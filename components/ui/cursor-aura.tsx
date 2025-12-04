"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface CursorState {
  x: number
  y: number
}

export function CursorAura() {
  const [pos, setPos] = useState<CursorState>({ x: -100, y: -100 })
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    let hideTimeout: number | undefined

    const handleMove = (event: MouseEvent) => {
      setPos({ x: event.clientX, y: event.clientY })
      setVisible(true)

      if (hideTimeout) {
        window.clearTimeout(hideTimeout)
      }
      hideTimeout = window.setTimeout(() => {
        setVisible(false)
      }, 1200)
    }

    const handleEnter = () => {
      setVisible(true)
    }

    const handleLeave = () => {
      setVisible(false)
    }

    const handleDown = () => setActive(true)
    const handleUp = () => setActive(false)

    window.addEventListener("pointermove", handleMove)
    window.addEventListener("pointerenter", handleEnter)
    window.addEventListener("pointerleave", handleLeave)
    window.addEventListener("pointerdown", handleDown)
    window.addEventListener("pointerup", handleUp)

    return () => {
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerenter", handleEnter)
      window.removeEventListener("pointerleave", handleLeave)
      window.removeEventListener("pointerdown", handleDown)
      window.removeEventListener("pointerup", handleUp)
      if (hideTimeout) window.clearTimeout(hideTimeout)
    }
  }, [])

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-[60] transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0",
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          "pointer-events-none absolute rounded-full mix-blend-screen",
          "bg-[radial-gradient(circle_at_center,_rgba(107,255,184,0.5),_rgba(75,223,255,0.15)_45%,_transparent_70%)]",
          "transition-transform transition-opacity duration-200",
        )}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: active ? "8rem" : "10rem",
          height: active ? "8rem" : "10rem",
          transform: `translate(-50%, -50%) scale(${active ? 0.9 : 1})`,
          opacity: visible ? 0.8 : 0.7,
        }}
      />
    </div>
  )
}


