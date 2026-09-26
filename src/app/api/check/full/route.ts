import { NextRequest, NextResponse } from 'next/server';
import { runRealAIAnalysis } from '@/lib/real-ai';

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

    const report = await runRealAIAnalysis(
      url,
      'full',
      body.customPrompts,
      body.customCompetitors
    );

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
