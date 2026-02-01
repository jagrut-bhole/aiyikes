"use client";

import { FeatureCard } from "@/components/Feature/Feature-Card";
import { Footer } from "@/components/Footer/Footer";
import { Hero } from "@/components/Hero/Hero";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-black">
      <Hero />
      <FeatureCard />
      <Footer />
    </div>
  );
}
