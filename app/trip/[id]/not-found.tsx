import Link from "next/link"
import { ArrowLeft, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function TripNotFound() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <SearchX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Trip Not Found</h1>
            <p className="mt-2 text-muted-foreground">
              We couldn&apos;t find the trip you&apos;re looking for. It may have been deleted or the link is incorrect.
            </p>
            <Button asChild className="mt-6">
              <Link href="/trip/new">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Create a New Trip
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
