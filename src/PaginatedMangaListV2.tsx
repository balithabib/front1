import  { useEffect, useState } from 'react';

interface Manga {
  mal_id: number;
  title: string;
  images: { jpg: { image_url: string } };
}


const PaginatedMangaList: React.FC = () => {
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(5);

  useEffect(() => {
    fetch(`https://api.jikan.moe/v4/manga?page=${page}&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        setMangaList(data.data);
        setTotalPages(data.pagination.last_visible_page);
      });
  }, [page, limit]);

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setPage(1); // reset to first page
  };

  const Pagination = () => (
    <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
      <div className="flex items-center gap-2">
        <span>Page:</span>
        {[...Array(Math.min(totalPages, 5)).keys()].map((i) => {
          const p = i + Math.max(1, page - 2);
          if (p > totalPages) return null;
          return (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded-md ${
                p === page ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {p}
            </button>
          );
        })}
        {page < totalPages - 2 && <span>...</span>}
        {page < totalPages && (
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded-md bg-gray-200"
          >
            &gt;
          </button>
        )}
      </div>
      <div>
        <label className="mr-2">Items per page:</label>
        <select value={limit} onChange={handleLimitChange} className="border px-2 py-1 rounded">
          {[5, 10, 15, 20, 25].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-4">Top Manga</h1>
      <Pagination />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mangaList.map((manga) => (
          <div key={manga.mal_id} className="bg-white p-4 shadow rounded">
            <img src={manga.images.jpg.image_url} alt={manga.title} className="w-full h-60 object-cover rounded" />
            <h2 className="mt-2 text-lg font-semibold">{manga.title}</h2>
          </div>
        ))}
      </div>
      <Pagination />
    </div>
  );
};

export default PaginatedMangaList;
