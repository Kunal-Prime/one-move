import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useCreateMove, useCompleteMove } from "@/hooks/use-moves";
import { OutputCard } from "@/components/OutputCard";
import type { Move } from "@shared/schema";

export default function Home() {
  const [brainDump, setBrainDump] = useState("");
  const [currentMove, setCurrentMove] = useState<Move | null>(null);
  const [refineInput, setRefineInput] = useState("");
  const [loading, setLoading] = useState(false);

  const createMove = useCreateMove();
  const completeMove = useCompleteMove();

  const handleSubmit = async (refinement: string = "") => {
    const text = refinement ? `${brainDump}\n\nREFINEMENT: ${refinement}` : brainDump;
    if (!text.trim()) return;
    
    setLoading(true);
    try {
      const result = await createMove.mutateAsync({ brainDump: text });
      setCurrentMove(result);
      if (refinement) {
        setRefineInput("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = () => handleSubmit(refineInput);

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
    setRefineInput("");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      <div className="nebula-glow" />
      <div className="planet planet-1" />
      <div className="planet planet-2" />
      <div className="hero-orb" />
      <div className="absolute top-8 left-8 z-20">
        <span className="text-xl font-bold tracking-tighter text-white/50 select-none">OneMove</span>
      </div>
      <AnimatePresence mode="wait">
        {!currentMove ? (
          <motion.div 
            key="input-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[800px] text-center z-10"
          >
            <header className="mb-16">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-indigo-400 font-bold tracking-[0.3em] uppercase text-xs mb-6 opacity-80"
              >
                The Clarity Engine
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-[40px] sm:text-[60px] md:text-[80px] lg:text-[90px] font-black tracking-tighter mb-6 leading-none shimmer-text whitespace-nowrap cursor-default"
              >
                A Space to Breathe
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl text-white/40 font-medium max-w-3xl mx-auto leading-tight"
              >
                Transform your messy thoughts into one concrete move.
              </motion.p>
            </header>

            <main className="w-full space-y-12">
              <div className="relative group glow-hover">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.6rem] blur-xl opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
                <textarea
                  value={brainDump}
                  onChange={(e) => setBrainDump(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (brainDump.trim() && !loading) {
                        handleSubmit();
                      }
                    }
                  }}
                  placeholder="What's weighing on your mind?"
                  className="calm-input relative"
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col items-center gap-8">
                <button
                  onClick={() => handleSubmit()}
                  disabled={!brainDump.trim() || loading}
                  className="btn-primary min-w-[320px] relative overflow-hidden group glow-hover"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                  {loading ? (
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
          <div className="w-full max-w-[800px] flex flex-col items-center gap-8 z-10 py-12">
            <OutputCard 
              key="output-card"
              move={currentMove} 
              onComplete={handleComplete}
              isCompleting={completeMove.isPending}
              onRestart={handleRestart}
            />

            <AnimatePresence>
              {!currentMove.isCompleted && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full space-y-4"
                >
                  <div className="text-center">
                    <span className="text-sm font-bold text-white/40 uppercase tracking-widest">Refine for more clarity</span>
                  </div>
                  <div className="relative group">
                    <textarea
                      value={refineInput}
                      onChange={(e) => setRefineInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (refineInput.trim() && !loading) {
                            handleRefine();
                          }
                        }
                      }}
                      className="w-full h-24 p-6 rounded-3xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-white/20 transition-all resize-none"
                      placeholder="What feels unclear? Refine as much as you need."
                      disabled={loading}
                    />
                  </div>
                  <button
                    onClick={handleRefine}
                    disabled={!refineInput.trim() || loading}
                    className="w-full py-4 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 font-bold transition-all disabled:opacity-50"
                  >
                    {loading ? "Refining..." : "Refine Move"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
