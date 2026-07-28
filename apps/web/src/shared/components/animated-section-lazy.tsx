"use client";

import dynamic from "next/dynamic";

// Lazy-load framer-motion into its own chunk; sections are still SSR'd for SEO
export const AnimatedSection = dynamic(() =>
  import("./animated-section").then((m) => m.AnimatedSection)
);
