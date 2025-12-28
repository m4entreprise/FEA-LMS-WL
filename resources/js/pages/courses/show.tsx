import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import AppLayout from '@/layouts/app-layout';
import * as coursesRoutes from '@/routes/courses';
import * as lessonsRoutes from '@/routes/lessons';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronDown, FileText, Video, HelpCircle, FileBox, File, CheckCircle, Lock } from 'lucide-react';

interface Content {
    id: number;
    title: string;
    type: 'text' | 'video' | 'quiz' | 'scorm' | 'document';
}

interface Module {
    id: number;
    title: string;
    contents: Content[];
}

interface Course {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    category: string | null;
    estimated_duration: number | null;
    modules: Module[];
    prerequisites?: { id: number; title: string; slug: string }[];
}

interface Props {
    course: Course;
    isEnrolled: boolean;
    completedAt?: string | null;
    missingPrerequisiteIds?: number[];
    firstContentId?: number | null;
    continueContentId?: number | null;
}

export default function CourseShow({ course, isEnrolled, completedAt, missingPrerequisiteIds = [], firstContentId = null, continueContentId = null }: Props) {
    const page = usePage<{ errors?: Record<string, string> }>();
    const prereqError = page.props.errors?.prerequisites;

    const missingSet = new Set(missingPrerequisiteIds);
    const prerequisites = course.prerequisites ?? [];
    const canEnroll = prerequisites.length === 0 || missingPrerequisiteIds.length === 0;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Catalog',
            href: coursesRoutes.index().url,
        },
        {
            title: course.title,
            href: coursesRoutes.show(course.slug).url,
        },
    ];

    const { post, processing } = useForm();

    const handleEnroll = () => {
        post(coursesRoutes.enroll(course.id).url);
    };

    const getContentIcon = (type: Content['type']) => {
        switch (type) {
            case 'text': return <FileText className="h-4 w-4" />;
            case 'video': return <Video className="h-4 w-4" />;
            case 'quiz': return <HelpCircle className="h-4 w-4" />;
            case 'scorm': return <FileBox className="h-4 w-4" />;
            default: return <File className="h-4 w-4" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={course.title} />

            <div className="flex flex-col gap-6 p-6">
                <Button variant="outline" size="sm" className="w-fit" asChild>
                    <Link href={coursesRoutes.index().url}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Catalog
                    </Link>
                </Button>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                {course.category && (
                                    <Badge variant="secondary">{course.category}</Badge>
                                )}
                                {course.estimated_duration && (
                                    <span className="text-sm text-muted-foreground">• {course.estimated_duration} mins</span>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="whitespace-pre-wrap">{course.description}</p>
                            </div>
                        </div>

                        {prerequisites.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Prerequisites</CardTitle>
                                    <CardDescription>Complete these courses before you can enroll.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        {prerequisites.map((p) => (
                                            <div key={p.id} className="flex items-center justify-between">
                                                <Link className="hover:underline" href={coursesRoutes.show(p.slug).url}>
                                                    {p.title}
                                                </Link>
                                                <span className={missingSet.has(p.id) ? 'text-muted-foreground' : 'text-primary'}>
                                                    {missingSet.has(p.id) ? 'Not completed' : 'Completed'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Course Content</h2>
                            {course.modules.map((module) => (
                                <Card key={module.id} className="overflow-hidden">
                                    <Collapsible defaultOpen>
                                        <div className="flex items-center justify-between bg-muted/30 px-4 py-3 border-b border-sidebar-border/70">
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" className="p-0 hover:bg-transparent flex items-center gap-2 w-full justify-start font-medium text-base">
                                                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                                                    {module.title}
                                                </Button>
                                            </CollapsibleTrigger>
                                        </div>
                                        <CollapsibleContent>
                                            <CardContent className="p-0">
                                                <div className="divide-y divide-sidebar-border/70">
                                                    {module.contents.map((content) => (
                                                        <div key={content.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/20 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-muted-foreground">
                                                                    {getContentIcon(content.type)}
                                                                </div>
                                                                <span className={!isEnrolled ? "text-muted-foreground" : ""}>
                                                                    {content.title}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                {isEnrolled ? (
                                                                    <Button size="sm" variant="ghost" className="h-8" asChild>
                                                                        <Link
                                                                            href={
                                                                                lessonsRoutes.show({
                                                                                    course: course.slug,
                                                                                    content: content.id,
                                                                                }).url
                                                                            }
                                                                        >
                                                                            Start
                                                                        </Link>
                                                                    </Button>
                                                                ) : (
                                                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>
                            ))}
                            {course.modules.length === 0 && (
                                <p className="text-muted-foreground italic">No content available yet.</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle>
                                    {isEnrolled ? 'You are enrolled!' : 'Ready to start learning?'}
                                </CardTitle>
                                <CardDescription>
                                    {isEnrolled 
                                        ? 'Continue your progress below.' 
                                        : 'Enroll now to get unlimited access to this course.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {prereqError && (
                                    <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                        {prereqError}
                                    </div>
                                )}

                                {isEnrolled ? (
                                    <div className="space-y-3">
                                        <Button className="w-full" size="lg" asChild disabled={!continueContentId && !firstContentId}>
                                            <Link
                                                href={
                                                    continueContentId || firstContentId
                                                        ? lessonsRoutes.show({
                                                              course: course.slug,
                                                              content: (continueContentId || firstContentId) as number,
                                                          }).url
                                                        : coursesRoutes.show(course.slug).url
                                                }
                                            >
                                                Continue Learning
                                            </Link>
                                        </Button>
                                        {completedAt && (
                                            <Button className="w-full" variant="secondary" asChild>
                                                <a href={`/courses/${course.slug}/certificate`}>
                                                    Download Certificate (PDF)
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <Button 
                                        className="w-full" 
                                        size="lg" 
                                        onClick={handleEnroll} 
                                        disabled={processing || !canEnroll}
                                    >
                                        {processing && <div className="mr-2 animate-spin">⟳</div>}
                                        {canEnroll ? 'Enroll for Free' : 'Complete prerequisites to enroll'}
                                    </Button>
                                )}
                                
                                <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-primary" />
                                        <span>Full lifetime access</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-primary" />
                                        <span>Access on mobile and desktop</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-primary" />
                                        <span>Certificate of completion</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
