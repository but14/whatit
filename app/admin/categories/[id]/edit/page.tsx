import { createAdminClient } from '@/lib/supabase/admin';
import { notFound, redirect } from 'next/navigation';
import EditCategoryForm from './EditCategoryForm';

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createAdminClient();
  const categoryId = parseInt(params.id);

  if (isNaN(categoryId)) {
    notFound();
  }

  // Get category with translations
  const { data: category, error } = await supabase
    .from('categories')
    .select(
      `
      id,
      slug,
      translations:category_translations (
        id,
        language_code,
        name,
        description
      )
    `
    )
    .eq('id', categoryId)
    .single();

  if (error || !category) {
    notFound();
  }

  const viTranslation = category.translations?.find(
    (t: any) => t.language_code === 'vi'
  );
  const enTranslation = category.translations?.find(
    (t: any) => t.language_code === 'en'
  );

  return (
    <EditCategoryForm
      category={{
        id: category.id,
        slug: category.slug,
        viName: viTranslation?.name || '',
        viDescription: viTranslation?.description || '',
        enName: enTranslation?.name || '',
        enDescription: enTranslation?.description || '',
      }}
    />
  );
}

