import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import * as coursesRoutes from '@/routes/admin/courses';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Course {
    id: number;
    title: string;
    category: string | null;
    is_published: boolean;
    students_count: number;
}

interface Props {
    courses: Course[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Course Management',
        href: coursesRoutes.index().url,
    },
];

export default function CourseIndex({ courses }: Props) {
    const { delete: destroy, processing } = useForm();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [courseIdToDelete, setCourseIdToDelete] = useState<number | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Course Management" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Courses</h1>
                        <p className="text-sm text-muted-foreground">Create and manage your educational content.</p>
                    </div>
                    <Button asChild>
                        <Link href={coursesRoutes.create().url}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Course
                        </Link>
                    </Button>
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
                                    <Badge variant={course.is_published ? 'default' : 'secondary'}>
                                        {course.is_published ? 'Published' : 'Draft'}
                                    </Badge>
                                </div>
                                <div className="mt-4">
                                    <h3 className="font-semibold leading-none tracking-tight">{course.title}</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {course.category || 'No category'} • {course.students_count} Students
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-sidebar-border/70 p-4 dark:border-sidebar-border">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={coursesRoutes.edit(course.id).url}>
                                        Manage
                                    </Link>
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    aria-label="Delete course"
                                    title="Delete course"
                                    onClick={() => {
                                        setCourseIdToDelete(course.id);
                                        setConfirmOpen(true);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {courses.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-sidebar-border/70 p-12 text-center dark:border-sidebar-border">
                            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mt-4 text-lg font-semibold">No courses yet</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Get started by creating your first course.</p>
                            <Button variant="outline" className="mt-6" asChild>
                                <Link href={coursesRoutes.create().url}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Course
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                <ConfirmDialog
                    open={confirmOpen}
                    onOpenChange={(open) => {
                        setConfirmOpen(open);
                        if (!open) {
                            setCourseIdToDelete(null);
                        }
                    }}
                    title="Delete course"
                    description="This action cannot be undone."
                    confirmText="Delete"
                    confirmVariant="destructive"
                    confirmDisabled={processing}
                    onConfirm={() => {
                        if (courseIdToDelete === null) return;
                        destroy(coursesRoutes.destroy(courseIdToDelete).url, { preserveScroll: true });
                    }}
                />
            </div>
        </AppLayout>
    );
}
