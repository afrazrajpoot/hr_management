"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicyPage = () => {
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
            Privacy Policy
          </h1>
          <p className="text-slate-400 mb-8">Last updated: December 19, 2025</p>

          <div className="prose prose-invert max-w-none space-y-6 text-slate-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                1. Introduction
              </h2>
              <p>
                GeniusFactor AI (&quot;we,&quot; &quot;our,&quot; or
                &quot;us&quot;) is committed to protecting your privacy. This
                Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you use our HR management
                platform. Please read this policy carefully to understand our
                practices regarding your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                2. Information We Collect
              </h2>
              <h3 className="text-lg font-medium text-white mt-4 mb-2">
                2.1 Personal Information
              </h3>
              <p>We collect information you provide directly, including:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Name, email address, and phone number</li>
                <li>
                  Professional information (job title, department, skills)
                </li>
                <li>Employment history and qualifications</li>
                <li>Assessment results and performance data</li>
                <li>Profile photos and biographical information</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-4 mb-2">
                2.2 Automatically Collected Information
              </h3>
              <p>When you use our Platform, we automatically collect:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Device information (browser type, operating system)</li>
                <li>IP address and location data</li>
                <li>Usage patterns and interaction data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                3. How We Use Your Information
              </h2>
              <p>We use the collected information for:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Providing and maintaining our HR management services</li>
                <li>Processing assessments and generating career insights</li>
                <li>Facilitating internal mobility and job matching</li>
                <li>Analyzing retention risks and workforce trends</li>
                <li>Improving our AI algorithms and recommendations</li>
                <li>Communicating with you about your account and updates</li>
                <li>Ensuring platform security and preventing fraud</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                4. AI and Data Processing
              </h2>
              <p>
                GeniusFactor AI uses artificial intelligence to analyze employee
                data and provide insights. This includes:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Skill assessment and competency analysis</li>
                <li>Career pathway recommendations</li>
                <li>Retention risk predictions</li>
                <li>Job matching algorithms</li>
                <li>Performance trend analysis</li>
              </ul>
              <p className="mt-3">
                We ensure that AI-driven decisions are transparent and that
                human oversight is maintained for significant employment
                decisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                5. Information Sharing
              </h2>
              <p>We may share your information with:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <strong className="text-white">Your Employer:</strong> HR
                  administrators and managers within your organization have
                  access to relevant employee data
                </li>
                <li>
                  <strong className="text-white">Service Providers:</strong>{" "}
                  Third-party vendors who assist in operating our Platform
                </li>
                <li>
                  <strong className="text-white">Legal Requirements:</strong>{" "}
                  When required by law or to protect our rights
                </li>
                <li>
                  <strong className="text-white">Business Transfers:</strong> In
                  connection with mergers, acquisitions, or asset sales
                </li>
              </ul>
              <p className="mt-3">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                6. Data Security
              </h2>
              <p>
                We implement appropriate technical and organizational measures
                to protect your personal data, including:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and audits</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                7. Data Retention
              </h2>
              <p>
                We retain your personal data for as long as necessary to fulfill
                the purposes outlined in this policy, unless a longer retention
                period is required by law. When data is no longer needed, we
                securely delete or anonymize it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                8. Your Rights
              </h2>
              <p>Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your data (subject to legal requirements)</li>
                <li>Object to or restrict processing</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, please contact us using the
                information below.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                9. Cookies and Tracking
              </h2>
              <p>
                We use cookies and similar technologies to enhance your
                experience, analyze usage patterns, and personalize content. You
                can manage cookie preferences through your browser settings.
                Note that disabling certain cookies may affect Platform
                functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                10. International Data Transfers
              </h2>
              <p>
                Your information may be transferred to and processed in
                countries other than your own. We ensure appropriate safeguards
                are in place for such transfers in compliance with applicable
                data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                11. Children&apos;s Privacy
              </h2>
              <p>
                Our Platform is not intended for individuals under 18 years of
                age. We do not knowingly collect personal information from
                children. If you believe we have collected information from a
                child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                12. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy periodically. We will notify
                you of any material changes by posting the new policy on this
                page and updating the &quot;Last updated&quot; date. We
                encourage you to review this policy regularly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                13. Contact Us
              </h2>
              <p>
                If you have questions or concerns about this Privacy Policy or
                our data practices, please contact us at:
              </p>
              <p className="mt-2">
                <strong className="text-white">Email:</strong>{" "}
                privacy@geniusfactor.ai
                <br />
                <strong className="text-white">
                  Data Protection Officer:
                </strong>{" "}
                dpo@geniusfactor.ai
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

export default PrivacyPolicyPage;
