"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export const animations = {
  fadeInUp,
  fadeIn,
  staggerContainer,
  scaleIn,
  slideInLeft,
  slideInRight,
};

interface AnimatedSectionProps extends HTMLMotionProps<"section"> {
  children: React.ReactNode;
}

export function AnimatedSection({ children, ...props }: AnimatedSectionProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
      {...props}
    >
      {children}
    </motion.section>
  );
}

interface AnimatedGridProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export function AnimatedGrid({ children, ...props }: AnimatedGridProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={staggerContainer}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCard({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={scaleIn} {...props}>
      {children}
    </motion.div>
  );
}
