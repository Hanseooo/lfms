from rest_framework import serializers
from .models import Report, LostItem, FoundItem, Comment, Claim, Notification, ActivityLog, ReportResolutionLog
from django.contrib.auth import get_user_model

User = get_user_model()  # This will get the correct User model

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User 
        fields =  ["id", "username", "email", "first_name", "last_name", "profile_avatar_url"]

class LostItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = LostItem
        exclude = ["report"] 


class FoundItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoundItem
        exclude = ["report"]  


class ReportSerializer(serializers.ModelSerializer):
    reported_by = UserSerializer(read_only=True)
    lost_item = serializers.SerializerMethodField()
    found_item = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = "__all__"

    def get_lost_item(self, obj):
        if obj.type == "lost" and hasattr(obj, 'lost_item'):
            return LostItemSerializer(obj.lost_item).data
        return None

    def get_found_item(self, obj):
        if obj.type == "found" and hasattr(obj, 'found_item'):
            return FoundItemSerializer(obj.found_item).data
        return None


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = "__all__"

class ClaimSerializer(serializers.ModelSerializer):
    claimed_by = UserSerializer(read_only=True)
    received_from = UserSerializer(read_only=True)
    supervised_by = UserSerializer(read_only=True)
    verified_by = UserSerializer(read_only=True)

    class Meta:
        model = Claim
        fields = "__all__"

class SimpleReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ["id", "type", "status", "date_time"]


class NotificationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    related_report = ReportSerializer(read_only=True)
    claimed_by = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id",
            "user",
            "message",
            "detailed_message",
            "related_report",
            "claimed_by",
            "is_read",
            "created_at",
        ]

    def get_claimed_by(self, obj):
        """Return the latest claimant for this report, if exists."""
        if not obj.related_report:
            return None

        claim = Claim.objects.filter(report=obj.related_report).order_by("-date_claimed").first()
        if claim and claim.claimed_by:
            return {
                "id": str(claim.claimed_by.id),
                "first_name": claim.claimed_by.first_name,
                "last_name": claim.claimed_by.last_name,
            }
        return None



class UserMiniSerializer(serializers.ModelSerializer):
    """Minimal user info for nested display"""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "username", "email", "full_name"]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()


class ReportResolutionLogSerializer(serializers.ModelSerializer):
    report = ReportSerializer(read_only=True)
    resolved_by = UserMiniSerializer(read_only=True)
    claimed_by = UserMiniSerializer(read_only=True)

    class Meta:
        model = ReportResolutionLog
        fields = [
            "id",
            "report",
            "resolved_by",
            "claimed_by",
            "receiver_name",
            "giver_name",
            "report_title",
            "date_resolved",
        ]


class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    notification = NotificationSerializer(read_only=True)
    report = ReportSerializer(read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            "id",
            "notification",
            "user",
            "report",
            "report_type",
            "action",
            "user_full_name",
            "item_name",
            "created_at",
        ]

