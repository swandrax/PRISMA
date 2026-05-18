"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShieldAlert, FileText, CheckCircle } from "lucide-react"
import Link from "next/link"

interface Notification {
  id: string
  title: string
  description: string
  time: Date
  type: "keamanan" | "surat" | "info"
  link: string
}

export function RealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to laporan_keamanan inserts
    const channel = supabase
      .channel('realtime_laporan')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'laporan_keamanan'
        },
        (payload) => {
          const newReport = payload.new
          
          const newNotification: Notification = {
            id: newReport.id,
            title: "Laporan Keamanan Baru",
            description: newReport.jenis_laporan || "Ada laporan keamanan baru masuk",
            time: new Date(),
            type: "keamanan",
            link: "/surat/keamanan"
          }

          setNotifications(prev => [newNotification, ...prev].slice(0, 5)) // Keep last 5
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-700 shadow-2xl rounded-lg p-4 flex gap-3 text-white relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${
              notif.type === 'keamanan' ? 'bg-red-500' : 
              notif.type === 'surat' ? 'bg-blue-500' : 'bg-green-500'
            }`} />
            
            <div className="mt-1">
              {notif.type === 'keamanan' ? <ShieldAlert className="h-5 w-5 text-red-400" /> :
               notif.type === 'surat' ? <FileText className="h-5 w-5 text-blue-400" /> :
               <CheckCircle className="h-5 w-5 text-green-400" />}
            </div>
            
            <div className="flex-1 pr-6 cursor-pointer">
              <Link href={notif.link} onClick={() => dismissNotification(notif.id)}>
                <h4 className="font-semibold text-sm mb-1">{notif.title}</h4>
                <p className="text-xs text-slate-300 line-clamp-2">{notif.description}</p>
                <span className="text-[10px] text-slate-400 mt-2 block">
                  Berapa detik yang lalu
                </span>
              </Link>
            </div>

            <button 
              onClick={() => dismissNotification(notif.id)}
              className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
