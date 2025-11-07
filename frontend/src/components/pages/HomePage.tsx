"use client";

import { useEffect, useState } from "react";
import CreateReportSection from "../sections/CreateReportSection";
import UserProfileSection from "../sections/UserProfileSection";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { NotificationModal } from "@/components/modals/NotificationModal";
import { api } from "@/api/axiosInstance";
import { toast } from "sonner";

export default function HomePage() {
  const [openNotifications, setOpenNotifications] = useState(false);
   const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get(`/reports/notifications/unread-count/`);
        setUnreadCount(res.data.unread_count || 0);
      } catch {
        toast.error("Failed to fetch unread notifications");
      }
    };

    fetchUnreadCount();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-100 via-white to-neutral-200 dark:from-neutral-900 dark:via-neutral-950 dark:to-black py-12 px-4 md:px-8 lg:px-16 transition-colors duration-500">
      <header className="text-center mb-10 relative">
        <div className="absolute top-0 right-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpenNotifications(true)}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            )}
          </Button>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-[#800000] via-[#b22222] to-[#800000] bg-clip-text text-transparent">
          Lost & Found Management System
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 max-w-2xl mx-auto leading-relaxed">
          Submit or browse reports of lost and found items. Help reunite people
          with their belongings one item at a time.
        </p>
      </header>

      <Separator className="my-8 max-w-5xl mx-auto opacity-60" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-10 items-center">
        <aside className="flex justify-center lg:justify-start">
          <UserProfileSection />
        </aside>

        <main className="space-y-8">
          <CreateReportSection />
        </main>
      </div>

      <footer className="text-center text-sm px-4 py-6 text-muted-foreground mt-12 opacity-75">
        © {new Date().getFullYear()} HCDC Lost & Found Management System. Built
        with ❤️ to help people reconnect with their belongings in the campus.
      </footer>

      <NotificationModal
        open={openNotifications}
        onClose={() => setOpenNotifications(false)}
      />
    </div>
  );
}
