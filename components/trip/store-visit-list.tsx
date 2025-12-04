"use client"

import { useState } from "react"
import { MapPin, ChevronDown, ChevronUp, Store } from "lucide-react"
import type { PlanResponse } from "@/lib/optimizer/types"

interface StoreVisitListProps {
  plan: PlanResponse
}

export function StoreVisitList({ plan }: StoreVisitListProps) {
  // Determine distance source for attribution
  const hasGoogle = plan.stores.some(s => s.distanceSource === 'google')
  const hasFallback = plan.stores.some(s => s.distanceSource === 'fallback')

  let attributionText = ''
  if (hasGoogle && !hasFallback) {
    attributionText = 'Distances powered by Google Maps'
  } else if (hasGoogle && hasFallback) {
    attributionText = 'Distances from Google Maps and approximate calculations'
  } else if (hasFallback) {
    attributionText = 'Distances are approximated'
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Store className="h-5 w-5" />
          Store Visit Order
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Visit these {plan.stores.length} store{plan.stores.length !== 1 ? "s" : ""} in order
        </p>
      </div>

      <div className="space-y-4">
        {plan.stores.map((storeVisit, index) => (
          <StoreVisitCard
            key={storeVisit.store.id}
            storeVisit={storeVisit}
            stopNumber={index + 1}
            isFirst={index === 0}
            isLast={index === plan.stores.length - 1}
          />
        ))}
      </div>

      {attributionText && (
        <p className="text-xs text-muted-foreground text-center pt-2">
          {attributionText}
        </p>
      )}
    </div>
  )
}

function StoreVisitCard({
  storeVisit,
  stopNumber,
  isFirst,
  isLast,
}: {
  storeVisit: PlanResponse["stores"][0]
  stopNumber: number
  isFirst: boolean
  isLast: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const storeSubtotal = storeVisit.items.reduce((sum, item) => sum + item.lineTotal, 0)

  return (
    <div className="relative">
      {/* Connection line */}
      {!isLast && <div className="absolute left-5 top-16 h-full w-0.5 bg-border" />}

      <div className="glass rounded-2xl shadow-xl float-on-hover transition-spring glow-green-hover">
        {/* Store header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 border-2 border-primary glow-green shadow-lg">
              <span className="font-bold text-primary">{stopNumber}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Stop {stopNumber}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="font-semibold text-foreground">{storeVisit.store.name}</span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {storeVisit.store.chain} • {storeVisit.store.address}
              </p>
              {!isFirst && (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {storeVisit.distanceFromPrevKm.toFixed(1)} km • {Math.round(storeVisit.travelTimeFromPrevMin)} min
                  drive from previous
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-foreground">${storeSubtotal.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Subtotal</p>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Items list */}
        {isExpanded && (
          <div className="border-t border-border">
            <div className="divide-y divide-border">
              {storeVisit.items.map((item) => (
                <div
                  key={`${storeVisit.store.id}-${item.productId}`}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">{item.quantity}x</span>
                    <span className="text-foreground">{item.productName}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-foreground">${item.lineTotal.toFixed(2)}</span>
                    <span className="ml-2 text-xs text-muted-foreground">(${item.unitPrice.toFixed(2)} ea)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

