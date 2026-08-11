import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "active" | "accent";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  className = "",
}) => {
  const variantStyles = {
    neutral: "bg-slate-100/90 text-slate-700 border border-slate-200/80",
    active: "bg-slate-900 text-white border border-slate-900",
    accent: "bg-amber-500/10 text-amber-800 border border-amber-500/20 font-medium",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-normal tracking-tight rounded-md ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
