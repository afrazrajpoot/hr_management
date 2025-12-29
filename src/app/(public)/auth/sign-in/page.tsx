"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
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
  const [justSignedIn, setJustSignedIn] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const getFriendlyAuthError = (code: string) => {
    switch (code) {
      case "CredentialsSignin":
        return "Invalid email or password.";
      case "AccessDenied":
        return "Access denied. Please contact support if this seems wrong.";
      case "OAuthAccountNotLinked":
        return "This email is already linked to another sign-in method. Use the original provider.";
      case "Callback":
        return "Authentication failed. Please try again.";
      default:
        return "Sign-in failed. Please try again.";
    }
  };

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

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      const errorMessage = getFriendlyAuthError(errorParam);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [searchParams]);

  useEffect(() => {
    if (
      status === "authenticated" &&
      justSignedIn &&
      (session as any).redirectTo
    ) {
      toast.success("Sign-in successful! Redirecting...");
      router.push((session as any).redirectTo);
      setJustSignedIn(false);
    }
  }, [status, session, router, justSignedIn]);

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

    const email = data.email.toLowerCase();

    try {
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      const result = await signIn("credentials", {
        email: email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        const msg = getFriendlyAuthError(result.error);
        setError(msg);
        toast.error(msg);
      } else {
        setJustSignedIn(true);
        toast.success("Sign-in successful!");
      }
    } catch (error) {
      const errorMessage = "An error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
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
      toast.success(`Signing in with ${provider}...`);
    } catch (error) {
      const errorMessage = "Authentication failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
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

  const formFields = [
    {
      id: "email",
      label: "Email Address",
      type: "email",
      placeholder: "Enter your email",
      icon: (
        <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
      ),
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
      icon: (
        <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
      ),
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
                Welcome Back
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-muted-foreground">
                Sign in to your account to continue
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-5">
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

            <motion.form
              variants={itemVariants}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {formFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label
                    htmlFor={field.id}
                    className="text-sm font-medium text-foreground"
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
                      className={`pl-10 ${
                        field.id === "password" ? "pr-10" : ""
                      } h-11 border-input text-foreground placeholder:text-muted-foreground focus:border-ring`}
                    />
                    {field.id === "password" && (
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
                    )}
                  </div>
                  {errors[field.id as keyof FormData]?.message && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-destructive"
                    >
                      {errors[field.id as keyof FormData]?.message}
                    </motion.p>
                  )}
                </div>
              ))}

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                    className="border-input"
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm font-medium text-foreground"
                  >
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-muted-foreground hover:text-foreground"
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
                    "Sign In"
                  )}
                </Button>
              </motion.div>
            </motion.form>
          </CardContent>

          <CardFooter className="pt-4">
            <motion.div variants={itemVariants} className="w-full text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/auth/sign-up"
                  className="font-medium text-primary hover:text-primary/80"
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
    <Suspense fallback={<Loader />}>
      <SignInForm />
    </Suspense>
  );
};

export default SignInPage;
