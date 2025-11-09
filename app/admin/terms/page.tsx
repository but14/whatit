import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import DeleteTermButton from './DeleteTermButton';

export default async function TermsPage() {
  const supabase = createAdminClient();

  // Get all terms with Vietnamese translations
  const { data: terms, error } = await supabase
    .from('terms')
    .select(`
      id,
      slug,
      created_at,
      updated_at,
      translations:term_translations!inner (
        id,
        language_code,
        title
      )
    `)
    .eq('translations.language_code', 'vi')
    .order('updated_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching terms:', error);
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Thuật ngữ</h1>
          <p className="mt-2 text-sm text-gray-600">
            Quản lý tất cả các thuật ngữ trong từ điển
          </p>
        </div>
        <Link
          href="/admin/terms/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Thêm thuật ngữ mới
        </Link>
      </div>

      {terms && terms.length > 0 ? (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  Tiêu đề
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Slug
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Cập nhật
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {terms.map((term) => {
                const viTranslation = Array.isArray(term.translations)
                  ? term.translations.find((t: any) => t.language_code === 'vi')
                  : null;

                return (
                  <tr key={term.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {viTranslation?.title || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {term.slug}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {formatDate(term.updated_at)}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link
                        href={`/admin/terms/${term.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Sửa
                      </Link>
                      <span className="mx-2 text-gray-300">|</span>
                      <DeleteTermButton termId={term.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">
            Chưa có thuật ngữ nào.{' '}
            <Link
              href="/admin/terms/new"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Tạo thuật ngữ đầu tiên
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

