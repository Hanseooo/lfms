import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, CheckCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { CommentModal } from "../modals/CommentModal";
import { useAuth } from "@/hooks/useAuth";
import type { FoundReport } from "@/types/apiResponse";
import { api } from "@/api/axiosInstance";
import { toast } from "sonner";
import { ReportActionModal } from "../modals/ReportActionModal";
import { ImagePreviewDialog } from "../modals/ImagePreviewDialog";

export default function FoundItemCard({ report }: { report: FoundReport }) {
  const { user } = useAuth();
  const [commentOpen, setCommentOpen] = useState(false);
  const [reportActionOpen, setReportActionOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);

  const { found_item } = report;
  const isOwner = user?.id === report.reported_by.id;

  const handleDeleteReport = async () => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      await api.delete(`/reports/reports/${report.id}/`);
      toast.success("Report deleted successfully!");
    } catch {
      toast.error("Failed to delete report");
    }
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto my-4 border bg-card shadow-sm rounded-xl">
        {/* Header */}
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Avatar>
            <AvatarImage src={report.reported_by.profile_avatar_url ?? ""} />
            <AvatarFallback>
              {report.reported_by.first_name[0]}
              {report.reported_by.last_name[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <p className="font-semibold text-base">
              {report.reported_by.first_name} {report.reported_by.last_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(report.date_time).toLocaleString()}
            </p>
          </div>

          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto hover:bg-red-50"
              onClick={handleDeleteReport}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-3">
          {found_item.photo_url && (
            <img
              src={found_item.photo_url}
              alt={found_item.item_name}
              className="w-full rounded-lg object-cover h-64 cursor-pointer transition hover:opacity-90"
              onClick={() => setImageOpen(true)}
            />
          )}

          <h3 className="text-xl font-bold tracking-tight">
            {found_item.item_name}
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {found_item.description}
          </p>

          <div className="text-sm space-y-1 pt-1">
            <p>
              <span className="font-semibold">Category:</span>{" "}
              {found_item.category}
            </p>
            <p>
              <span className="font-semibold">Found at:</span>{" "}
              {found_item.location_found}
            </p>

            {found_item.date_found && (
              <p>
                <span className="font-semibold">Date Found:</span>{" "}
                {found_item.date_found}
              </p>
            )}
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setCommentOpen(true)}
          >
            <MessageCircle className="mr-2 h-4 w-4" /> Comments
          </Button>

          {!isOwner && (
            <Button
              onClick={() => setReportActionOpen(true)}
              size="sm"
              className="w-full sm:w-auto"
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Claim Item
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Dialogs */}
      <ImagePreviewDialog
        open={imageOpen}
        onClose={() => setImageOpen(false)}
        src={found_item.photo_url ?? ""}
        alt={found_item.item_name}
      />

      <CommentModal
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        report={report}
      />

      <ReportActionModal
        open={reportActionOpen}
        onClose={() => setReportActionOpen(false)}
        report={report}
        actionType="claim"
      />
    </>
  );
}
