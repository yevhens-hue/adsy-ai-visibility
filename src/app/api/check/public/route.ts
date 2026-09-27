import { NextRequest, NextResponse } from 'next/server';
import { runRealAIAnalysis } from '@/lib/real-ai';
import { checkRateLimit, checkMonthlyQuota, getClientIp } from '@/lib/rate-limiter';
import { PublicCheckSchema } from '@/lib/schemas';

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

    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    if (!rawBody.url && !rawBody.domain) {
      return NextResponse.json(
        { error: 'Please provide a valid website URL or domain' },
        { status: 400 }
      );
    }

    const parseResult = PublicCheckSchema.safeParse({
      url: rawBody.url || rawBody.domain,
      domain: rawBody.domain,
      guestSessionId: rawBody.guestSessionId,
      isGuest: rawBody.isGuest,
    });

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues[0]?.message || 'Please provide a valid website URL or domain';
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      );
    }

    const { url } = parseResult.data;
    const isGuest = parseResult.data.isGuest !== false;
    if (isGuest) {
      const quota = checkMonthlyQuota(`guest-${ip}`, 3);
      if (!quota.allowed) {
        return NextResponse.json(
          { 
            error: 'Monthly quota of 3 free AI Visibility audits exceeded for this billing period. Please sign in to Adsy for unlimited access.',
            remaining: 0,
            quotaExceeded: true 
          },
          { status: 403 }
        );
      }
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
