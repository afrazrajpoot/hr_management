"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams, } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner"; // Import sonner
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, Github, Chrome } from "lucide-react";
import Loader from "@/components/Loader";

type FormData = {
  email: string;
  password: string;
};

const SignInForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle query parameter errors
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      const errorMessage =
        errorParam === "Callback"
          ? "Authentication failed. Please try again."
          : errorParam;
      setError(errorMessage);
      toast.error(errorMessage); // Show error toast
    }
  }, [searchParams]);

  // Handle redirection based on session.redirectTo
  useEffect(() => {
    if (status === "authenticated" && (session as any).redirectTo) {
      toast.success("Sign-in successful! Redirecting..."); // Show success toast
      router.push((session as any).redirectTo);
    }
  }, [status, session, router]);

  // Load email from localStorage on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setValue("email", savedEmail);
      setRememberMe(true);
    }
  }, [setValue]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError("");

    try {
      // Save email to localStorage if "Remember Me" is checked
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", data.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please try again.");
        toast.error("Invalid credentials. Please try again."); // Show error toast
      } else {
        toast.success("Sign-in successful!"); // Show success toast
      }
    } catch (error) {
      const errorMessage = "An error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage); // Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true);
    try {
      const callbackUrl =
        searchParams.get("callbackUrl") || "/employee-dashboard";
      await signIn(provider, { callbackUrl });
      toast.success(`Signing in with ${provider}...`); // Show OAuth sign-in toast
    } catch (error) {
      const errorMessage = "Authentication failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage); // Show error toast
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

  const formFields = [
    {
      id: "email",
      label: "Email Address",
      type: "email",
      placeholder: "Enter your email",
      icon: <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />,
      registerOptions: {
        required: "Email is required",
        pattern: {
          value: /\S+@\S+\.\S+/,
          message: "Invalid email address",
        },
      },
    },
    {
      id: "password",
      label: "Password",
      type: showPassword ? "text" : "password",
      placeholder: "Enter your password",
      icon: <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />,
      registerOptions: {
        required: "Password is required",
        minLength: {
          value: 6,
          message: "Password must be at least 6 characters",
        },
      },
    },
  ];

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
                Welcome Back
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-slate-400 text-base">
                Sign in to your account to continue
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleOAuthSignIn("github")}
                  disabled={isLoading}
                  className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 text-slate-200 h-11"
                >
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOAuthSignIn("google")}
                  disabled={isLoading}
                  className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 text-slate-200 h-11"
                >
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  <Chrome className="w-4 h-4 mr-2" />
                  Google
                </Button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800 px-3 text-slate-400 font-medium">
                  Or continue with email
                </span>
              </div>
            </motion.div>

            <motion.form
              variants={itemVariants}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {formFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label
                    htmlFor={field.id}
                    className="text-sm font-medium text-slate-300"
                  >
                    {field.label}
                  </Label>
                  <div className="relative">
                    {field.icon}
                    <Input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      {...register(
                        field.id as keyof FormData,
                        field.registerOptions
                      )}
                      disabled={isLoading}
                      className={`pl-10 ${field.id === "password" ? "pr-10" : ""
                        } h-12 bg-slate-700/50 border-slate-600 focus:border-slate-500 text-white placeholder:text-slate-400 rounded-lg transition-all duration-300`}
                    />
                    {field.id === "password" && (
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
                    )}
                  </div>
                  {errors[field.id as keyof FormData]?.message && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-500"
                    >
                      {errors[field.id as keyof FormData]?.message}
                    </motion.p>
                  )}
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                    className="border-slate-600"
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm font-medium text-slate-300"
                  >
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-slate-400 hover:text-slate-200 transition-colors duration-300"
                >
                  Forgot password?
                </Link>
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
                    "Sign In"
                  )}
                </Button>
              </motion.div>
            </motion.form>
          </CardContent>

          <CardFooter className="pt-6">
            <motion.div variants={itemVariants} className="w-full text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?{" "}
                <Link
                  href="/auth/sign-up"
                  className="font-medium text-slate-200 hover:text-white transition-colors duration-300"
                >
                  Sign up
                </Link>
              </p>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

const SignInPage = () => {
  return (
    <Suspense fallback={
      <Loader />
    }>
      <SignInForm />
    </Suspense>
  );
};

export default SignInPage;
