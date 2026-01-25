import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type MoveInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// ============================================
// MOVES HOOKS
// ============================================

export function useCreateMove() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: MoveInput) => {
      // Validate input before sending
      const validated = api.moves.create.input.parse(data);
      
      const res = await fetch(api.moves.create.path, {
        method: api.moves.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.moves.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error('Failed to process your thoughts');
      }
      
      return api.moves.create.responses[201].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "Couldn't process that",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useCompleteMove() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.moves.complete.path, { id });
      const res = await fetch(url, { 
        method: api.moves.complete.method,
        credentials: "include" 
      });
      
      if (!res.ok) {
        throw new Error('Failed to complete move');
      }
      
      return api.moves.complete.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      toast({
        title: "Well done!",
        description: "Move completed successfully.",
        className: "bg-[#48BB78] text-white border-none",
      });
    },
  });
}
