import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/api/axiosInstance";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import type { Report, Comment } from "@/types/apiResponse";

interface CommentModalProps {
  open: boolean;
  onClose: () => void;
  report: Report;
}

export function CommentModal({ open, onClose, report }: CommentModalProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  function extractResults(data: any) {
    return Array.isArray(data) ? data : data.results || [];
  }


    const fetchComments = async () => {
    try {
        const res = await api.get(`/reports/comments/?report=${report.id}`);
        setComments(extractResults(res.data));

    } catch {
        toast.error("Failed to load comments");
    }
    };
    


  const handleSubmit = async () => {
    if (!content.trim()) return;
    try {
      setLoading(true);
      const res = await api.post("/reports/comments/", {
        report: report.id,
        content,
      });
      setComments((prev) => [...prev, res.data]);
      toast.success("Comment added!");
      setContent("");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await api.delete(`/reports/comments/${commentId}/`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

useEffect(() => {
  if (open && report?.id) {
    fetchComments();
  }
}, [open, report?.id]);


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-64 p-2 border rounded-md bg-muted/30">
          {comments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              No comments yet.
            </p>
          ) : (
            comments.map((c) => {
              const canDelete =
                user?.id === c.user.id ||
                user?.id === report.reported_by.id ||
                user?.user_type === "admin";
              return (
                <div key={c.id} className="flex items-start gap-3 py-2">
                  <Avatar>
                    <AvatarImage src={c.user.profile_avatar_url ?? ""} />
                    <AvatarFallback>
                      {c.user.first_name[0]}
                      {c.user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {c.user.first_name} {c.user.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground mb-1">
                      {new Date(c.created_at).toLocaleString()}
                    </p>
                    <p className="text-sm">{c.content}</p>
                  </div>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </ScrollArea>

        <Separator className="my-2" />

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your comment..."
          className="mb-2"
        />
        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? "Posting..." : "Post Comment"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
