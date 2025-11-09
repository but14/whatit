import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();

  // Get recent terms
  const { data: recentTerms } = await supabase
    .from('terms')
    .select(`
      id,
      slug,
      translations:term_translations!inner (
        language_code,
        title
      )
    `)
    .eq('translations.language_code', 'vi')
    .order('updated_at', { ascending: false })
    .limit(10);

  // Get all categories
  const { data: categories } = await supabase
    .from('categories')
    .select(`
      id,
      slug,
      translations:category_translations!inner (
        language_code,
        name,
        description
      )
    `)
    .eq('translations.language_code', 'vi');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                IT Dictionary
              </h1>
            </div>
            <nav className="flex space-x-4">
              <Link
                href="/search"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Tìm kiếm
              </Link>
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

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Từ điển Thuật ngữ CNTT
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Tra cứu và tìm hiểu các thuật ngữ công nghệ thông tin bằng tiếng Việt
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <form action="/search" method="get" className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                name="q"
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
        </div>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <div className="mb-12">
            <h3 className="mb-6 text-2xl font-bold text-gray-900">
              Chuyên mục
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const viName = Array.isArray(category.translations)
                  ? category.translations.find((t: any) => t.language_code === 'vi')?.name
                  : '';
                const viDescription = Array.isArray(category.translations)
                  ? category.translations.find((t: any) => t.language_code === 'vi')?.description
                  : '';

                return (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <h4 className="text-lg font-semibold text-gray-900">
                      {viName}
                    </h4>
                    {viDescription && (
                      <p className="mt-2 text-sm text-gray-600">{viDescription}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Terms */}
        {recentTerms && recentTerms.length > 0 && (
          <div>
            <h3 className="mb-6 text-2xl font-bold text-gray-900">
              Thuật ngữ mới cập nhật
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentTerms.map((term) => {
                const viTitle = Array.isArray(term.translations)
                  ? term.translations.find((t: any) => t.language_code === 'vi')?.title
                  : '';

                return (
                  <Link
                    key={term.id}
                    href={`/terms/${term.slug}`}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <h4 className="text-lg font-semibold text-gray-900">
                      {viTitle}
                    </h4>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
