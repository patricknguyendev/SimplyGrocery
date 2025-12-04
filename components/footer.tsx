import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="glass rounded-t-2xl border-t border-glow-green shadow-2xl mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Left side: Copyright */}
          <div className="text-sm">
            <p className="font-bold text-lg bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              SimplyGrocery
            </p>
            <p className="mt-2 text-muted-foreground">
              © {currentYear} SimplyGrocery. All rights reserved.
            </p>
          </div>

          {/* Right side: Links */}
          <div className="flex flex-wrap gap-6 text-sm">
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary hover:text-glow-green transition-spring hover:scale-105"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary hover:text-glow-green transition-spring hover:scale-105"
            >
              Terms
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-border/30">
          <div className="glass-subtle rounded-xl p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground font-semibold">Disclaimer:</strong> SimplyGrocery is not affiliated with or endorsed
              by any retailers. We aggregate publicly available information and present it for convenience only. Prices,
              availability, and store details may change and are not guaranteed. Always verify prices and availability
              directly with the retailer before purchasing.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
