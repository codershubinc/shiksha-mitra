"use client";

import { ExamModeScreen } from '@/components/screens/ExamModeScreen';
import { useRouter } from 'next/navigation';

export default function ExamPage() {
  const router = useRouter();

  const handleNavigate = (screen: string) => {
    if (screen === 'dashboard') {
      router.push('/');
    } else if (screen === 'post-scan-growth') {
      router.push('/post-scan-growth');
    } else {
      router.push(`/${screen}`);
    }
  };

  return <ExamModeScreen onNavigate={handleNavigate} />;
}
