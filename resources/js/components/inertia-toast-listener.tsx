import { toast } from '@/hooks/use-toast';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef } from 'react';

type Flash = { success?: string | null; error?: string | null };

function firstError(errors?: Record<string, unknown>) {
    if (!errors) {
        return null;
    }

    for (const value of Object.values(errors)) {
        if (typeof value === 'string' && value.trim().length > 0) {
            return value;
        }
    }

    return null;
}

export function InertiaToastListener() {
    const page = usePage<SharedData & { flash?: Flash; errors?: Record<string, unknown> }>();

    const success = page.props.flash?.success ?? null;
    const error = page.props.flash?.error ?? null;

    const validationError = useMemo(() => firstError(page.props.errors), [page.props.errors]);

    const lastRef = useRef<{ success: string | null; error: string | null; validation: string | null }>({
        success: null,
        error: null,
        validation: null,
    });

    useEffect(() => {
        if (success && lastRef.current.success !== success) {
            lastRef.current.success = success;
            toast({
                variant: 'success',
                title: 'Success',
                description: success,
            });
        }
    }, [success]);

    useEffect(() => {
        if (error && lastRef.current.error !== error) {
            lastRef.current.error = error;
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error,
            });
        }
    }, [error]);

    useEffect(() => {
        if (validationError && lastRef.current.validation !== validationError) {
            lastRef.current.validation = validationError;
            toast({
                variant: 'destructive',
                title: 'Validation error',
                description: validationError,
            });
        }
    }, [validationError]);

    return null;
}
