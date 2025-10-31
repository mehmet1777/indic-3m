import { PageTransition } from '@/components/PageTransition';
import ChartViewComponent from '@/components/ChartViewWrapper';

interface ChartPageProps {
  params: Promise<{
    symbol: string;
  }>;
}

export default async function ChartPage({ params }: ChartPageProps) {
  const { symbol } = await params;
  
  return (
    <PageTransition>
      <ChartViewComponent symbol={symbol} />
    </PageTransition>
  );
}
