"use client";
"use client";
import { AITeacherPage } from '@/components/screens/AITeacherPage';
import { useRouter } from 'next/navigation';
import { ScreenId } from '@/types';

export default function AiTeacherPage() {
  const router = useRouter();
  const navigate = (screen: ScreenId) => router.push(`/${screen}`);
  return <AITeacherPage onNavigate={navigate} />;
}
