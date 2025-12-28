"use client";

import { Coffee, Utensils, Calendar } from "lucide-react";

const categories = [
  {
    name: "Breakfast",
    icon: Coffee,
    description: "Start your day right",
  },
  {
    name: "Lunch",
    icon: Utensils,
    description: "Midday delights",
  },
  {
    name: "Dinner",
    icon: Calendar,
    description: "Evening favorites",
  },
];

export function Categories() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Explore Recipe Categories</h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4 sm:px-0">
            Browse through our diverse collection of recipes categorized for every occasion
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.name}
                className="group bg-card border border-border rounded-xl p-6 sm:p-8 text-center hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-200">
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2">{category.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{category.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

