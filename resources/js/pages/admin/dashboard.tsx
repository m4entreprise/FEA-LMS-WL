import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard as adminDashboardRoute } from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BookOpen, GraduationCap, Users } from 'lucide-react';

interface Stats {
    total_users: number;
    total_students: number;
    total_admins: number;
    total_courses: number;
    total_enrollments: number;
    completed_enrollments: number;
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
    recentUsers: User[];
    recentEnrollments: Enrollment[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: adminDashboardRoutes.index().url,
    },
];

export default function AdminDashboard({ stats, recentUsers = [], recentEnrollments = [] }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
                </div>

                {/* Stats Section */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                                    <p className="text-sm text-muted-foreground">No users found.</p>
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
                                    <p className="text-sm text-muted-foreground">No enrollments yet.</p>
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
