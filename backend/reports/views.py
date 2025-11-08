from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
import cloudinary.uploader

from .models import Report, LostItem, FoundItem, Comment, Claim, Notification
from .serializers import *
from .permissions import IsOwnerOrReadOnly, IsCommentOwnerOrReportOwnerOrReadOnly, IsAdminOrOwnerOrReadOnly
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import viewsets, permissions, status
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.db import connection
from rest_framework.decorators import api_view, permission_classes


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all().order_by("-date_time")  # Keep this for the router
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAdminOrOwnerOrReadOnly ]
    
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["type", "status"]
    
    def get_queryset(self):
        # Start with the base queryset
        queryset = Report.objects.all().order_by("-date_time")
        
        # Handle search manually
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(lost_item__item_name__icontains=search) |
                Q(found_item__item_name__icontains=search) |
                Q(lost_item__description__icontains=search) |
                Q(found_item__description__icontains=search)
            )
        
        return queryset

    def perform_create(self, serializer):
        file = self.request.data.get("photo")
        photo_url = None
        if file:
            upload_result = cloudinary.uploader.upload(file)
            photo_url = upload_result.get("secure_url")

        report = serializer.save(reported_by=self.request.user)

        if report.type == "lost":
            LostItem.objects.create(
                report=report,
                item_name=self.request.data.get("item_name"),
                description=self.request.data.get("description"),
                category=self.request.data.get("category"),
                location_last_seen=self.request.data.get("location_last_seen"),
                photo_url=photo_url,
                date_lost=self.request.data.get("date_lost"),
            )
        else:
            FoundItem.objects.create(
                report=report,
                item_name=self.request.data.get("item_name"),
                description=self.request.data.get("description"),
                category=self.request.data.get("category"),
                location_found=self.request.data.get("location_found"),
                photo_url=photo_url,
                date_found=self.request.data.get("date_found"),
            )
            
    @action(detail=True, methods=["patch"], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        report = self.get_object()
        report.status = "approved"
        report.save(update_fields=["status"])
        return Response({"status": "approved"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        report = self.get_object()
        report.status = "rejected"
        report.save(update_fields=["status"])
        return Response({"status": "rejected"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def claim_item(self, request, pk=None):
        report = self.get_object()
        message = request.data.get("message", "")

        if report.type != "found":
            return Response({"error": "Only found reports can be claimed."}, status=400)

        claim = Claim.objects.create(
            report=report,
            claimed_by=request.user,
            message=message,
        )

        Notification.objects.create(
            user=report.reported_by,
            message=f"{request.user.first_name} {request.user.last_name} wants to claim the found item.",
            detailed_message=message,
            related_report=report
        )

        return Response(
            {"status": "claim created", "claim_id": claim.id},
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def item_found(self, request, pk=None):
        report = self.get_object()
        message = request.data.get("message", "")

        if report.type != "lost":
            return Response({"error": "Only lost reports can be marked found."}, status=400)

        Notification.objects.create(
            user=report.reported_by,
            message=f"{request.user.first_name} {request.user.last_name} reported finding your lost item.",
            detailed_message=message,
            related_report=report
        )

        return Response({"status": "item found notification sent"})
    
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def resolve_report_view(request, report_id):
    """
    Resolve a report using the stored procedure in PostgreSQL.
    """
    owner_id = request.user.id
    claimant_id = request.data.get("claimant_id")

    if not claimant_id:
        return Response({"error": "Claimant ID is required."}, status=400)

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "CALL resolve_report_and_log(%s, %s, %s);",
                [report_id, str(owner_id), str(claimant_id)]
            )
        return Response({"message": "Report successfully resolved and logged."})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsCommentOwnerOrReportOwnerOrReadOnly]

    def get_queryset(self):
        report_id = self.request.query_params.get("report")
        queryset = Comment.objects.select_related("user").order_by("-created_at")
        if report_id:
            queryset = queryset.filter(report_id=report_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ClaimViewSet(viewsets.ModelViewSet):
    serializer_class = ClaimSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        # Admins see all claims, others only their own
        if user.is_staff:
            return Claim.objects.all().order_by("-date_claimed")
        return Claim.objects.filter(claimed_by=user).order_by("-date_claimed")

    def perform_create(self, serializer):
        serializer.save(claimed_by=self.request.user)

    @action(detail=False, methods=["get"], url_path="my-claims")
    def my_claims(self, request):
        claims = Claim.objects.filter(claimed_by=request.user).order_by("-date_claimed")
        serializer = self.get_serializer(claims, many=True)
        return Response(serializer.data)



class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by("-created_at")
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")

    def partial_update(self, request, *args, **kwargs):
        notification = self.get_object()
        is_read = request.data.get("is_read")

        if is_read is not None:
            notification.is_read = is_read
            notification.save(update_fields=["is_read"])
            return Response(
                {"status": "Notification marked as read"},
                status=status.HTTP_200_OK
            )

        return Response(
            {"error": "Invalid payload"},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT get_unread_notification_count(%s);", [request.user.id])
            unread_count = cursor.fetchone()[0]

        return Response({"unread_count": unread_count})
    
class ReportResolutionLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ReportResolutionLog.objects.select_related("report", "resolved_by", "claimed_by").order_by("-date_resolved")
    serializer_class = ReportResolutionLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return self.queryset
        return self.queryset.filter(report__reported_by=user)


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.select_related("user", "report", "notification").order_by("-created_at")
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return self.queryset
        return self.queryset.filter(user=user)

