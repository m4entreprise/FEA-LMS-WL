import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import AppLayout from '@/layouts/app-layout';
import * as coursesRoutes from '@/routes/admin/courses';
import * as modulesRoutes from '@/routes/admin/courses/modules';
import * as moduleItemRoutes from '@/routes/admin/modules';
import * as contentsRoutes from '@/routes/admin/modules/contents';
import * as contentItemRoutes from '@/routes/admin/contents';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { ChevronLeft, Loader2, Save, Plus, Trash2, ChevronDown, FileText, Video, HelpCircle, FileBox, File } from 'lucide-react';
import { useState } from 'react';

interface Content {
    id: number;
    module_id: number;
    title: string;
    type: 'text' | 'video' | 'quiz' | 'scorm' | 'document';
    order: number;
}

interface Module {
    id: number;
    course_id: number;
    title: string;
    order: number;
    contents: Content[];
}

interface Course {
    id: number;
    title: string;
    description: string | null;
    category: string | null;
    estimated_duration: number | null;
    is_published: boolean;
    modules: Module[];
    prerequisites?: { id: number; title: string }[];
}

interface CourseOption {
    id: number;
    title: string;
}

interface Props {
    course: Course | null;
    allCourses: CourseOption[];
}

export default function CourseEdit({ course, allCourses }: Props) {
    const isEditing = !!course;
    const [newModuleTitle, setNewModuleTitle] = useState('');
    const [isAddingModule, setIsAddingModule] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Course Management',
            href: coursesRoutes.index().url,
        },
        {
            title: isEditing ? `Edit: ${course.title}` : 'Create Course',
            href: isEditing ? coursesRoutes.edit(course.id).url : coursesRoutes.create().url,
        },
    ];

    const { data, setData, post, put, processing, errors } = useForm({
        title: course?.title ?? '',
        description: course?.description ?? '',
        category: course?.category ?? '',
        estimated_duration: course?.estimated_duration ?? '',
        is_published: course?.is_published ?? false,
        prerequisite_ids: (course?.prerequisites ?? []).map((p) => p.id),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(coursesRoutes.update(course.id).url);
        } else {
            post(coursesRoutes.store().url);
        }
    };

    const addModule = (e: React.FormEvent) => {
        e.preventDefault();
        if (!course) return;
        
        router.post(modulesRoutes.store(course.id).url, {
            title: newModuleTitle
        }, {
            onSuccess: () => {
                setNewModuleTitle('');
                setIsAddingModule(false);
            },
            preserveScroll: true,
        });
    };

    const deleteModule = (id: number) => {
        if (confirm('Delete this module and all its content?')) {
            router.delete(moduleItemRoutes.destroy(id).url, {
                preserveScroll: true,
            });
        }
    };

    const addContent = (moduleId: number, type: Content['type']) => {
        const title = prompt(`Enter ${type} title:`);
        if (title) {
            router.post(contentsRoutes.store(moduleId).url, {
                title, type
            }, {
                preserveScroll: true,
            });
        }
    };

    const deleteContent = (id: number) => {
        if (confirm('Delete this content?')) {
            router.delete(contentItemRoutes.destroy(id).url, {
                preserveScroll: true,
            });
        }
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
            <Head title={isEditing ? 'Edit Course' : 'Create Course'} />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={coursesRoutes.index().url}>
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-semibold">{isEditing ? 'Edit Course' : 'Create Course'}</h1>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={submit} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Course Details</CardTitle>
                                    <CardDescription>Basic information about the course.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Course Title</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="e.g. Introduction to React"
                                            required
                                        />
                                        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="What is this course about?"
                                            rows={5}
                                        />
                                        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category</Label>
                                            <Input
                                                id="category"
                                                value={data.category}
                                                onChange={(e) => setData('category', e.target.value)}
                                                placeholder="e.g. Development"
                                            />
                                            {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="estimated_duration">Duration (minutes)</Label>
                                            <Input
                                                id="estimated_duration"
                                                type="number"
                                                value={data.estimated_duration}
                                                onChange={(e) => setData('estimated_duration', e.target.value)}
                                                placeholder="e.g. 120"
                                            />
                                            {errors.estimated_duration && <p className="text-sm text-destructive">{errors.estimated_duration}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    {isEditing ? 'Save Changes' : 'Create Course'}
                                </Button>
                            </div>
                        </form>

                        {isEditing && (
                            <div className="space-y-4 mt-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">Course Curriculum</h2>
                                    {!isAddingModule ? (
                                        <Button size="sm" onClick={() => setIsAddingModule(true)}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Module
                                        </Button>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Input 
                                                size={30} 
                                                autoFocus
                                                placeholder="Module title..." 
                                                value={newModuleTitle}
                                                onChange={e => setNewModuleTitle(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && addModule(e)}
                                            />
                                            <Button size="sm" onClick={addModule}>Add</Button>
                                            <Button size="sm" variant="ghost" onClick={() => setIsAddingModule(false)}>Cancel</Button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {course.modules.map((module) => (
                                        <Card key={module.id} className="overflow-hidden">
                                            <Collapsible defaultOpen>
                                                <div className="flex items-center justify-between bg-muted/30 px-4 py-2 border-b border-sidebar-border/70">
                                                    <div className="flex items-center gap-2">
                                                        <CollapsibleTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                                                            </Button>
                                                        </CollapsibleTrigger>
                                                        <span className="font-medium">{module.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteModule(module.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
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
                                                                        <span className="text-sm">{content.title}</span>
                                                                        <Badge variant="outline" className="text-[10px] uppercase px-1 h-4">
                                                                            {content.type}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                                                            <Link href={contentItemRoutes.edit(content.id).url}>
                                                                                <ChevronLeft className="h-3 w-3 rotate-180" />
                                                                            </Link>
                                                                        </Button>
                                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteContent(content.id)}>
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <div className="p-4 flex items-center gap-2 flex-wrap bg-muted/10">
                                                                <span className="text-xs text-muted-foreground font-medium uppercase mr-2">Add Content:</span>
                                                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addContent(module.id, 'text')}>
                                                                    <FileText className="mr-1 h-3 w-3" /> Text
                                                                </Button>
                                                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addContent(module.id, 'video')}>
                                                                    <Video className="mr-1 h-3 w-3" /> Video
                                                                </Button>
                                                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addContent(module.id, 'scorm')}>
                                                                    <FileBox className="mr-1 h-3 w-3" /> SCORM
                                                                </Button>
                                                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addContent(module.id, 'document')}>
                                                                    <File className="mr-1 h-3 w-3" /> Doc
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </Card>
                                    ))}
                                    {course.modules.length === 0 && (
                                        <div className="text-center py-8 rounded-lg border border-dashed border-sidebar-border/70">
                                            <p className="text-sm text-muted-foreground">No modules yet. Start by adding one above.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                                <CardDescription>Control the visibility of this course.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Published</Label>
                                        <p className="text-xs text-muted-foreground">Make this course visible to students.</p>
                                    </div>
                                    <Switch
                                        checked={data.is_published}
                                        onCheckedChange={(checked) => setData('is_published', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Prerequisites</CardTitle>
                                <CardDescription>Courses a student must complete before enrolling.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {allCourses.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No other courses available.</p>
                                    ) : (
                                        <div className="max-h-64 space-y-2 overflow-auto rounded-md border border-sidebar-border/70 p-3">
                                            {allCourses.map((c) => {
                                                const checked = (data.prerequisite_ids as number[]).includes(c.id);
                                                return (
                                                    <label key={c.id} className="flex items-center gap-2 text-sm">
                                                        <Checkbox
                                                            checked={checked}
                                                            onCheckedChange={(next) => {
                                                                const current = data.prerequisite_ids as number[];
                                                                const nextChecked = next === true;
                                                                if (nextChecked) {
                                                                    setData('prerequisite_ids', Array.from(new Set([...current, c.id])));
                                                                } else {
                                                                    setData('prerequisite_ids', current.filter((id) => id !== c.id));
                                                                }
                                                            }}
                                                        />
                                                        <span className="leading-none">{c.title}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {errors.prerequisite_ids && (
                                        <p className="text-sm text-destructive">{errors.prerequisite_ids}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
