import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const termId = parseInt(params.id);

    if (isNaN(termId)) {
      return NextResponse.json(
        { error: 'Invalid term ID' },
        { status: 400 }
      );
    }

    // Delete term (cascade will delete translations, categories, related terms, etc.)
    const { error } = await supabase
      .from('terms')
      .delete()
      .eq('id', termId);

    if (error) {
      console.error('Error deleting term:', error);
      return NextResponse.json(
        { error: 'Failed to delete term' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delete route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

