"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react"

interface TestResult {
  name: string
  description: string
  expectedBehavior: string
  status: "pending" | "success" | "error"
  request?: object
  response?: object
  error?: string
}

export default function TestPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const updateResult = (index: number, update: Partial<TestResult>) => {
    setResults((prev) => prev.map((r, i) => (i === index ? { ...r, ...update } : r)))
  }

  const runTests = async () => {
    setIsRunning(true)
    const testResults: TestResult[] = [
      {
        name: "1. POST /api/trips - Create Trip",
        description: "Creates a trip with valid items (spaghetti, marinara, milk)",
        expectedBehavior: "Returns 200 with tripId and 3 optimized plans",
        status: "pending",
      },
      {
        name: "2. GET /api/trips/:id - Retrieve Trip",
        description: "Fetches the trip created in test 1",
        expectedBehavior: "Returns 200 with full trip details and plans",
        status: "pending",
      },
      {
        name: "3. GET /api/stores - List Stores",
        description: "Lists stores near Mountain View (37.4019, -122.111)",
        expectedBehavior: "Returns 200 with array of nearby stores",
        status: "pending",
      },
      {
        name: "4. GET /api/products/search - Search Products",
        description: "Searches for products matching 'milk'",
        expectedBehavior: "Returns 200 with matching products",
        status: "pending",
      },
      {
        name: "5. Error Handling - Empty Items",
        description: "Sends request with empty items array",
        expectedBehavior: "Returns 400 Bad Request (this is correct behavior)",
        status: "pending",
      },
      {
        name: "6. Error Handling - Unmatched Products",
        description: "Sends request with non-existent products",
        expectedBehavior: "Returns 422 Unprocessable Entity (this is correct behavior)",
        status: "pending",
      },
    ]
    setResults(testResults)

    // Test 1: Valid POST /api/trips
    const validRequest = {
      origin: { lat: 37.4019, lon: -122.111, zip: "94040" },
      items: [
        { rawQuery: "spaghetti", quantity: 2 },
        { rawQuery: "marinara sauce", quantity: 1 },
        { rawQuery: "whole milk", quantity: 1 },
      ],
      preferences: {
        maxStores: 3,
        maxRadiusKm: 15,
        strategy: "ALL",
      },
    }

    let tripId: number | null = null

    try {
      const res1 = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequest),
      })
      const data1 = await res1.json()
      tripId = data1.tripId
      updateResult(0, {
        status: res1.ok ? "success" : "error",
        request: validRequest,
        response: data1,
        error: res1.ok ? undefined : data1.error,
      })
    } catch (e) {
      updateResult(0, { status: "error", error: String(e) })
    }

    // Test 2: GET /api/trips/:id
    if (tripId) {
      try {
        const res2 = await fetch(`/api/trips/${tripId}`)
        const data2 = await res2.json()
        updateResult(1, {
          status: res2.ok ? "success" : "error",
          request: { tripId },
          response: data2,
          error: res2.ok ? undefined : data2.error,
        })
      } catch (e) {
        updateResult(1, { status: "error", error: String(e) })
      }
    } else {
      updateResult(1, { status: "error", error: "Skipped - no tripId from test 1" })
    }

    // Test 3: GET /api/stores
    try {
      const res3 = await fetch("/api/stores?lat=37.4019&lon=-122.111&radiusKm=10")
      const data3 = await res3.json()
      updateResult(2, {
        status: res3.ok ? "success" : "error",
        request: { lat: 37.4019, lon: -122.111, radiusKm: 10 },
        response: data3,
        error: res3.ok ? undefined : data3.error,
      })
    } catch (e) {
      updateResult(2, { status: "error", error: String(e) })
    }

    // Test 4: GET /api/products/search
    try {
      const res4 = await fetch("/api/products/search?q=milk")
      const data4 = await res4.json()
      updateResult(3, {
        status: res4.ok ? "success" : "error",
        request: { q: "milk" },
        response: data4,
        error: res4.ok ? undefined : data4.error,
      })
    } catch (e) {
      updateResult(3, { status: "error", error: String(e) })
    }

    // Test 5: Error - Empty items array (should return 400)
    try {
      const emptyRequest = {
        origin: { lat: 37.4019, lon: -122.111 },
        items: [],
      }
      const res5 = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emptyRequest),
      })
      const data5 = await res5.json()
      // Success = got expected 400 error
      updateResult(4, {
        status: res5.status === 400 ? "success" : "error",
        request: emptyRequest,
        response: data5,
        error: res5.status === 400 ? undefined : `Expected 400, got ${res5.status}`,
      })
    } catch (e) {
      updateResult(4, { status: "error", error: String(e) })
    }

    // Test 6: Error - Unmatched products (should return 422)
    try {
      const unmatchedRequest = {
        origin: { lat: 37.4019, lon: -122.111 },
        items: [
          { rawQuery: "xyznonexistent123", quantity: 1 },
          { rawQuery: "abcfakeproduct456", quantity: 1 },
        ],
      }
      const res6 = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(unmatchedRequest),
      })
      const data6 = await res6.json()
      // Success = got expected 422 error
      updateResult(5, {
        status: res6.status === 422 ? "success" : "error",
        request: unmatchedRequest,
        response: data6,
        error: res6.status === 422 ? undefined : `Expected 422, got ${res6.status}`,
      })
    } catch (e) {
      updateResult(5, { status: "error", error: String(e) })
    }

    setIsRunning(false)
  }

  const successCount = results.filter((r) => r.status === "success").length
  const errorCount = results.filter((r) => r.status === "error").length

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">API Test Suite</h1>
            <p className="text-muted-foreground">Testing trip planning endpoints</p>
          </div>
          <Button onClick={runTests} disabled={isRunning} size="lg">
            {isRunning ? "Running..." : "Run All Tests"}
          </Button>
        </div>

        {results.length > 0 && (
          <Card>
            <CardContent className="flex items-center justify-center gap-8 py-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium">{successCount} Passed</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium">{errorCount} Failed</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{results.filter((r) => r.status === "pending").length} Pending</span>
              </div>
            </CardContent>
          </Card>
        )}

        {results.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Click "Run All Tests" to start the test suite
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <Card
                key={index}
                className={
                  result.status === "error" ? "border-red-500" : result.status === "success" ? "border-green-500" : ""
                }
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {result.status === "pending" && <Clock className="h-5 w-5 text-muted-foreground" />}
                        {result.status === "success" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                        {result.status === "error" && <XCircle className="h-5 w-5 text-red-600" />}
                        {result.name}
                      </CardTitle>
                      <CardDescription>{result.description}</CardDescription>
                    </div>
                    <span
                      className={`shrink-0 rounded px-2 py-1 text-sm font-medium ${
                        result.status === "pending"
                          ? "bg-muted text-muted-foreground"
                          : result.status === "success"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                      }`}
                    >
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Expected: {result.expectedBehavior}</span>
                  </div>
                  {result.error && <p className="pt-2 text-sm text-red-600 dark:text-red-400">Error: {result.error}</p>}
                </CardHeader>
                {(result.request || result.response) && (
                  <CardContent className="space-y-4">
                    {result.request && (
                      <div>
                        <h4 className="mb-1 font-medium text-sm">Request:</h4>
                        <pre className="overflow-auto rounded bg-muted p-3 text-xs">
                          {JSON.stringify(result.request, null, 2)}
                        </pre>
                      </div>
                    )}
                    {result.response && (
                      <div>
                        <h4 className="mb-1 font-medium text-sm">Response:</h4>
                        <pre className="max-h-96 overflow-auto rounded bg-muted p-3 text-xs">
                          {JSON.stringify(result.response, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Database Tables Used</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm md:grid-cols-2">
            <div className="space-y-2">
              <p>
                <strong>trips:</strong> id, user_id, origin_lat, origin_lon, origin_zip, settings
              </p>
              <p>
                <strong>trip_items:</strong> id, trip_id, product_id, raw_query, quantity
              </p>
              <p>
                <strong>trip_plans:</strong> id, trip_id, label, strategy, total_price, distances, times, savings
              </p>
              <p>
                <strong>trip_plan_stores:</strong> id, trip_plan_id, store_id, order_index, distances
              </p>
            </div>
            <div className="space-y-2">
              <p>
                <strong>trip_plan_item_assignments:</strong> trip_plan_id, trip_item_id, store_id, product_id, price
              </p>
              <p>
                <strong>stores:</strong> id, name, chain, lat, lon, address
              </p>
              <p>
                <strong>products:</strong> id, name, brand, category, size
              </p>
              <p>
                <strong>store_product_prices:</strong> store_id, product_id, price, in_stock
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
