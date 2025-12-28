import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import * as coursesRoutes from '@/routes/courses';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';

interface Course {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    category: string | null;
    estimated_duration: number | null;
    modules_count: number;
}

interface Props {
    courses: Course[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Catalog',
        href: coursesRoutes.index().url,
    },
];

export default function CourseCatalog({ courses }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Course Catalog" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Course Catalog</h1>
                    <p className="text-sm text-muted-foreground">Explore our available courses and start learning today.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <div 
                            key={course.id} 
                            className="group flex flex-col rounded-xl border border-sidebar-border/70 bg-card transition-all hover:shadow-md dark:border-sidebar-border"
                        >
                            <div className="flex flex-1 flex-col p-6">
                                <div className="flex items-start justify-between">
                                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                        <BookOpen className="h-6 w-6" />
                                    </div>
                                    {course.category && (
                                        <Badge variant="secondary">
                                            {course.category}
                                        </Badge>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <h3 className="font-semibold leading-none tracking-tight">{course.title}</h3>
                                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                        {course.description || 'No description available.'}
                                    </p>
                                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                                        <span>{course.modules_count} Modules</span>
                                        {course.estimated_duration && (
                                            <span>• {course.estimated_duration} mins</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-sidebar-border/70 p-4 dark:border-sidebar-border">
                                <Button className="w-full" asChild>
                                    <Link href={coursesRoutes.show(course.slug).url}>
                                        View Course
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                    {courses.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-sidebar-border/70 p-12 text-center dark:border-sidebar-border">
                            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mt-4 text-lg font-semibold">No courses available</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Check back later for new content.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
