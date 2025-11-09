'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';

interface CategoryFormData {
  id: number;
  slug: string;
  viName: string;
  viDescription: string;
  enName: string;
  enDescription: string;
}

export default function EditCategoryForm({
  category,
}: {
  category: CategoryFormData;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    slug: category.slug,
    viName: category.viName,
    viDescription: category.viDescription,
    enName: category.enName,
    enDescription: category.enDescription,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Update category slug
      const { error: categoryError } = await supabase
        .from('categories')
        .update({ slug: formData.slug || slugify(formData.viName) })
        .eq('id', category.id);

      if (categoryError) throw categoryError;

      // Update or create Vietnamese translation
      if (formData.viName) {
        const { error: viError } = await supabase
          .from('category_translations')
          .upsert({
            category_id: category.id,
            language_code: 'vi',
            name: formData.viName,
            description: formData.viDescription || null,
          });

        if (viError) throw viError;
      }

      // Update or create English translation
      if (formData.enName) {
        const { error: enError } = await supabase
          .from('category_translations')
          .upsert({
            category_id: category.id,
            language_code: 'en',
            name: formData.enName,
            description: formData.enDescription || null,
          });

        if (enError) throw enError;
      }

      router.push('/admin/categories');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi cập nhật chuyên mục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sửa chuyên mục</h1>
        <p className="mt-2 text-sm text-gray-600">
          Chỉnh sửa thông tin chuyên mục
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Thông tin cơ bản</h2>
          
          <div className="space-y-4">
            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700"
              >
                Slug (URL) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="slug"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Nội dung tiếng Việt
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="viName"
                className="block text-sm font-medium text-gray-700"
              >
                Tên chuyên mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="viName"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.viName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, viName: e.target.value }))
                }
              />
            </div>

            <div>
              <label
                htmlFor="viDescription"
                className="block text-sm font-medium text-gray-700"
              >
                Mô tả
              </label>
              <textarea
                id="viDescription"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.viDescription}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, viDescription: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Nội dung tiếng Anh
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="enName"
                className="block text-sm font-medium text-gray-700"
              >
                Category Name
              </label>
              <input
                type="text"
                id="enName"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.enName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, enName: e.target.value }))
                }
              />
            </div>

            <div>
              <label
                htmlFor="enDescription"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="enDescription"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.enDescription}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, enDescription: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật'}
          </button>
        </div>
      </form>
    </div>
  );
}

