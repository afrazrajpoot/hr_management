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
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function CommunityPage() {
  const { data: session, status } = useSession();
  const [isJoined, setIsJoined] = useState(false);

  if (status === "loading") {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-8 bg-layout-purple min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gradient-purple mb-4">
              Join Our Exclusive Community
            </h1>
            <p className="text-on-matte-subtle text-lg max-w-2xl mx-auto">
              Connect with like-minded professionals, access exclusive
              resources, and accelerate your career growth.
            </p>
          </div>

          <Card className="card-purple border-2 border-purple-accent/20 overflow-hidden relative hover-lift">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

            <CardHeader className="text-center pb-2 relative z-10">
              <div className="mx-auto w-16 h-16 icon-brand flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-purple-accent" />
              </div>
              <CardTitle className="text-3xl font-bold text-on-matte">
                Genius Factor Academy Community
              </CardTitle>
              <CardDescription className="text-lg mt-2 text-on-matte-subtle">
                Unlock your full potential with our premium community access
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 relative z-10">
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full icon-success">
                      <CheckCircle className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-on-matte">
                        Network with Experts
                      </h3>
                      <p className="text-sm text-on-matte-subtle">
                        Connect with industry leaders and mentors.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full icon-success">
                      <CheckCircle className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-on-matte">
                        Exclusive Content
                      </h3>
                      <p className="text-sm text-on-matte-subtle">
                        Access premium workshops and resources.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full icon-success">
                      <CheckCircle className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-on-matte">
                        Peer Support
                      </h3>
                      <p className="text-sm text-on-matte-subtle">
                        Get feedback and support from peers.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full icon-success">
                      <CheckCircle className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-on-matte">
                        Career Opportunities
                      </h3>
                      <p className="text-sm text-on-matte-subtle">
                        First access to job postings and gigs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center pt-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Checkbox
                    id="community-joined"
                    checked={isJoined}
                    onCheckedChange={(checked) => setIsJoined(checked as boolean)}
                    className="border-purple-accent data-[state=checked]:bg-purple-accent data-[state=checked]:text-white"
                  />
                  <Label
                    htmlFor="community-joined"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-on-matte cursor-pointer"
                  >
                    I have already joined the community
                  </Label>
                </div>

                {isJoined ? (
                  <Button
                    size="lg"
                    className="bg-gray-500/50 text-gray-300 px-8 py-6 text-lg rounded-xl shadow-none cursor-not-allowed border-2 border-gray-600/30"
                    disabled
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Already Joined
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="btn-purple px-8 py-6 text-lg rounded-xl shadow-prominent hover:scale-105 transition-all duration-300 group hover-lift"
                    asChild
                  >
                    <Link
                      href="https://www.skool.com/geniusfactoracademy/about?ref=9991102cdf9d4b378471534355a57fce"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                      Join Our Free Community
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                )}

                <p className="text-xs text-on-matte-subtle mt-4">
                  {isJoined ? "You're all set!" : "Redirects to Skool.com"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
