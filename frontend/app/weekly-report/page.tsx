"use client";
"use client";

import { WeeklyReportScreen } from "@/components/screens/WeeklyReportScreen";
import { useRouter } from "next/navigation";
import { ScreenId } from "@/types";

export default function WeeklyReportPage() {
  const router = useRouter();
  const navigate = (screen: ScreenId) => router.push(`/${screen}`);
  return <WeeklyReportScreen onNavigate={navigate} />;
}
