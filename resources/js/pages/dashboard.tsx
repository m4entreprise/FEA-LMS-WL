import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import * as certificatesRoutes from '@/routes/certificates';
import * as coursesRoutes from '@/routes/courses';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Award, BookOpen, CheckCircle, Clock, ExternalLink, PlayCircle } from 'lucide-react';

interface EnrolledCourse {
    id: number;
    title: string;
    slug: string;
    category: string | null;
    image_path: string | null;
    progress: number;
    total_contents: number;
    completed_at?: string | null;
}

interface CertificateInfo {
    uuid: string;
    certificate_number: string;
    issued_at: string | null;
}

interface CompletedCourse {
    id: number;
    title: string;
    slug: string;
    completed_at: string | null;
    certificate: CertificateInfo | null;
}

interface CertificateItem {
    uuid: string;
    certificate_number: string;
    issued_at: string | null;
    course: { title: string; slug: string } | null;
}

interface RecommendedCourse {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    category: string | null;
    estimated_duration: number | null;
    modules_count: number;
}

interface ActivityItem {
    id: number;
    content_title: string;
    course_title: string;
    course_slug: string;
    content_id: number;
    completed_at_human: string;
    type: string;
}

interface Stats {
    total_courses: number;
    completed_courses: number;
    in_progress_courses: number;
}

interface Props {
    enrolledCourses: EnrolledCourse[];
    completedCourses: CompletedCourse[];
    certificates: CertificateItem[];
    recommendedCourses: RecommendedCourse[];
    stats: Stats;
    recentActivity: ActivityItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({ enrolledCourses = [], completedCourses = [], certificates = [], recommendedCourses = [], stats, recentActivity = [] }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-6">
                
                {/* Stats Section */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Courses
                            </CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_courses}</div>
                            <p className="text-xs text-muted-foreground">
                                Enrolled courses
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                In Progress
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.in_progress_courses}</div>
                            <p className="text-xs text-muted-foreground">
                                Active learning paths
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Completed
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.completed_courses}</div>
                            <p className="text-xs text-muted-foreground">
                                Finished courses
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight">My Learning</h2>
                            <Button asChild variant="outline" size="sm">
                                <Link href={coursesRoutes.index().url}>Browse Courses</Link>
                            </Button>
                        </div>

                        {enrolledCourses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold">No courses yet</h3>
                                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                    You haven't enrolled in any courses yet. Browse our catalog to get started.
                                </p>
                                <Button asChild>
                                    <Link href={coursesRoutes.index().url}>Browse Catalog</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2">
                                {enrolledCourses.map((course) => (
                                    <Card key={course.id} className="flex flex-col overflow-hidden">
                                        <div className="aspect-video w-full bg-muted relative">
                                            {course.image_path ? (
                                                <img 
                                                    src={course.image_path} 
                                                    alt={course.title} 
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-secondary/50 text-muted-foreground">
                                                    <BookOpen className="h-10 w-10 opacity-20" />
                                                </div>
                                            )}
                                            {course.category && (
                                                <Badge className="absolute right-2 top-2" variant="secondary">
                                                    {course.category}
                                                </Badge>
                                            )}
                                        </div>
                                        <CardHeader className="p-4 pb-2">
                                            <CardTitle className="line-clamp-1 text-base">{course.title}</CardTitle>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                                                <span>{course.total_contents} lessons</span>
                                                <span>{course.progress}% complete</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-2 pb-2 flex-1">
                                            <Progress value={course.progress} className="h-2" />
                                        </CardContent>
                                        <CardFooter className="p-4 pt-2">
                                            <Button asChild className="w-full">
                                                <Link href={coursesRoutes.show(course.slug).url}>
                                                    {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                                                    <PlayCircle className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight">Completed Courses</h2>
                            <Button asChild variant="outline" size="sm">
                                <Link href={certificatesRoutes.index().url}>My Certificates</Link>
                            </Button>
                        </div>

                        {completedCourses.length === 0 ? (
                            <Card>
                                <CardContent className="p-6 text-sm text-muted-foreground">No completed courses yet.</CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2">
                                {completedCourses.slice(0, 4).map((course) => (
                                    <Card key={course.id} className="flex flex-col">
                                        <CardHeader className="p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <CardTitle className="line-clamp-2 text-base">{course.title}</CardTitle>
                                                    <CardDescription className="text-xs">
                                                        Completed {course.completed_at ? new Date(course.completed_at).toLocaleDateString() : '—'}
                                                    </CardDescription>
                                                </div>
                                                <div className="rounded-md bg-primary/10 p-2 text-primary">
                                                    <Award className="h-5 w-5" />
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex flex-1 flex-col gap-2 p-4 pt-0">
                                            <Button asChild>
                                                <a href={certificatesRoutes.download(course.slug).url}>Download Certificate (PDF)</a>
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
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Certificates</h2>
                            <p className="text-sm text-muted-foreground">Your latest issued certificates.</p>
                        </div>

                        {certificates.length === 0 ? (
                            <Card>
                                <CardContent className="p-6 text-center text-sm text-muted-foreground">No certificates issued yet</CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {certificates.slice(0, 5).map((c) => (
                                    <Card key={c.uuid}>
                                        <CardHeader className="p-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-sm font-medium line-clamp-1">
                                                        {c.course?.title ?? 'Certificate'}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs">
                                                        #{c.certificate_number}
                                                    </CardDescription>
                                                </div>
                                                <Badge variant="outline" className="text-[10px]">Issued</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardFooter className="flex items-center justify-between p-4 pt-0">
                                            <Button size="sm" variant="ghost" asChild disabled={!c.course?.slug}>
                                                {c.course?.slug ? (
                                                    <a href={certificatesRoutes.download(c.course.slug).url}>PDF</a>
                                                ) : (
                                                    <span>PDF</span>
                                                )}
                                            </Button>
                                            <Button size="sm" variant="ghost" asChild>
                                                <Link href={certificatesRoutes.verify(c.uuid).url}>Verify</Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Recommended</h2>
                            <p className="text-sm text-muted-foreground">Quick picks from the catalog.</p>
                        </div>

                        {recommendedCourses.length === 0 ? (
                            <Card>
                                <CardContent className="p-6 text-center text-sm text-muted-foreground">No recommendations available.</CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {recommendedCourses.slice(0, 4).map((c) => (
                                    <Card key={c.id}>
                                        <CardHeader className="p-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-sm font-medium line-clamp-1">{c.title}</CardTitle>
                                                    <CardDescription className="text-xs line-clamp-2">
                                                        {c.description || 'No description available.'}
                                                    </CardDescription>
                                                </div>
                                                {c.category ? (
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        {c.category}
                                                    </Badge>
                                                ) : null}
                                            </div>
                                        </CardHeader>
                                        <CardFooter className="p-4 pt-0">
                                            <Button size="sm" variant="outline" asChild className="w-full">
                                                <Link href={coursesRoutes.show(c.slug).url}>View</Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                                <Button asChild variant="secondary" className="w-full">
                                    <Link href={coursesRoutes.index().url}>Browse full catalog</Link>
                                </Button>
                            </div>
                        )}

                        <h2 className="text-xl font-bold tracking-tight">Recent Activity</h2>
                        
                        {recentActivity.length === 0 ? (
                            <Card>
                                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                                    No recent activity
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <Card key={activity.id}>
                                        <CardHeader className="p-4">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-sm font-medium line-clamp-1">
                                                        {activity.content_title}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs line-clamp-1">
                                                        {activity.course_title}
                                                    </CardDescription>
                                                </div>
                                                <Badge variant="outline" className="text-[10px] capitalize">
                                                    {activity.type}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex justify-between items-center">
                                            <div className="flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3 text-green-500" />
                                                <span>Completed</span>
                                            </div>
                                            <span>{activity.completed_at_human}</span>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
