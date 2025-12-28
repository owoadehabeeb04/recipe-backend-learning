"use client";

import Link from "next/link";
import { Sparkles, ChefHat } from "lucide-react";

export function AuthSidebar() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary/5 dark:bg-primary/10 border-r border-border">
      {/* Animated bubbles background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large bubbles with animation */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '5s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-primary/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '6s' }}></div>
        
        {/* Medium bubbles */}
        <div className="absolute top-40 right-20 w-48 h-48 bg-primary/12 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '3s' }}></div>
        <div className="absolute bottom-40 left-20 w-56 h-56 bg-primary/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '4s' }}></div>
        
        {/* Small bubbles */}
        <div className="absolute top-60 left-1/4 w-32 h-32 bg-primary/15 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.3s', animationDuration: '2.5s' }}></div>
        <div className="absolute bottom-60 right-1/4 w-40 h-40 bg-primary/12 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1.2s', animationDuration: '3.5s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full p-12">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <ChefHat className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-primary group-hover:opacity-80 transition-opacity">Recipia</span>
        </Link>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium w-fit">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Cooking</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground leading-tight">
              Transform Your Kitchen Experience
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
              Discover intelligent recipe creation, personalized meal planning, and seamless cooking assistance powered by AI.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
              <span className="text-sm">Smart recipe discovery</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
              <span className="text-sm">Personalized meal planning</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
              <span className="text-sm">AI cooking assistant</span>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Join thousands of home cooks</p>
          <p>transforming their kitchens</p>
        </div>
      </div>
    </div>
  );
}

