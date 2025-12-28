import { Head, Link, usePage } from '@inertiajs/react';

interface Certificate {
    uuid: string;
    certificate_number: string;
    issued_at: string;
    user: { name: string };
    course: { title: string; slug: string };
}

interface Props {
    certificate: Certificate | null;
}

export default function CertificateVerify({ certificate }: Props) {
    const page = usePage<{ name: string }>();

    return (
        <>
            <Head title="Certificate Verification" />

            <div className="min-h-screen bg-background">
                <div className="mx-auto max-w-3xl px-6 py-12">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold">Certificate verification</h1>
                            <p className="text-sm text-muted-foreground">{page.props.name}</p>
                        </div>
                        <Link href="/" className="text-sm hover:underline">
                            Home
                        </Link>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6">
                        {certificate ? (
                            <div className="space-y-4">
                                <div className="text-sm text-muted-foreground">Status</div>
                                <div className="text-lg font-semibold text-primary">Valid</div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <div className="text-xs uppercase text-muted-foreground">Certificate #</div>
                                        <div className="font-medium">{certificate.certificate_number}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs uppercase text-muted-foreground">Issued at</div>
                                        <div className="font-medium">{new Date(certificate.issued_at).toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs uppercase text-muted-foreground">Student</div>
                                        <div className="font-medium">{certificate.user.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs uppercase text-muted-foreground">Course</div>
                                        <Link className="font-medium hover:underline" href={`/courses/${certificate.course.slug}`}>
                                            {certificate.course.title}
                                        </Link>
                                    </div>
                                </div>

                                <div className="pt-2 text-xs text-muted-foreground">
                                    Verification ID: <span className="font-mono">{certificate.uuid}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">Status</div>
                                <div className="text-lg font-semibold text-destructive">Not found</div>
                                <p className="text-sm text-muted-foreground">This verification ID does not match any issued certificate.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
