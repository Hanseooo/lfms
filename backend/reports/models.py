from django.db import models
from django.conf import settings 

class Report(models.Model):
    REPORT_TYPE_CHOICES = [
        ("lost", "Lost"),
        ("found", "Found"),
    ]
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("resolved", "Resolved"),
    ]

    reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=REPORT_TYPE_CHOICES)
    date_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")

    def __str__(self):
        return f"{self.type.capitalize()} Report #{self.id}"


class LostItem(models.Model):
    report = models.OneToOneField(Report, on_delete=models.CASCADE, related_name="lost_item")
    item_name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=100)
    location_last_seen = models.CharField(max_length=255)
    photo_url = models.URLField(blank=True, null=True)
    date_lost = models.DateField(blank=True, null=True)


class FoundItem(models.Model):
    report = models.OneToOneField(Report, on_delete=models.CASCADE, related_name="found_item")
    item_name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=100)
    location_found = models.CharField(max_length=255)
    photo_url = models.URLField(blank=True, null=True)
    supervised_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    date_found = models.DateField(blank=True, null=True)


class Comment(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class Claim(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE)
    claimed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="claims")
    received_from = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="received_claims")
    supervised_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="supervised_claims")
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="verified_claims")
    message = models.TextField(blank=True, null=True)
    received = models.BooleanField(default=False)
    date_claimed = models.DateTimeField(auto_now_add=True)
    date_received = models.DateTimeField(blank=True, null=True)


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.CharField(max_length=255)
    detailed_message = models.TextField(blank=True, null=True)
    related_report = models.ForeignKey(Report, on_delete=models.SET_NULL, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class ReportResolutionLog(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name="resolution_logs")
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="resolved_reports"
    )
    claimed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="claimed_reports"
    )
    receiver_name = models.CharField(max_length=255)
    giver_name = models.CharField(max_length=255)
    report_title = models.CharField(max_length=255)
    date_resolved = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Resolution Log for Report #{self.report.id} - {self.report_title}"
