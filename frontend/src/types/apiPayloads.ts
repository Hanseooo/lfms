import { type LostItem, type FoundItem } from "./apiResponse";

export type LoginPayload = {
  username?: string; 
  email?: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password1: string;
  password2: string;
  id_number?: string;
  user_type?: "student" | "staff" | "guest" | "admin";
  contact_number?: string;
};


export type CreateReportPayload = {
  type: "lost" | "found";
  item_name: string;
  description: string;
  category: string;
  location_last_seen?: string;
  location_found?: string;
  photo?: File | Blob; 
  date_lost?: string;
  date_found?: string;
};


export type UpdateReportPayload = Partial<CreateReportPayload> & {
  status?: "pending" | "approved" | "rejected" | "resolved";
};

export type CreateLostItemPayload = Omit<LostItem, "id" | "report">;
export type UpdateLostItemPayload = Partial<CreateLostItemPayload>;

export type CreateFoundItemPayload = Omit<FoundItem, "id" | "report">;
export type UpdateFoundItemPayload = Partial<CreateFoundItemPayload>;

export type CreateCommentPayload = {
  report: number;
  content: string;
};

export type UpdateCommentPayload = Partial<CreateCommentPayload>;

export type CreateClaimPayload = {
  message?: string;
};


export type UpdateNotificationPayload = {
  is_read?: boolean;
};

export interface ReportActionPayload {
  message: string;
}


