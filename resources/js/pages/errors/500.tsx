import { Button } from '@/components/ui/button';
import { dashboard, home } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Error500() {
    const { auth } = usePage<SharedData>().props;
    const backHref = auth.user ? dashboard() : home();

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <Head title="500" />
            <div className="w-full max-w-lg space-y-4 rounded-xl border border-sidebar-border/70 bg-card p-6">
                <div className="text-sm text-muted-foreground">500</div>
                <h1 className="text-2xl font-semibold">Something went wrong</h1>
                <p className="text-sm text-muted-foreground">An unexpected error occurred. Please try again.</p>
                <div className="pt-2">
                    <Button asChild>
                        <Link href={backHref}>Go back</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
