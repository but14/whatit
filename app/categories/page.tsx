import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function CategoriesPage() {
  const supabase = await createClient();

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
    .eq('translations.language_code', 'vi')
    .order('slug', { ascending: true });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              IT Dictionary
            </Link>
            <nav className="flex space-x-4">
              <Link
                href="/search"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Tìm kiếm
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tất cả Chuyên mục</h1>
          <p className="mt-2 text-sm text-gray-600">
            Khám phá các chuyên mục thuật ngữ CNTT
          </p>
        </div>

        {categories && categories.length > 0 ? (
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
                  <h3 className="text-lg font-semibold text-gray-900">
                    {viName}
                  </h3>
                  {viDescription && (
                    <p className="mt-2 text-sm text-gray-600">{viDescription}</p>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500">Chưa có chuyên mục nào.</p>
          </div>
        )}
      </main>
    </div>
  );
}

