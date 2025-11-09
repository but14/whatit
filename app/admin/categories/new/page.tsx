'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';

export default function NewCategoryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    slug: '',
    viName: '',
    viDescription: '',
    enName: '',
    enDescription: '',
  });

  const handleSlugChange = (value: string) => {
    setFormData((prev) => ({ ...prev, slug: slugify(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create category
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .insert({
          slug: formData.slug || slugify(formData.viName),
        })
        .select()
        .single();

      if (categoryError) throw categoryError;

      // Create Vietnamese translation
      if (formData.viName) {
        const { error: viError } = await supabase
          .from('category_translations')
          .insert({
            category_id: category.id,
            language_code: 'vi',
            name: formData.viName,
            description: formData.viDescription || null,
          });

        if (viError) throw viError;
      }

      // Create English translation
      if (formData.enName) {
        const { error: enError } = await supabase
          .from('category_translations')
          .insert({
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
      setError(err.message || 'Có lỗi xảy ra khi tạo chuyên mục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Thêm chuyên mục mới</h1>
        <p className="mt-2 text-sm text-gray-600">
          Tạo một chuyên mục mới cho từ điển thuật ngữ
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
                placeholder="data-science"
              />
              <p className="mt-1 text-xs text-gray-500">
                Slug sẽ được tự động tạo từ tên tiếng Việt nếu để trống
              </p>
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
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, viName: e.target.value }));
                  if (!formData.slug) {
                    handleSlugChange(e.target.value);
                  }
                }}
                placeholder="Khoa học dữ liệu"
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
                placeholder="Mô tả về chuyên mục này..."
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
                placeholder="Data Science"
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
                placeholder="Description about this category..."
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
            {loading ? 'Đang tạo...' : 'Tạo chuyên mục'}
          </button>
        </div>
      </form>
    </div>
  );
}

