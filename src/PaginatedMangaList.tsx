import { useEffect, useState } from 'react';
import Pagination from './Pagination';

interface Manga {
  mal_id: number;
  title: string;
  images: { jpg: { image_url: string } };
}

interface ApiResponse {
  data: Manga[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
  };
}

export default function PaginatedMangaList() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    async function fetchMangas() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.jikan.moe/v4/top/manga?page=${currentPage}&limit=${pageSize}`
        );
        const json: ApiResponse = await res.json();

        setMangas(json.data);
        setTotalPages(json.pagination.last_visible_page);
      } catch (err) {
        console.error('Fetch manga failed:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMangas();
  }, [currentPage, pageSize]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <label htmlFor="pageSize" className="mr-2 font-semibold">
            Items per page:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1); // reset page sur changement taille
            }}
            className="border rounded px-2 py-1"
          >
            {[5, 10, 15, 20, 25].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mangas.map((manga) => (
            <div
              key={manga.mal_id}
              className="bg-white rounded shadow p-4 flex flex-col items-center"
            >
              <img src={manga.images.jpg.image_url} alt={manga.title} className="w-full h-60 object-cover rounded" />
              <h3 className="text-lg font-semibold text-center">{manga.title}</h3>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
