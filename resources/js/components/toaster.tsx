import { useEffect, useRef } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { dismissToast, useToasts } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function Toaster() {
    const toasts = useToasts();
    const mounted = useRef(false);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
            {toasts.map((t) => {
                const isDestructive = t.variant === 'destructive';
                const isSuccess = t.variant === 'success';

                return (
                    <div key={t.id} className="pointer-events-auto" onClick={() => dismissToast(t.id)}>
                        <Alert
                            variant={isDestructive ? 'destructive' : 'default'}
                            className={cn('cursor-pointer shadow-md', isSuccess && 'border-green-500/30 bg-green-500/10 text-foreground')}
                        >
                            {isDestructive ? <AlertCircle /> : <CheckCircle2 className={cn(isSuccess ? 'text-green-500' : undefined)} />}
                            {t.title ? <AlertTitle>{t.title}</AlertTitle> : null}
                            {t.description ? <AlertDescription>{t.description}</AlertDescription> : null}
                        </Alert>
                    </div>
                );
            })}
        </div>
    );
}
