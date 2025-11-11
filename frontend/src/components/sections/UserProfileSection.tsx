"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, Edit2, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import SettingsModal from "../modals/SettingsModal";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { api } from "@/api/axiosInstance";
import { useAuth } from "@/hooks/useAuth";

export default function UserProfileSection() {
  const { user, refreshUser } = useAuth(); // ✅ refreshUser should re-fetch from backend
  const [openSettings, setOpenSettings] = useState(false);
  const [openAvatarPicker, setOpenAvatarPicker] = useState(false);
  const [customSeed, setCustomSeed] = useState("");
  const [avatar, setAvatar] = useState(
    user?.profile_avatar_url ||
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Easton"
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customSeed.trim()) {
      setAvatar(
        `https://api.dicebear.com/9.x/adventurer/svg?seed=${customSeed}`
      );
    }
  }, [customSeed]);

  const avatarOptions = [
    "Alexander",
    "Nova",
    "Pixel",
    "Brooklynn",
    "jl",
    "Leo",
    "Milo",
    "Easton",
    "Avery",
  ].map((seed) => `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`);

  const handleSaveAvatar = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await api.patch(`/accounts/users/${user.id}/`, {
        profile_avatar_url: avatar,
      });

      toast.success("Avatar updated successfully!");
      await refreshUser(); // ✅ refresh global user context
      setOpenAvatarPicker(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update avatar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card
        className={cn(
          "w-full max-w-md mx-auto p-6 shadow-xl border-2 border-accent rounded-2xl transition-all duration-500",
          "bg-linear-to-br from-neutral-100 via-neutral-50 to-neutral-200 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900",
          "backdrop-blur-xl hover:shadow-2xl"
        )}
      >
        <CardHeader className="flex flex-col items-center text-center space-y-4">
          <Popover open={openAvatarPicker} onOpenChange={setOpenAvatarPicker}>
            <PopoverTrigger asChild>
              <div className="relative group cursor-pointer">
                <Avatar className="h-24 w-24 mx-auto border-2 border-accent/60 transition-transform duration-300 group-hover:scale-105 group-hover:border-accent">
                  <AvatarImage src={avatar} alt={user?.username || "User"} />
                  <AvatarFallback className="text-xl">
                    {user?.first_name?.[0] || "U"}
                    {user?.last_name?.[0] || ""}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-all duration-300",
                    "group-hover:bg-black/40"
                  )}
                >
                  <Edit2
                    className={cn(
                      "h-6 w-6 text-white opacity-0 transition-opacity duration-300",
                      "group-hover:opacity-100"
                    )}
                  />
                </div>
              </div>
            </PopoverTrigger>

            <PopoverContent
              align="center"
              side="top"
              className={cn(
                "bg-linear-to-b from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900",
                "p-6 rounded-2xl border-2 border-accent shadow-xl backdrop-blur-md",
                "flex flex-col gap-4 w-[320px] max-w-[90vw]"
              )}
            >
              <div className="flex flex-wrap justify-center gap-4">
                {avatarOptions.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAvatar(url)}
                    className={cn(
                      "rounded-full overflow-hidden border-2 transition-all duration-200 hover:scale-105",
                      avatar === url
                        ? "border-[#b22222]"
                        : "border-transparent hover:border-[#800000]/70"
                    )}
                  >
                    <img
                      src={url}
                      alt={`Avatar ${idx}`}
                      className="h-14 w-14"
                    />
                  </button>
                ))}
              </div>

              <Separator className="my-2" />

              <Input
                value={customSeed}
                placeholder="Type a custom avatar seed"
                onChange={(e) => setCustomSeed(e.target.value)}
              />

              <Button
                variant="default"
                disabled={saving}
                className="w-full bg-linear-to-r from-[#800000] via-[#b22222] to-[#800000] text-white hover:opacity-90 transition rounded-lg"
                onClick={handleSaveAvatar}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </PopoverContent>
          </Popover>

          <div>
            <CardTitle className="text-xl font-semibold text-gradient-maroon">
              {user?.first_name} {user?.last_name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">@{user?.username}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Email:</span>{" "}
            {user?.email || "N/A"}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Contact:</span>{" "}
            {user?.contact_number || "N/A"}
          </p>

          <div className="pt-4">
            <Button
              onClick={() => setOpenSettings(true)}
              className="w-full bg-linear-to-r from-[#800000] via-[#b22222] to-[#800000] text-white hover:opacity-90 transition rounded-lg"
            >
              <Settings className="h-4 w-4 mr-2" /> Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <SettingsModal open={openSettings} onOpenChange={setOpenSettings} />
    </>
  );
}
