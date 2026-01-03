import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20",
        secondary:
          "border-gray-700/50 bg-gray-800/50 text-gray-300 hover:bg-gray-700/50",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/20",
        outline: "border-gray-700/50 text-gray-300 hover:bg-gray-800/50",
        success:
          "border-transparent bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
