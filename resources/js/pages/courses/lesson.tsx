import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import * as coursesRoutes from '@/routes/courses';
import * as lessonsRoutes from '@/routes/lessons';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { FileText, Video, HelpCircle, FileBox, File, CheckCircle, Loader2, Menu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import QuizPlayer, { type Quiz } from '@/components/quiz-player';
import { ScormAdapter } from '@/lib/scorm-adapter';
import { useEffect, useRef, useState } from 'react';

interface Content {
    id: number;
    module_id: number;
    title: string;
    type: 'text' | 'video' | 'quiz' | 'scorm' | 'document';
    body?: string;
    video_url?: string;
    file_path?: string;
    quiz?: Quiz;
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
    modules: Module[];
}

interface Props {
    course: Course;
    currentContent: Content;
    userProgress: number[];
    unlockedContentIds: number[];
    previousContentId?: number | null;
    nextContentId?: number | null;
}

const getContentIcon = (type: Content['type']) => {
    switch (type) {
        case 'text': return <FileText className="h-4 w-4" />;
        case 'video': return <Video className="h-4 w-4" />;
        case 'quiz': return <HelpCircle className="h-4 w-4" />;
        case 'scorm': return <FileBox className="h-4 w-4" />;
        default: return <File className="h-4 w-4" />;
    }
};

const ContentRenderer = ({ content }: { content: Content }) => {
    switch (content.type) {
        case 'quiz':
            return content.quiz ? (
                <QuizPlayer quiz={content.quiz} />
            ) : (
                <div className="text-center p-8 text-muted-foreground">
                    Quiz data not available.
                </div>
            );
        case 'text':
            return (
                <div className="prose dark:prose-invert max-w-none">
                    {content.body ? <ReactMarkdown>{content.body}</ReactMarkdown> : <p className="italic text-muted-foreground">No content body.</p>}
                </div>
            );
        case 'video':
            return (
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                    {content.file_path ? (
                        <video 
                            src={`/storage/${content.file_path}`} 
                            controls 
                            className="h-full w-full"
                        >
                            Your browser does not support the video tag.
                        </video>
                    ) : content.video_url ? (
                        <iframe 
                            src={content.video_url.replace('watch?v=', 'embed/')} 
                            className="h-full w-full border-0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            No video source provided.
                        </div>
                    )}
                </div>
            );
        case 'scorm':
            return (
                <div className="h-[70svh] sm:h-[80vh] w-full overflow-hidden rounded-lg border bg-white">
                    {content.file_path ? (
                        <iframe 
                            src={`/storage/${content.file_path}`}
                            className="h-full w-full border-0"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            SCORM package not uploaded.
                        </div>
                    )}
                </div>
            );
        case 'document':
             return (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-sidebar-border/70 p-12 text-center">
                    <FileText className="h-12 w-12 text-primary/50" />
                    <h3 className="mt-4 text-lg font-semibold">{content.title}</h3>
                    {content.file_path ? (
                        <Button className="mt-4" asChild>
                            <a href={`/storage/${content.file_path}`} target="_blank" rel="noopener noreferrer">
                                Download / View Document
                            </a>
                        </Button>
                    ) : (
                        <p className="mt-2 text-sm text-muted-foreground">No file attached.</p>
                    )}
                </div>
            );
        default:
            return (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-sidebar-border/70 p-12 text-center">
                    <File className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">Content type not yet supported</h3>
                    <p className="mt-2 text-sm text-muted-foreground">We are working on adding support for {content.type}.</p>
                </div>
            );
    }
};

export default function LessonPlayer({ course, currentContent, userProgress = [], unlockedContentIds = [], previousContentId = null, nextContentId = null }: Props) {
    const isCompleted = userProgress.includes(currentContent.id);
    const canManuallyComplete = !['quiz', 'scorm'].includes(currentContent.type);
    const scormAdapterRef = useRef<ScormAdapter | null>(null);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    useEffect(() => {
        if (currentContent.type === 'scorm') {
            const adapter = new ScormAdapter(currentContent.id);
            adapter.initialize();
            scormAdapterRef.current = adapter;

            return () => {
                // Cleanup global SCORM API on unmount or content change
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                delete (window as any).API;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                delete (window as any).API_1484_11;
            };
        }
    }, [currentContent.id, currentContent.type]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Catalog',
            href: coursesRoutes.index().url,
        },
        {
            title: course.title,
            href: coursesRoutes.show(course.slug).url,
        },
        {
            title: currentContent.title,
            href: window.location.href, // Current page
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${currentContent.title} - ${course.title}`} />

            {(() => {
                const navContent = (
                    <div className="flex h-full flex-col">
                        <div className="p-4 border-b border-sidebar-border/70">
                            <h2 className="font-semibold">{course.title}</h2>
                            <Link href={coursesRoutes.show(course.slug).url} className="text-xs text-muted-foreground hover:underline">
                                &larr; Back to Course Home
                            </Link>
                        </div>
                        <ScrollArea className="flex-1 lg:h-[calc(100vh-8rem)]">
                            <div className="p-4 space-y-4">
                                {course.modules.map((module) => (
                                    <div key={module.id}>
                                        <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
                                            {module.title}
                                        </h3>
                                        <div className="space-y-1">
                                            {module.contents.map((content) => {
                                                const isActive = content.id === currentContent.id;
                                                const isUnlocked = unlockedContentIds.includes(content.id);
                                                return (
                                                    <Button
                                                        key={content.id}
                                                        variant={isActive ? 'secondary' : 'ghost'}
                                                        size="sm"
                                                        className="w-full justify-start gap-2"
                                                        asChild
                                                        onClick={() => setMobileNavOpen(false)}
                                                        disabled={!isUnlocked}
                                                    >
                                                        <Link href={lessonsRoutes.show({ course: course.slug, content: content.id }).url}>
                                                            {getContentIcon(content.type)}
                                                            <span className="truncate">{content.title}</span>
                                                        </Link>
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                );

                return (
                    <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-4rem)]">
                        <div className="hidden lg:block lg:w-80 lg:border-r border-sidebar-border/70 bg-sidebar/30">
                            {navContent}
                        </div>

                        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="mx-4 mt-4 lg:hidden w-fit">
                                    <Menu className="mr-2 h-4 w-4" />
                                    Lessons
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-[18rem] bg-sidebar">
                                <SheetHeader className="sr-only">
                                    <SheetTitle>Lessons</SheetTitle>
                                </SheetHeader>
                                {navContent}
                            </SheetContent>
                        </Sheet>

                        <div className="flex-1 lg:overflow-y-auto">
                            <div className="container max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold">{currentContent.title}</h1>
                        </div>
                        
                        <Card>
                            <CardContent className="p-6">
                                <ContentRenderer content={currentContent} />
                            </CardContent>
                            <CardFooter className="flex flex-col gap-3 border-t p-6 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-sm text-muted-foreground">
                                    {isCompleted ? 'Completed' : 'Not completed'}
                                </div>
                                {canManuallyComplete ? (
                                    <Button 
                                        variant={isCompleted ? "outline" : "default"}
                                        onClick={() =>
                                            router.post(
                                                lessonsRoutes.complete({ course: course.slug, content: currentContent.id }).url,
                                                {},
                                                { preserveScroll: true, onStart: () => setIsCompleting(true), onFinish: () => setIsCompleting(false) }
                                            )
                                        }
                                        disabled={isCompleting}
                                    >
                                        {isCompleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {isCompleted ? (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                Completed
                                            </>
                                        ) : (
                                            "Mark as Complete"
                                        )}
                                    </Button>
                                ) : null}
                            </CardFooter>
                        </Card>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
                            <Button variant="outline" disabled={!previousContentId} asChild={!!previousContentId}>
                                {previousContentId ? (
                                    <Link href={lessonsRoutes.show({ course: course.slug, content: previousContentId }).url}>Previous Lesson</Link>
                                ) : (
                                    <span>Previous Lesson</span>
                                )}
                            </Button>
                            <Button disabled={!nextContentId} asChild={!!nextContentId}>
                                {nextContentId ? (
                                    <Link href={lessonsRoutes.show({ course: course.slug, content: nextContentId }).url}>Next Lesson</Link>
                                ) : (
                                    <span>Next Lesson</span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
                );
            })()}
        </AppLayout>
    );
}
