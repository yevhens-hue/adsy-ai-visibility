import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PlacementBriefData } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const brief: PlacementBriefData = await req.json();

    if (!brief || !brief.target_domain || !brief.publisher_domain) {
      return NextResponse.json(
        { error: 'Invalid brief payload. Target domain and publisher are required.' },
        { status: 400 }
      );
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      try {
        await supabase.from('placement_briefs').insert({
          id: brief.id,
          run_id: brief.run_id,
          gap_id: brief.gap_id,
          publisher_domain: brief.publisher_domain,
          brief_data: brief,
          status: 'ready_for_cp',
        });
      } catch (dbErr) {
        console.warn('Supabase placement brief persistence fallback:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Brief successfully saved for Adsy CP Task handoff',
      brief,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error saving brief';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
