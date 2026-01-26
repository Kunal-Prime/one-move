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
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      <div className="hero-orb" />
      <div className="absolute top-8 left-8 z-20">
        <span className="text-xl font-bold tracking-tighter text-white/50 select-none">OneMove</span>
      </div>
      <AnimatePresence mode="wait">
        {!currentMove ? (
          <motion.div 
            key="input-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[800px] text-center z-10"
          >
            {/* Header */}
            <header className="mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-indigo-400 font-bold tracking-[0.3em] uppercase text-xs mb-6 opacity-80"
              >
                The Clarity Engine
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[64px] sm:text-[100px] font-black tracking-tighter mb-6 leading-[0.9] shimmer-text"
              >
                A Space to Breathe
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl sm:text-3xl text-white/40 font-medium max-w-3xl mx-auto leading-tight"
              >
                Transform your messy thoughts into one concrete move.
              </motion.p>
            </header>

            {/* Main Input Area */}
            <main className="w-full space-y-12">
              <div className="relative group glow-hover">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.6rem] blur-xl opacity-0 group-focus-within:opacity-20 transition duration-1000"></div>
                <textarea
                  value={brainDump}
                  onChange={(e) => setBrainDump(e.target.value)}
                  placeholder="What's weighing on your mind?"
                  className="calm-input relative"
                  disabled={createMove.isPending}
                />
              </div>

              {/* Controls */}
              <div className="flex flex-col items-center gap-8">
                <button
                  onClick={handleSubmit}
                  disabled={!brainDump.trim() || createMove.isPending}
                  className="btn-primary min-w-[320px] relative overflow-hidden group glow-hover"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                  {createMove.isPending ? (
                    <div className="flex items-center justify-center gap-4">
                      <Loader2 className="w-7 h-7 animate-spin" />
                      <span>Distilling...</span>
                    </div>
                  ) : (
                    "Create Clarity"
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
