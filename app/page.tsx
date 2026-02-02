"use client";

import { FeatureCard } from "@/components/Feature/Feature-Card";
import { Footer } from "@/components/Footer/Footer";
import Hero2 from "@/components/Hero/Hero2";
import { Testimonials } from "@/components/Testimonial";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-black">
      <Hero2 />
      <div className="bg-black min-h-screen flex justify-center items-center">
        <FeatureCard />
      </div>
      <Testimonials />
      <Footer />
    </div>
  );
}
