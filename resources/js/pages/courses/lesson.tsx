import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area"
import AppLayout from '@/layouts/app-layout';
import * as coursesRoutes from '@/routes/courses';
import * as lessonsRoutes from '@/routes/lessons';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { FileText, Video, HelpCircle, FileBox, File, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import QuizPlayer, { type Quiz } from '@/components/quiz-player';
import { ScormAdapter } from '@/lib/scorm-adapter';
import { useEffect, useRef } from 'react';

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
                <div className="h-[80vh] w-full overflow-hidden rounded-lg border bg-white">
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

export default function LessonPlayer({ course, currentContent, userProgress = [], previousContentId = null, nextContentId = null }: Props) {
    const isCompleted = userProgress.includes(currentContent.id);
    const scormAdapterRef = useRef<ScormAdapter | null>(null);

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

            <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
                {/* Mobile Sidebar Trigger (could be added here) */}
                
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-sidebar-border/70 bg-sidebar/30">
                     <div className="p-4 border-b border-sidebar-border/70">
                         <h2 className="font-semibold">{course.title}</h2>
                         <Link href={coursesRoutes.show(course.slug).url} className="text-xs text-muted-foreground hover:underline">
                             &larr; Back to Course Home
                         </Link>
                     </div>
                     <ScrollArea className="h-[calc(100vh-8rem)]">
                         <div className="p-4 space-y-4">
                            {course.modules.map((module) => (
                                <div key={module.id}>
                                    <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
                                        {module.title}
                                    </h3>
                                    <div className="space-y-1">
                                        {module.contents.map((content) => {
                                            const isActive = content.id === currentContent.id;
                                            return (
                                                <Button
                                                    key={content.id}
                                                    variant={isActive ? "secondary" : "ghost"}
                                                    size="sm"
                                                    className="w-full justify-start gap-2"
                                                    asChild
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

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="container max-w-4xl py-8">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold">{currentContent.title}</h1>
                        </div>
                        
                        <Card>
                            <CardContent className="p-6">
                                <ContentRenderer content={currentContent} />
                            </CardContent>
                            <CardFooter className="flex justify-between border-t p-6">
                                <div className="text-sm text-muted-foreground">
                                    {isCompleted ? 'Completed' : 'Not completed'}
                                </div>
                                <Button 
                                    variant={isCompleted ? "outline" : "default"}
                                    onClick={() =>
                                        router.post(
                                            lessonsRoutes.complete({ course: course.slug, content: currentContent.id }).url,
                                            {},
                                            { preserveScroll: true }
                                        )
                                    }
                                >
                                    {isCompleted ? (
                                        <>
                                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                            Completed
                                        </>
                                    ) : (
                                        "Mark as Complete"
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>

                        <div className="mt-8 flex justify-between">
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
        </AppLayout>
    );
}
