import { Sparkles } from "lucide-react";

interface FloatingAIButtonProps {
  onClick: () => void;
}

export default function FloatingAIButton({ onClick }: FloatingAIButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-surface hover:bg-surface-muted border border-border hover:border-accent-purple text-text-primary rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 z-30"
    >
      <Sparkles className="w-6 h-6 text-accent-purple" />
    </button>
  );
}
