'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import RichTextEditor from '@/components/RichTextEditor';

export default function NewTermPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [allTerms, setAllTerms] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    slug: '',
    viTitle: '',
    viDefinition: '',
    enTitle: '',
    enDefinition: '',
    selectedCategories: [] as number[],
    relatedTerms: [] as number[],
  });

  useEffect(() => {
    // Load categories
    const loadCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select(`
          id,
          slug,
          translations:category_translations!inner (
            language_code,
            name
          )
        `)
        .eq('translations.language_code', 'vi');

      if (data) {
        setCategories(data);
      }
    };

    // Load all terms for related terms selection
    const loadTerms = async () => {
      const { data } = await supabase
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
        .limit(100);

      if (data) {
        setAllTerms(data);
      }
    };

    loadCategories();
    loadTerms();
  }, [supabase]);

  const handleSlugChange = (value: string) => {
    setFormData((prev) => ({ ...prev, slug: slugify(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create term
      const { data: term, error: termError } = await supabase
        .from('terms')
        .insert({
          slug: formData.slug || slugify(formData.viTitle),
          author_id: user.id,
        })
        .select()
        .single();

      if (termError) throw termError;

      // Create Vietnamese translation
      if (formData.viTitle) {
        const { error: viError } = await supabase
          .from('term_translations')
          .insert({
            term_id: term.id,
            language_code: 'vi',
            title: formData.viTitle,
            definition: formData.viDefinition
              ? JSON.parse(formData.viDefinition)
              : null,
          });

        if (viError) throw viError;
      }

      // Create English translation
      if (formData.enTitle) {
        const { error: enError } = await supabase
          .from('term_translations')
          .insert({
            term_id: term.id,
            language_code: 'en',
            title: formData.enTitle,
            definition: formData.enDefinition
              ? JSON.parse(formData.enDefinition)
              : null,
          });

        if (enError) throw enError;
      }

      // Link categories
      if (formData.selectedCategories.length > 0) {
        const { error: catError } = await supabase
          .from('term_categories')
          .insert(
            formData.selectedCategories.map((catId) => ({
              term_id: term.id,
              category_id: catId,
            }))
          );

        if (catError) throw catError;
      }

      // Link related terms
      if (formData.relatedTerms.length > 0) {
        const { error: relatedError } = await supabase
          .from('related_terms')
          .insert(
            formData.relatedTerms.map((relatedId) => ({
              term_id: term.id,
              related_term_id: relatedId,
            }))
          );

        if (relatedError) throw relatedError;
      }

      router.push('/admin/terms');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo thuật ngữ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Thêm thuật ngữ mới</h1>
        <p className="mt-2 text-sm text-gray-600">
          Tạo một thuật ngữ mới cho từ điển
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
                placeholder="api"
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
                htmlFor="viTitle"
                className="block text-sm font-medium text-gray-700"
              >
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="viTitle"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.viTitle}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, viTitle: e.target.value }));
                  if (!formData.slug) {
                    handleSlugChange(e.target.value);
                  }
                }}
                placeholder="API (Giao diện Lập trình Ứng dụng)"
              />
            </div>

            <div>
              <label
                htmlFor="viDefinition"
                className="block text-sm font-medium text-gray-700"
              >
                Định nghĩa
              </label>
              <RichTextEditor
                content={formData.viDefinition || ''}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, viDefinition: content }))
                }
                placeholder="Nhập định nghĩa và giải thích về thuật ngữ..."
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
                htmlFor="enTitle"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                type="text"
                id="enTitle"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.enTitle}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, enTitle: e.target.value }))
                }
                placeholder="API (Application Programming Interface)"
              />
            </div>

            <div>
              <label
                htmlFor="enDefinition"
                className="block text-sm font-medium text-gray-700"
              >
                Definition
              </label>
              <RichTextEditor
                content={formData.enDefinition || ''}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, enDefinition: content }))
                }
                placeholder="Enter definition and explanation..."
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Chuyên mục</h2>
          
          <div className="space-y-2">
            {categories.map((category) => {
              const viName = Array.isArray(category.translations)
                ? category.translations.find((t: any) => t.language_code === 'vi')?.name
                : '';
              
              return (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.selectedCategories.includes(category.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData((prev) => ({
                          ...prev,
                          selectedCategories: [...prev.selectedCategories, category.id],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          selectedCategories: prev.selectedCategories.filter(
                            (id) => id !== category.id
                          ),
                        }));
                      }
                    }}
                  />
                  <span className="ml-2 text-sm text-gray-700">{viName}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Thuật ngữ liên quan
          </h2>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {allTerms.map((term) => {
              const viTitle = Array.isArray(term.translations)
                ? term.translations.find((t: any) => t.language_code === 'vi')?.title
                : '';
              
              return (
                <label key={term.id} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.relatedTerms.includes(term.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData((prev) => ({
                          ...prev,
                          relatedTerms: [...prev.relatedTerms, term.id],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          relatedTerms: prev.relatedTerms.filter(
                            (id) => id !== term.id
                          ),
                        }));
                      }
                    }}
                  />
                  <span className="ml-2 text-sm text-gray-700">{viTitle}</span>
                </label>
              );
            })}
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
            {loading ? 'Đang tạo...' : 'Tạo thuật ngữ'}
          </button>
        </div>
      </form>
    </div>
  );
}

