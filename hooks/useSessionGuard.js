'use client'
import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function useSessionGuard({
  idleTime = 15 * 60 * 1000,        // 預設閒置 15 分鐘
  maxSessionTime = 60 * 60 * 1000   // 預設登入後最多 1 小時
} = {}) {
  const router = useRouter()

  useEffect(() => {
    // ✅ 定時檢查是否超過最大登入時間
    const checkLoginTime = () => {
      const loginTime = localStorage.getItem('loginTime')
      const now = Date.now()
      if (!loginTime || now - loginTime > maxSessionTime) {
        supabase.auth.signOut()
        localStorage.clear()
        router.push('/')
      }
    }

    checkLoginTime() // 進來先檢查一次
    const sessionInterval = setInterval(checkLoginTime, 10000) // 每10秒檢查一次

    // ✅ 閒置檢查（滑鼠鍵盤等沒動）
    let idleTimer
    const resetIdleTimer = () => {
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        supabase.auth.signOut()
        localStorage.clear()
        router.push('/') 
      }, idleTime)
    }

    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart']
    events.forEach(event => window.addEventListener(event, resetIdleTimer))
    resetIdleTimer()

        // ✅ 當頁面從背景回到前台時，重新檢查
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            checkLoginTime();
          }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

    // ✅ 清除定時器與事件
    return () => {
      clearInterval(sessionInterval)
      events.forEach(event => window.removeEventListener(event, resetIdleTimer))
      clearTimeout(idleTimer)
    }
  }, [idleTime, maxSessionTime, router])
}
