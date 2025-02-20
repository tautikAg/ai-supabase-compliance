import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export function LoadingSpinner({ className, size = 24 }: LoadingSpinnerProps) {
  return (
    <Loader2 
      className={cn("animate-spin", className)} 
      size={size}
    />
  );
}

export function LoadingCard({ title, description }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <LoadingSpinner size={32} className="text-primary" />
      {title && <h3 className="text-lg font-medium">{title}</h3>}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
} 