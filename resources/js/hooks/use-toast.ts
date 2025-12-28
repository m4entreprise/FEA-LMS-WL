import { useSyncExternalStore } from 'react';

export type ToastVariant = 'default' | 'success' | 'destructive';

export interface Toast {
    id: string;
    title?: string;
    description?: string;
    variant?: ToastVariant;
    duration?: number;
}

export type ToastInput = Omit<Toast, 'id'> & { id?: string };

type Listener = () => void;

const listeners = new Set<Listener>();
let toasts: Toast[] = [];

function emit() {
    for (const listener of listeners) {
        listener();
    }
}

function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function getSnapshot() {
    return toasts;
}

function generateId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function dismissToast(id: string) {
    const next = toasts.filter((t) => t.id !== id);
    if (next.length === toasts.length) {
        return;
    }

    toasts = next;
    emit();
}

export function toast(input: ToastInput) {
    const id = input.id ?? generateId();
    const duration = input.duration ?? 4000;

    const nextToast: Toast = {
        id,
        title: input.title,
        description: input.description,
        variant: input.variant ?? 'default',
        duration,
    };

    toasts = [nextToast, ...toasts].slice(0, 5);
    emit();

    if (duration > 0 && typeof window !== 'undefined') {
        window.setTimeout(() => dismissToast(id), duration);
    }

    return {
        id,
        dismiss: () => dismissToast(id),
    };
}

export function useToasts() {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
