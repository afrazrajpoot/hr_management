"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Mail, ArrowLeft } from "lucide-react";
import Loader from "@/components/Loader";

type FormData = {
  email: string;
};

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      setIsSubmitted(true);
      toast.success("Reset code sent to your email!");

      setTimeout(() => {
        router.push(
          `/auth/reset-password?email=${encodeURIComponent(data.email)}`
        );
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset code");
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
                Forgot Password
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-muted-foreground">
                Enter your email address and we'll send you a link to reset your
                password
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-5">
            {!isSubmitted ? (
              <motion.form
                variants={itemVariants}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /\S+@\S+\.\S+/,
                          message: "Invalid email address",
                        },
                      })}
                      disabled={isLoading}
                      className="pl-10 h-11 border-input text-foreground placeholder:text-muted-foreground focus:border-ring"
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-destructive"
                    >
                      {errors.email.message}
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
                      "Send Reset Link"
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
                  <Mail className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Check your email
                </h3>
                <p className="text-muted-foreground mb-6">
                  We've sent a password reset link to your email address.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsSubmitted(false)}
                  className="text-foreground border-input hover:bg-secondary hover:text-foreground"
                >
                  Try another email
                </Button>
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

export default ForgotPasswordPage;
