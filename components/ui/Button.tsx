import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const variants = {
    primary:
      "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99] shadow-sm rounded-md",
    secondary:
      "bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-[0.99] rounded-md",
    outline:
      "border border-slate-300/80 bg-transparent text-slate-800 hover:bg-slate-100/60 active:scale-[0.99] rounded-md",
    ghost:
      "bg-transparent text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 rounded-md",
    link: "bg-transparent text-slate-900 hover:underline p-0 underline-offset-4",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs tracking-wide",
    md: "px-4 py-2.5 text-sm tracking-tight",
    lg: "px-6 py-3.5 text-base tracking-tight font-medium",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
