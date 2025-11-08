from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, CommentViewSet, ClaimViewSet, NotificationViewSet, resolve_report_view, ReportResolutionLogViewSet, ActivityLogViewSet

router = DefaultRouter()
router.register("reports", ReportViewSet)
router.register("comments", CommentViewSet, basename="comments")
router.register("notifications", NotificationViewSet)
router.register("claims", ClaimViewSet, basename="claim")
router.register(r"resolution-logs", ReportResolutionLogViewSet, basename="resolution-log")
router.register(r"activity-logs", ActivityLogViewSet, basename="activity-log")


urlpatterns = [
    path("", include(router.urls)),
    path("reports/<int:report_id>/resolve/", resolve_report_view, name="resolve-report"),
]
