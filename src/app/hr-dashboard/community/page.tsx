"use client";

import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import Loader from "@/components/Loader";
import HRLayout from "@/components/hr/HRLayout";

export default function CommunityPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  return (
    <HRLayout>
      <div className="p-6 space-y-8 gradient-bg-primary min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold gradient-text-primary mb-4">
              Join Our Exclusive Community
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Connect with like-minded professionals, access exclusive
              resources, and accelerate your career growth.
            </p>
          </div>

          <Card className="card-primary border-2 border-primary/20 overflow-hidden relative">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

            <CardHeader className="text-center pb-2 relative z-10">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">
                Genius Factor Academy Community
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Unlock your full potential with our premium community access
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 relative z-10">
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-green-500/10 p-1 rounded-full">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">
                        Network with Experts
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Connect with industry leaders and mentors.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-green-500/10 p-1 rounded-full">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">
                        Exclusive Content
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Access premium workshops and resources.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-green-500/10 p-1 rounded-full">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">
                        Peer Support
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Get feedback and support from peers.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-green-500/10 p-1 rounded-full">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">
                        Career Opportunities
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        First access to job postings and gigs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center pt-6">
                <Button
                  size="lg"
                  className="btn-gradient-primary text-primary-foreground px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                  asChild
                >
                  <Link
                    href="https://www.skool.com/geniusfactoracademy/about?ref=9991102cdf9d4b378471534355a57fce"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                    Join Our Paid Community
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Redirects to Skool.com
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </HRLayout>
  );
}
