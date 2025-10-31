import { WelcomePage } from '@/components/WelcomePage';
import { PageTransition } from '@/components/PageTransition';

export default function Home() {
  return (
    <PageTransition>
      <WelcomePage />
    </PageTransition>
  );
}
