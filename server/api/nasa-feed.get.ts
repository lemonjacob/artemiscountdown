interface FeedItem {
  title: string
  link: string
  pubDate: string
  description: string
}

export default defineCachedEventHandler(async () => {
  const response = await $fetch<string>('https://www.nasa.gov/blogs/artemis/feed/', {
    responseType: 'text'
  })

  const items: FeedItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(response)) !== null) {
    const block = match[1]
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
      ?? block.match(/<title>(.*?)<\/title>/)?.[1] ?? ''
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] ?? ''
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? ''
    const desc = block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/s)?.[1]
      ?? block.match(/<description>(.*?)<\/description>/s)?.[1] ?? ''
    const cleanDesc = desc.replace(/<[^>]*>/g, '').trim()

    items.push({ title, link, pubDate, description: cleanDesc })
  }

  return items.slice(0, 5)
}, {
  maxAge: 600,
  name: 'nasa-artemis-feed'
})
