import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient" | "custom"
    size?: "default" | "sm" | "lg" | "icon"
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                ref={ref}
                className={cn(
                    // Base styles with improved font rendering
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold",
                    "ring-offset-background transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:pointer-events-none disabled:opacity-50",
                    "select-none cursor-pointer",
                    // Variant styles with improved contrast
                    {
                        // Default - Primary button with solid contrast
                        "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md active:scale-[0.98]": variant === "default",

                        // Destructive - Clear red with white text
                        "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md active:scale-[0.98]": variant === "destructive",

                        // Outline - Clear border with readable text  
                        "border-2 border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/50": variant === "outline",

                        // Secondary - Subtle but readable
                        "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm": variant === "secondary",

                        // Ghost - Minimal but visible
                        "text-foreground hover:bg-accent hover:text-accent-foreground": variant === "ghost",

                        // Link - Underlined text link
                        "text-primary underline-offset-4 hover:underline font-medium": variant === "link",

                        // Gradient - For use on colored backgrounds (white button with dark text)
                        "bg-white text-slate-800 hover:bg-gray-50 shadow-md hover:shadow-lg border-0 active:scale-[0.98]": variant === "gradient",

                        // Custom - No default background/color styling
                        "": variant === "custom",

                        // Sizes
                        "h-10 px-5 py-2": size === "default",
                        "h-9 rounded-md px-4 text-xs": size === "sm",
                        "h-12 rounded-md px-8 text-base": size === "lg",
                        "h-10 w-10": size === "icon",
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
