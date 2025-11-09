import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = await createClient();
  const query = searchParams.q || '';
  const language = 'vi';

  let terms: any[] = [];

  if (query) {
    // Search terms by title (using ilike for case-insensitive search)
    const { data, error } = await supabase
      .from('term_translations')
      .select(`
        id,
        title,
        term:terms (
          id,
          slug
        )
      `)
      .eq('language_code', language)
      .ilike('title', `%${query}%`)
      .limit(50);

    if (data) {
      terms = data
        .map((t: any) => ({
          id: t.term.id,
          slug: t.term.slug,
          title: t.title,
        }))
        .filter((t: any) => t.id && t.slug);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              WHATIT
            </Link>
            <nav className="flex space-x-4">
              <Link
                href="/categories"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Chuyên mục
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tìm kiếm</h1>
        </div>

        {/* Search Form */}
        <form action="/search" method="get" className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Tìm kiếm thuật ngữ..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-500"
            >
              Tìm kiếm
            </button>
          </div>
        </form>

        {/* Results */}
        {query && (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Kết quả tìm kiếm cho &quot;{query}&quot;
            </h2>
            {terms.length > 0 ? (
              <div className="space-y-4">
                {terms.map((term) => (
                  <Link
                    key={term.id}
                    href={`/terms/${term.slug}`}
                    className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      {term.title}
                    </h3>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                <p className="text-gray-500">
                  Không tìm thấy kết quả nào cho &quot;{query}&quot;
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

