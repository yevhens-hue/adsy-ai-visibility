import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const runId = searchParams.get('id');

    if (runId) {
      // Fetch full report data for a specific run
      const { data: run, error: runErr } = await supabase
        .from('check_runs')
        .select('*')
        .eq('id', runId)
        .single();

      if (runErr || !run) {
        return NextResponse.json({ error: 'Run not found' }, { status: 404 });
      }

      const [promptsRes, competitorsRes, sourcesRes, gapsRes, answersRes] = await Promise.all([
        supabase.from('check_prompts').select('*').eq('run_id', runId),
        supabase.from('check_competitors').select('*').eq('run_id', runId),
        supabase.from('check_sources').select('*').eq('run_id', runId),
        supabase.from('check_gaps').select('*').eq('run_id', runId),
        supabase.from('ai_answers').select('*').in('prompt_id', (await supabase.from('check_prompts').select('id').eq('run_id', runId)).data?.map(p => p.id) || []),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          run,
          prompts: promptsRes.data || [],
          competitors: competitorsRes.data || [],
          sources: sourcesRes.data || [],
          gaps: gapsRes.data || [],
          answers: answersRes.data || [],
        },
      });
    }

    // Otherwise list historical runs
    const { data: runs, error } = await supabase
      .from('check_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: runs || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching runs from database';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
