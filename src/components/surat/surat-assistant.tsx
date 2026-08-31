"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Send, Sparkles, Bot } from "lucide-react"
import { aiService } from "@/lib/ai-service"

interface SuratAssistantProps {
    onFilter: (query: string) => void;
}

interface Message {
    role: "user" | "bot";
    content: string;
}

export function SuratAssistant({ onFilter }: SuratAssistantProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [messages, setMessages] = React.useState<Message[]>([
        { role: "bot", content: "Halo! Saya Siaga. Bingung cari surat apa? Ceritakan kebutuhan Anda, saya akan bantu carikan templatenya." }
    ])
    const [input, setInput] = React.useState("")
    const [isTyping, setIsTyping] = React.useState(false)
    const messagesEndRef = React.useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    React.useEffect(() => {
        scrollToBottom()
    }, [messages, isOpen])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg = input
        setMessages(prev => [...prev, { role: "user", content: userMsg }])
        setInput("")
        setIsTyping(true)

        try {
            // Call AI Service
            const response = await aiService.chat(userMsg)

            setMessages(prev => [...prev, { role: "bot", content: response.response || "Maaf, saya tidak mengerti." }])

            // If AI suggests something useful, we can use it to filter
            // Ideally the backend returns an intent or keywords. 
            // For now, we'll try to use the user's query itself or extract keywords if the backend supports it.
            // As a simple heuristic, if the AI response mentions specific surat types, we could filter.
            // But to be safe and direct, we filter using the USER's original intent for now, 
            // or we could ask the AI to return a "search_query" in the JSON if we modified the backend.
            // Since we can't easily modify backend logic perfectly right now without retraining RAG, 
            // let's pass the user's input as a search filter which is often good enough "semantic search" proxy if the search is fuzzy.

            onFilter(userMsg)

        } catch {
            setMessages(prev => [...prev, { role: "bot", content: "Maaf, saya sedang ada gangguan. Silakan cari manual ya." }])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <>
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-110 transition-transform z-50 border-2 border-white/20"
                >
                    <Sparkles className="h-6 w-6 text-white" />
                </Button>
            )}

            {isOpen && (
                <Card className="fixed bottom-6 right-6 w-80 md:w-96 shadow-2xl z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 border-purple-500/30 bg-slate-900/95 backdrop-blur-md text-white">
                    <CardHeader className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 p-4 flex flex-row items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-purple-500/20 rounded-lg">
                                <Bot className="h-5 w-5 text-purple-300" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold text-white">Asisten Surat</CardTitle>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-purple-200 hover:bg-white/10 hover:text-white">
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="p-0">
                        <ScrollArea className="h-72 p-4">
                            <div className="flex flex-col gap-3">
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user'
                                                ? 'bg-purple-600 text-white rounded-br-none'
                                                : 'bg-white/10 text-slate-100 rounded-bl-none border border-white/5'
                                            }`}>
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/10 rounded-2xl px-4 py-3 rounded-bl-none flex gap-1 items-center h-9">
                                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-3 border-t border-white/10 bg-slate-900/50">
                        <form
                            className="flex w-full gap-2"
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        >
                            <Input
                                placeholder="Cth: Buat surat domisili..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus-visible:ring-purple-500 rounded-full"
                            />
                            <Button type="submit" size="icon" disabled={!input.trim() || isTyping} className="bg-purple-600 hover:bg-purple-700 rounded-full shrink-0">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}
        </>
    )
}
