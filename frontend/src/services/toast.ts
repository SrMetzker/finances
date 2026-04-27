import { toast } from 'sonner';

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return fallback;
}

export const notify = {
  success(message: string) {
    toast.success(message);
  },
  warning(message: string) {
    toast.warning(message);
  },
  error(error: unknown, fallback: string) {
    toast.error(getErrorMessage(error, fallback));
  },
};
