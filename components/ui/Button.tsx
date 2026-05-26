import { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 
  'onDrag' | 'onDragEnd' | 'onDragStart' | 
  'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
  variant?: "primary" | "secondary" | "ghost" | "gold";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles = "font-medium rounded-button transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-opacity-90 shadow-sm hover:shadow-md active:scale-95",
    secondary: "bg-neutral-200 text-neutral-900 hover:bg-neutral-300 shadow-sm hover:shadow-md active:scale-95",
    ghost: "text-primary hover:bg-primary/10 underline-offset-2 hover:underline active:scale-95",
    gold: "bg-accent text-neutral-900 font-semibold hover:bg-opacity-90 shadow-md hover:shadow-lg active:scale-95 border-2 border-accent",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

