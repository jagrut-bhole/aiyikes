"use client";

import { useState, useEffect } from "react";
import { userProfile, changePassword } from "@/apis/auth/authApi";
import { ProfileSchemaResponse } from "@/app/api/user/profile/profileSchema";
import { toast } from "sonner";
import { signOut, useSession } from "next-auth/react";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Header } from "@/components/Gallery/Header";
import { Lock, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";


export default function ProfilePage() {

    const { data: session, status } = useSession();

    const router = useRouter();

    const user = session?.user;

    const [profile, setProfile] = useState<ProfileSchemaResponse['data'] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await userProfile();

            if (response.success) {
                toast.success("User Profile fetched successfully");
                setProfile(response.data ?? null);
            }
        } catch (error) {
            setError("Failed to fetch user profile: " + error);
            toast.error("Failed to fetch User Profile")
        } finally {
            setLoading(false);
        }
    }

    const handleLogout = () => {
        signOut();
        router.push('/');
    }

    const handleChangePassword = async () => {

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        if (currentPassword === newPassword) {
            toast.error("New password must be different from current password");
            return;
        }

        setChangingPassword(true);
        try {
            const response = await changePassword({
                currentPassword,
                newPassword
            });

            if (response.success) {
                toast.success("Password changed successfully");
                setChangePasswordOpen(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                toast.error(response.message || "Failed to change password");
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Error changing password";
            toast.error(errorMessage);
        } finally {
            setChangingPassword(false);
        }
    }

    useEffect(() => {
        fetchProfile();
    }, []);

    if (status === 'loading' || !user || loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
                <OrbitalLoader color="white" className="text-white" message="Loading Profile" messagePlacement="bottom" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#030303]">
            <Header />
            <main className="pt-24 pb-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                            My Profile
                        </h1>
                        <p className="text-neutral-400">
                            Manage your account and view your creations
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 sm:p-8 mb-12"
                    >
                        <h2 className="text-xl font-semibold text-white mb-6">
                            Account Details
                        </h2>

                        <div className="space-y-6">
                            {/* Name */}
                            <div className="flex items-center justify-between py-4 border-b border-neutral-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500">Name</p>
                                        <p className="text-white font-medium">
                                            {profile?.name || "User"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center justify-between py-4 border-b border-neutral-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500">Email</p>
                                        <p className="text-white font-medium">
                                            {profile?.email || "email@example.com"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Password */}
                            <div className="flex items-center justify-between py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <Lock className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500">Password</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-medium">
                                                {"••••••••••••"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Dialog
                                    open={changePasswordOpen}
                                    onOpenChange={setChangePasswordOpen}
                                >
                                    <DialogTrigger asChild>
                                        <button className="cursor-pointer text-sm font-medium text-white hover:text-neutral-300 transition-colors">
                                            Change Password
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Change Password</DialogTitle>
                                            <DialogDescription>
                                                Enter your current password and a new password to update
                                                your credentials.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-white">
                                                    Current Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    className="w-full px-4 py-2 rounded-lg border border-neutral-700 bg-[#0a0a0a] text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                                                    placeholder="Enter current password"
                                                    disabled={changingPassword}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-white">
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full px-4 py-2 rounded-lg border border-neutral-700 bg-[#0a0a0a] text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                                                    placeholder="Enter new password"
                                                    disabled={changingPassword}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-white">
                                                    Confirm New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full px-4 py-2 rounded-lg border border-neutral-700 bg-[#0a0a0a] text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                                                    placeholder="Confirm new password"
                                                    disabled={changingPassword}
                                                />
                                            </div>
                                            <button
                                                onClick={handleChangePassword}
                                                disabled={changingPassword}
                                                className="w-full py-2.5 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {changingPassword ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                                        Updating...
                                                    </>
                                                ) : (
                                                    "Update Password"
                                                )}
                                            </button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </motion.div>

                    {/* My Creations Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    My Creations
                                </h2>
                                <p className="text-neutral-400">
                                    Your generated Manim animations
                                </p>
                            </div>
                            <span className="text-sm text-neutral-500">
                                {profile?.generatedImages?.length || 0} creations
                            </span>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    )
}