import PublicLayout from '@/layouts/public-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

interface Certificate {
    uuid: string;
    certificate_number: string;
    issued_at: string;
    user: { name: string };
    course: { title: string; slug: string };
}

interface Props {
    certificate: Certificate | null;
    query?: string;
    searched?: boolean;
    canRegister?: boolean;
}

export default function CertificateVerify({ certificate, query = '', searched = false, canRegister = false }: Props) {
    const page = usePage<{ name: string; auth?: { user?: unknown } }>();
    const [value, setValue] = useState(query);
    const [isLoading, setIsLoading] = useState(false);

    const isAuthed = !!page.props.auth?.user;
    const verifyUrl = useMemo(() => {
        if (certificate?.uuid) return `${window.location.origin}/certificates/verify/${certificate.uuid}`;
        return '';
    }, [certificate?.uuid]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/certificates/verify',
            { q: value || undefined },
            { preserveScroll: true, onStart: () => setIsLoading(true), onFinish: () => setIsLoading(false) },
        );
    };

    return (
        <PublicLayout title="Certificate Verification">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold">Certificate verification</h1>
                <p className="text-sm text-muted-foreground">{page.props.name}</p>
            </div>

            <form onSubmit={onSubmit} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="w-full sm:flex-1">
                    <Input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Enter a verification ID or certificate number…"
                        disabled={isLoading}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button type="submit" disabled={isLoading || value.trim().length === 0}>Verify</Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setValue('');
                            router.get('/certificates/verify', {}, { onStart: () => setIsLoading(true), onFinish: () => setIsLoading(false) });
                        }}
                        disabled={isLoading}
                    >
                        Reset
                    </Button>
                </div>
            </form>

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

                        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={!verifyUrl}
                                onClick={async () => {
                                    if (!verifyUrl) return;
                                    await navigator.clipboard.writeText(verifyUrl);
                                }}
                            >
                                Copy link
                            </Button>
                            <Button type="button" variant="outline" onClick={() => window.print()}>
                                Print
                            </Button>
                            {!isAuthed && (
                                <div className="sm:ml-auto flex items-center gap-2">
                                    <Button asChild>
                                        <Link href="/login">Login</Link>
                                    </Button>
                                    {canRegister && (
                                        <Button variant="secondary" asChild>
                                            <Link href="/register">Register</Link>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Status</div>
                        <div className="text-lg font-semibold text-destructive">Not found</div>
                        <p className="text-sm text-muted-foreground">
                            {searched
                                ? 'This verification ID does not match any issued certificate.'
                                : 'Enter a verification ID (UUID) or a certificate number to verify authenticity.'}
                        </p>

                        {!isAuthed && (
                            <div className="pt-4 flex items-center gap-2">
                                <Button asChild>
                                    <Link href="/login">Login</Link>
                                </Button>
                                {canRegister && (
                                    <Button variant="secondary" asChild>
                                        <Link href="/register">Register</Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
