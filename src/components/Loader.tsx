"use client";
import React from "react";
import { Brain } from "lucide-react";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
      {/* Glass morphism container */}
      <div className="relative text-center space-y-8 p-10 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/20 shadow-2xl shadow-black/5">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-purple opacity-5 -z-10"></div>

        {/* AI Brain with glass effect */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl backdrop-blur-sm border border-border/30 animate-pulse"></div>
          <div className="relative flex items-center justify-center w-full h-full">
            <div className="bg-gradient-purple p-3 rounded-lg shadow-lg">
              <Brain className="h-10 w-10 text-white animate-pulse" />
            </div>
          </div>
        </div>

        {/* Text with glass effect */}
        <div className="space-y-2 backdrop-blur-sm">
          <h3 className="text-xl font-semibold gradient-text-primary">
            Genius Factor AI
          </h3>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>

        {/* Glassy dots */}
        <div className="flex justify-center space-x-2">
          <div className="h-2 w-2 bg-gradient-purple rounded-full animate-pulse backdrop-blur-sm"></div>
          <div className="h-2 w-2 bg-gradient-purple rounded-full animate-pulse delay-200 backdrop-blur-sm"></div>
          <div className="h-2 w-2 bg-gradient-purple rounded-full animate-pulse delay-400 backdrop-blur-sm"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
