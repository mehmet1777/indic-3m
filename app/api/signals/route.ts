import { NextRequest, NextResponse } from 'next/server';
import { Signal } from '@/types/signal';
import { signalStorage } from '@/lib/signalStorage';
import { signalBroadcaster } from '@/lib/signalBroadcaster';

export interface SignalWebhookPayload {
  symbol: string;
  signalType: 'BUY' | 'SELL' | 'LONG' | 'SHORT' | 'ALERT';
  price: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 100;

function validatePayload(data: any): data is SignalWebhookPayload {
  return (
    typeof data.symbol === 'string' &&
    ['BUY', 'SELL', 'LONG', 'SHORT', 'ALERT'].includes(data.signalType) &&
    typeof data.price === 'number' &&
    typeof data.timestamp === 'number'
  );
}

// Convert incoming BUY/SELL to LONG/SHORT (and fix reversed logic)
function convertSignalType(signalType: 'BUY' | 'SELL' | 'LONG' | 'SHORT' | 'ALERT'): 'LONG' | 'SHORT' | 'ALERT' {
  if (signalType === 'BUY') return 'SHORT'; // BUY was actually SHORT
  if (signalType === 'SELL') return 'LONG'; // SELL was actually LONG
  if (signalType === 'LONG') return 'LONG';
  if (signalType === 'SHORT') return 'SHORT';
  return 'ALERT';
}

function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  const validApiKey = process.env.SIGNAL_API_KEY;
  
  if (!validApiKey) {
    return true;
  }
  
  return apiKey === validApiKey;
}

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientId);
  
  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(clientId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }
  
  if (clientData.count >= MAX_REQUESTS) {
    return false;
  }
  
  clientData.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const clientId = request.headers.get('x-forwarded-for') || 'unknown';
  
  if (!validateApiKey(request)) {
    console.warn(`Unauthorized signal request from ${clientId}`);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  if (!checkRateLimit(clientId)) {
    console.warn(`Rate limit exceeded for ${clientId}`);
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  try {
    const body = await request.json();
    
    if (!validatePayload(body)) {
      return NextResponse.json(
        { error: 'Invalid signal payload' },
        { status: 400 }
      );
    }

    const signal: Signal = {
      id: `signal-${body.timestamp}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: body.timestamp,
      symbol: body.symbol,
      signalType: convertSignalType(body.signalType),
      price: body.price,
      metadata: body.metadata,
      folderPath: ''
    };

    await signalStorage.saveSignal(signal);

    // Broadcast signal to all connected clients
    signalBroadcaster.broadcast(signal);

    console.log(`Signal received: ${signal.id} - ${signal.symbol} ${signal.signalType} at ${signal.price}`);
    console.log(`Broadcasting to ${signalBroadcaster.getListenerCount()} listeners`);

    // Trigger server-side screenshot capture (non-blocking)
    fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/capture-screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signalId: signal.id })
    }).catch(error => {
      console.error('Failed to trigger screenshot:', error);
    });

    return NextResponse.json(
      { 
        success: true, 
        signalId: signal.id,
        message: 'Signal received and saved',
        chartUrl: `/chart/${signal.symbol}?capture=true&signalId=${signal.id}`
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing signal:', error);
    return NextResponse.json(
      { error: 'Failed to process signal' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const signalType = searchParams.get('signalType') as 'LONG' | 'SHORT' | 'ALERT' | null;
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const filter: any = {};
    if (symbol) filter.symbol = symbol;
    if (signalType) filter.signalType = signalType;
    if (dateFrom) filter.dateFrom = parseInt(dateFrom);
    if (dateTo) filter.dateTo = parseInt(dateTo);

    const signals = await signalStorage.filterSignals(filter);

    return NextResponse.json({ signals }, { status: 200 });
  } catch (error) {
    console.error('Error fetching signals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signals' },
      { status: 500 }
    );
  }
}
