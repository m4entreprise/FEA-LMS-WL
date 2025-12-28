import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import * as adminCertificatesRoutes from '@/routes/admin/certificates';
import * as adminUsersRoutes from '@/routes/admin/users';
import * as certificatesRoutes from '@/routes/certificates';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface Certificate {
    id: number;
    uuid: string;
    certificate_number: string;
    issued_at: string;
    user: { id: number; name: string; email: string };
    course: { id: number; title: string; slug: string };
}

interface Props {
    certificate: Certificate;
}

export default function AdminCertificateShow({ certificate }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Certificates',
            href: adminCertificatesRoutes.index().url,
        },
        {
            title: certificate.certificate_number,
            href: window.location.href,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Certificate - ${certificate.certificate_number}`} />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Certificate</h1>
                        <p className="text-sm text-muted-foreground">Admin view of an issued certificate.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" asChild>
                            <a href={certificatesRoutes.verify(certificate.uuid).url} target="_blank" rel="noreferrer">
                                Verify
                            </a>
                        </Button>
                        <Button variant="secondary" asChild>
                            <a href={certificatesRoutes.download(certificate.course.slug).url}>Download PDF</a>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Certificate Details</CardTitle>
                            <CardDescription>Identifiers and issuance information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center justify-between gap-4 border-b py-2">
                                <span className="text-muted-foreground">Certificate #</span>
                                <span className="font-mono">{certificate.certificate_number}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-b py-2">
                                <span className="text-muted-foreground">Verification ID</span>
                                <span className="font-mono">{certificate.uuid}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 py-2">
                                <span className="text-muted-foreground">Issued at</span>
                                <span>{new Date(certificate.issued_at).toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>User</CardTitle>
                            <CardDescription>Recipient of the certificate.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center justify-between gap-4 border-b py-2">
                                <span className="text-muted-foreground">Name</span>
                                <span className="font-medium">{certificate.user.name}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-b py-2">
                                <span className="text-muted-foreground">Email</span>
                                <span className="text-muted-foreground">{certificate.user.email}</span>
                            </div>
                            <div className="pt-2">
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={adminUsersRoutes.show(certificate.user.id).url}>View user</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Course</CardTitle>
                            <CardDescription>Course associated with this certificate.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-1">
                                <div className="text-sm font-medium">{certificate.course.title}</div>
                                <div className="text-xs text-muted-foreground">Slug: {certificate.course.slug}</div>
                            </div>
                            <Button variant="ghost" asChild>
                                <Link href={`/courses/${certificate.course.slug}`}>Open course</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
