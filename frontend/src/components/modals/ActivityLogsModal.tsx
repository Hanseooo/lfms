"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserRound, CalendarDays, ClipboardList } from "lucide-react";
import { api } from "@/api/axiosInstance";
import { toast } from "sonner";
import type { ActivityLog } from "@/types/apiResponse";

interface ActivityLogsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ActivityLogsModal({ open, onClose }: ActivityLogsModalProps) {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    if (open) fetchActivityLogs();
  }, [open]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/activity-logs/`);
      setLogs(res.data.results || []);
    } catch {
      toast.error("Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full h-[80vh] flex flex-col dark:bg-neutral-950 bg-background rounded-lg p-4">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-center">
            Activity Logs
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-2">
            {logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">
                No activity logs found.
              </p>
            ) : (
              <ul className="space-y-4">
                {logs.map((log) => {
                  const report = log.report;
                  const reportTitle =
                    report?.lost_item?.item_name ||
                    report?.found_item?.item_name ||
                    "N/A";

                  return (
                    <Card
                      key={log.id}
                      className="border bg-foreground/5 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pb-1">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                          <ClipboardList className="h-4 w-4 text-primary" />
                          {log.action}
                        </CardTitle>
                        {log.role && (
                          <Badge
                            variant="outline"
                            className="bg-primary/10 border-primary/20 text-primary text-sm px-2 py-1"
                          >
                            {log.role}
                          </Badge>
                        )}
                      </CardHeader>

                      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <UserRound className="h-4 w-4" />
                          <span className="font-medium text-foreground">
                            User:
                          </span>
                          <span>{log.user.full_name}</span>
                        </div>

                        {report && (
                          <div className="flex items-center gap-2">
                            <ClipboardList className="h-4 w-4" />
                            <span className="font-medium text-foreground">
                              Report:
                            </span>
                            <span>{reportTitle}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 sm:col-span-2">
                          <CalendarDays className="h-4 w-4" />
                          <span className="font-medium text-foreground">
                            Date:
                          </span>
                          <span>
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                      </CardContent>

                      <Separator className="my-1" />
                    </Card>
                  );
                })}
              </ul>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
