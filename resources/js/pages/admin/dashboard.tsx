import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard as adminDashboardRoute } from '@/routes/admin';
import * as adminCoursesRoutes from '@/routes/admin/courses';
import * as reportsEnrollmentsRoutes from '@/routes/admin/reports/enrollments';
import * as adminUsersRoutes from '@/routes/admin/users';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Award, BarChart3, BookOpen, GraduationCap, Users } from 'lucide-react';

interface Stats {
    total_users: number;
    total_students: number;
    total_admins: number;
    total_courses: number;
    total_enrollments: number;
    completed_enrollments: number;
    completion_rate: number;
    certificates_issued: number;
}

interface SeriesPoint {
    date: string;
    enrollments: number;
    completions: number;
    certificates: number;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface Enrollment {
    user_name: string;
    course_title: string;
    created_at: string;
}

interface Props {
    stats: Stats;
    series: SeriesPoint[];
    recentUsers: User[];
    recentEnrollments: Enrollment[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: adminDashboardRoute().url,
    },
];

function MiniBars({ title, icon, values }: { title: string; icon: React.ReactNode; values: number[] }) {
    const max = Math.max(1, ...values);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="text-sm font-medium">{title}</span>
                    {icon}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex h-24 items-end gap-1">
                    {values.map((v, i) => (
                        <div
                            key={i}
                            className="w-full rounded-sm bg-primary/20"
                            style={{ height: `${Math.round((v / max) * 100)}%` }}
                            title={String(v)}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminDashboard({ stats, series = [], recentUsers = [], recentEnrollments = [] }: Props) {
    const enrollmentsSeries = series.map((p) => p.enrollments);
    const completionsSeries = series.map((p) => p.completions);
    const certificatesSeries = series.map((p) => p.certificates);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="secondary" asChild>
                            <a href={reportsEnrollmentsRoutes.csv().url}>Export enrollments CSV</a>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={adminCoursesRoutes.create().url}>Create course</Link>
                        </Button>
                        <Button asChild>
                            <Link href={adminUsersRoutes.create().url}>Create user</Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_users}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.total_students} Students, {stats.total_admins} Admins
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_courses}</div>
                            <p className="text-xs text-muted-foreground">
                                Active courses
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_enrollments}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.completed_enrollments} Completed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.completion_rate}%</div>
                            <p className="text-xs text-muted-foreground">Completed enrollments / total</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <MiniBars title="Enrollments (14d)" icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />} values={enrollmentsSeries} />
                    <MiniBars title="Completions (14d)" icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />} values={completionsSeries} />
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.certificates_issued}</div>
                            <p className="text-xs text-muted-foreground">Total issued certificates</p>
                            <div className="mt-4">
                                <div className="text-xs text-muted-foreground mb-2">Certificates (14d)</div>
                                <div className="flex h-16 items-end gap-1">
                                    {(() => {
                                        const max = Math.max(1, ...certificatesSeries);
                                        return certificatesSeries.map((v, i) => (
                                            <div
                                                key={i}
                                                className="w-full rounded-sm bg-primary/20"
                                                style={{ height: `${Math.round((v / max) * 100)}%` }}
                                                title={String(v)}
                                            />
                                        ));
                                    })()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Recent Users */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Users</CardTitle>
                            <CardDescription>Newest registered users.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentUsers.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-sidebar-border/70 p-6 text-center text-sm text-muted-foreground dark:border-sidebar-border">
                                        No users found.
                                    </div>
                                ) : (
                                    recentUsers.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                {user.role}
                                            </Badge>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Enrollments */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Enrollments</CardTitle>
                            <CardDescription>Latest course enrollments.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentEnrollments.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-sidebar-border/70 p-6 text-center text-sm text-muted-foreground dark:border-sidebar-border">
                                        No enrollments yet.
                                    </div>
                                ) : (
                                    recentEnrollments.map((enrollment, idx) => (
                                        <div key={idx} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">{enrollment.user_name}</p>
                                                <p className="text-xs text-muted-foreground">enrolled in</p>
                                                <p className="text-sm font-medium">{enrollment.course_title}</p>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(enrollment.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
