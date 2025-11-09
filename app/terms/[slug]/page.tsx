import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import TermRenderer from '@/components/TermRenderer';
import { formatDate } from '@/lib/utils';

export default async function TermDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();
  const language = 'vi'; // Default to Vietnamese, can be made dynamic later

  // Get term with all related data
  const { data: term, error } = await supabase
    .from('terms')
    .select(`
      id,
      slug,
      created_at,
      updated_at,
      translations:term_translations!inner (
        language_code,
        title,
        definition
      ),
      categories:term_categories (
        category:categories (
          id,
          slug,
          translations:category_translations!inner (
            language_code,
            name
          )
        )
      ),
      related:related_terms (
        related_term:terms!related_terms_related_term_id_fkey (
          id,
          slug,
          translations:term_translations!inner (
            language_code,
            title
          )
        )
      )
    `)
    .eq('slug', params.slug)
    .eq('translations.language_code', language)
    .single();

  if (error || !term) {
    notFound();
  }

  const translation = Array.isArray(term.translations)
    ? term.translations.find((t: any) => t.language_code === language)
    : null;

  const categories = Array.isArray(term.categories)
    ? term.categories
        .map((tc: any) => tc.category)
        .filter(Boolean)
        .map((cat: any) => {
          const viName = Array.isArray(cat.translations)
            ? cat.translations.find((t: any) => t.language_code === 'vi')?.name
            : '';
          return { id: cat.id, slug: cat.slug, name: viName };
        })
    : [];

  const relatedTerms = Array.isArray(term.related)
    ? term.related
        .map((rt: any) => rt.related_term)
        .filter(Boolean)
        .map((rt: any) => {
          const viTitle = Array.isArray(rt.translations)
            ? rt.translations.find((t: any) => t.language_code === 'vi')?.title
            : '';
          return { id: rt.id, slug: rt.slug, title: viTitle };
        })
    : [];

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

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <article className="rounded-lg bg-white p-8 shadow-sm">
          {/* Title */}
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            {translation?.title}
          </h1>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 hover:bg-blue-200"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          {/* Definition */}
          <div className="prose max-w-none">
            <TermRenderer content={translation?.definition || null} />
          </div>

          {/* Related Terms */}
          {relatedTerms.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Thuật ngữ liên quan
              </h2>
              <ul className="space-y-2">
                {relatedTerms.map((relatedTerm) => (
                  <li key={relatedTerm.id}>
                    <Link
                      href={`/terms/${relatedTerm.slug}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {relatedTerm.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Metadata */}
          <div className="mt-8 border-t border-gray-200 pt-4 text-sm text-gray-500">
            <p>Cập nhật lần cuối: {formatDate(term.updated_at)}</p>
          </div>
        </article>
      </main>
    </div>
  );
}

