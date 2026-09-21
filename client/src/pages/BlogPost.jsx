import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPostBySlug } from '../lib/blogPosts'

function useDocumentMeta(title, description) {
  useEffect(() => {
    if (!title) return
    const prevTitle = document.title
    const tag = document.querySelector('meta[name="description"]')
    const prevDescription = tag?.getAttribute('content')

    document.title = title
    if (description) tag?.setAttribute('content', description)

    return () => {
      document.title = prevTitle
      if (prevDescription != null) tag?.setAttribute('content', prevDescription)
    }
  }, [title, description])
}

export default function BlogPost() {
  const { slug } = useParams()
  const post = getPostBySlug(slug)

  useDocumentMeta(post ? `${post.title} — ROUTEXA` : 'Post not found — ROUTEXA', post?.description)

  if (!post) {
    return (
      <main className="min-h-screen bg-app-light dark:bg-app-dark text-text-primary-light dark:text-text-primary-dark pt-24 pb-16 px-4">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">This post doesn't exist.</p>
          <Link to="/blog" className="inline-block mt-3 text-sm text-accent-light dark:text-accent-dark hover:underline">
            ← Back to blog
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-app-light dark:bg-app-dark text-text-primary-light dark:text-text-primary-dark pt-20 pb-16 px-4">
      <article className="max-w-xl mx-auto">
        <Link
          to="/blog"
          className="text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-accent-light dark:hover:text-accent-dark transition-colors"
        >
          ← Back to blog
        </Link>

        <span className="block text-[11px] font-semibold uppercase tracking-wide text-accent-light dark:text-accent-dark mt-4">
          {post.publishedLabel}
        </span>
        <h1 className="text-2xl font-bold mt-2 leading-tight">{post.title}</h1>

        <div className="mt-6 space-y-6">
          {post.body.map((block) => (
            <section key={block.heading}>
              <h2 className="text-base font-semibold mb-2">{block.heading}</h2>
              <div className="text-sm leading-relaxed text-text-secondary-light dark:text-text-secondary-dark space-y-3">
                {block.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-card-light dark:border-card-dark">
          <Link
            to="/"
            className="inline-flex items-center justify-center h-10 px-5 rounded-lg text-sm font-semibold bg-accent-light dark:bg-accent-dark text-white hover:brightness-110 transition"
          >
            Open the map
          </Link>
        </div>
      </article>
    </main>
  )
}
