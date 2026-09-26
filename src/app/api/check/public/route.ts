import { NextRequest, NextResponse } from 'next/server';
import { generatePublicAnalysis } from '@/lib/checker';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body.url || body.domain;

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide a valid website URL or domain' },
        { status: 400 }
      );
    }

    const analysis = generatePublicAnalysis(url);

    // If Supabase is connected with real keys, persist run
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      try {
        await supabase.from('check_runs').insert({
          id: analysis.run.id,
          domain: analysis.run.domain,
          brand_name: analysis.run.brand_name,
          mode: 'public',
          status: 'completed',
          visibility_score: analysis.run.visibility_score,
          prompt_coverage: analysis.run.prompt_coverage,
          brand_mention_share: analysis.run.brand_mention_share,
          platforms: analysis.run.platforms,
          prompts_count: analysis.run.prompts_count,
        });
      } catch (dbErr) {
        console.warn('Supabase persistence fallback (proceeding with memory result):', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during analysis';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
