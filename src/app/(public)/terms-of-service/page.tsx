"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const TermsOfServicePage = () => {
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
          href="/auth/sign-up"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign Up
        </Link>

        <div className="bg-slate-800/90 rounded-2xl border border-slate-700/50 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Terms of Service
          </h1>
          <p className="text-slate-400 mb-8">Last updated: December 19, 2025</p>

          <div className="prose prose-invert max-w-none space-y-6 text-slate-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using GeniusFactor AI (&quot;the
                Platform&quot;), you agree to be bound by these Terms of
                Service. If you do not agree to these terms, please do not use
                our services. These terms apply to all users, including
                employees, HR professionals, and administrators.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                2. Description of Service
              </h2>
              <p>
                GeniusFactor AI is a comprehensive HR management platform that
                provides:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Employee assessment and skill evaluation tools</li>
                <li>Career development and pathway recommendations</li>
                <li>AI-powered analytics and insights for HR decisions</li>
                <li>Internal mobility and job matching services</li>
                <li>Retention risk analysis and workforce planning</li>
                <li>Employee profile management and performance tracking</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                3. User Accounts
              </h2>
              <p>
                To access certain features of the Platform, you must create an
                account. You are responsible for:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  Maintaining the confidentiality of your account credentials
                </li>
                <li>All activities that occur under your account</li>
                <li>
                  Providing accurate and complete information during
                  registration
                </li>
                <li>
                  Notifying us immediately of any unauthorized use of your
                  account
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                4. Acceptable Use
              </h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Use the Platform for any unlawful purpose</li>
                <li>
                  Attempt to gain unauthorized access to any part of the
                  Platform
                </li>
                <li>
                  Interfere with or disrupt the Platform&apos;s functionality
                </li>
                <li>Upload malicious code or content</li>
                <li>Impersonate any person or entity</li>
                <li>Share your account credentials with others</li>
                <li>
                  Use automated systems to access the Platform without
                  permission
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                5. Data and Privacy
              </h2>
              <p>
                Your use of the Platform is also governed by our{" "}
                <Link
                  href="/privacy-policy"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Privacy Policy
                </Link>
                . By using the Platform, you consent to the collection, use, and
                sharing of your information as described in the Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                6. Intellectual Property
              </h2>
              <p>
                The Platform and its original content, features, and
                functionality are owned by GeniusFactor AI and are protected by
                international copyright, trademark, patent, trade secret, and
                other intellectual property laws. You may not copy, modify,
                distribute, or create derivative works based on our Platform
                without explicit permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                7. AI-Generated Content
              </h2>
              <p>
                The Platform uses artificial intelligence to provide insights,
                recommendations, and analytics. While we strive for accuracy:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  AI-generated content is provided for informational purposes
                  only
                </li>
                <li>
                  Recommendations should not be the sole basis for employment
                  decisions
                </li>
                <li>
                  Users should exercise professional judgment when using AI
                  insights
                </li>
                <li>
                  We do not guarantee the accuracy of AI-generated predictions
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                8. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by law, GeniusFactor AI shall
                not be liable for any indirect, incidental, special,
                consequential, or punitive damages, including loss of profits,
                data, or other intangible losses resulting from your use of the
                Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                9. Termination
              </h2>
              <p>
                We reserve the right to terminate or suspend your account and
                access to the Platform at our sole discretion, without notice,
                for conduct that we believe violates these Terms of Service or
                is harmful to other users, us, or third parties, or for any
                other reason.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                10. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these Terms of Service at any
                time. We will notify users of any material changes by posting
                the new terms on this page and updating the &quot;Last
                updated&quot; date. Your continued use of the Platform after
                such changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                11. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms of Service, please
                contact us at:
              </p>
              <p className="mt-2">
                <strong className="text-white">Email:</strong>{" "}
                support@geniusfactor.ai
                <br />
                <strong className="text-white">Platform:</strong> GeniusFactor
                AI
              </p>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsOfServicePage;
