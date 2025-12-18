"use client";

import { useState, Suspense } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import Loader from "@/components/Loader";

type FormData = {
  password: string;
  confirmPassword: string;
};

const ResetPasswordForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData & { otp: string }>({
    defaultValues: {
      password: "",
      confirmPassword: "",
      otp: "",
    },
  });

  const onSubmit: SubmitHandler<FormData & { otp: string }> = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: data.otp,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      setIsSuccess(true);
      toast.success("Password reset successfully!");
      
      // Redirect after a delay
      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants: any = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const backgroundVariants: any = {
    animate: {
      backgroundPosition: ["0% 0%", "100% 100%"],
      transition: {
        duration: 20,
        ease: "linear",
        repeat: Infinity,
        repeatType: "reverse" as const,
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900">
      <motion.div
        variants={backgroundVariants}
        animate="animate"
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        style={{
          backgroundSize: "400% 400%",
        }}
      />

      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 80,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-1/2 -right-1/2 w-full h-full opacity-5"
        >
          <div className="w-96 h-96 border border-slate-700/20 rounded-full" />
          <div className="w-80 h-80 border border-slate-600/20 rounded-full absolute top-8 left-8" />
          <div className="w-64 h-64 border border-slate-500/20 rounded-full absolute top-16 left-16" />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md p-6"
      >
        <Card className="backdrop-blur-xl bg-slate-800/80 shadow-2xl border border-slate-700/50 rounded-2xl">
          <CardHeader className="space-y-1 text-center pb-8">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-3xl font-bold text-white mb-2">
                Reset Password
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-slate-400 text-base">
                Enter the code sent to {emailParam || "your email"} and your new password
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6">
            {!isSuccess ? (
              <motion.form
                variants={itemVariants}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="otp"
                    className="text-sm font-medium text-slate-300"
                  >
                    Verification Code
                  </Label>
                  <div className="relative">
                    <CheckCircle className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      {...register("otp", {
                        required: "Verification code is required",
                        minLength: {
                          value: 6,
                          message: "Code must be 6 digits",
                        },
                        maxLength: {
                          value: 6,
                          message: "Code must be 6 digits",
                        },
                      })}
                      disabled={isLoading}
                      className="pl-10 h-12 bg-slate-700/50 dark:bg-slate-700/50 bg-slate-100 border-slate-600 dark:border-slate-600 border-slate-300 focus:border-slate-500 dark:focus:border-slate-500 focus:border-primary text-foreground placeholder:text-muted-foreground rounded-lg transition-all duration-300 tracking-widest"
                    />
                  </div>
                  {errors.otp && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-500"
                    >
                      {errors.otp.message}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-300"
                  >
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      disabled={isLoading}
                      className="pl-10 pr-10 h-12 bg-slate-700/50 dark:bg-slate-700/50 bg-slate-100 border-slate-600 dark:border-slate-600 border-slate-300 focus:border-slate-500 dark:focus:border-slate-500 focus:border-primary text-foreground placeholder:text-muted-foreground rounded-lg transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-500"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-slate-300"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (val) => {
                          if (watch("password") != val) {
                            return "Your passwords do not match";
                          }
                        },
                      })}
                      disabled={isLoading}
                      className="pl-10 pr-10 h-12 bg-slate-700/50 dark:bg-slate-700/50 bg-slate-100 border-slate-600 dark:border-slate-600 border-slate-300 focus:border-slate-500 dark:focus:border-slate-500 focus:border-primary text-foreground placeholder:text-muted-foreground rounded-lg transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-500"
                    >
                      {errors.confirmPassword.message}
                    </motion.p>
                  )}
                </div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="pt-2"
                >
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </motion.div>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Password Reset!</h3>
                <p className="text-slate-400 mb-6">
                  Your password has been successfully reset. Redirecting to sign in...
                </p>
                <Link href="/auth/sign-in">
                  <Button
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    Sign In Now
                  </Button>
                </Link>
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="pt-6">
            <motion.div variants={itemVariants} className="w-full text-center">
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Link>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={<Loader />}>
      <ResetPasswordForm />
    </Suspense>
  );
};

export default ResetPasswordPage;
