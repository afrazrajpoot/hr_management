// app/pricing/page.tsx
"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import { Check, Shield, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

const products = [
  {
    name: "ESSENTIAL MEMBERSHIP",
    price: "$79.99",
    period: "/month",
    description: "Core Career Assessment & AI Insights",
    checkoutUrl:
      "https://mystoregfa.samcart.com/products/genius-factor-academy-essential-membership",
    features: [
      "AI Career Intelligence",
      "Standard Assessment Tools",
      "Digital Learning Library",
    ],
    highlight: false,
  },
  {
    name: "ELITE MEMBERSHIP",
    price: "$117.99",
    period: "/month",
    description: "Genius Factor AI Career Intelligence Platform Access",
    checkoutUrl:
      "https://mystoregfa.samcart.com/products/genius-factor-academy-elite-membership",
    features: [
      "Unlimited AI Learning Platform",
      "Career Intelligence Tools",
      "Exclusive Resources & Webinars",
      "Priority Support",
    ],
    highlight: true,
  },
  {
    name: "CAREER ACCELERATOR",
    price: "$2,499.99",
    period: " once",
    description: "Intensive Career Transformation Program",
    checkoutUrl:
      "https://mystoregfa.samcart.com/products/genius-factor-career-alignment-accelerator-course",
    features: [
      "4-Week Virtual Course",
      "Live Group coaching Calls",
      "Career Alignment Blueprint",
    ],
    highlight: false,
  },
  {
    name: "MASTERMIND PROGRAM",
    price: "$17,999.99",
    period: " once",
    description: "Exclusive High-Level Executive Coaching",
    checkoutUrl:
      "https://mystoregfa.samcart.com/products/mastermind-coaching-program",
    features: [
      "1-on-1 Strategy Sessions",
      "VIP Event Access",
      "Lifetime Community Membership",
    ],
    highlight: false,
  },
];

const PricingPage: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handlePurchase = async (product: (typeof products)[0]) => {
    if (!session) {
      toast.error("Please sign in to continue");
      router.push("/auth/sign-in");
      return;
    }

    setLoadingId(product.name);

    try {
      const response = await axios.post("/api/payment/create-order", {
        planName: product.name,
        price: product.price,
        checkoutUrl: product.checkoutUrl,
        email: session.user.email,
        firstName:
          (session.user as any).firstName ||
          session.user.name?.split(" ")[0] ||
          "",
        lastName:
          (session.user as any).lastName ||
          session.user.name?.split(" ")[1] ||
          "",
      });

      if (response.data.success && response.data.checkoutUrl) {
        toast.success(`Redirecting to ${product.name} checkout...`);
        setTimeout(() => {
          window.location.href = response.data.checkoutUrl;
        }, 500);
      } else {
        throw new Error("Failed to get checkout URL");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Payment initialization failed"
      );
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen gradient-bg-primary py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Choose Your Path to Mastery
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Select the plan that best aligns with your career goals and let AI
              accelerate your progress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div
                key={product.name}
                className={`card-primary p-8 border-2 rounded-3xl shadow-lg flex flex-col transition-all hover:scale-[1.02] ${
                  product.highlight
                    ? "border-primary ring-4 ring-primary/10"
                    : "border-transparent"
                }`}
              >
                {product.highlight && (
                  <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full self-center mb-4 uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <h2 className="text-xl font-bold mb-2 text-center">
                  {product.name}
                </h2>
                <p className="text-muted-foreground text-sm mb-6 text-center h-10">
                  {product.description}
                </p>

                <div className="flex items-baseline justify-center gap-1 mb-8">
                  <span className="text-3xl font-extrabold">
                    {product.price}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {product.period}
                  </span>
                </div>

                <div className="space-y-4 mb-8 flex-grow">
                  {product.features.map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      <span className="text-sm">{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handlePurchase(product)}
                  disabled={!!loadingId}
                  className={`w-full py-4 px-6 font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                    product.highlight
                      ? "bg-primary text-white hover:opacity-90"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  } disabled:opacity-50`}
                >
                  {loadingId === product.name ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    "Get Started"
                  )}
                </button>

                <div className="mt-4 text-[10px] text-muted-foreground flex items-center justify-center gap-2">
                  <Shield className="w-3 h-3" />
                  Secure checkout via SamCart
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PricingPage;
