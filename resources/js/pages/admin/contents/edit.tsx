import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import * as contentsRoutes from '@/routes/admin/contents';
import * as coursesRoutes from '@/routes/admin/courses';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { ChevronLeft, Loader2, Save, FileText, Video, FileBox, File } from 'lucide-react';
import { useState } from 'react';

interface Course {
    id: number;
    title: string;
}

interface Module {
    id: number;
    title: string;
}

interface Content {
    id: number;
    module_id: number;
    title: string;
    type: 'text' | 'video' | 'quiz' | 'scorm' | 'document';
    body: string | null;
    video_url: string | null;
    file_path: string | null;
    order: number;
}

interface Props {
    content: Content;
    course: Course;
    module: Module;
}

export default function ContentEdit({ content, course, module }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Course Management',
            href: coursesRoutes.index().url,
        },
        {
            title: course.title,
            href: coursesRoutes.edit(course.id).url,
        },
        {
            title: `Edit Content: ${content.title}`,
            href: contentsRoutes.edit(content.id).url,
        },
    ];

    const [videoSource, setVideoSource] = useState<'url' | 'upload'>(
        content.file_path ? 'upload' : 'url'
    );

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: content.title,
        type: content.type,
        body: content.body ?? '',
        video_url: content.video_url ?? '',
        file_path: content.file_path ?? '',
        file: null as File | null,
        order: content.order,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(contentsRoutes.update(content.id).url);
    };

    const getTypeIcon = () => {
        switch (content.type) {
            case 'text': return <FileText className="h-5 w-5" />;
            case 'video': return <Video className="h-5 w-5" />;
            case 'scorm': return <FileBox className="h-5 w-5" />;
            default: return <File className="h-5 w-5" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Content - ${content.title}`} />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild aria-label="Back to course" title="Back to course">
                        <Link href={coursesRoutes.edit(course.id).url}>
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-muted rounded-md">
                            {getTypeIcon()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold">Edit Content</h1>
                            <p className="text-sm text-muted-foreground">{module.title} / {content.title}</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl">
                    <form onSubmit={submit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Content Details</CardTitle>
                                <CardDescription>
                                    Editing {content.type} content for module "{module.title}".
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Content title"
                                        required
                                        disabled={processing}
                                    />
                                    {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                                </div>

                                {content.type === 'text' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="body">Content Body</Label>
                                        <Textarea
                                            id="body"
                                            value={data.body}
                                            onChange={(e) => setData('body', e.target.value)}
                                            placeholder="Write your course content here..."
                                            className="min-h-[300px] font-mono"
                                            disabled={processing}
                                        />
                                        <p className="text-xs text-muted-foreground">Markdown is supported.</p>
                                        {errors.body && <p className="text-sm text-destructive">{errors.body}</p>}
                                    </div>
                                )}

                                {content.type === 'video' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Video Source</Label>
                                            <RadioGroup
                                                defaultValue={videoSource}
                                                onValueChange={(value) => setVideoSource(value as 'url' | 'upload')}
                                                className="flex gap-4"
                                                disabled={processing}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="url" id="source-url" />
                                                    <Label htmlFor="source-url">External URL (YouTube/Vimeo)</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="upload" id="source-upload" />
                                                    <Label htmlFor="source-upload">Upload Video</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        {videoSource === 'url' ? (
                                            <div className="space-y-2">
                                                <Label htmlFor="video_url">Video URL</Label>
                                                <Input
                                                    id="video_url"
                                                    value={data.video_url}
                                                    onChange={(e) => setData('video_url', e.target.value)}
                                                    placeholder="https://www.youtube.com/watch?v=..."
                                                    disabled={processing}
                                                />
                                                <p className="text-xs text-muted-foreground">Enter a YouTube or Vimeo URL.</p>
                                                {errors.video_url && <p className="text-sm text-destructive">{errors.video_url}</p>}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Label htmlFor="file">Video File</Label>
                                                <Input
                                                    id="file"
                                                    type="file"
                                                    onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                                                    className="cursor-pointer"
                                                    accept="video/*"
                                                    disabled={processing}
                                                />
                                                {data.file_path && !data.file && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Current file: {data.file_path}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground">Supported formats: MP4, WebM, Ogg. Max 500MB.</p>
                                                {errors.file && <p className="text-sm text-destructive">{errors.file}</p>}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {(content.type === 'document' || content.type === 'scorm') && (
                                    <div className="space-y-2">
                                        <Label htmlFor="file">File Upload {content.type === 'scorm' ? '(ZIP)' : ''}</Label>
                                        <Input
                                            id="file"
                                            type="file"
                                            onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                                            className="cursor-pointer"
                                            accept={content.type === 'scorm' ? '.zip' : undefined}
                                            disabled={processing}
                                        />
                                        {data.file_path && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Current file: {data.file_path}
                                            </p>
                                        )}
                                        {errors.file && <p className="text-sm text-destructive">{errors.file}</p>}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-4">
                            <Button variant="outline" asChild disabled={processing}>
                                <Link href={coursesRoutes.edit(course.id).url}>
                                    Cancel
                                </Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Content
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
