import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import DeleteCategoryButton from '../DeleteCategoryButton';

export default async function CategoriesPage() {
  const supabase = createAdminClient();

  // Get all categories with translations
  const { data: categories, error } = await supabase
    .from('categories')
    .select(`
      id,
      slug,
      created_at,
      translations:category_translations (
        id,
        language_code,
        name,
        description
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching categories:', error);
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Chuyên mục</h1>
          <p className="mt-2 text-sm text-gray-600">
            Quản lý các chuyên mục thuật ngữ (AI, Data, Security...)
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Thêm chuyên mục mới
        </Link>
      </div>

      {categories && categories.length > 0 ? (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  Tên (Tiếng Việt)
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Tên (Tiếng Anh)
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
                  Ngày tạo
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {categories.map((category) => {
                const viTranslation = category.translations?.find(
                  (t: any) => t.language_code === 'vi'
                );
                const enTranslation = category.translations?.find(
                  (t: any) => t.language_code === 'en'
                );

                return (
                  <tr key={category.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {viTranslation?.name || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {enTranslation?.name || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {category.slug}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {formatDate(category.created_at)}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link
                        href={`/admin/categories/${category.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Sửa
                      </Link>
                      <span className="mx-2 text-gray-300">|</span>
                      <DeleteCategoryButton categoryId={category.id} />
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
            Chưa có chuyên mục nào.{' '}
            <Link
              href="/admin/categories/new"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Tạo chuyên mục đầu tiên
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

