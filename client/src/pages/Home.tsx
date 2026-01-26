import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useCreateMove, useCompleteMove } from "@/hooks/use-moves";
import { OutputCard } from "@/components/OutputCard";
import type { Move } from "@shared/schema";

export default function Home() {
  const [brainDump, setBrainDump] = useState("");
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

  const handleRestart = () => {
    setBrainDump("");
    setCurrentMove(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <AnimatePresence mode="wait">
        {!currentMove ? (
          <motion.div 
            key="input-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[800px] text-center"
          >
            {/* Header */}
            <header className="mb-12">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[48px] sm:text-[72px] font-extrabold text-white tracking-tighter mb-4 leading-none bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
              >
                Clear the Chaos
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl sm:text-2xl text-slate-400 font-medium"
              >
                Transform your overwhelm into one clear move.
              </motion.p>
            </header>

            {/* Main Input Area */}
            <main className="w-full space-y-8">
              <div className="relative">
                <textarea
                  value={brainDump}
                  onChange={(e) => setBrainDump(e.target.value)}
                  placeholder="What's weighing on your mind?"
                  className="calm-input"
                  disabled={createMove.isPending}
                />
              </div>

              {/* Controls */}
              <div className="flex flex-col items-center gap-6">
                <button
                  onClick={handleSubmit}
                  disabled={!brainDump.trim() || createMove.isPending}
                  className="btn-primary min-w-[280px]"
                >
                  {createMove.isPending ? (
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    "Get Clarity"
                  )}
                </button>
              </div>
            </main>
          </motion.div>
        ) : (
          <OutputCard 
            key="output-card"
            move={currentMove} 
            onComplete={handleComplete}
            isCompleting={completeMove.isPending}
            onRestart={handleRestart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
