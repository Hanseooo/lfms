"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
import type { ActivityLogResponse, ActivityLog } from "@/types/apiResponse";

interface ActivityLogsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ActivityLogsModal({ open, onClose }: ActivityLogsModalProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextPage, setNextPage] = useState<string | null>(
    `/reports/activity-logs/`
  );
  const [hasMore, setHasMore] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchLogs = useCallback(async () => {
    if (!nextPage || loading || !hasMore) return;

    try {
      setLoading(true);
      const res = await api.get<ActivityLogResponse>(nextPage);
      const data = res.data;

      setLogs((prev) => [...prev, ...data.results]);
      setNextPage(data.next);
      setHasMore(!!data.next);
    } catch (err) {
      toast.error("Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  }, [nextPage, loading, hasMore]);

  // Reset & fetch first page when modal opens
  useEffect(() => {
    if (open) {
      setLogs([]);
      setNextPage(`/reports/activity-logs/`);
      setHasMore(true);
    }
  }, [open]);

  // Initial fetch when modal opens
  useEffect(() => {
    if (open && nextPage === `/reports/activity-logs/`) {
      fetchLogs();
    }
  }, [open, fetchLogs, nextPage]);

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      fetchLogs();
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

        <ScrollArea
          className="flex-1 min-h-0 pr-2"
          ref={scrollRef}
          onScroll={handleScroll}
        >
          {logs.length === 0 && !loading ? (
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
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </CardContent>

                    <Separator className="my-1" />
                  </Card>
                );
              })}
              {loading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </ul>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
