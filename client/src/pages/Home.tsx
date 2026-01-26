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
            <header className="mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-indigo-500 font-semibold tracking-[0.2em] uppercase text-sm mb-4"
              >
                The Clarity Engine
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[48px] sm:text-[84px] font-extrabold text-white tracking-tighter mb-4 leading-none bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-500"
              >
                A Space to Breathe
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl sm:text-2xl text-slate-400 font-medium max-w-2xl mx-auto"
              >
                AI Decision Made Simple. Transform your messy thoughts into one concrete move.
              </motion.p>
            </header>

            {/* Main Input Area */}
            <main className="w-full space-y-8">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.1rem] blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
                <textarea
                  value={brainDump}
                  onChange={(e) => setBrainDump(e.target.value)}
                  placeholder="What's weighing on your mind?"
                  className="calm-input relative"
                  disabled={createMove.isPending}
                />
              </div>

              {/* Controls */}
              <div className="flex flex-col items-center gap-6">
                <button
                  onClick={handleSubmit}
                  disabled={!brainDump.trim() || createMove.isPending}
                  className="btn-primary min-w-[280px] relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                  {createMove.isPending ? (
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Start Creating Clarity"
                  )}
                </button>
              </div>
            </main>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 text-sm animate-bounce"
            >
              <span>Scroll to explore</span>
              <div className="w-px h-8 bg-gradient-to-b from-slate-500 to-transparent"></div>
            </motion.div>
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
