import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function CategoryDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();
  const language = 'vi';

  // Get category with translations
  const { data: category, error: categoryError } = await supabase
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
    .eq('slug', params.slug)
    .eq('translations.language_code', language)
    .single();

  if (categoryError || !category) {
    notFound();
  }

  const viTranslation = Array.isArray(category.translations)
    ? category.translations.find((t: any) => t.language_code === 'vi')
    : null;

  // Get all terms in this category
  const { data: terms, error: termsError } = await supabase
    .from('term_categories')
    .select(`
      term:terms (
        id,
        slug,
        translations:term_translations!inner (
          language_code,
          title
        )
      )
    `)
    .eq('category_id', category.id)
    .eq('term.translations.language_code', language);

  const termList = terms
    ?.map((tc: any) => tc.term)
    .filter(Boolean)
    .map((term: any) => {
      const viTitle = Array.isArray(term.translations)
        ? term.translations.find((t: any) => t.language_code === 'vi')?.title
        : '';
      return { id: term.id, slug: term.slug, title: viTitle };
    }) || [];

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

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            {viTranslation?.name}
          </h1>
          {viTranslation?.description && (
            <p className="mt-4 text-xl text-gray-600">
              {viTranslation.description}
            </p>
          )}
        </div>

        {termList.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {termList.map((term) => (
              <Link
                key={term.id}
                href={`/terms/${term.slug}`}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {term.title}
                </h3>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500">Chưa có thuật ngữ nào trong chuyên mục này.</p>
          </div>
        )}
      </main>
    </div>
  );
}

