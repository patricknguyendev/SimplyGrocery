"use client"

import type { PlanResponse } from "@/lib/optimizer/types"

interface PlanSummaryHeaderProps {
  plan: PlanResponse
}

export function PlanSummaryHeader({ plan }: PlanSummaryHeaderProps) {
  const storeCount = plan.stores.length
  const timeInStore = Math.round(plan.estimatedInstoreTimeMin)

  // Build savings array
  const savings: Array<{ chain: string; amount: number }> = []
  if (plan.savingsVsTarget !== null && plan.savingsVsTarget > 0) {
    savings.push({ chain: "Target", amount: plan.savingsVsTarget })
  }
  if (plan.savingsVsCostco !== null && plan.savingsVsCostco > 0) {
    savings.push({ chain: "Costco", amount: plan.savingsVsCostco })
  }
  if (plan.savingsVsWalmart !== null && plan.savingsVsWalmart > 0) {
    savings.push({ chain: "Walmart", amount: plan.savingsVsWalmart })
  }

  // Build savings text
  let savingsText = ""
  if (savings.length > 0) {
    const savingsParts = savings.map((s) => `$${s.amount.toFixed(2)} vs ${s.chain}`)
    if (savingsParts.length === 1) {
      savingsText = `, saving ${savingsParts[0]}`
    } else if (savingsParts.length === 2) {
      savingsText = `, saving ${savingsParts[0]} and ${savingsParts[1]}`
    } else {
      const last = savingsParts.pop()
      savingsText = `, saving ${savingsParts.join(", ")}, and ${last}`
    }
  }

  const summaryText = `With the ${plan.label} plan, you'll visit ${storeCount} store${storeCount !== 1 ? "s" : ""}, spend about ${timeInStore} minutes in-store, and pay $${plan.totalPrice.toFixed(2)}${savingsText}.`

  return (
    <div className="space-y-4">
      {/* Summary Sentence */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-base leading-relaxed text-foreground">{summaryText}</p>
      </div>

      {/* Detailed Metrics */}
      <div>
        <h4 className="mb-3 font-semibold text-foreground">Trip Details</h4>
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Cost</p>
            <p className="text-xl font-bold text-foreground">${plan.totalPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Travel Distance</p>
            <p className="text-xl font-bold text-foreground">{plan.totalDistanceKm.toFixed(1)} km</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Travel Time</p>
            <p className="text-xl font-bold text-foreground">{Math.round(plan.totalTravelTimeMin)} min</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Time</p>
            <p className="text-xl font-bold text-foreground">~{Math.round(plan.estimatedTotalTimeMin)} min</p>
          </div>
        </div>
      </div>
    </div>
  )
}

