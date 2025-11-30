import { useState } from "react";

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  description: string;
  actionLabel?: string;
  isDestructive?: boolean;
  onConfirm?: () => void | Promise<void>;
}

export function useConfirmation() {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    title: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const confirm = async (config: Omit<ConfirmationState, "isOpen">) => {
    setState({ ...config, isOpen: true });
    return new Promise<boolean>((resolve) => {
      const originalOnConfirm = config.onConfirm;
      config.onConfirm = async () => {
        setIsLoading(true);
        try {
          if (originalOnConfirm) {
            await originalOnConfirm();
          }
          resolve(true);
        } finally {
          setIsLoading(false);
          setState((s) => ({ ...s, isOpen: false }));
        }
      };
    });
  };

  const cancel = () => {
    setState((s) => ({ ...s, isOpen: false }));
  };

  return { state, isLoading, confirm, cancel };
}
