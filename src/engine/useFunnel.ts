import { create } from 'zustand';
import { useMemo } from 'react';
import type { Flow } from '../schemas';

type FunnelState = {
  currentStepId: string;
  formData: Record<string, unknown>;
  isPopup: boolean;
  goToNext: (action?: 'approve' | 'decline') => void;
  setFormData: (data: Record<string, unknown>) => void;
};

export const useFunnel = (flow: Flow) => {
  const useStore = useMemo(() => create<FunnelState>((set, get) => ({
    currentStepId: flow.steps[0]?.id || '',
    formData: {},
    isPopup: false,
    goToNext: (action = 'approve') => {
      const { currentStepId } = get();
      const currentStep = flow.steps.find(s => s.id === currentStepId);
      if (!currentStep) return;

      let nextId = currentStep.next;
      if (action === 'approve' && currentStep.onApprove) nextId = currentStep.onApprove;
      if (action === 'decline' && currentStep.onDecline) nextId = currentStep.onDecline;

      if (nextId) {
        const nextStep = flow.steps.find(s => s.id === nextId);
        set({ currentStepId: nextId, isPopup: nextStep?.type === 'popup' });
      }
    },
    setFormData: (data) => set((state) => ({
      formData: { ...state.formData, [state.currentStepId]: data }
    })),
  })), [flow]);

  return useStore();
};