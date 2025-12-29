import PublicLayout from '@/layouts/public-layout';
import { usePage } from '@inertiajs/react';

export default function Terms() {
    const page = usePage<{ name: string }>();

    return (
        <PublicLayout title="Terms">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold">Terms</h1>
                <p className="text-sm text-muted-foreground">{page.props.name}</p>
            </div>

            <div className="rounded-xl border border-sidebar-border/70 bg-card p-6">
                <p className="text-sm text-muted-foreground">
                    Terms of service are configured per customer deployment of M4 LMS.
                </p>
            </div>
        </PublicLayout>
    );
}
