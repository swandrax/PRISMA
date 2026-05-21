"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Ensure component is mounted on client to prevent hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 flex items-center justify-center opacity-50 cursor-not-allowed"
                disabled
            >
                <div className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        )
    }

    const isLight = resolvedTheme === "light"

    return (
        <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 flex items-center justify-center transition-all duration-300 hover:bg-accent hover:text-accent-foreground active:scale-90"
            onClick={() => setTheme(isLight ? "dark" : "light")}
            aria-label="Toggle theme"
        >
            <Sun className={`h-[1.2rem] w-[1.2rem] text-amber-500 transition-all duration-500 transform ${
                isLight ? "rotate-0 scale-100" : "-rotate-90 scale-0 opacity-0"
            }`} />
            <Moon className={`absolute h-[1.2rem] w-[1.2rem] text-indigo-400 transition-all duration-500 transform ${
                isLight ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100"
            }`} />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}

