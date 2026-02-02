"use client";

import { useState, useEffect } from "react";
import { userProfile, changePassword } from "@/apis/auth/authApi";
import { uploadAvatar, getUserImages, UserImage } from "@/apis/user/userApi";
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
import { Lock, Mail, User, Camera, Download, Heart, Repeat2, User2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { AvatarUploader } from "@/components/ui/avatar-uploader";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function ProfilePage() {

    const { data: session, status, update } = useSession();

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
    const [avatarUrl, setAvatarUrl] = useState<string>("");
    const [userImages, setUserImages] = useState<UserImage[]>([]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await userProfile();

            if (response.success) {
                toast.success("User Profile fetched successfully");
                setProfile(response.data ?? null);
                setAvatarUrl(response.data?.avatar || "");
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

    const handleAvatarUpload = async (file: File) => {
        try {
            const result = await uploadAvatar(file);
            if (result.success && result.avatarUrl) {
                setAvatarUrl(result.avatarUrl);
                toast.success("Avatar updated successfully!");

                // Reload page to refresh session with new avatar
                setTimeout(() => {
                    window.location.reload();
                }, 500);

                return { success: true };
            }
            toast.error("Failed to upload avatar");
            return { success: false };
        } catch (error) {
            console.error("Avatar upload error:", error);
            toast.error("Failed to upload avatar");
            return { success: false };
        }
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

    const fetchImages = async () => {
        try {
            const response = await getUserImages();
            if (response.success && response.data) {
                setUserImages(response.data);
            }
        } catch (error) {
            console.error("Error fetching user images:", error);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchImages();
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
                            {/* Avatar Upload */}
                            <div className="flex items-center justify-center py-6 border-b border-neutral-800">
                                <AvatarUploader onUpload={handleAvatarUpload}>
                                    <div className="relative group cursor-pointer">
                                        <Avatar className="h-24 w-24 border-2 border-neutral-700 hover:border-white transition-colors">
                                            <AvatarImage
                                                src={avatarUrl || profile?.avatar || `https://images.unsplash.com/photo-1567446537708-ac4aa75c9c28?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D || 'user'}`}
                                                alt={profile?.name || "User avatar"}
                                            />
                                            <AvatarFallback className="bg-neutral-800 text-white text-2xl">
                                                {profile?.name?.charAt(0).toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </AvatarUploader>
                                <div className="ml-4">
                                    <p className="text-white font-medium">Profile Picture</p>
                                    <p className="text-sm text-neutral-500">Click to upload new avatar</p>
                                </div>
                            </div>

                            {/* Name */}
                            <div className="flex items-center justify-between py-4 border-b border-neutral-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500">Name</p>
                                        <p className="text-white font-medium">{profile?.name || "Not set"}</p>
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
                                        <p className="text-white font-medium">{profile?.email || "Not set"}</p>
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
                                        <p className="text-white font-medium">••••••••</p>
                                    </div>
                                </div>
                                <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
                                    <DialogTrigger asChild>
                                        <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors">
                                            Change Password
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-[#0a0a0a] border-neutral-800">
                                        <DialogHeader>
                                            <DialogTitle className="text-white">Change Password</DialogTitle>
                                            <DialogDescription className="text-neutral-400">
                                                Enter your current password and choose a new one
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
                                    Your AI-generated images
                                </p>
                            </div>
                            <span className="text-sm text-neutral-500">
                                {userImages.length} creations
                            </span>
                        </div>

                        {/* Image Grid */}
                        {userImages.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userImages.map((image, index) => (
                                    <motion.div
                                        key={image.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="bg-[#0a0a0a] border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors group"
                                    >
                                        {/* Image */}
                                        <div className="aspect-square relative overflow-hidden">
                                            <img
                                                src={image.s3Url}
                                                alt={image.prompt}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="p-4 space-y-3">
                                            {/* Model badge */}
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-neutral-800 text-neutral-300">
                                                    {image.model}
                                                </span>
                                                <span className="text-xs text-neutral-500">
                                                    {new Date(image.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {/* Prompt */}
                                            <p className="text-sm text-neutral-400 line-clamp-2">
                                                {image.prompt}
                                            </p>

                                            {/* Stats */}
                                            <div className="flex items-center gap-4 pt-2 border-t border-neutral-800">
                                                <div className="flex items-center gap-1 text-neutral-500 text-sm">
                                                    <Heart className="w-4 h-4" />
                                                    <span>{image.likeCount}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-neutral-500 text-sm">
                                                    <Repeat2 className="w-4 h-4" />
                                                    <span>{image.remixCount}</span>
                                                </div>
                                            </div>

                                            {/* Download Button */}
                                            <button
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = image.s3Url;
                                                    link.download = `aiyikes-${image.id}.jpg`;
                                                    link.target = '_blank';
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                                    <User2 className="w-8 h-8 text-neutral-500" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">
                                    No creations yet
                                </h3>
                                <p className="text-neutral-500 mb-4">
                                    Start creating AI-generated images to see them here
                                </p>
                                <button
                                    onClick={() => router.push('/create')}
                                    className="px-6 py-2.5 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 transition-colors"
                                >
                                    Create Your First Image
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    )
}