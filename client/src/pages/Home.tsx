import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useCreateMove, useCompleteMove } from "@/hooks/use-moves";
import { OutputCard } from "@/components/OutputCard";
import type { Move } from "@shared/schema";

export default function Home() {
  const [brainDump, setBrainDump] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [currentMove, setCurrentMove] = useState<Move | null>(null);

  const createMove = useCreateMove();
  const completeMove = useCompleteMove();

  const handleSubmit = async () => {
    if (!brainDump.trim()) return;
    
    // Reset view if submitting again
    setCurrentMove(null);
    
    try {
      const result = await createMove.mutateAsync({ brainDump });
      setCurrentMove(result);
    } catch (error) {
      // Error handled by hook toast
      console.error(error);
    }
  };

  const handleComplete = async () => {
    if (!currentMove) return;
    try {
      await completeMove.mutateAsync(currentMove.id);
      setCurrentMove(prev => prev ? { ...prev, isCompleted: true } : null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[680px]"
      >
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-[32px] sm:text-[40px] font-semibold text-foreground tracking-tight mb-2">
            OneMove
          </h1>
          <p className="text-lg text-secondary">
            Stop thinking. Start moving.
          </p>
        </header>

        {/* Main Input Area */}
        <main className="w-full">
          <div className="relative">
            <textarea
              value={brainDump}
              onChange={(e) => setBrainDump(e.target.value)}
              placeholder="I have three assignments due and I don't know where to start..."
              className="calm-input"
              disabled={createMove.isPending}
            />
            {/* Character Count (Optional detail) */}
            {brainDump.length > 50 && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-4 right-4 text-xs text-muted-foreground font-medium pointer-events-none"
              >
                {brainDump.length} characters
              </motion.span>
            )}
          </div>

          {/* Controls */}
          <div className="mt-4 flex flex-col items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer group select-none">
              <div className={`w-5 h-5 border-2 rounded transition-colors duration-200 flex items-center justify-center
                ${isPrivate ? 'bg-primary border-primary' : 'border-[#CBD5E0] group-hover:border-[#2D3748]'}`}>
                {isPrivate && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              <span className="text-sm text-secondary group-hover:text-foreground transition-colors">
                Remember this session (OneMove learns you)
              </span>
            </label>

            <button
              onClick={handleSubmit}
              disabled={!brainDump.trim() || createMove.isPending}
              className="btn-primary min-w-[200px] flex items-center justify-center gap-2"
            >
              {createMove.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Get Clarity"
              )}
            </button>
          </div>
        </main>
      </motion.div>

      {/* Output Section */}
      <AnimatePresence>
        {currentMove && (
          <OutputCard 
            move={currentMove} 
            onComplete={handleComplete}
            isCompleting={completeMove.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
