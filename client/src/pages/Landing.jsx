import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const TITLE = 'ROUTEXA — Live traffic navigation'
const DESCRIPTION =
  'Find the fastest route and see live traffic conditions as you drive, ride, or take the bus. No account required.'

function useDocumentMeta(title, description) {
  useEffect(() => {
    const prevTitle = document.title
    const tag = document.querySelector('meta[name="description"]')
    const prevDescription = tag?.getAttribute('content')

    document.title = title
    tag?.setAttribute('content', description)

    return () => {
      document.title = prevTitle
      if (prevDescription != null) tag?.setAttribute('content', prevDescription)
    }
  }, [title, description])
}

function PrimaryButton({ children, className = '' }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg text-sm font-semibold bg-accent-light dark:bg-accent-dark text-white hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-light dark:focus-visible:ring-accent-dark transition ${className}`}
    >
      {children}
    </Link>
  )
}

// abstract road network + a traffic-colored route, same palette as the live map
function MapMock({ compact = false }) {
  return (
    <div className={`relative w-full ${compact ? 'aspect-[4/3]' : 'aspect-[16/10]'} rounded-xl overflow-hidden bg-app-dark`}>
      <svg viewBox="0 0 400 260" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="400" height="260" fill="#0F172A" />
        <g stroke="#1E293B" strokeWidth="3" fill="none">
          <path d="M-10 40 L410 60" />
          <path d="M-10 120 L410 100" />
          <path d="M-10 210 L410 190" />
          <path d="M60 -10 L40 270" />
          <path d="M180 -10 L210 270" />
          <path d="M320 -10 L340 270" />
        </g>
        <path d="M52 -10 Q80 90 130 130 T260 190 Q300 210 340 270" stroke="#64748B" strokeWidth="4" fill="none" opacity="0.5" />
        <path
          d="M52 -10 Q80 90 130 130 T260 190"
          stroke="#10B981"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M260 190 Q300 210 320 240"
          stroke="#F59E0B"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M320 240 L340 270"
          stroke="#EF4444"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="52" cy="-2" r="7" fill="#14B8A6" stroke="#0F172A" strokeWidth="2" />
        <circle cx="336" cy="262" r="7" fill="#F472B6" stroke="#0F172A" strokeWidth="2" />
      </svg>

      <span className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-dark glass border border-card-dark">
        <span className="h-1.5 w-1.5 rounded-full bg-traffic-clear-dark" />
        <span className="text-[10px] font-semibold text-traffic-clear-dark">LIVE</span>
      </span>

      {!compact && (
        <span className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-dark glass border border-card-dark text-[9px] text-text-secondary-dark">
          <span className="w-2 h-1 rounded-sm bg-traffic-clear-dark" />
          <span className="w-2 h-1 rounded-sm bg-traffic-moderate-dark" />
          <span className="w-2 h-1 rounded-sm bg-traffic-heavy-dark" />
          <span className="italic">Fast → Slow</span>
        </span>
      )}
    </div>
  )
}

function AppSheetMock() {
  const modes = [
    { icon: 'fa-car', active: true },
    { icon: 'fa-bus', active: false },
    { icon: 'fa-motorcycle', active: false }
  ]
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-card-dark bg-app-dark">
      <MapMock />
      <div className="bg-surface-dark glass border-t border-card-dark px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          {modes.map((m) => (
            <span
              key={m.icon}
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs ${
                m.active ? 'bg-accent-dark text-white' : 'text-text-secondary-dark'
              }`}
            >
              <i className={`fas ${m.icon}`} aria-hidden="true" />
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2.5 mb-2">
          <span className="shrink-0 w-2 h-2 rounded-full border-2 border-text-secondary-dark" />
          <span className="flex-1 h-8 rounded-lg bg-white/10 flex items-center px-3 text-xs text-text-secondary-dark">
            Your location
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <i className="fas fa-location-dot shrink-0 text-route-destination-dark text-sm" aria-hidden="true" />
          <span className="flex-1 h-8 rounded-lg bg-white/10 flex items-center px-3 text-xs text-text-primary-dark">
            Destination
          </span>
        </div>
      </div>
    </div>
  )
}

const STEPS = [
  { icon: 'fa-magnifying-glass-location', title: 'Search where you\u2019re going', body: 'Type an address, a place, or drop a pin — no sign-in needed.' },
  { icon: 'fa-shuffle', title: 'Pick how you\u2019re getting there', body: 'Car, bus, or motorbike — each gets its own route.' },
  { icon: 'fa-route', title: 'Follow the fastest way', body: 'The route updates as traffic changes, in real time.' }
]

const FEATURES = [
  {
    icon: 'fa-gauge-high',
    title: 'Live traffic, not stale maps',
    body: 'Routes are colored by current speed on the road, and re-checked as conditions change — not a fixed estimate from average speeds.'
  },
  {
    icon: 'fa-car-side',
    title: 'Car, bus, or motorbike',
    body: 'Each mode gets a route built for it, not the same driving directions relabeled.'
  },
  {
    icon: 'fa-magnifying-glass-location',
    title: 'Search real places',
    body: 'Hospitals, fuel stations, hotels, cafes, banks, and more — search by name or category and route there directly.'
  },
  {
    icon: 'fa-user-shield',
    title: 'No account, ever',
    body: 'No sign-up, no phone number, no email. Open it and start routing.'
  },
  {
    icon: 'fa-earth-americas',
    title: 'Works anywhere',
    body: 'ROUTEXA routes and tracks traffic wherever you are — not limited to one city or country.'
  },
  {
    icon: 'fa-circle-half-stroke',
    title: 'Built for how you actually look at it',
    body: 'Light and dark themes that follow your system setting automatically, day or night.'
  }
]

function FeatureCard({ icon, title, body }) {
  return (
    <div className="rounded-xl border border-card-light dark:border-card-dark bg-surface-light dark:bg-surface-dark p-5">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark mb-3">
        <i className={`fas ${icon}`} aria-hidden="true" />
      </span>
      <h3 className="text-sm font-semibold mb-1.5">{title}</h3>
      <p className="text-sm leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">{body}</p>
    </div>
  )
}

export default function Landing() {
  useDocumentMeta(TITLE, DESCRIPTION)

  return (
    <main className="min-h-screen bg-app-light dark:bg-app-dark text-text-primary-light dark:text-text-primary-dark">
      {/* Hero */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
              The fastest route, based on traffic that's happening right now.
            </h1>
            <p className="mt-4 text-base text-text-secondary-light dark:text-text-secondary-dark leading-relaxed max-w-md">
              ROUTEXA plans your route by car, bus, or motorbike and colors it by live traffic
              conditions — not yesterday's average. No account required, anywhere in the world.
            </p>
            <div className="mt-7 flex items-center gap-3">
              <PrimaryButton>
                Open the map
                <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
              </PrimaryButton>
              <Link
                to="/about"
                className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-accent-light dark:hover:text-accent-dark transition-colors"
              >
                How your data is handled
              </Link>
            </div>
            <Link
              to="/blog"
              className="inline-block mt-4 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-accent-light dark:hover:text-accent-dark transition-colors"
            >
              Read our Nairobi traffic guides →
            </Link>
          </div>
          <div className="max-w-sm mx-auto md:mx-0 md:ml-auto w-full">
            <AppSheetMock />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 border-t border-card-light dark:border-card-dark">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold mb-8">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.title}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center bg-accent-light dark:bg-accent-dark text-white text-xs font-bold">
                    {i + 1}
                  </span>
                  <i className={`fas ${s.icon} text-accent-light dark:text-accent-dark`} aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-16 px-4 border-t border-card-light dark:border-card-dark">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold mb-8">Why ROUTEXA</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* Live map teaser */}
      <section className="py-16 px-4 border-t border-card-light dark:border-card-dark">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-2">See traffic before you leave</h2>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark max-w-md mx-auto mb-8">
            Green means moving, amber means slowing down, red means stopped — right on the route
            you're about to take.
          </p>
          <div className="rounded-2xl border border-card-light dark:border-card-dark bg-surface-light dark:bg-surface-dark p-2 shadow-2xl">
            <div className="flex items-center gap-1.5 px-2 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-traffic-heavy-light dark:bg-traffic-heavy-dark" />
              <span className="h-2.5 w-2.5 rounded-full bg-traffic-moderate-light dark:bg-traffic-moderate-dark" />
              <span className="h-2.5 w-2.5 rounded-full bg-traffic-clear-light dark:bg-traffic-clear-dark" />
              <span className="ml-2 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">routexa.vercel.app</span>
            </div>
            <MapMock />
          </div>
          <PrimaryButton className="mt-8">
            Try it now
            <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
          </PrimaryButton>
        </div>
      </section>

      {/* Privacy / trust */}
      <section className="py-16 px-4 border-t border-card-light dark:border-card-dark">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-3">No account. No tracking you by name.</h2>
          <p className="text-sm leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
            You don't sign up, and we don't ask for your name, email, or phone number. We collect
            what's needed to plan a route and understand basic usage — routes searched, approximate
            location from your IP, and, if you allow it, live GPS position to guide you, which stays
            in your browser. Nothing is sold, and nothing is used for advertising.
          </p>
          <Link
            to="/about"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-accent-light dark:text-accent-dark hover:underline"
          >
            Read the full privacy breakdown
            <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 border-t border-card-light dark:border-card-dark">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-6">Open the map and see your route now.</h2>
          <PrimaryButton>
            Open the map
            <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
          </PrimaryButton>
        </div>
      </section>

      <footer className="px-4 py-8 border-t border-card-light dark:border-card-dark">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary-light dark:text-text-secondary-dark">
          <span>© {new Date().getFullYear()} ROUTEXA</span>
          <Link to="/about" className="hover:text-accent-light dark:hover:text-accent-dark transition-colors">
            About &amp; privacy
          </Link>
        </div>
      </footer>
    </main>
  )
}
