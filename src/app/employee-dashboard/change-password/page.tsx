"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import {
    useCreateOrUpdateEmployeeMutation,
    useGetEmployeeQuery,
} from "@/redux/employe-api";
import { toast } from "sonner";
import Loader from "@/components/Loader";
import {
    Shield,
    Key,
    CheckCircle,
    AlertCircle,
    Save,
    Lock,
    Eye,
    EyeOff,
    Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const ChangePasswordPage: React.FC = () => {
    const { status } = useSession();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(true);

    const {
        data: employeeData,
        isLoading: isFetching,
        error: fetchError,
    } = useGetEmployeeQuery();

    const [createOrUpdateEmployee, { isLoading: isMutating }] =
        useCreateOrUpdateEmployeeMutation();

    useEffect(() => {
        if (fetchError) {
            toast.error("Failed to load profile data");
        }
    }, [fetchError]);

    useEffect(() => {
        if (confirmPassword) {
            setPasswordsMatch(newPassword === confirmPassword);
        } else {
            setPasswordsMatch(true); // Don't show error if confirm is empty
        }
    }, [newPassword, confirmPassword]);

    const handleSave = async () => {
        if (!newPassword) {
            toast.error("Please enter a new password");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (!employeeData) {
            toast.error("Employee data not loaded properly");
            return;
        }

        const toastId = toast.loading("Updating password...");
        try {
            const saveData = {
                ...(employeeData as any),
                password: newPassword,
            };

            await createOrUpdateEmployee(saveData as any).unwrap();

            toast.success("Password updated successfully!", {
                id: toastId,
                icon: <CheckCircle className="w-5 h-5 text-success" />,
            });
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            console.error("Error updating password:", error);
            const errorMessage =
                error?.data?.error || "Failed to update password";
            toast.error(errorMessage, {
                id: toastId,
                icon: <AlertCircle className="w-5 h-5 text-destructive" />,
            });
        }
    };

    if (status === "loading" || isFetching) {
        return (
            <AppLayout>
                <Loader />
            </AppLayout>
        );
    }

    // Password strength calculation
    const calculateStrength = (password: string) => {
        let score = 0;
        if (!password) return 0;
        if (password.length > 5) score += 1;
        if (password.length > 9) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        return score;
    };

    const strengthScore = calculateStrength(newPassword);
    const getStrengthLabel = () => {
        switch (strengthScore) {
            case 0:
            case 1:
                return { label: "Weak", color: "bg-destructive", text: "text-destructive" };
            case 2:
            case 3:
                return { label: "Medium", color: "bg-warning", text: "text-warning" };
            case 4:
            case 5:
                return { label: "Strong", color: "bg-success", text: "text-success" };
            default:
                return { label: "Weak", color: "bg-destructive", text: "text-destructive" };
        }
    };

    const strength = getStrengthLabel();

    return (
        <AppLayout>
            <div className="min-h-screen bg-layout-purple p-4 md:p-6 flex flex-col">
                {/* Decorative Background Elements */}
                <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-blue-400/20 blur-3xl opacity-30" />
                    <div className="absolute bottom-20 right-10 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl opacity-30" />
                </div>

                <div className="max-w-6xl mx-auto w-full relative z-10 flex-1 flex flex-col lg:flex-row gap-8 items-center justify-center">
                    {/* Left Side - Visual & Information */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex-1 space-y-8 w-full lg:max-w-lg"
                    >
                        <div className="space-y-4">
                            <div className="icon-brand p-3 rounded-2xl mb-4">
                                <Shield className="w-10 h-10 text-purple-accent" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gradient-purple">
                                Secure Your <br /> Digital Identity
                            </h1>
                            <p className="text-lg text-on-matte-subtle leading-relaxed max-w-md">
                                Keep your account safe with a strong, diverse password. Regular updates help protect your personal and professional information.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="surface-matte-elevated p-4 rounded-xl border-matte backdrop-blur-sm">
                                <div className="icon-success p-2 rounded-lg w-fit mb-3">
                                    <CheckCircle className="w-5 h-5 text-success" />
                                </div>
                                <h3 className="font-semibold text-on-matte">Regular Updates</h3>
                                <p className="text-sm text-on-matte-subtle mt-1">Change every 90 days</p>
                            </div>
                            <div className="surface-matte-elevated p-4 rounded-xl border-matte backdrop-blur-sm">
                                <div className="icon-brand p-2 rounded-lg w-fit mb-3">
                                    <Key className="w-5 h-5 text-purple-accent" />
                                </div>
                                <h3 className="font-semibold text-on-matte">Complex is Better</h3>
                                <p className="text-sm text-on-matte-subtle mt-1">Mix symbols & case</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Side - Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex-1 w-full max-w-md"
                    >
                        <Card className="surface-matte-elevated border-matte shadow-prominent relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-purple" />
                            <CardHeader className="space-y-1 pb-2">
                                <CardTitle className="text-2xl font-bold text-on-matte flex items-center gap-2">
                                    Change Password
                                </CardTitle>
                                <CardDescription className="text-on-matte-subtle">
                                    Create a new password for your account
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6 pt-4">
                                {/* New Password Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="new-password" className="text-on-matte">New Password</Label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                            <Lock className="h-4 w-4 text-on-matte-subtle" />
                                        </div>
                                        <Input
                                            id="new-password"
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="Enter password"
                                            className="pl-9 pr-10 bg-transparent border-border"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-matte-subtle hover:text-on-matte transition-colors focus:outline-none"
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>

                                    {/* Password Strength Meter */}
                                    <div className="space-y-1.5 pt-1">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-on-matte-subtle">Strength</span>
                                            <span className={`font-medium ${strength.text}`}>{strength.label}</span>
                                        </div>
                                        <div className="flex gap-1 h-1.5 w-full">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-full rounded-full flex-1 transition-all duration-500 ${strengthScore >= level ? strength.color : "bg-muted"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Confirm Password Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password" className="text-on-matte">Confirm Password</Label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                            <Lock className="h-4 w-4 text-on-matte-subtle" />
                                        </div>
                                        <Input
                                            id="confirm-password"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm password"
                                            className={`pl-9 pr-10 bg-transparent border-border ${!passwordsMatch && confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""
                                                }`}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-matte-subtle hover:text-on-matte transition-colors focus:outline-none"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <AnimatePresence>
                                        {!passwordsMatch && confirmPassword && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="text-xs text-destructive flex items-center gap-1 mt-1"
                                            >
                                                <AlertCircle className="w-3 h-3" /> Passwords do not match
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Password Requirements Checklist */}
                                <div className="space-y-2 bg-muted/30 p-3 rounded-lg border border-border/50">
                                    <p className="text-xs font-semibold text-on-matte-subtle mb-2">Requirements:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <RequirementItem label="6+ Characters" met={newPassword.length >= 6} />
                                        <RequirementItem label="One Number" met={/[0-9]/.test(newPassword)} />
                                        <RequirementItem label="One Uppercase" met={/[A-Z]/.test(newPassword)} />
                                        <RequirementItem label="One Special Char" met={/[^A-Za-z0-9]/.test(newPassword)} />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSave}
                                    disabled={!newPassword || !confirmPassword || !passwordsMatch || isMutating}
                                    className="w-full h-11 btn-purple shadow-lg hover-lift"
                                >
                                    {isMutating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                            Updating Security...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Update Password
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
};

const RequirementItem = ({ label, met }: { label: string; met: boolean }) => (
    <div className={`flex items-center gap-1.5 text-xs transition-colors duration-300 ${met ? "text-success" : "text-on-matte-subtle"}`}>
        {met ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
        {label}
    </div>
);

export default ChangePasswordPage;