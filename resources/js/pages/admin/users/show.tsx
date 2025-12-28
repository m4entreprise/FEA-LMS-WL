import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import * as usersRoutes from '@/routes/admin/users';
import * as certificatesRoutes from '@/routes/certificates';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, CheckCircle } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    created_at: string;
}

interface EnrolledCourse {
    id: number;
    title: string;
    slug: string;
    progress: number;
    total_contents: number;
    completed_at: string | null;
    enrolled_at: string;
}

interface ActivityItem {
    id: number;
    content_title: string;
    course_title: string;
    completed_at: string;
    type: string;
}

interface Certificate {
    uuid: string;
    certificate_number: string;
    issued_at: string | null;
    course: { title: string; slug: string } | null;
}

interface Props {
    user: User;
    enrolledCourses: EnrolledCourse[];
    recentActivity: ActivityItem[];
    certificates: Certificate[];
}

export default function UserShow({ user, enrolledCourses, recentActivity, certificates }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'User Management',
            href: usersRoutes.index().url,
        },
        {
            title: user.name,
            href: window.location.href,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User Details - ${user.name}`} />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={usersRoutes.index().url}>
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{user.email}</span>
                                <span>•</span>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                    {user.role}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={usersRoutes.edit(user.id).url}>Edit User</Link>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Enrolled Courses</CardTitle>
                            <CardDescription>Courses this student is currently taking.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {enrolledCourses.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No courses enrolled.</p>
                            ) : (
                                <div className="space-y-6">
                                    {enrolledCourses.map((course) => (
                                        <div key={course.id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium">{course.title}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {course.progress}%
                                                </div>
                                            </div>
                                            <Progress value={course.progress} className="h-2" />
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>Enrolled: {new Date(course.enrolled_at).toLocaleDateString()}</span>
                                                {course.completed_at && (
                                                    <span className="flex items-center gap-1 text-green-600">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Completed: {new Date(course.completed_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Certificates</CardTitle>
                            <CardDescription>Certificates issued for this user.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {certificates.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No certificates issued.</p>
                            ) : (
                                <div className="space-y-4">
                                    {certificates.map((c) => (
                                        <div
                                            key={c.uuid}
                                            className="flex flex-col gap-2 rounded-lg border border-sidebar-border/70 p-4 md:flex-row md:items-center md:justify-between"
                                        >
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium">
                                                    {c.course?.title ?? 'Course'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Certificate #: <span className="font-mono">{c.certificate_number}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Issued:{' '}
                                                    {c.issued_at ? new Date(c.issued_at).toLocaleDateString() : '—'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Verify ID: <span className="font-mono">{c.uuid}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                {c.course?.slug ? (
                                                    <Button variant="secondary" size="sm" asChild>
                                                        <a href={certificatesRoutes.download(c.course.slug).url}>
                                                            Download PDF
                                                        </a>
                                                    </Button>
                                                ) : null}

                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={certificatesRoutes.verify(c.uuid).url} target="_blank" rel="noreferrer">
                                                        Verify
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest completed lessons and quizzes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No recent activity.</p>
                                ) : (
                                    recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">{activity.content_title}</p>
                                                <p className="text-xs text-muted-foreground">{activity.course_title}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge variant="outline" className="text-[10px] capitalize">
                                                    {activity.type}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(activity.completed_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-sm font-medium">Joined</span>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-sm font-medium">Total Courses</span>
                                <span className="text-sm text-muted-foreground">{enrolledCourses.length}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-sm font-medium">Completed Courses</span>
                                <span className="text-sm text-muted-foreground">
                                    {enrolledCourses.filter(c => c.completed_at).length}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
