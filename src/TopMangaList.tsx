import { useEffect, useState } from 'react'

type Manga = {
  title: string
  images: {
    jpg: {
      image_url: string
    }
  }
  url: string
  score: number
}

export default function TopMangaList() {
  const [mangas, setMangas] = useState<Manga[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://api.jikan.moe/v4/top/manga')
      .then(res => res.json())
      .then(data => {
        setMangas(data.data.slice(0, 10))
        setLoading(false)
      })
  }, [])

  if (loading) return <p className="text-center text-gray-500">Chargement...</p>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {mangas.map((manga) => (
        <a
          key={manga.title}
          href={manga.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
        >
          <img src={manga.images.jpg.image_url} alt={manga.title} className="w-full h-60 object-cover" />
          <div className="p-4">
            <h2 className="text-lg font-semibold">{manga.title}</h2>
            <p className="text-sm text-gray-500">Score : {manga.score}</p>
          </div>
        </a>
      ))}
    </div>
  )
}
