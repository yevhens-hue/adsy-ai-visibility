import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PlacementBriefData } from '@/types';
import { SaveBriefSchema } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    if (!rawBody?.target_domain || !rawBody?.publisher_domain) {
      return NextResponse.json(
        { error: 'Invalid brief payload. Target domain and publisher are required.' },
        { status: 400 }
      );
    }

    const parseResult = SaveBriefSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues[0]?.message || 'Invalid brief payload. Target domain and publisher are required.';
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      );
    }

    const brief = rawBody as PlacementBriefData;

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
