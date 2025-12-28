import { Head, Link, usePage } from '@inertiajs/react';

export default function Support() {
    const page = usePage<{ name: string }>();

    return (
        <>
            <Head title="Support" />
            <div className="min-h-screen bg-background">
                <div className="mx-auto max-w-3xl px-6 py-12">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold">Support</h1>
                            <p className="text-sm text-muted-foreground">{page.props.name}</p>
                        </div>
                        <Link href="/" className="text-sm hover:underline">
                            Home
                        </Link>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6">
                        <p className="text-sm text-muted-foreground">
                            This instance of M4 LMS is installed and maintained by M4 Entreprise for its clients.
                            Support details are configured per customer deployment.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
