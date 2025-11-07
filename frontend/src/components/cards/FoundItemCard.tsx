import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { CommentModal } from "../modals/CommentModal";
import { useAuth } from "@/hooks/useAuth";
import type { FoundReport } from "@/types/apiResponse";
import { api } from "@/api/axiosInstance";
import { toast } from "sonner";
import { ReportActionModal } from "../modals/ReportActionModal";

export default function FoundItemCard({ report }: { report: FoundReport }) {
  const { user } = useAuth();
  const [commentOpen, setCommentOpen] = useState(false);
  const [reportActionOpen, setReportActionOpen] = useState(false);
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
      <Card className="w-full max-w-lg mx-auto my-4 border border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-3">
          <Avatar>
            <AvatarImage src={report.reported_by.profile_avatar_url ?? ""} />
            <AvatarFallback>
              {report.reported_by.first_name[0]}
              {report.reported_by.last_name[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <p className="font-medium">
              {report.reported_by.first_name} {report.reported_by.last_name}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(report.date_time).toLocaleString()}
            </p>
          </div>

          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={handleDeleteReport}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {found_item.photo_url && (
            <img
              src={found_item.photo_url}
              alt={found_item.item_name}
              className="w-full rounded-lg object-cover h-64"
            />
          )}

          <h3 className="text-lg font-semibold mt-3">{found_item.item_name}</h3>
          <p className="text-sm text-muted-foreground">
            {found_item.description}
          </p>

          <div className="text-sm mt-3 space-y-1">
            <p>
              <strong>Category:</strong> {found_item.category}
            </p>
            <p>
              <strong>Found at:</strong> {found_item.location_found}
            </p>
            {found_item.date_found && (
              <p>
                <strong>Date Found:</strong> {found_item.date_found}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setCommentOpen(true)}
          >
            <MessageCircle className="mr-2 h-4 w-4" /> Comments
          </Button>

          {/* Hide Claim button if owner */}
          {!isOwner && (
            <Button onClick={() => setReportActionOpen(true)} variant="default" size="sm" className="w-full sm:w-auto hover:cursor-pointer">
              <CheckCircle className="mr-2 h-4 w-4" /> Claim Item
            </Button>
          )}
        </CardFooter>
      </Card>

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
