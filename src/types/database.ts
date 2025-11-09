// Database types for TypeScript
// These types match the Supabase database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: number;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          slug?: string;
          created_at?: string;
        };
      };
      category_translations: {
        Row: {
          id: number;
          category_id: number;
          language_code: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          category_id: number;
          language_code: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          category_id?: number;
          language_code?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      terms: {
        Row: {
          id: number;
          slug: string;
          author_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          slug: string;
          author_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          slug?: string;
          author_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      term_translations: {
        Row: {
          id: number;
          term_id: number;
          language_code: string;
          title: string;
          definition: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          term_id: number;
          language_code: string;
          title: string;
          definition?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          term_id?: number;
          language_code?: string;
          title?: string;
          definition?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      term_categories: {
        Row: {
          term_id: number;
          category_id: number;
          created_at: string;
        };
        Insert: {
          term_id: number;
          category_id: number;
          created_at?: string;
        };
        Update: {
          term_id?: number;
          category_id?: number;
          created_at?: string;
        };
      };
      related_terms: {
        Row: {
          term_id: number;
          related_term_id: number;
          created_at: string;
        };
        Insert: {
          term_id: number;
          related_term_id: number;
          created_at?: string;
        };
        Update: {
          term_id?: number;
          related_term_id?: number;
          created_at?: string;
        };
      };
      term_media: {
        Row: {
          id: number;
          term_id: number;
          media_type: string;
          url: string;
          caption: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          term_id: number;
          media_type: string;
          url: string;
          caption?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          term_id?: number;
          media_type?: string;
          url?: string;
          caption?: string | null;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: number;
          term_id: number;
          user_id: string;
          content: string;
          parent_comment_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          term_id: number;
          user_id: string;
          content: string;
          parent_comment_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          term_id?: number;
          user_id?: string;
          content?: string;
          parent_comment_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_term_favorites: {
        Row: {
          user_id: string;
          term_id: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          term_id: number;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          term_id?: number;
          created_at?: string;
        };
      };
      term_suggestions: {
        Row: {
          id: number;
          term_id: number;
          language_code: string;
          user_id: string | null;
          suggestion_content: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          term_id: number;
          language_code: string;
          user_id?: string | null;
          suggestion_content: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          term_id?: number;
          language_code?: string;
          user_id?: string | null;
          suggestion_content?: string;
          status?: string;
          created_at?: string;
        };
      };
    };
  };
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type CategoryTranslation = Database['public']['Tables']['category_translations']['Row'];
export type Term = Database['public']['Tables']['terms']['Row'];
export type TermTranslation = Database['public']['Tables']['term_translations']['Row'];
export type TermCategory = Database['public']['Tables']['term_categories']['Row'];
export type RelatedTerm = Database['public']['Tables']['related_terms']['Row'];
export type TermMedia = Database['public']['Tables']['term_media']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type UserTermFavorite = Database['public']['Tables']['user_term_favorites']['Row'];
export type TermSuggestion = Database['public']['Tables']['term_suggestions']['Row'];

// Extended types with relations
export type CategoryWithTranslations = Category & {
  translations: CategoryTranslation[];
};

export type TermWithDetails = Term & {
  translations: TermTranslation[];
  categories: CategoryWithTranslations[];
  related_terms: TermWithDetails[];
  media: TermMedia[];
};

export type TermTranslationWithTerm = TermTranslation & {
  term: Term;
};

