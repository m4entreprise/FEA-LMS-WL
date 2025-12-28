import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import * as coursesRoutes from '@/routes/courses';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Course {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    category: string | null;
    estimated_duration: number | null;
    modules_count: number;
    is_enrolled?: boolean;
    is_completed?: boolean;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedCourses {
    data: Course[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    courses: PaginatedCourses;
    categories: string[];
    filters: {
        q?: string;
        category?: string;
        duration?: string;
        status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Catalog',
        href: coursesRoutes.index().url,
    },
];

export default function CourseCatalog({ courses, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.q ?? '');
    const categoryValue = filters.category ?? '';
    const durationValue = filters.duration ?? '';
    const statusValue = filters.status ?? '';

    const normalizedLinks = useMemo(() => {
        return (courses.links ?? []).map((l) => ({
            ...l,
            label: l.label.replace(/<[^>]*>/g, '').trim(),
        }));
    }, [courses.links]);

    const applyFilters = (next?: Partial<{ q: string; category: string; duration: string; status: string }>) => {
        const nextQ = (next?.q ?? search).trim();
        const nextCategory = next?.category ?? categoryValue;
        const nextDuration = next?.duration ?? durationValue;
        const nextStatus = next?.status ?? statusValue;

        const query = {
            q: nextQ.length > 0 ? nextQ : undefined,
            category: nextCategory !== '' ? nextCategory : undefined,
            duration: nextDuration !== '' ? nextDuration : undefined,
            status: nextStatus !== '' ? nextStatus : undefined,
        };

        router.get(
            coursesRoutes.index.url({ query }),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Course Catalog" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Course Catalog</h1>
                    <p className="text-sm text-muted-foreground">Explore our available courses and start learning today.</p>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search courses..."
                        className="md:col-span-2"
                    />

                    <Select
                        value={categoryValue}
                        onValueChange={(v) => {
                            applyFilters({ category: v });
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All categories</SelectItem>
                            {categories.map((c) => (
                                <SelectItem key={c} value={c}>
                                    {c}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={statusValue}
                        onValueChange={(v) => {
                            applyFilters({ status: v });
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All</SelectItem>
                            <SelectItem value="enrolled">Enrolled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="available">Available</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Select
                        value={durationValue}
                        onValueChange={(v) => {
                            applyFilters({ duration: v });
                        }}
                    >
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Duration" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Any duration</SelectItem>
                            <SelectItem value="0-30">0–30 mins</SelectItem>
                            <SelectItem value="30-60">30–60 mins</SelectItem>
                            <SelectItem value="60+">60+ mins</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="secondary"
                        onClick={() => applyFilters({ q: search })}
                        disabled={search.trim().length === 0}
                    >
                        Search
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => {
                            setSearch('');
                            router.get(coursesRoutes.index().url, {}, { replace: true });
                        }}
                    >
                        Reset
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {courses.data.map((course) => (
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
                    {courses.data.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-sidebar-border/70 p-12 text-center dark:border-sidebar-border">
                            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mt-4 text-lg font-semibold">No courses available</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Check back later for new content.</p>
                        </div>
                    )}
                </div>

                {normalizedLinks.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {normalizedLinks.map((link, idx) => (
                            <Button
                                key={idx}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => {
                                    if (!link.url) {
                                        return;
                                    }
                                    router.get(link.url, {}, { preserveState: true });
                                }}
                            >
                                {link.label}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
