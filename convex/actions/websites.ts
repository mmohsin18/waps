// convex/actions/websites.ts
'use node'

import { v } from 'convex/values'
import { action } from '../_generated/server'

/**
 * Node action that fetches a site's homepage HTML
 * and extracts title / description / favicon + a heuristic category.
 * You can later swap this out to call Gemini directly.
 */

function normalizeToHomepage(input: string): {
  canonicalUrl: string
  origin: string
} {
  const u = new URL(input.includes('://') ? input : `https://${input}`)
  const origin = u.hostname.replace(/^www\./, '')
  return { canonicalUrl: `https://${origin}/`, origin }
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

function extractFromHtml(
  html: string,
  baseUrl: string
): {
  title: string | null
  description: string | null
  faviconUrl: string
} {
  const title = html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1]?.trim() ?? null

  const metaDesc =
    html.match(
      /<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i
    )?.[1] ??
    html.match(
      /<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["']/i
    )?.[1] ??
    null

  const iconTag = html.match(
    /<link[^>]+rel=["'](?:shortcut\s+icon|icon|apple-touch-icon)["'][^>]*>/i
  )?.[0]
  const href = iconTag?.match(/href=["']([^"']+)["']/i)?.[1]

  const faviconUrl = href
    ? new URL(href, baseUrl).toString()
    : `https://www.google.com/s2/favicons?sz=64&domain=${new URL(baseUrl).hostname}`

  return { title, description: metaDesc, faviconUrl }
}

function heuristicCategory(title: string, html: string): string {
  const t = (title + ' ' + html.slice(0, 4000)).toLowerCase()
  if (/\bfigma|design|palette|color|font\b/.test(t)) return 'Design'
  if (/\bnotion|todo|task|note|kanban|linear|jira|trello|airtable\b/.test(t))
    return 'Productivity'
  if (/\bvercel|github|deploy|code|api|redis|kafka|infra|devops\b/.test(t))
    return 'Dev & Infra'
  if (/\bread|article|blog|medium|pocket|readwise\b/.test(t)) return 'Reading'
  if (/\bcourse|learn|duolingo|coursera|udemy\b/.test(t)) return 'Education'
  if (/\bmusic|podcast|spotify|audio\b/.test(t)) return 'Music & Audio'
  if (/\bvideo|youtube|stream\b/.test(t)) return 'Video'
  return 'Tools'
}

export const scanWithGemini = action({
  args: { url: v.string() },
  handler: async (_ctx, { url }) => {
    const { canonicalUrl, origin } = normalizeToHomepage(url)

    let html = ''
    try {
      const res = await fetch(canonicalUrl, {
        redirect: 'follow',
        headers: { 'user-agent': 'WapsBot/1.0 (+https://waps.app)' }
      })
      html = await res.text()
    } catch {
      // swallow; fall back to defaults
    }

    const basic = extractFromHtml(html, canonicalUrl)
    const title = basic.title ?? origin
    const description =
      basic.description ??
      `“${title}” is a website you can explore for more details and features.`
    const category = heuristicCategory(title, html)

    return {
      title,
      slug: slugify(title),
      description,
      category,
      faviconUrl: basic.faviconUrl,
      canonicalUrl,
      origin
    }
  }
})
