import { useEffect, useState } from 'react'

type Manga = {
  mal_id: number
  title: string
  images: { jpg: { image_url: string } }
  url: string
  score: number
}

export default function TopMangaList() {
  const [mangas, setMangas] = useState<Manga[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://api.jikan.moe/v4/top/manga')
      .then((res) => res.json())
      .then((data) => {
        setMangas(data.data.slice(0, 12)) // Top 12 mangas
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <p className="text-center text-lg mt-10">Chargement...</p>
  }

  return (
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
  {mangas.map((manga) => (
    <div key={manga.mal_id} className="bg-white shadow rounded-xl overflow-hidden">
      <img src={manga.images.jpg.image_url} className="w-full h-64 object-cover" />
      <div className="p-4">
        <h2 className="text-lg font-bold truncate">{manga.title}</h2>
        <p className="text-sm text-gray-600">⭐ {manga.score}</p>
      </div>
    </div>
  ))}
</div>

  )
}
