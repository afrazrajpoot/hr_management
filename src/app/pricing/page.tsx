// app/pricing/page.tsx
"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import { Check, Shield, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

const product = {
  name: "ELITE MEMBERSHIP",
  price: "$117.99",
  period: "/month",
  description: "Genius Factor AI Career Intelligence Platform Access",
  features: [
    "Unlimited Access to AI Learning Platform",
    "Career Intelligence Tools",
    "Exclusive Resources & Webinars",
  ],
  // Use the product slug from your SamCart URL
  samcartProductSlug: "genius-factor-academy-elite-membership",
  // Your actual checkout URL
  checkoutUrl:
    "https://mystoregfa.samcart.com/products/genius-factor-academy-elite-membership",
};

const PricingPage: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!session) {
      toast.error("Please sign in to continue");
      router.push("/auth/sign-in");
      return;
    }

    setLoading(true);

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
        toast.success("Redirecting to checkout...");

        // Small delay for user feedback
        setTimeout(() => {
          window.location.href = response.data.checkoutUrl;
        }, 500);
      } else {
        throw new Error("Failed to get checkout URL");
      }
    } catch (error: any) {
      console.error("Payment error:", error);

      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to initialize payment";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen gradient-bg-primary py-20 px-6 flex justify-center">
        <div className="card-primary p-10 max-w-md w-full border-2 rounded-3xl shadow-lg text-center">
          <h2 className="text-3xl font-bold mb-4">{product.name}</h2>
          <p className="text-muted-foreground mb-6">{product.description}</p>

          <div className="flex items-baseline justify-center gap-2 mb-6">
            <span className="text-4xl font-extrabold">{product.price}</span>
            <span className="text-muted-foreground">{product.period}</span>
          </div>

          <div className="space-y-3 mb-8">
            {product.features.map((f) => (
              <div key={f} className="flex items-center gap-3 justify-center">
                <Check className="w-4 h-4 text-success" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full py-4 px-6 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              "Purchase Now"
            )}
          </button>

          <div className="mt-4 text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Shield className="w-3 h-3" />
            Secure payment via SamCart
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PricingPage;
