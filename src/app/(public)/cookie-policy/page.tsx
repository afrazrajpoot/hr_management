"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Cookie, Settings, Shield } from "lucide-react";

const CookiePolicyPage = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        <Link
          href="/auth/sign-in"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Link>

        <div className="bg-slate-800/90 rounded-2xl border border-slate-700/50 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <Cookie className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Cookie Policy
            </h1>
          </div>
          <p className="text-slate-400 mb-8">Last updated: December 19, 2025</p>

          <div className="prose prose-invert max-w-none space-y-6 text-slate-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                1. What Are Cookies
              </h2>
              <p>
                Cookies are small text files that are stored on your device when you
                visit our website. They help us provide you with a better browsing
                experience by remembering your preferences and understanding how you
                use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                2. Types of Cookies We Use
              </h2>

              <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-medium text-white">Essential Cookies</h3>
                </div>
                <p className="text-sm text-slate-300 mb-2">
                  These cookies are necessary for the website to function and cannot be switched off.
                </p>
                <ul className="list-disc pl-6 text-sm space-y-1">
                  <li>Authentication and security cookies</li>
                  <li>Session management cookies</li>
                  <li>CSRF protection tokens</li>
                </ul>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-medium text-white">Functional Cookies</h3>
                </div>
                <p className="text-sm text-slate-300 mb-2">
                  These cookies enable the website to provide enhanced functionality and personalization.
                </p>
                <ul className="list-disc pl-6 text-sm space-y-1">
                  <li>User preference settings (theme, language)</li>
                  <li>Remember me functionality</li>
                  <li>Form data preservation</li>
                </ul>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Cookie className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-medium text-white">Analytics Cookies</h3>
                </div>
                <p className="text-sm text-slate-300 mb-2">
                  These cookies help us understand how visitors interact with our website.
                </p>
                <ul className="list-disc pl-6 text-sm space-y-1">
                  <li>Page view tracking</li>
                  <li>User journey analysis</li>
                  <li>Performance monitoring</li>
                  <li>Error tracking and debugging</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                3. How We Use Cookies
              </h2>
              <p>We use cookies for the following purposes:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <strong className="text-white">Authentication:</strong> To keep you
                  logged in and maintain secure sessions
                </li>
                <li>
                  <strong className="text-white">User Experience:</strong> To remember
                  your preferences and settings
                </li>
                <li>
                  <strong className="text-white">Analytics:</strong> To understand how
                  our platform is used and identify areas for improvement
                </li>
                <li>
                  <strong className="text-white">Security:</strong> To protect against
                  fraud and unauthorized access
                </li>
                <li>
                  <strong className="text-white">Performance:</strong> To monitor
                  application performance and user interactions
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                4. Third-Party Cookies
              </h2>
              <p>
                We may use third-party services that set their own cookies. These
                include:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <strong className="text-white">NextAuth.js:</strong> For
                  authentication with external providers
                </li>
                <li>
                  <strong className="text-white">Analytics Services:</strong> For
                  website usage analysis (when consented to)
                </li>
                <li>
                  <strong className="text-white">Error Monitoring:</strong> For
                  tracking and resolving application errors
                </li>
              </ul>
              <p className="mt-3">
                These third parties have their own privacy policies and cookie
                practices, which we encourage you to review.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                5. Cookie Consent
              </h2>
              <p>
                When you first visit our website, you'll see a cookie consent banner
                that allows you to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <strong className="text-white">Accept All:</strong> Enable all cookies
                  for the best experience
                </li>
                <li>
                  <strong className="text-white">Decline Non-Essential:</strong> Only
                  allow essential cookies required for basic functionality
                </li>
                <li>
                  <strong className="text-white">Dismiss:</strong> Hide the banner
                  (essential cookies will still be used)
                </li>
              </ul>
              <p className="mt-3">
                You can change your cookie preferences at any time by clearing your
                browser's cookies or contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                6. Managing Cookies
              </h2>
              <p>You can control cookies through your browser settings:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <strong className="text-white">Chrome:</strong> Settings → Privacy and
                  security → Cookies and other site data
                </li>
                <li>
                  <strong className="text-white">Firefox:</strong> Settings → Privacy &
                  Security → Cookies and Site Data
                </li>
                <li>
                  <strong className="text-white">Safari:</strong> Preferences → Privacy
                  → Manage Website Data
                </li>
                <li>
                  <strong className="text-white">Edge:</strong> Settings → Cookies and
                  site permissions → Cookies and site data
                </li>
              </ul>
              <p className="mt-3 text-amber-300">
                <strong>Note:</strong> Disabling certain cookies may affect the
                functionality of our platform and limit your user experience.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                7. Cookie Retention
              </h2>
              <p>
                Different types of cookies have different lifespans:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <strong className="text-white">Session Cookies:</strong> Deleted when
                  you close your browser
                </li>
                <li>
                  <strong className="text-white">Persistent Cookies:</strong> Remain
                  until deleted or expired (typically 30 days to 2 years)
                </li>
                <li>
                  <strong className="text-white">Authentication Cookies:</strong> May
                  last longer for security purposes
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                8. Updates to This Policy
              </h2>
              <p>
                We may update this Cookie Policy to reflect changes in our practices
                or legal requirements. We will notify you of significant changes by
                updating the "Last updated" date and, where appropriate, providing
                additional notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                9. Contact Us
              </h2>
              <p>
                If you have questions about our use of cookies or this Cookie Policy,
                please contact us:
              </p>
              <p className="mt-2">
                <strong className="text-white">Email:</strong>{" "}
                privacy@geniusfactor.ai
                <br />
                <strong className="text-white">Subject:</strong> Cookie Policy Inquiry
              </p>
            </section>

            <div className="bg-slate-700/50 rounded-lg p-4 mt-8">
              <p className="text-sm text-slate-400">
                For more information about how we handle your personal data, please
                review our{" "}
                <Link
                  href="/privacy"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CookiePolicyPage;
