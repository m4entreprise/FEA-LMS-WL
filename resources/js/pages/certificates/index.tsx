import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import * as certificatesRoutes from '@/routes/certificates';
import * as coursesRoutes from '@/routes/courses';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Award, ExternalLink, Download } from 'lucide-react';

interface CertificateInfo {
    uuid: string;
    certificate_number: string;
    issued_at: string;
}

interface CompletedCourse {
    id: number;
    title: string;
    slug: string;
    completed_at: string;
    certificate: CertificateInfo | null;
}

interface Props {
    completedCourses: CompletedCourse[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Certificates',
        href: certificatesRoutes.index().url,
    },
];

export default function CertificatesIndex({ completedCourses }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Certificates" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">My Certificates</h1>
                    <p className="text-sm text-muted-foreground">
                        Download your completion certificates and share verification links.
                    </p>
                </div>

                {completedCourses.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>No certificates yet</CardTitle>
                            <CardDescription>
                                Complete a course to unlock a certificate of completion.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href={coursesRoutes.index().url}>Browse courses</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {completedCourses.map((course) => (
                            <Card key={course.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                                            <CardDescription>
                                                Completed {new Date(course.completed_at).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        <div className="rounded-md bg-primary/10 p-2 text-primary">
                                            <Award className="h-5 w-5" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex flex-1 flex-col gap-3">
                                    <Button asChild>
                                        <a href={certificatesRoutes.download(course.slug).url}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download PDF
                                        </a>
                                    </Button>

                                    <Button variant="outline" asChild disabled={!course.certificate}>
                                        {course.certificate ? (
                                            <Link href={certificatesRoutes.verify(course.certificate.uuid).url}>
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Verify
                                            </Link>
                                        ) : (
                                            <span>
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Verify
                                            </span>
                                        )}
                                    </Button>

                                    {course.certificate && (
                                        <div className="text-xs text-muted-foreground">
                                            Certificate #{course.certificate.certificate_number}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
