import { Head, Link, usePage } from '@inertiajs/react';

export default function Privacy() {
    const page = usePage<{ name: string }>();

    return (
        <>
            <Head title="Privacy" />
            <div className="min-h-screen bg-background">
                <div className="mx-auto max-w-3xl px-6 py-12">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold">Privacy</h1>
                            <p className="text-sm text-muted-foreground">{page.props.name}</p>
                        </div>
                        <Link href="/" className="text-sm hover:underline">
                            Home
                        </Link>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6">
                        <p className="text-sm text-muted-foreground">
                            Privacy policy is configured per customer deployment of M4 LMS.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
