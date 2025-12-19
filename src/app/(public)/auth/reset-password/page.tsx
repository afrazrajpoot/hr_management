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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg-primary py-12 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        <Card className="card-primary backdrop-blur-xl overflow-hidden">
          <CardHeader className="space-y-1 text-center pb-6">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl font-bold text-foreground">
                Reset Password
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-muted-foreground">
                Enter the code sent to {emailParam || "your email"} and your new
                password
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-5">
            {!isSuccess ? (
              <motion.form
                variants={itemVariants}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="otp"
                    className="text-sm font-medium text-foreground"
                  >
                    Verification Code
                  </Label>
                  <div className="relative">
                    <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                      className="pl-10 h-11 border-input text-foreground placeholder:text-muted-foreground focus:border-ring tracking-widest"
                    />
                  </div>
                  {errors.otp && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-destructive"
                    >
                      {errors.otp.message}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                      className="pl-10 pr-10 h-11 border-input text-foreground placeholder:text-muted-foreground focus:border-ring"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                      className="text-sm text-destructive"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-foreground"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                      className="pl-10 pr-10 h-11 border-input text-foreground placeholder:text-muted-foreground focus:border-ring"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                      className="text-sm text-destructive"
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
                    className="w-full h-11 btn-gradient-primary text-primary-foreground font-medium"
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
                        className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
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
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Password Reset!
                </h3>
                <p className="text-muted-foreground mb-6">
                  Your password has been successfully reset. Redirecting to sign
                  in...
                </p>
                <Link href="/auth/sign-in">
                  <Button className="w-full btn-gradient-primary text-primary-foreground">
                    Sign In Now
                  </Button>
                </Link>
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="pt-4">
            <motion.div variants={itemVariants} className="w-full text-center">
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
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
