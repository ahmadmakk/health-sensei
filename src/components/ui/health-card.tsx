import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface HealthCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
  children?: ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}

export function HealthCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  className, 
  children,
  variant = "default"
}: HealthCardProps) {
  const variantStyles = {
    default: "bg-gradient-card border-border",
    primary: "bg-gradient-primary text-primary-foreground border-primary/20",
    success: "bg-gradient-to-br from-success/10 to-success/5 border-success/20",
    warning: "bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20",
    danger: "bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20"
  };

  const trendColors = {
    up: "text-success",
    down: "text-destructive",
    neutral: "text-muted-foreground"
  };

  return (
    <div className={cn(
      "rounded-lg border shadow-soft p-4 transition-all duration-300 hover:shadow-medium animate-slide-up",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {icon && (
              <div className={cn(
                "p-2 rounded-lg",
                variant === "primary" ? "bg-primary-foreground/20" : "bg-primary/10"
              )}>
                {icon}
              </div>
            )}
            <h3 className={cn(
              "font-medium text-sm",
              variant === "primary" ? "text-primary-foreground/90" : "text-muted-foreground"
            )}>
              {title}
            </h3>
          </div>
          
          <div className="space-y-1">
            <div className={cn(
              "text-2xl font-bold",
              variant === "primary" ? "text-primary-foreground" : "text-foreground"
            )}>
              {value}
            </div>
            
            {subtitle && (
              <div className={cn(
                "text-sm flex items-center gap-1",
                trend && trendColors[trend],
                !trend && (variant === "primary" ? "text-primary-foreground/70" : "text-muted-foreground")
              )}>
                {trend === "up" && "↗"}
                {trend === "down" && "↘"}
                {trend === "neutral" && "→"}
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
}