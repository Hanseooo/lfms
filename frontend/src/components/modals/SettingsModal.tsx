"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/axiosInstance";
import { useAuth } from "@/hooks/useAuth";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SettingsModal({
  open,
  onOpenChange,
}: SettingsModalProps) {
  const { user, refreshUser } = useAuth();

  // Profile info state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Theme
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  // Load user info when modal opens
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setUsername(user.username || "");
      setEmail(user.email || "");
      setContact(user.contact_number || "");
    }
  }, [user]);

  // ------------------------- THEME HANDLING -------------------------
  useEffect(() => {
    // Default: system theme
    const storedTheme = localStorage.getItem("theme") as
      | "light"
      | "dark"
      | "system"
      | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const activeTheme = storedTheme || "system";

    setTheme(activeTheme);

    const applyTheme = (theme: string) => {
      if (theme === "system") {
        document.documentElement.classList.toggle("dark", prefersDark);
      } else {
        document.documentElement.classList.toggle("dark", theme === "dark");
      }
    };

    applyTheme(activeTheme);

    // React to system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        document.documentElement.classList.toggle("dark", e.matches);
      }
    };
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [theme]);

  const handleThemeChange = (mode: "light" | "dark" | "system") => {
    setTheme(mode);
    localStorage.setItem("theme", mode);
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (mode === "system") {
      document.documentElement.classList.toggle("dark", prefersDark);
    } else {
      document.documentElement.classList.toggle("dark", mode === "dark");
    }
    toast.success(`Theme changed to ${mode}`);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      await api.patch(`/accounts/users/${user.id}/`, {
        first_name: firstName,
        last_name: lastName,
        username,
        email,
        contact_number: contact,
      });

      toast.success("Profile updated successfully!");
      await refreshUser();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      if (error.response?.data?.username) {
        toast.error("Username is already taken.");
      } else if (error.response?.data?.email) {
        toast.error("Email is already taken.");
      } else {
        toast.error("Failed to update profile. Try again later.");
      }
    }
  };

  // ------------------------- PASSWORD UPDATE -------------------------
  const handleSavePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await api.patch(`/accounts/users/${user?.id}/`, {
        password: newPassword,
      });
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update password. Try again later.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          max-w-2xl w-[90vw] max-h-[85vh] overflow-y-auto rounded-xl 
          bg-linear-to-b from-[#3b0a0a]/95 to-[#1a0101]/95
          text-white border border-white/10 backdrop-blur-md p-6
          scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent
        "
      >
        <DialogHeader className="pb-4 z-10">
          <DialogTitle className="text-lg font-semibold">Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="account" className="mt-2">
          <TabsList className="grid grid-cols-2 bg-white/10 rounded-lg p-1">
            <TabsTrigger
              value="account"
              className="text-white data-[state=active]:bg-white/20 rounded-md"
            >
              Account
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="text-white data-[state=active]:bg-white/20 rounded-md"
            >
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* ACCOUNT TAB */}
          <TabsContent value="account" className="mt-6 space-y-6">
            {/* Profile Info */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-200">
                Profile Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Enter email"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Enter contact number"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleSaveProfile}
                  className="w-full sm:w-auto bg-linear-to-r from-[#800000] via-[#b22222] to-[#800000] text-white hover:opacity-90"
                >
                  Save Profile
                </Button>
              </div>
            </div>

            {/* Password Section */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <h3 className="text-base font-semibold text-gray-200">
                Password Settings
              </h3>

              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleSavePassword}
                  className="w-full sm:w-auto bg-linear-to-r from-[#800000] via-[#b22222] to-[#800000] text-white hover:opacity-90"
                >
                  Save Password
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* PREFERENCES TAB */}
          <TabsContent value="preferences" className="mt-6 space-y-6">
            <div>
              <h3 className="text-base font-semibold text-gray-200 mb-2">
                Theme Preference
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                Choose how you want the interface to appear.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Button
                  variant={theme === "light" ? "default" : "ghost"}
                  onClick={() => handleThemeChange("light")}
                  className="flex-1 flex items-center gap-2 justify-center bg-white/10 hover:bg-white/20"
                >
                  <Sun className="h-4 w-4" /> Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "ghost"}
                  onClick={() => handleThemeChange("dark")}
                  className="flex-1 flex items-center gap-2 justify-center bg-white/10 hover:bg-white/20"
                >
                  <Moon className="h-4 w-4" /> Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "ghost"}
                  onClick={() => handleThemeChange("system")}
                  className="flex-1 flex items-center gap-2 justify-center bg-white/10 hover:bg-white/20"
                >
                  <Monitor className="h-4 w-4" /> System
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
