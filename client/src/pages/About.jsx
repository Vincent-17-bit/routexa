import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const TITLE = 'About & privacy — ROUTEXA'
const DESCRIPTION =
  'How ROUTEXA works, what information it collects to plan routes and show live traffic, and how that information is used.'

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

function Section({ title, children }) {
  return (
    <section className="py-6 border-b border-card-light dark:border-card-dark last:border-0">
      <h2 className="text-base font-semibold mb-2">{title}</h2>
      <div className="text-sm leading-relaxed text-text-secondary-light dark:text-text-secondary-dark space-y-3">
        {children}
      </div>
    </section>
  )
}

export default function About() {
  useDocumentMeta(TITLE, DESCRIPTION)

  return (
    <main className="min-h-screen bg-app-light dark:bg-app-dark text-text-primary-light dark:text-text-primary-dark pt-20 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <Link
          to="/"
          className="text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-accent-light dark:hover:text-accent-dark transition-colors"
        >
          ← Back to map
        </Link>

        <h1 className="text-2xl font-bold mt-4">About ROUTEXA</h1>
        <p className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
          ROUTEXA helps you find the fastest way from A to B and see current traffic conditions
          along the way. This page explains what we collect, why, and how it's handled.
        </p>

        <Section title="What we collect">
          <p>
            We don't ask you to create an account, and we don't collect your name, email
            address, or phone number. To make the app work, and to understand how it's used,
            we do collect some information automatically:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>A random identifier stored on your device, so repeat visits are recognized without asking who you are.</li>
            <li>Basic device and browser details — type, operating system, and browser name.</li>
            <li>An approximate location (city and country) worked out from your IP address when you open the app.</li>
            <li>The places and routes you search for — origin, destination, distance, and estimated time for each route you plan.</li>
            <li>If you allow location access in your browser, your live position is used to show you on the map and guide your route. This stays in your browser and is not sent to or stored on our servers.</li>
          </ul>
        </Section>

        <Section title="How we use it">
          <p>We use this information to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Calculate and display routes and traffic conditions</li>
            <li>Keep the app reliable and working correctly</li>
            <li>Understand how ROUTEXA is used, so we can improve it</li>
          </ul>
          <p>We don't sell your information, and we don't use it for advertising.</p>
        </Section>

        <Section title="Who we share it with">
          <p>
            We use a small number of outside services to help run ROUTEXA — for example, to
            draw maps and calculate directions, and to work out an approximate location from an
            IP address. These providers only receive the limited information needed to do that
            job, and we don't allow them to use it for anything else.
          </p>
        </Section>

        <Section title="How long we keep it">
          <p>
            We keep information for as long as we need it to run and improve the app.
          </p>
        </Section>

        <Section title="Your choices">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Clear your browser's local storage to reset your device identifier</li>
            <li>Turn off location access at any time in your browser or device settings</li>
          </ul>
        </Section>

        <Section title="Security">
          <p>
            We take reasonable steps to protect the information we hold, including limiting who
            can access it and monitoring for unusual activity. No system is completely secure,
            but we work to keep your information safe.
          </p>
        </Section>

        <Section title="Compliance">
          <p>
            We aim to handle information responsibly and in line with generally accepted data
            protection principles.
          </p>
        </Section>

        <Section title="Changes to this page">
          <p>We may update this page from time to time.</p>
        </Section>

        <p className="mt-10 text-xs text-text-secondary-light dark:text-text-secondary-dark">
          © {new Date().getFullYear()} ROUTEXA. Created, drafted, and built by viniihkr3.
        </p>
      </div>
    </main>
  )
}
