import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/products/search
 * Search products by name for autocomplete
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")
    const category = searchParams.get("category")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "10"), 50)

    if (!query || query.length < 2) {
      return NextResponse.json({ error: "Query parameter 'q' must be at least 2 characters" }, { status: 400 })
    }

    const supabase = await createClient()

    let dbQuery = supabase
      .from("products")
      .select("id, name, brand, category, size_value, size_unit")
      .ilike("name", `%${query}%`)
      .limit(limit)

    if (category) {
      dbQuery = dbQuery.eq("category", category)
    }

    const { data, error } = await dbQuery

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Sort by relevance (exact matches first, then by name length)
    const products = (data || []).sort((a, b) => {
      const aExact = a.name.toLowerCase() === query.toLowerCase()
      const bExact = b.name.toLowerCase() === query.toLowerCase()

      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1

      return a.name.length - b.name.length
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error searching products:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
