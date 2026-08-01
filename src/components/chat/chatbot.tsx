"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, Send, Mic, Minimize2, CircleUser } from "lucide-react"
import { useRouter } from "next/navigation"
import { aiService } from "@/lib/ai-service"

type Message = {
    role: "bot" | "user"
    content: string
    action?: {
        label: string
        href?: string
        onClick?: () => void
    }
    reasoning?: string
}

const CHIP_OPTIONS = [
    "Cara Bikin Surat Pengantar",
    "Cek Iuran Bulanan",
    "Lapor Lampu Mati/Sampah",
    "Hubungi Pak RT Langsung"
]

export function Chatbot() {
    const router = useRouter()
    const [isOpen, setIsOpen] = React.useState(false)
    const [isMinimized, setIsMinimized] = React.useState(false)
    const [input, setInput] = React.useState("")
    const [messages, setMessages] = React.useState<Message[]>([
        {
            role: "bot",
            content: "Halo! Selamat datang di PRISMA RT 04. Saya Siaga. Jangan bingung ya, bapak/ibu ingin mengurus apa hari ini?"
        }
    ])
    const [isTyping, setIsTyping] = React.useState(false)

    // Scroll to bottom handling
    const messagesEndRef = React.useRef<HTMLDivElement>(null)
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    React.useEffect(() => {
        scrollToBottom()
    }, [messages, isOpen])

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return

        // 1. Add User Message
        setMessages(prev => [...prev, { role: "user", content: text }])
        setInput("")
        setIsTyping(true)

        try {
            // 2. Call AI Service (handles backend call and localized fallback)
            const data = await aiService.chat(text)
            const replyText = data.response
            const backendAction = data.action

            let action: Message["action"] = undefined

            if (backendAction) {
                if (backendAction.type === 'navigate') {
                    action = {
                        label: backendAction.label,
                        onClick: () => router.push(backendAction.value)
                    }
                } else if (backendAction.type === 'link') {
                    action = {
                        label: backendAction.label,
                        href: backendAction.value
                    }
                }
            }

            setMessages(prev => [...prev, {
                role: "bot",
                content: replyText,
                action: action,
                reasoning: data.reasoning
            }])

        } catch {
            setMessages(prev => [...prev, {
                role: "bot",
                content: "Maaf, koneksi ke Siaga terputus. Silakan hubungi WA pengurus RT.",
                action: {
                    label: "Chat WA Pengurus",
                    href: "https://wa.me/6287872004448"
                }
            }])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <div className="fixed bottom-[20px] left-[20px] z-[9999] flex flex-col items-start gap-4 font-sans text-base">

            {/* Expanded Chat Window */}
            {isOpen && !isMinimized && (
                <Card className="w-[340px] md:w-[380px] h-[500px] flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 border-none rounded-xl overflow-hidden ring-1 ring-black/5">
                    {/* Header */}
                    <CardHeader className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4 flex flex-row items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-1.5 rounded-full">
                                <CircleUser className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold">Asisten Warga</CardTitle>
                                <p className="text-xs text-blue-100 opacity-90">Siaga - Online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)} className="text-white hover:bg-white/20 rounded-full h-8 w-8">
                                <Minimize2 className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 rounded-full h-8 w-8">
                                <X className="h-6 w-6" />
                            </Button>
                        </div>
                    </CardHeader>

                    {/* Chat Content */}
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900 border-b">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`
                                    max-w-[85%] rounded-2xl p-3.5 text-[15px] leading-relaxed shadow-sm
                                    ${m.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-bl-none'
                                    }
                                `}>
                                    <div>{m.content}</div>
                                    {m.reasoning && (
                                        <details className="mt-2 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-2 cursor-pointer focus:outline-none">
                                            <summary className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 select-none">
                                                Proses Berpikir Asisten AI
                                            </summary>
                                            <pre className="mt-1.5 p-2 bg-slate-50 dark:bg-slate-900 rounded text-[10px] font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto text-slate-600 dark:text-slate-400 max-h-[120px]">
                                                {m.reasoning}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                                {m.action && (
                                    <div className="mt-2">
                                        {m.action.href ? (
                                            <Button size="sm" asChild className="bg-green-600 hover:bg-green-700 text-white rounded-full text-sm">
                                                <a href={m.action.href} target="_blank" rel="noopener noreferrer">
                                                    {m.action.label}
                                                </a>
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={m.action.onClick}
                                                className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 rounded-full text-sm font-semibold"
                                            >
                                                {m.action.label}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 border rounded-2xl p-3 rounded-bl-none flex gap-1">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>

                    {/* Quick Replies & Input */}
                    <div className="p-2 bg-slate-50 dark:bg-slate-900 overflow-x-auto whitespace-nowrap scrollbar-hide">
                        <div className="flex gap-2 px-2">
                            {CHIP_OPTIONS.map((chip, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(chip)}
                                    className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200"
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                    </div>

                    <CardFooter className="p-3 bg-white dark:bg-slate-950">
                        <form
                            className="flex w-full gap-2 items-center"
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        >
                            <div className="relative flex-1">
                                <Input
                                    placeholder="Ketik pesan..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="pr-10 rounded-full border-slate-300 focus-visible:ring-blue-500"
                                />
                                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                                    <Mic className="h-5 w-5" />
                                </button>
                            </div>
                            <Button type="submit" size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700 h-10 w-10 shrink-0 shadow-sm">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}

            {/* Launcher / FAB */}
            {(!isOpen || isMinimized) && (
                <div className="group relative">
                    {/* Tooltip */}
                    <div className="absolute left-full bottom-full mb-2 ml-4 w-max -translate-x-4">
                        <div className="relative bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-3 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-sm font-medium animate-bounce">
                            Butuh Bantuan? Klik Disini
                            <div className="absolute left-4 top-full -mt-1 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"></div>
                        </div>
                    </div>

                    <Button
                        onClick={() => {
                            setIsOpen(true)
                            setIsMinimized(false)
                        }}
                        size="lg"
                        className="rounded-full h-16 w-16 shadow-xl bg-gradient-to-br from-orange-400 to-red-500 hover:scale-105 transition-all duration-300 border-4 border-white dark:border-slate-900 p-0 overflow-hidden"
                    >
                        {/* Friendly Avatar Image using standard icon for now, would use Image component in real scenario */}
                        <div className="flex items-center justify-center w-full h-full bg-white text-orange-500">
                            <CircleUser className="h-10 w-10" />
                        </div>
                    </Button>
                </div>
            )}
        </div>
    )
}
