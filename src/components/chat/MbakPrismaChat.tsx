// c:\Users\user\Desktop\prisma\src\components\chat\MbakPrismaChat.tsx
"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageSquare, X, Send, AlertTriangle, ShieldAlert } from "lucide-react"
import ChatFeedback from "@/components/ai/ChatFeedback"

type Message = {
    role: "bot" | "user" | "system"
    content: string
    id?: string
    responseTimeMs?: number
    userMessageContext?: string
}

const QUICK_REPLIES = [
    "Cara Bikin Surat Pengantar",
    "Cek Iuran Bulanan",
    "Jadwal Ronda & Kerja Bakti",
    "Hubungi Pak RT"
]

export default function MbakPrismaChat() {
    const [isOpen, setIsOpen] = React.useState(false)
    const [input, setInput] = React.useState("")
    const [messages, setMessages] = React.useState<Message[]>([
        {
            role: "bot",
            content: "Halo! Saya Mbak PRISMA 👋 Bisa bantu apa nih seputar layanan RT 04 Kemayoran?",
            id: "initial-msg"
        }
    ])
    const [isTyping, setIsTyping] = React.useState(false)
    const [messageCount, setMessageCount] = React.useState(0)
    const MAX_SESSION_MESSAGES = 20
    
    // Generate a unique session ID once per mount
    const sessionId = React.useRef(crypto.randomUUID())

    const messagesEndRef = React.useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    React.useEffect(() => {
        if (isOpen) {
            scrollToBottom()
        }
    }, [messages, isOpen, isTyping])

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return
        if (messageCount >= MAX_SESSION_MESSAGES) return

        const userText = text.trim()
        setInput("")
        
        // Add user message to history
        const userMsgId = crypto.randomUUID()
        const updatedMessages: Message[] = [...messages, { role: "user" as const, content: userText, id: userMsgId }]
        setMessages(updatedMessages)
        setIsTyping(true)
        
        const nextCount = messageCount + 1
        setMessageCount(nextCount)

        // Enforce rate limit locally right after updating message count
        if (nextCount >= MAX_SESSION_MESSAGES) {
            setIsTyping(false)
            setMessages(prev => [
                ...prev,
                {
                    role: "system" as const,
                    content: "Sesi tanya jawab Anda hari ini sudah mencapai batas 20 pesan. Jika masih ada pertanyaan penting, silakan hubungi Pak RT langsung melalui WhatsApp."
                }
            ])
            return
        }

        try {
            // Keep rolling history up to 20 messages for API payload context
            const rollingHistory = updatedMessages.slice(-20)

            const startTime = Date.now()
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userText,
                    history: rollingHistory.slice(0, -1).map(m => ({ role: m.role, content: m.content })) 
                })
            })
            const endTime = Date.now()
            const responseTimeMs = endTime - startTime

            if (res.ok) {
                const data = await res.json()
                setMessages(prev => [...prev, { 
                    role: "bot" as const, 
                    content: data.reply,
                    id: crypto.randomUUID(),
                    responseTimeMs,
                    userMessageContext: userText
                }])
            } else {
                setMessages(prev => [...prev, {
                    role: "bot" as const,
                    content: "Maaf Kak, sistem lagi sibuk nih. Boleh coba kirim lagi beberapa saat lagi ya? 🙏",
                    id: crypto.randomUUID()
                }])
            }
        } catch {
            setMessages(prev => [...prev, {
                role: "bot" as const,
                content: "Waduh, koneksi internet sepertinya terganggu Kak. Pastikan koneksi aman ya, atau bisa hubungi Pak RT via WA.",
                id: crypto.randomUUID()
            }])
        } finally {
            setIsTyping(false)
        }
    }

    const isLimitReached = messageCount >= MAX_SESSION_MESSAGES

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="mb-4 w-[360px] max-w-[calc(100vw-32px)] h-[500px] flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-emerald-950/10 dark:border-emerald-500/10 bg-white dark:bg-slate-950 ring-1 ring-black/5"
                    >
                        {/* Header */}
                        <CardHeader className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-4 flex flex-row items-center justify-between shrink-0 shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-950 text-white font-bold h-10 w-10 rounded-full flex items-center justify-center border-2 border-emerald-700/50 shadow-inner">
                                    MP
                                </div>
                                <div className="text-left">
                                    <CardTitle className="text-base font-bold tracking-tight text-white leading-tight">Mbak PRISMA</CardTitle>
                                    <p className="text-xs text-emerald-200/90 font-medium leading-tight">Asisten Warga RT 04</p>
                                </div>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setIsOpen(false)} 
                                className="text-white hover:bg-white/10 rounded-full h-8 w-8 transition-colors shrink-0"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </CardHeader>

                        {/* Chat Area */}
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/40 scrollbar-thin">
                            {messages.map((m, i) => {
                                if (m.role === "system") {
                                    return (
                                        <div key={i} className="flex justify-center my-2">
                                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3.5 text-center text-xs leading-relaxed text-amber-800 dark:text-amber-300 shadow-sm max-w-[90%] flex flex-col items-center gap-2">
                                                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0" />
                                                <p className="font-medium">{m.content}</p>
                                                <Button 
                                                    size="sm" 
                                                    asChild 
                                                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-full px-4 mt-1 transition-all"
                                                >
                                                    <a 
                                                        href="https://wa.me/6287872004448?text=Halo%20Pak%20RT%20Erry%2C%20saya%20warga%20RT%2004%20ingin%20bertanya%20mengenai..." 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                    >
                                                        Hubungi Pak RT via WA
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                }

                                const isBot = m.role === "bot"
                                return (
                                    <div key={m.id || i} className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
                                        <div className={`
                                            max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm
                                            ${isBot
                                                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                                                : 'bg-emerald-800 text-white rounded-tr-none'
                                            }
                                        `}>
                                            <p className="whitespace-pre-line">{m.content}</p>
                                        </div>
                                        
                                        {/* Feedback Component for Bot Responses (excluding initial message) */}
                                        {isBot && m.id !== 'initial-msg' && m.userMessageContext && m.responseTimeMs && (
                                            <ChatFeedback 
                                                sessionId={sessionId.current}
                                                userMessage={m.userMessageContext}
                                                aiResponse={m.content}
                                                responseTimeMs={m.responseTimeMs}
                                            />
                                        )}
                                    </div>
                                )
                            })}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-4 py-3 rounded-tl-none flex gap-1 shadow-sm">
                                        <span className="w-2 h-2 bg-emerald-700/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-emerald-700/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-emerald-700/60 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </CardContent>

                        {/* Quick Replies Carousel */}
                        {!isLimitReached && (
                            <div className="py-2.5 px-3 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2 shrink-0">
                                {QUICK_REPLIES.map((reply, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(reply)}
                                        disabled={isTyping}
                                        className="inline-flex items-center justify-center rounded-full border border-emerald-100 dark:border-emerald-950 bg-emerald-50/50 dark:bg-emerald-950/20 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/30 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                                    >
                                        {reply}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Message Input Footer */}
                        <CardFooter className="p-3 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 shrink-0">
                            {isLimitReached ? (
                                <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/10 p-2.5 rounded-xl w-full border border-amber-100 dark:border-amber-900/30 justify-center">
                                    <ShieldAlert className="h-4 w-4 shrink-0" />
                                    <span>Batas maksimum 20 pesan tercapai.</span>
                                </div>
                            ) : (
                                <form
                                    className="flex w-full gap-2 items-center"
                                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                >
                                    <Input
                                        placeholder="Ketik pesan seputar RT 04..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        disabled={isTyping}
                                        className="flex-1 rounded-full border-slate-200 focus-visible:ring-emerald-800 dark:border-slate-800 dark:bg-slate-900 text-sm h-10 px-4"
                                    />
                                    <Button 
                                        type="submit" 
                                        size="icon" 
                                        disabled={isTyping || !input.trim()}
                                        className="rounded-full bg-emerald-800 hover:bg-emerald-900 text-white h-10 w-10 shrink-0 shadow transition-all disabled:opacity-55"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            )}
                        </CardFooter>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Launcher (FAB) */}
            <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="shadow-2xl rounded-full"
            >
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    size="lg"
                    className="rounded-full h-14 w-14 shadow-xl bg-gradient-to-br from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 text-white p-0 border-2 border-white dark:border-slate-900 flex items-center justify-center transition-all duration-300 group"
                >
                    <MessageSquare className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-300" />
                </Button>
            </motion.div>
        </div>
    )
}
