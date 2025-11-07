"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import type { ReportActionPayload } from "@/types/apiPayloads";
import type { Report } from "@/types/apiResponse";
import { ReportInfoCard } from "../cards/ReportInfoCard";
import axios from "axios";

interface ReportActionModalProps {
  open: boolean;
  onClose: () => void;
  report: Report;
  actionType: "claim" | "found";
}

const BASE_URL = "http://127.0.0.1:8000/api";

export function ReportActionModal({
  open,
  onClose,
  report,
  actionType,
}: ReportActionModalProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message.");
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication token missing.");
        return;
      }

      const payload: ReportActionPayload = { message };
      const endpoint =
        actionType === "claim"
          ? `reports/reports/${report.id}/claim_item/`
          : `reports/reports/${report.id}/item_found/`;

      await axios.post(`${BASE_URL}/${endpoint}`, payload, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success(
        actionType === "claim"
          ? "Claim request sent successfully!"
          : "Item found notification sent!"
      );

      setMessage("");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to send request.");
    } finally {
      setLoading(false);
    }
  };

  const actionTitle =
    actionType === "claim" ? "Claim Found Item" : "Notify Item Found";
  const placeholderText =
    actionType === "claim"
      ? "Write a short message to explain why you’re claiming this item..."
      : "Provide details about where or how you found the item...";
  const buttonLabel =
    actionType === "claim" ? "Send Claim Request" : "Notify Owner";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 space-y-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {actionTitle}
          </DialogTitle>
        </DialogHeader>

        <ReportInfoCard report={report} />

        <Separator className="my-2" />

        <div>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholderText}
            className="min-h-[100px] resize-none"
          />
        </div>

        <Button
          type="button"
          onClick={() => {
            handleSubmit();
          }}
          disabled={loading}
          className="w-full text-base font-medium"
        >
          {loading ? "Submitting..." : buttonLabel}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
