"use client";

import Link from "next/link";
import {
  MessageSquare,
  Calendar,
  Clock,
  ShoppingCart,
  CheckCircle,
  Star,
  Heart,
  Plus,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "AI Chat Assistant",
    description:
      "Chat with Aria, your intelligent cooking companion. Get instant recipe suggestions, cooking tips, and personalized meal recommendations.",
  },
  {
    icon: Calendar,
    title: "Smart Meal Planning",
    description:
      "Create personalized weekly meal plans with AI assistance. Balance nutrition, manage dietary restrictions, and streamline your cooking schedule.",
  },
  {
    icon: Clock,
    title: "Calendar Integration",
    description:
      "Sync your meal plans directly with Google Calendar. Set cooking reminders, prep time alerts, and never miss a meal preparation deadline.",
  },
  {
    icon: ShoppingCart,
    title: "Shopping Lists",
    description:
      "Automatically generate organized shopping lists from your meal plans. Print or share lists categorized by store sections.",
  },
  {
    icon: CheckCircle,
    title: "Cooking Progress Tracker",
    description:
      "Step-by-step cooking guidance with progress tracking. Mark completed steps, set timers, and never lose your place in complex recipes.",
  },
  {
    icon: Star,
    title: "Rating & Reviews",
    description:
      "Rate and review recipes with detailed feedback. Discover top-rated dishes, share your cooking experiences, and help the community.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-12 sm:py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 px-4 sm:px-0">
            Everything You Need for Culinary Excellence
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto px-4 sm:px-0">
            From AI-powered recipe discovery to smart meal planning, we've got all
            your cooking needs covered
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group bg-card border border-border rounded-xl p-5 sm:p-6 hover:border-primary/50 hover:shadow-md transition-all duration-200"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-200">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-16">
          <div className="bg-card border border-border rounded-xl p-6 sm:p-8 hover:border-primary/50 hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Plus className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Admin Recipe Management</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Authorized administrators can create, edit, and curate premium recipes.
                  Ensure quality content with professional recipe validation.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 sm:p-8 hover:border-primary/50 hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Personal Collections</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Save your favorite recipes, create custom collections, and build your
                  personal cookbook. Share collections with friends.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center bg-card border border-border rounded-2xl p-6 sm:p-8 md:p-12">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4 sm:px-0">
            Ready to revolutionize your cooking experience?
          </h3>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-4 sm:px-0">
            Join thousands of home cooks and professional chefs who've transformed their
            kitchens with Recipia's intelligent features.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center bg-primary text-primary-foreground px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-medium shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 w-full sm:w-auto"
            >
              Get Started Free
            </Link>
            <Link
              href="/dashboard/aria"
              className="inline-flex items-center justify-center border-2 border-border px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-medium hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 w-full sm:w-auto"
            >
              Try AI Assistant
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

