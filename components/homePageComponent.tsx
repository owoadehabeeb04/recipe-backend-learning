"use client";

import { Header } from "./home/Header";
import { Hero } from "./home/Hero";
import { Categories } from "./home/Categories";
import { FeaturedRecipes } from "./home/FeaturedRecipes";
import { Features } from "./home/Features";
import { Footer } from "./home/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <Categories />
        <FeaturedRecipes />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
