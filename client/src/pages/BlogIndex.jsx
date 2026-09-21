import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BLOG_POSTS } from '../lib/blogPosts'

const TITLE = 'Blog — ROUTEXA'
const DESCRIPTION = 'Practical guides on Nairobi traffic patterns and getting around faster with live routing.'

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

export default function BlogIndex() {
  useDocumentMeta(TITLE, DESCRIPTION)

  return (
    <main className="min-h-screen bg-app-light dark:bg-app-dark text-text-primary-light dark:text-text-primary-dark pt-20 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <Link
          to="/landing"
          className="text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-accent-light dark:hover:text-accent-dark transition-colors"
        >
          ← Back
        </Link>

        <h1 className="text-2xl font-bold mt-4">Blog</h1>
        <p className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
          Practical guides on Nairobi traffic and getting around faster with live routing.
        </p>

        <div className="mt-8 flex flex-col divide-y divide-card-light dark:divide-card-dark border-t border-b border-card-light dark:border-card-dark">
          {BLOG_POSTS.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="py-5 group">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-accent-light dark:text-accent-dark">
                {post.publishedLabel}
              </span>
              <h2 className="text-base font-semibold mt-1 group-hover:text-accent-light dark:group-hover:text-accent-dark transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1 leading-relaxed">
                {post.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
