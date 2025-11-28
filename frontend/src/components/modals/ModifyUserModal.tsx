"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import type { User } from "@/types/apiResponse";
import { debounce } from "lodash";
import { API_BASE_URL } from "@/api/apiConfig";

interface ModifyUserModalProps {
  open: boolean;
  onClose: () => void;
}

interface PaginatedUsers {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export function ModifyUserModal({ open, onClose }: ModifyUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageUrl, setPageUrl] = useState<string | null>("/accounts/users/");
  const [pagination, setPagination] = useState<{
    next: string | null;
    previous: string | null;
  }>({ next: null, previous: null });

  const token = localStorage.getItem("token");

  const handleSearch = debounce((value: string) => {
    setSearchTerm(value);
    setPageUrl(`${API_BASE_URL}/accounts/users/?search=${encodeURIComponent(value)}`);
  }, 500);

  const fetchUsers = async (url?: string) => {
    try {
      setLoading(true);
      const res = await axios.get<PaginatedUsers>(url || pageUrl!, {
        headers: { Authorization: `Token ${token}` },
      });
      setUsers(res.data.results || []);
      setPagination({ next: res.data.next, previous: res.data.previous });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchUsers();
  }, [open, pageUrl]);

  const handleRoleChange = async (
    userId: string,
    role: "admin" | "student"
  ) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/accounts/users/${userId}/`,
        { user_type: role },
        { headers: { Authorization: `Token ${token}` } }
      );
      toast.success("User role updated");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, user_type: role } : u))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col dark:bg-neutral-950 bg-background">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            Modify User Role
          </DialogTitle>
        </DialogHeader>

        <div className="p-4">
          <Input
            placeholder="Search users..."
            defaultValue={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="flex-1 px-4">
            {(users || []).length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No users found.
              </p>
            ) : (
              <ul className="space-y-3">
                {users.map((user) => (
                  <Card
                    key={user.id}
                    className="border bg-foreground/5 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <CardHeader className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={user.profile_avatar_url || undefined}
                          />
                          <AvatarFallback>
                            {user.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-sm">
                          <span className="font-medium">
                            {user.first_name} {user.last_name}
                          </span>
                          <span className="text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </div>

                      <Select
                        value={user.user_type}
                        onValueChange={(val) =>
                          handleRoleChange(user.id, val as "admin" | "student")
                        }
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardHeader>
                  </Card>
                ))}
              </ul>
            )}
          </ScrollArea>
        )}

        <DialogFooter className="flex justify-between mt-2">
          <Button
            disabled={!pagination.previous}
            onClick={() => setPageUrl(pagination.previous)}
          >
            Previous
          </Button>
          <Button
            disabled={!pagination.next}
            onClick={() => setPageUrl(pagination.next)}
          >
            Next
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
