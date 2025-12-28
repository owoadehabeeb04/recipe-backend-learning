"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative py-12 sm:py-16 md:py-20 lg:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium w-fit">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>AI-Powered Cooking</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                <span className="text-foreground">AI-Powered Recipe</span>
                <br />
                <span className="text-primary">Discovery & Creation</span>
              </h1>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Transform your kitchen with AI-powered recipe discovery, personalized meal planning, and intelligent cooking assistance. Create, discover, and enjoy delicious recipes tailored just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center bg-primary text-primary-foreground px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-medium shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 w-full sm:w-auto"
              >
                Begin Your Journey
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/dashboard/all-recipes"
                className="inline-flex items-center justify-center border-2 border-border px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-medium hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 w-full sm:w-auto"
              >
                Browse Recipes
              </Link>
            </div>
          </div>
          <div className="relative order-1 lg:order-2 mb-8 lg:mb-0">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border shadow-lg">
              <Image
                src="https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg"
                alt="Gourmet dish with fresh ingredients"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 sm:w-24 sm:h-24 bg-primary/10 rounded-full blur-2xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

