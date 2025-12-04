import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, User, LogOut, Settings } from "lucide-react"
import { getCurrentUser, getCurrentAdmin } from "@/lib/auth/get-current-user"
import { signOut } from "@/lib/auth/actions"

export async function Header() {
  const user = await getCurrentUser()
  const admin = await getCurrentAdmin()

  return (
    <header className="sticky top-0 z-50 w-full glass-subtle backdrop-glass border-b border-border/60 shadow-lg">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-3 font-bold text-2xl transition-spring hover:scale-105">
          <div className="rounded-xl bg-primary/20 p-2 shadow-lg border border-primary/40">
            <ShoppingCart className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(107,255,184,0.8)]" />
          </div>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SimplyGrocery
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              {/* Logged in */}
              <Link href="/trips">
                <Button variant="glass" size="sm">My Trips</Button>
              </Link>
              <Link href="/trip/new">
                <Button variant="neon" size="sm">Plan a Trip</Button>
              </Link>
              {admin && (
                <Link href="/admin">
                  <Button variant="secondary" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <div className="flex items-center gap-3 border-l border-border/50 pl-4 ml-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-subtle">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm text-foreground">{user.email}</span>
                </div>
                <form action={signOut}>
                  <Button variant="outline" size="sm" type="submit">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <>
              {/* Logged out */}
              <Link href="/trip/new">
                <Button variant="neon" size="sm">Plan a Trip</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button variant="glass" size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
