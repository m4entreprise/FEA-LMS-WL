import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import * as adminCertificatesRoutes from '@/routes/admin/certificates';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface Certificate {
    id: number;
    uuid: string;
    certificate_number: string;
    issued_at: string;
    user: { id: number; name: string; email: string };
    course: { id: number; title: string; slug: string };
}

interface Props {
    certificates: Certificate[];
    filters: { q: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Certificates',
        href: adminCertificatesRoutes.index().url,
    },
];

export default function CertificatesIndex({ certificates, filters }: Props) {
    const [q, setQ] = useState(filters.q ?? '');

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            adminCertificatesRoutes.index({ query: { q: q || undefined } }).url,
            {},
            { preserveScroll: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Certificates" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Certificates</h1>
                        <p className="text-sm text-muted-foreground">Browse and verify issued certificates.</p>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search by number, uuid, user, or course…"
                            className="pl-9"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="submit">Search</Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setQ('');
                                router.get(adminCertificatesRoutes.index().url);
                            }}
                        >
                            Reset
                        </Button>
                    </div>
                </form>

                <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3 font-medium">Certificate #</th>
                                <th className="px-6 py-3 font-medium">User</th>
                                <th className="px-6 py-3 font-medium">Course</th>
                                <th className="px-6 py-3 font-medium">Issued</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                            {certificates.map((c) => (
                                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-foreground">{c.certificate_number}</td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        <div className="font-medium text-foreground">{c.user.name}</div>
                                        <div className="text-xs">{c.user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link className="hover:underline" href={`/courses/${c.course.slug}`}>
                                            {c.course.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{new Date(c.issued_at).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button size="sm" variant="ghost" asChild>
                                            <Link href={adminCertificatesRoutes.show(c.id).url}>View</Link>
                                        </Button>
                                        <Button size="sm" variant="ghost" asChild>
                                            <Link href={`/certificates/verify/${c.uuid}`}>Verify</Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {certificates.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                                        No certificates found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
