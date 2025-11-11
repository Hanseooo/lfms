"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Bell,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/api/axiosInstance";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import type { Notification, PaginatedResponse } from "@/types/apiResponse";

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationModal({ open, onClose }: NotificationModalProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get<PaginatedResponse<Notification>>(
        `/reports/notifications/?user=${user?.id}`
      );
      setNotifications(res.data.results || []);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/reports/notifications/${id}/`, { is_read: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await api.delete(`/reports/notifications/${id}/`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification removed");
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const clearAllNotifications = async () => {
    if (notifications.length === 0) return;
    setClearing(true);
    try {
      await Promise.all(
        notifications.map((notif) =>
          api.delete(`/reports/notifications/${notif.id}/`)
        )
      );
      setNotifications([]);
      toast.success("All notifications cleared");
    } catch {
      toast.error("Failed to clear all notifications");
    } finally {
      setClearing(false);
    }
  };

  const resolveReport = async (
    reportId: number,
    claimantId: string,
    notifId: number
  ) => {
    try {
      await api.post(`/reports/reports/${reportId}/resolve/`, {
        claimant_id: claimantId,
      });
      toast.success("Report marked as resolved");
      fetchNotifications();
      markAsRead(notifId);
    } catch (error) {
      toast.error("Failed to resolve report");
    }
  };

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[85vh] rounded-xl dark:bg-neutral-950 bg-white p-4 sm:p-6 overflow-hidden">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
              <Bell className="h-5 w-5 text-primary shrink-0" /> Notifications
            </DialogTitle>

            {notifications.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                disabled={clearing}
                onClick={clearAllNotifications}
                className="self-end sm:self-auto w-full sm:w-auto"
              >
                {clearing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1" />
                )}
                Clear All
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] mt-3 pr-2">
          {loading ? (
            <p className="text-center text-muted-foreground py-6">
              Loading notifications...
            </p>
          ) : notifications.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">
              No notifications yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {notifications.map((notif, idx) => (
                <div key={notif.id}>
                  <div
                    className={`flex flex-col gap-3 p-4 rounded-lg transition-colors shadow-sm ${
                      notif.is_read
                        ? "bg-muted/40"
                        : "bg-primary/5 border border-primary/20"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage
                          src={notif.user.profile_avatar_url ?? ""}
                          alt={notif.user.first_name}
                        />
                        <AvatarFallback>
                          {notif.user.first_name[0]}
                          {notif.user.last_name[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium leading-tight wrap-break-word">
                            {notif.message}
                          </p>
                          {!notif.is_read && (
                            <Circle className="h-3 w-3 text-primary shrink-0" />
                          )}
                        </div>
                        {notif.detailed_message && (
                          <p className="text-xs text-muted-foreground mt-1 leading-snug wrap-break-word">
                            {notif.detailed_message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 pt-2 border-t border-border/50 gap-2 sm:gap-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(notif.created_at).toLocaleString()}
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {notif.related_report &&
                          notif.related_report.status !== "resolved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-green-600 border-green-600/30 hover:bg-green-600/10 hover:text-green-700"
                              onClick={() => {
                                const reportId = notif.related_report?.id;
                                const claimantId = notif.triggered_by?.id;
                                if (!reportId || !claimantId) {
                                  toast.error(
                                    "Missing report or claimant info"
                                  );
                                  return;
                                }
                                resolveReport(reportId, claimantId, notif.id);
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Mark Resolved
                            </Button>
                          )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-red-500 hover:bg-red-500/10"
                          onClick={() => deleteNotification(notif.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>

                        {notif.is_read ? (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-2 py-0.5 rounded-md"
                          >
                            Read
                          </Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-primary"
                            onClick={() => markAsRead(notif.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {idx < notifications.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
