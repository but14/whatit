import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import EditTermForm from './EditTermForm';

export default async function EditTermPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createAdminClient();
  const termId = parseInt(params.id);

  if (isNaN(termId)) {
    notFound();
  }

  // Get term with translations, categories, and related terms
  const { data: term, error } = await supabase
    .from('terms')
    .select(
      `
      id,
      slug,
      translations:term_translations (
        id,
        language_code,
        title,
        definition
      ),
      categories:term_categories (
        category_id
      ),
      related:related_terms (
        related_term_id
      )
    `
    )
    .eq('id', termId)
    .single();

  if (error || !term) {
    notFound();
  }

  const viTranslation = Array.isArray(term.translations)
    ? term.translations.find((t: any) => t.language_code === 'vi')
    : null;
  const enTranslation = Array.isArray(term.translations)
    ? term.translations.find((t: any) => t.language_code === 'en')
    : null;

  const selectedCategories = Array.isArray(term.categories)
    ? term.categories.map((c: any) => c.category_id)
    : [];
  const relatedTerms = Array.isArray(term.related)
    ? term.related.map((r: any) => r.related_term_id)
    : [];

  return (
    <EditTermForm
      term={{
        id: term.id,
        slug: term.slug,
        viTitle: viTranslation?.title || '',
        viDefinition: viTranslation?.definition
          ? JSON.stringify(viTranslation.definition)
          : '',
        enTitle: enTranslation?.title || '',
        enDefinition: enTranslation?.definition
          ? JSON.stringify(enTranslation.definition)
          : '',
        selectedCategories,
        relatedTerms,
      }}
    />
  );
}

