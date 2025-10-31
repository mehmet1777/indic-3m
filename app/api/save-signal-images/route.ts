import { NextRequest, NextResponse } from 'next/server';
import { signalStorage } from '@/lib/signalStorage';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const signalId = formData.get('signalId') as string;
    const chartImage = formData.get('chartImage') as File;
    const indicatorImage = formData.get('indicatorImage') as File;

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

    let chartImagePath: string | undefined;
    let indicatorImagePath: string | undefined;

    // Upload chart image to Vercel Blob
    if (chartImage) {
      try {
        const blob = await put(`signals/${signalId}/chart.png`, chartImage, {
          access: 'public',
          addRandomSuffix: false,
        });
        chartImagePath = blob.url;
        console.log('Chart image uploaded:', blob.url);
      } catch (error) {
        console.error('Error uploading chart image:', error);
      }
    }

    // Upload indicator image to Vercel Blob
    if (indicatorImage) {
      try {
        const blob = await put(`signals/${signalId}/indicator.png`, indicatorImage, {
          access: 'public',
          addRandomSuffix: false,
        });
        indicatorImagePath = blob.url;
        console.log('Indicator image uploaded:', blob.url);
      } catch (error) {
        console.error('Error uploading indicator image:', error);
      }
    }

    // Update signal metadata with image URLs
    if (chartImagePath || indicatorImagePath) {
      await signalStorage.updateSignalMetadata(signalId, {
        chartImagePath,
        indicatorImagePath
      });
    }

    console.log(`Screenshots saved for signal ${signalId}`);

    return NextResponse.json(
      { 
        success: true,
        message: 'Screenshots saved successfully',
        chartImagePath,
        indicatorImagePath
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving signal images:', error);
    return NextResponse.json(
      { error: 'Failed to save images', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
