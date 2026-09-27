import { NextRequest, NextResponse } from 'next/server';
import { runRealAIAnalysis } from '@/lib/real-ai';
import { checkRateLimit, checkMonthlyQuota, getClientIp } from '@/lib/rate-limiter';
import { FullCheckSchema } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`full-${ip}`, { maxRequests: 10, windowSeconds: 60 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please wait a moment before running another full analysis.',
          retryAfter: rateCheck.resetInSeconds 
        },
        { 
          status: 429,
          headers: { 'Retry-After': String(rateCheck.resetInSeconds) }
        }
      );
    }

    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const parseResult = FullCheckSchema.safeParse({
      url: rawBody.url || rawBody.domain,
      domain: rawBody.domain,
      guestSessionId: rawBody.guestSessionId,
      isGuest: rawBody.isGuest,
      mode: rawBody.mode,
      customPrompts: rawBody.customPrompts,
      customCompetitors: rawBody.customCompetitors,
    });

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues[0]?.message || 'Please provide a valid website URL or domain';
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      );
    }

    const { url, customPrompts, customCompetitors } = parseResult.data;
    const isGuest = Boolean(parseResult.data.isGuest || rawBody.mode === 'guest');
    if (isGuest) {
      const quota = checkMonthlyQuota(`guest-${ip}`, 3);
      if (!quota.allowed) {
        return NextResponse.json(
          { 
            error: 'Monthly quota of 3 free AI Visibility audits exceeded for this billing period. Please register or sign in to your Adsy account for unlimited access.',
            remaining: 0,
            quotaExceeded: true 
          },
          { status: 403 }
        );
      }
    }

    const report = await runRealAIAnalysis(
      url,
      'full',
      customPrompts,
      customCompetitors
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
