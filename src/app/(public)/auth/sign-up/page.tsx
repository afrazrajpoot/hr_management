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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, Chrome, Phone } from "lucide-react";
import Loader from "@/components/Loader";

type FormData = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  role: string;
};

const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      password: "",
      role: "Employee",
    },
  });

  const password = watch("password");

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      const errorMessage =
        errorParam === "Callback"
          ? "Authentication failed. Please try again."
          : errorParam;
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [searchParams]);

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-600";
    if (passwordStrength === 3) return "bg-yellow-600";
    if (passwordStrength === 4) return "bg-blue-500";
    return "bg-blue-600";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength === 3) return "Medium";
    if (passwordStrength === 4) return "Strong";
    return "Very Strong";
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError("");

    if (!acceptTerms) {
      setError("Please accept the terms and conditions");
      toast.error("Please accept the terms and conditions");
      setIsLoading(false);
      return;
    }

    const email = data.email.toLowerCase();

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          email,
          password: data.password,
          role: data.role,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = payload?.error || "Registration failed";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Account created successfully! Please verify your email.");
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const formFields = [
    {
      id: "firstName",
      label: "First Name",
      type: "text",
      placeholder: "Enter your first name",
      icon: (
        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-white" />
      ),
      registerOptions: {
        required: "First name is required",
        minLength: {
          value: 2,
          message: "First name must be at least 2 characters",
        },
      },
    },
    {
      id: "lastName",
      label: "Last Name",
      type: "text",
      placeholder: "Enter your last name",
      icon: (
        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-white" />
      ),
      registerOptions: {
        required: "Last name is required",
        minLength: {
          value: 2,
          message: "Last name must be at least 2 characters",
        },
      },
    },
    {
      id: "phoneNumber",
      label: "Phone Number",
      type: "tel",
      placeholder: "Enter your phone number",
      icon: (
        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-white" />
      ),
      registerOptions: {
        required: "Phone number is required",
      },
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter your email",
      icon: (
        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-white" />
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
      placeholder: "Create a password",
      icon: (
        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-white" />
      ),
      registerOptions: {
        required: "Password is required",
        minLength: {
          value: 8,
          message: "Password must be at least 8 characters",
        },
        pattern: {
          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/,
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        },
      },
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-layout-purple py-12 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-lg"
      >
        <Card className="card-purple backdrop-blur-xl overflow-hidden">
          <CardHeader className="space-y-2 text-center">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl font-semibold gradient-text-primary">
                Create Your Account
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-muted-foreground">
                Sign up to get started with your account
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

            <motion.div variants={itemVariants} className="relative">
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Continue with email
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
                      onChange={(e) => {
                        register(field.id as keyof FormData).onChange(e);
                        if (field.id === "password") {
                          setPasswordStrength(
                            checkPasswordStrength(e.target.value)
                          );
                        }
                      }}
                      className={`!pl-12 ${field.id === "password" ? "!pr-12" : ""
                        } h-12 input-purple transition-colors`}
                    />
                    {field.id === "password" && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:hover:text-white hover:text-gray-700 transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
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

              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Password strength:
                    </span>
                    <span
                      className={`font-medium ${passwordStrength <= 2
                          ? "text-red-600"
                          : passwordStrength === 3
                            ? "text-yellow-600"
                            : "text-blue-500"
                        }`}
                    >
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${getPasswordStrengthColor()}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="role"
                  className="text-sm font-medium text-foreground"
                >
                  Role
                </Label>
                <Select
                  onValueChange={(value) => setValue("role", value)}
                  defaultValue="Employee"
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11 bg-card border-input text-foreground">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-input">
                    <SelectItem
                      value="Employee"
                      className="select-dropdown-item"
                    >
                      Employee
                    </SelectItem>
                    {/* <SelectItem value="HR" className="select-dropdown-item">
                      HR
                    </SelectItem> */}
                    {/* <SelectItem value="Admin" className="select-dropdown-item">
                      Admin
                    </SelectItem> */}
                  </SelectContent>
                </Select>
              </div>

              <motion.div
                variants={itemVariants}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => {
                    setAcceptTerms(checked as boolean);
                  }}
                  className="border-input"
                />
                <Label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-none"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms-of-service"
                    className="text-primary hover:text-primary/80"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-primary hover:text-primary/80"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full h-11 btn-purple font-medium shadow-md hover:shadow-lg transition-all duration-300"
                  disabled={isLoading || !acceptTerms}
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
                    "Create Account"
                  )}
                </Button>
              </motion.div>
            </motion.form>
          </CardContent>

          <CardFooter>
            <motion.div variants={itemVariants} className="w-full text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/auth/sign-in"
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

const SignUpPage = () => {
  return (
    <Suspense fallback={<Loader />}>
      <SignUpForm />
    </Suspense>
  );
};

export default SignUpPage;
