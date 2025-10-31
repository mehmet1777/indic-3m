import { NextRequest, NextResponse } from 'next/server';
import { signalStorage } from '@/lib/signalStorage';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const signalId = formData.get('signalId') as string;
    const chartImage = formData.get('chartImage') as File;
    const indicatorImage = formData.get('indicatorImage') as File;

    if (!signalId || !chartImage || !indicatorImage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    const folderPath = path.join(process.cwd(), signal.folderPath);
    
    await mkdir(folderPath, { recursive: true });

    const chartBuffer = Buffer.from(await chartImage.arrayBuffer());
    const chartFilename = `chart-${signal.timestamp}.png`;
    const chartPath = path.join(folderPath, chartFilename);
    await writeFile(chartPath, chartBuffer);

    const indicatorBuffer = Buffer.from(await indicatorImage.arrayBuffer());
    const indicatorFilename = `indicator-${signal.timestamp}.png`;
    const indicatorPath = path.join(folderPath, indicatorFilename);
    await writeFile(indicatorPath, indicatorBuffer);

    const dateFolder = new Date(signal.timestamp).toISOString().split('T')[0];
    const signalFolderName = path.basename(signal.folderPath);

    await signalStorage.updateSignalMetadata(signalId, {
      chartImagePath: `/signals/${dateFolder}/${signalFolderName}/${chartFilename}`,
      indicatorImagePath: `/signals/${dateFolder}/${signalFolderName}/${indicatorFilename}`
    });

    console.log(`Screenshots saved for signal ${signalId}`);

    return NextResponse.json(
      { 
        success: true,
        message: 'Screenshots saved successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving signal images:', error);
    return NextResponse.json(
      { error: 'Failed to save images' },
      { status: 500 }
    );
  }
}
