"use client"

import { useCallback, useEffect, useState } from "react"

export interface SavedListItem {
  rawQuery: string
  quantity: number
}

export interface SavedList {
  id: string
  name: string
  items: SavedListItem[]
  createdAt: string
}

const STORAGE_KEY = "simplygrocery:savedLists"

function isSavedListArray(value: unknown): value is SavedList[] {
  return Array.isArray(value)
}

export function useSavedLists() {
  const [savedLists, setSavedLists] = useState<SavedList[]>([])

  // Load from localStorage on first client render
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return

      const parsed = JSON.parse(raw)
      if (isSavedListArray(parsed)) {
        setSavedLists(parsed)
      }
    } catch (error) {
      console.error("Failed to load saved lists from localStorage:", error)
    }
  }, [])

  const persist = useCallback((lists: SavedList[]) => {
    setSavedLists(lists)

    if (typeof window === "undefined") return

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lists))
    } catch (error) {
      console.error("Failed to persist saved lists to localStorage:", error)
    }
  }, [])

  const saveList = useCallback(
    (name: string, items: SavedListItem[]): SavedList | null => {
      const trimmedName = name.trim()
      const validItems = items.filter((item) => item.rawQuery.trim() !== "" && item.quantity > 0)

      if (!trimmedName || validItems.length === 0) {
        return null
      }

      const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now())

      const newList: SavedList = {
        id,
        name: trimmedName,
        items: validItems.map((item) => ({
          rawQuery: item.rawQuery.trim(),
          quantity: item.quantity,
        })),
        createdAt: new Date().toISOString(),
      }

      const next = [...savedLists, newList]
      persist(next)
      return newList
    },
    [persist, savedLists],
  )

  const deleteList = useCallback(
    (id: string) => {
      const next = savedLists.filter((list) => list.id !== id)
      persist(next)
    },
    [persist, savedLists],
  )

  const renameList = useCallback(
    (id: string, name: string) => {
      const trimmedName = name.trim()
      if (!trimmedName) return

      const next = savedLists.map((list) => (list.id === id ? { ...list, name: trimmedName } : list))
      persist(next)
    },
    [persist, savedLists],
  )

  return {
    savedLists,
    saveList,
    deleteList,
    renameList,
  }
}


