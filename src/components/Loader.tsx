"use client";
import React from "react";
import { Brain } from "lucide-react";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      {/* Glass morphism container */}
      <div className="relative text-center space-y-8 p-10 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-black/5 dark:shadow-black/20">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 -z-10"></div>

        {/* AI Brain with glass effect */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-xl backdrop-blur-sm border border-white/30 dark:border-gray-600/30 animate-pulse"></div>
          <div className="relative flex items-center justify-center w-full h-full">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-lg shadow-lg">
              <Brain className="h-10 w-10 text-white animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* Text with glass effect */}
        <div className="space-y-2 backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Genius Factor AI
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Thinking...
          </p>
        </div>

        {/* Glassy dots */}
        <div className="flex justify-center space-x-2">
          <div className="h-2 w-2 bg-blue-500/80 rounded-full animate-pulse backdrop-blur-sm"></div>
          <div className="h-2 w-2 bg-blue-500/80 rounded-full animate-pulse delay-200 backdrop-blur-sm"></div>
          <div className="h-2 w-2 bg-blue-500/80 rounded-full animate-pulse delay-400 backdrop-blur-sm"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
