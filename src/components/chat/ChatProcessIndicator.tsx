import type { QueryStreamStage } from "@/types/query";
import { cn } from "@/lib/utils";

export const CHAT_PROCESS_STEPS: { stage: QueryStreamStage; label: string }[] = [
  { stage: "understanding", label: "🔍 Understanding your question..." },
  { stage: "searching", label: "📚 Searching indexed documents..." },
  { stage: "web_searching", label: "🌐 Searching trusted web sources..." },
  { stage: "thinking", label: "💡 Thinking..." },
  { stage: "writing", label: "✍️ Writing response..." },
  { stage: "done", label: "✓ Done" },
];

type Props = {
  currentStage?: QueryStreamStage | null;
};

export function ChatProcessIndicator({ currentStage = "understanding" }: Props) {
  const active =
    CHAT_PROCESS_STEPS.find((s) => s.stage === (currentStage ?? "understanding")) ??
    CHAT_PROCESS_STEPS[0];

  return (
    <div className="py-0.5 text-[13px] leading-relaxed text-foreground">
      <span className={cn("animate-pulse")}>{active.label}</span>
    </div>
  );
}
