"use client";

import { motion, Variants } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

type AnimatedGroupProps = {
  children: React.ReactNode;
  className?: string;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
};

export const AnimatedGroup = ({
  children,
  className,
  variants,
}: AnimatedGroupProps) => {
  const defaultContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const defaultItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const containerVariants = variants?.container || defaultContainerVariants;
  const itemVariants = variants?.item || defaultItemVariants;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className={cn(className)}
    >
      {React.Children.map(children, (child) => {
        return <motion.div variants={itemVariants}>{child}</motion.div>;
      })}
    </motion.div>
  );
};
