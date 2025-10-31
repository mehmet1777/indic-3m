import { NextRequest, NextResponse } from 'next/server';
import { signalStorage } from '@/lib/signalStorage';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { put } from '@vercel/blob';

export const maxDuration = 60; // 60 seconds timeout for screenshot

export async function POST(request: NextRequest) {
  let browser;
  
  try {
    const { signalId } = await request.json();

    if (!signalId) {
      return NextResponse.json(
        { error: 'Missing signalId' },
        { status: 400 }
      );
    }

    const signal = await signalStorage.getSignal(signalId);
    if (!signal) {
      return NextResponse.json(
        { error: 'Signal not found' },
        { status: 404 }
      );
    }

    console.log(`Starting server-side screenshot for ${signal.symbol}`);

    // Launch headless browser
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to chart page
    const chartUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}/chart/${signal.symbol}`;
    console.log(`Navigating to: ${chartUrl}`);
    
    await page.goto(chartUrl, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Wait for charts to render
    console.log('Waiting for charts to render...');
    await page.waitForSelector('canvas', { timeout: 15000 });
    
    // Extra wait for chart animations
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Find indicator containers
    const indicators = await page.$$('[data-chart-container], .bg-white\\/5');
    
    if (indicators.length < 2) {
      throw new Error('Could not find indicator containers');
    }

    console.log(`Found ${indicators.length} indicators, capturing screenshots...`);

    // Capture first indicator
    const indicator1Screenshot = await indicators[0].screenshot({ type: 'png' });
    const indicator1Blob = await put(
      `signals/${signalId}/chart.png`,
      indicator1Screenshot,
      { access: 'public', addRandomSuffix: false }
    );

    // Capture second indicator
    const indicator2Screenshot = await indicators[1].screenshot({ type: 'png' });
    const indicator2Blob = await put(
      `signals/${signalId}/indicator.png`,
      indicator2Screenshot,
      { access: 'public', addRandomSuffix: false }
    );

    // Update signal with image URLs
    await signalStorage.updateSignalMetadata(signalId, {
      chartImagePath: indicator1Blob.url,
      indicatorImagePath: indicator2Blob.url
    });

    console.log(`✓ Screenshots saved for ${signal.symbol}`);

    return NextResponse.json({
      success: true,
      chartImagePath: indicator1Blob.url,
      indicatorImagePath: indicator2Blob.url
    });

  } catch (error) {
    console.error('Screenshot capture error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to capture screenshot',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
