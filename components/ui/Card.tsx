import { ReactNode } from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = "", hover = true, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-card p-6 md:p-8
        border border-neutral-100
        shadow-card
        ${hover ? 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

