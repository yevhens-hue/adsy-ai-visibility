import { NextRequest, NextResponse } from 'next/server';
import { generateFullAnalysis } from '@/lib/checker';
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

    const report = generateFullAnalysis(
      url,
      body.customPrompts,
      body.customCompetitors
    );

    // Persist full run to Supabase if credentials are valid
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      try {
        // 1. Run record
        await supabase.from('check_runs').insert({
          id: report.run.id,
          domain: report.run.domain,
          brand_name: report.run.brand_name,
          mode: 'full',
          status: 'completed',
          visibility_score: report.run.visibility_score,
          prompt_coverage: report.run.prompt_coverage,
          brand_mention_share: report.run.brand_mention_share,
          platforms: report.run.platforms,
          prompts_count: report.run.prompts_count,
        });

        // 2. Prompts
        const promptsInsert = report.prompts.map(p => ({
          id: p.id,
          run_id: p.run_id,
          text: p.text,
          topic: p.topic,
          prompt_type: p.prompt_type,
          is_custom: p.is_custom,
          has_brand_mention: p.has_brand_mention,
        }));
        await supabase.from('check_prompts').insert(promptsInsert);

        // 3. Competitors
        const competitorsInsert = report.competitors.map(c => ({
          id: c.id,
          run_id: c.run_id,
          name: c.name,
          domain: c.domain,
          visibility_score: c.visibility_score,
          prompt_coverage: c.prompt_coverage,
          mentions_count: c.mentions_count,
        }));
        await supabase.from('check_competitors').insert(competitorsInsert);

        // 4. Sources
        const sourcesInsert = report.sources.map(s => ({
          id: s.id,
          run_id: s.run_id,
          url: s.url,
          domain: s.domain,
          frequency: s.frequency,
          is_in_adsy_catalog: s.is_in_adsy_catalog,
          adsy_publisher_id: s.adsy_publisher_id,
          adsy_price: s.adsy_price,
        }));
        await supabase.from('check_sources').insert(sourcesInsert);

        // 5. Gaps
        const gapsInsert = report.gaps.map(g => ({
          id: g.id,
          run_id: g.run_id,
          topic: g.topic,
          gap_type: g.gap_type,
          priority: g.priority,
          rationale: g.rationale,
          prompts_list: g.prompts_list,
        }));
        await supabase.from('check_gaps').insert(gapsInsert);
      } catch (dbErr) {
        console.warn('Supabase full persistence fallback:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during full analysis';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
