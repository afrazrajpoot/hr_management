"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Cookie, Shield, ExternalLink } from "lucide-react";
import Link from "next/link";

interface CookieConsentProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept, onDecline }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (consent === null) {
      // No consent given yet, show banner
      setIsVisible(true);
    } else {
      setHasConsent(consent === "accepted");
      // Show reset option for testing (only when consent exists)
      setShowReset(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setHasConsent(true);
    setIsVisible(false);
    onAccept?.();
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setHasConsent(false);
    setIsVisible(false);
    onDecline?.();
  };

  const handleDismiss = () => {
    // For dismiss, we'll treat it as accepted for essential cookies only
    localStorage.setItem("cookie-consent", "essential-only");
    setHasConsent(false);
    setIsVisible(false);
  };

  const handleResetConsent = () => {
    localStorage.removeItem("cookie-consent");
    setHasConsent(null);
    setIsVisible(true);
    setShowReset(false);
  };

  if (hasConsent !== null && !isVisible) {
    // Show a small reset button for testing purposes
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={handleResetConsent}
          variant="outline"
          size="sm"
          className="text-xs bg-background/80 backdrop-blur-sm border-muted"
        >
          Reset Cookie Consent
        </Button>
      </div>
    );
  }

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <Card className="mx-auto max-w-4xl bg-background/95 backdrop-blur-sm border shadow-lg">
            <div className="flex items-start gap-4 p-6">
              <div className="flex-shrink-0">
                <Cookie className="h-6 w-6 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Cookie & Privacy Consent
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We use cookies and similar technologies to enhance your experience,
                  analyze site usage, and assist in our marketing efforts. By accepting,
                  you consent to our use of cookies. You can learn more about how we
                  use your data in our{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
                  >
                    Privacy Policy
                    <ExternalLink className="h-3 w-3" />
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/cookie-policy"
                    className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
                  >
                    Cookie Policy
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  .
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleAccept}
                    className="btn-gradient-primary text-primary-foreground"
                    size="sm"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Accept All
                  </Button>
                  <Button
                    onClick={handleDecline}
                    variant="outline"
                    size="sm"
                    className="border-input hover:bg-muted"
                  >
                    Decline Non-Essential
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Dismiss
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="flex-shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
