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
import { Bell, CheckCircle2, Circle } from "lucide-react";
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

    const resolveReport = async (reportId: number, claimantId: string) => {
      try {
        await api.post(`/reports/reports/${reportId}/resolve/`, {
          claimant_id: claimantId,
        });
        toast.success("Report marked as resolved");
        fetchNotifications();
      } catch {
        toast.error("Failed to resolve report");
      }
    };




  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" /> Notifications
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-80 mt-2 space-y-1">
          {loading ? (
            <p className="text-center text-muted-foreground py-6">
              Loading notifications...
            </p>
          ) : notifications.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">
              No notifications yet.
            </p>
          ) : (
            notifications.map((notif, idx) => (
              <div key={notif.id}>
                <div
                  className={`flex gap-3 p-3 rounded-md transition-colors ${
                    notif.is_read
                      ? "bg-muted/30"
                      : "bg-primary/5 border-l-4 border-primary"
                  }`}
                >
                  <Avatar>
                    <AvatarImage
                      src={notif.user.profile_avatar_url ?? ""}
                      alt={notif.user.first_name}
                    />
                    <AvatarFallback>
                      {notif.user.first_name[0]}
                      {notif.user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className="text-sm font-medium">{notif.message}</p>
                    {notif.detailed_message && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {notif.detailed_message}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {new Date(notif.created_at).toLocaleString()}
                      </p>
                      {!notif.is_read ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs flex items-center gap-1 text-primary"
                          onClick={() => markAsRead(notif.id)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Mark as read
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          Read
                        </Badge>
                      )}
                      {notif.related_report &&
                        notif.related_report.status !== "resolved" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs flex items-center gap-1 text-green-600"
                            onClick={() => {
                              const reportId = notif.related_report?.id;
                              const claimantId =
                                (notif.related_report as any)?.claimed_by?.id ??
                                (notif as any)?.claimed_by?.id;

                              if (!reportId) {
                                toast.error("Missing report ID");
                                return;
                              }

                              if (!claimantId) {
                                toast.error("Missing claimant ID");
                                return;
                              }

                              resolveReport(reportId, claimantId);
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Mark as Resolved
                          </Button>
                        )}
                    </div>
                  </div>

                  {!notif.is_read && (
                    <Circle className="h-3 w-3 text-primary mt-1 shrink-0" />
                  )}
                </div>

                {idx < notifications.length - 1 && <Separator />}
              </div>
            ))
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
