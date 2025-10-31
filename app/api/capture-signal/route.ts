import { NextRequest, NextResponse } from 'next/server';
import { signalStorage } from '@/lib/signalStorage';
import puppeteer from 'puppeteer';
import path from 'path';
import { writeFile } from 'fs/promises';

export async function POST(request: NextRequest) {
    try {
        const { signalId } = await request.json();

        if (!signalId) {
            return NextResponse.json(
                { error: 'Signal ID required' },
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

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        const chartUrl = `http://localhost:3000/chart/${signal.symbol}`;
        await page.goto(chartUrl, { waitUntil: 'networkidle0' });

        await page.waitForTimeout(3000);

        const chartElement = await page.$('[data-chart-container]');
        const indicatorElement = await page.$('[data-indicator-container]');

        const folderPath = path.join(process.cwd(), signal.folderPath);

        if (chartElement) {
            const chartScreenshot = await chartElement.screenshot({ type: 'png' });
            const chartPath = path.join(folderPath, `chart-${signal.timestamp}.png`);
            await writeFile(chartPath, chartScreenshot);

            await signalStorage.updateSignalMetadata(signalId, {
                chartImagePath: `/signals/${path.basename(path.dirname(signal.folderPath))}/${path.basename(signal.folderPath)}/chart-${signal.timestamp}.png`
            });
        }

        if (indicatorElement) {
            const indicatorScreenshot = await indicatorElement.screenshot({ type: 'png' });
            const indicatorPath = path.join(folderPath, `indicator-${signal.timestamp}.png`);
            await writeFile(indicatorPath, indicatorScreenshot);

            await signalStorage.updateSignalMetadata(signalId, {
                indicatorImagePath: `/signals/${path.basename(path.dirname(signal.folderPath))}/${path.basename(signal.folderPath)}/indicator-${signal.timestamp}.png`
            });
        }

        await browser.close();

        return NextResponse.json(
            {
                success: true,
                message: 'Screenshots captured successfully'
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error capturing screenshots:', error);
        return NextResponse.json(
            { error: 'Failed to capture screenshots' },
            { status: 500 }
        );
    }
}
