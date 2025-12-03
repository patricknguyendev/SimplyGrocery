"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { PlanResponse } from "@/lib/optimizer/types"
import { PlanSummaryHeader } from "@/components/trip/plan-summary-header"
import { PlanSelector } from "@/components/trip/plan-selector"
import { StoreVisitList } from "@/components/trip/store-visit-list"
import { SingleStoreComparison } from "@/components/trip/single-store-comparison"

interface TripPlansViewProps {
  plans: PlanResponse[]
}

export function TripPlansView({ plans }: TripPlansViewProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<number>(plans[0]?.id)
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0]

  if (!selectedPlan) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Trip Summary Section */}
      <Card>
        <CardContent className="pt-6">
          <PlanSummaryHeader plan={selectedPlan} />
        </CardContent>
      </Card>

      {/* Plan Selection Cards */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">Choose Your Plan</h2>
        <PlanSelector plans={plans} selectedPlanId={selectedPlanId} onSelectPlan={setSelectedPlanId} />
      </div>

      {/* Selected Plan Details */}
      <Card>
        <CardContent className="pt-6">
          <StoreVisitList plan={selectedPlan} />
        </CardContent>
      </Card>

      {/* Single Store Comparison */}
      <SingleStoreComparison plan={selectedPlan} />
    </div>
  )
}
