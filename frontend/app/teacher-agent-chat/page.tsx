"use client";
"use client";

import { TeacherAgentChatScreen } from "@/components/screens/TeacherAgentChatScreen";
import { useRouter } from "next/navigation";
import { ScreenId } from "@/types";

export default function TeacherAgentChatPage() {
  const router = useRouter();
  const navigate = (screen: ScreenId) => router.push(`/${screen}`);
  return <TeacherAgentChatScreen onNavigate={navigate} />;
}

