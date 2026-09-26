import { NextRequest, NextResponse } from 'next/server';
import { runRealAIAnalysis } from '@/lib/real-ai';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`pub-${ip}`, { maxRequests: 20, windowSeconds: 60 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please wait a moment before running another analysis.',
          retryAfter: rateCheck.resetInSeconds 
        },
        { 
          status: 429,
          headers: { 'Retry-After': String(rateCheck.resetInSeconds) }
        }
      );
    }

    const body = await req.json();
    const url = body.url || body.domain;

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide a valid website URL or domain' },
        { status: 400 }
      );
    }

    const analysis = await runRealAIAnalysis(url, 'public');

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
