import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, Pencil, Trash2, GripVertical, Check, X, Save, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import * as quizzesRoutes from '@/routes/admin/quizzes';
import * as quizQuestionsRoutes from '@/routes/admin/quizzes/questions';
import * as questionsRoutes from '@/routes/admin/questions';
import * as coursesRoutes from '@/routes/admin/courses';

interface Option {
    id?: number;
    text: string;
    is_correct: boolean;
}

interface Question {
    id: number;
    text: string;
    type: 'multiple_choice' | 'true_false' | 'short_answer';
    points: number;
    order: number;
    options: Option[];
}

interface Quiz {
    id: number;
    content_id: number;
    description: string | null;
    passing_score: number;
    time_limit: number | null;
    shuffle_questions: boolean;
    questions: Question[];
    content: {
        id: number;
        title: string;
    };
}

interface Course {
    id: number;
    title: string;
    slug: string;
}

interface Module {
    id: number;
    title: string;
}

interface Props {
    quiz: Quiz;
    course: Course;
    module: Module;
    content: {
        id: number;
        title: string;
    };
}

export default function QuizEdit({ quiz, course, module, content }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Courses',
            href: coursesRoutes.index().url,
        },
        {
            title: course.title,
            href: coursesRoutes.edit(course.id).url,
        },
        {
            title: `Quiz: ${content.title}`,
            href: window.location.href,
        },
    ];

    // Quiz Settings Form
    const settingsForm = useForm({
        description: quiz.description ?? '',
        passing_score: quiz.passing_score ?? 70,
        time_limit: quiz.time_limit ?? '',
        shuffle_questions: quiz.shuffle_questions ?? false,
    });

    const submitSettings = (e: React.FormEvent) => {
        e.preventDefault();
        settingsForm.put(quizzesRoutes.update(quiz.id).url, {
            preserveScroll: true,
        });
    };

    // Question Management
    const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    const questionForm = useForm<{
        text: string;
        type: 'multiple_choice' | 'true_false' | 'short_answer';
        points: number;
        options: Option[];
    }>({
        text: '',
        type: 'multiple_choice',
        points: 10,
        options: [{ text: '', is_correct: false }, { text: '', is_correct: false }],
    });

    // Reset form when dialog opens/closes or mode changes
    useEffect(() => {
        if (!isQuestionDialogOpen) {
            questionForm.reset();
            setEditingQuestion(null);
        }
    }, [isQuestionDialogOpen]);

    const openCreateQuestion = () => {
        setEditingQuestion(null);
        questionForm.setData({
            text: '',
            type: 'multiple_choice',
            points: 10,
            options: [{ text: '', is_correct: false }, { text: '', is_correct: false }],
        });
        setIsQuestionDialogOpen(true);
    };

    const openEditQuestion = (question: Question) => {
        setEditingQuestion(question);
        questionForm.setData({
            text: question.text,
            type: question.type,
            points: question.points,
            options: question.options.map(o => ({ id: o.id, text: o.text, is_correct: !!o.is_correct })),
        });
        setIsQuestionDialogOpen(true);
    };

    const handleQuestionTypeChange = (value: 'multiple_choice' | 'true_false' | 'short_answer') => {
        let newOptions = [...questionForm.data.options];
        
        if (value === 'true_false') {
            newOptions = [
                { text: 'True', is_correct: true },
                { text: 'False', is_correct: false }
            ];
        } else if (value === 'short_answer') {
            newOptions = [];
        } else if (value === 'multiple_choice' && newOptions.length < 2) {
            newOptions = [
                { text: '', is_correct: false },
                { text: '', is_correct: false }
            ];
        }

        questionForm.setData({
            ...questionForm.data,
            type: value,
            options: newOptions
        });
    };

    const addOption = () => {
        questionForm.setData('options', [
            ...questionForm.data.options,
            { text: '', is_correct: false }
        ]);
    };

    const removeOption = (index: number) => {
        const newOptions = [...questionForm.data.options];
        newOptions.splice(index, 1);
        questionForm.setData('options', newOptions);
    };

    const updateOption = (index: number, field: keyof Option, value: any) => {
        const newOptions = [...questionForm.data.options];
        newOptions[index] = { ...newOptions[index], [field]: value };
        questionForm.setData('options', newOptions);
    };

    const submitQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingQuestion) {
            questionForm.put(questionsRoutes.update(editingQuestion.id).url, {
                onSuccess: () => setIsQuestionDialogOpen(false),
            });
        } else {
            questionForm.post(quizQuestionsRoutes.store(quiz.id).url, {
                onSuccess: () => setIsQuestionDialogOpen(false),
            });
        }
    };

    const deleteQuestion = (question: Question) => {
        if (confirm('Are you sure you want to delete this question?')) {
            router.delete(questionsRoutes.destroy(question.id).url);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Quiz - ${content.title}`} />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <a href={coursesRoutes.edit(course.id).url}>
                                <ArrowLeft className="h-4 w-4" />
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold">Quiz: {content.title}</h1>
                            <p className="text-sm text-muted-foreground">{module.title} • {course.title}</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Questions Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Questions</CardTitle>
                                    <CardDescription>Manage the questions for this quiz.</CardDescription>
                                </div>
                                <Button onClick={openCreateQuestion} size="sm">
                                    <Plus className="mr-2 h-4 w-4" /> Add Question
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {quiz.questions.length === 0 ? (
                                    <div className="text-center py-12 border border-dashed rounded-lg">
                                        <p className="text-muted-foreground">No questions yet. Add one to get started.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {quiz.questions.map((question, index) => (
                                            <div key={question.id} className="flex items-start justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors group">
                                                <div className="flex gap-3">
                                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                                        {index + 1}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="font-medium leading-none">{question.text}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                            <Badge variant="outline" className="text-[10px] uppercase">
                                                                {question.type.replace('_', ' ')}
                                                            </Badge>
                                                            <span>{question.points} pts</span>
                                                            <span>• {question.options.length} options</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditQuestion(question)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteQuestion(question)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Settings Column */}
                    <div className="space-y-6">
                        <form onSubmit={submitSettings}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Settings</CardTitle>
                                    <CardDescription>Configure quiz parameters.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={settingsForm.data.description}
                                            onChange={(e) => settingsForm.setData('description', e.target.value)}
                                            placeholder="Instructions for the student..."
                                            rows={3}
                                        />
                                        {settingsForm.errors.description && <p className="text-sm text-destructive">{settingsForm.errors.description}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="passing_score">Passing Score (%)</Label>
                                            <Input
                                                id="passing_score"
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={settingsForm.data.passing_score}
                                                onChange={(e) => settingsForm.setData('passing_score', parseInt(e.target.value) || 0)}
                                            />
                                            {settingsForm.errors.passing_score && <p className="text-sm text-destructive">{settingsForm.errors.passing_score}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="time_limit">Time Limit (min)</Label>
                                            <Input
                                                id="time_limit"
                                                type="number"
                                                min="0"
                                                placeholder="None"
                                                value={settingsForm.data.time_limit}
                                                onChange={(e) => settingsForm.setData('time_limit', e.target.value)}
                                            />
                                            {settingsForm.errors.time_limit && <p className="text-sm text-destructive">{settingsForm.errors.time_limit}</p>}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border rounded-lg p-3">
                                        <Label htmlFor="shuffle_questions" className="cursor-pointer">Shuffle Questions</Label>
                                        <Switch
                                            id="shuffle_questions"
                                            checked={settingsForm.data.shuffle_questions}
                                            onCheckedChange={(checked) => settingsForm.setData('shuffle_questions', checked)}
                                        />
                                    </div>
                                </CardContent>
                                <div className="p-6 pt-0 flex justify-end">
                                    <Button type="submit" disabled={settingsForm.processing}>
                                        {settingsForm.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Settings
                                    </Button>
                                </div>
                            </Card>
                        </form>
                    </div>
                </div>
            </div>

            {/* Question Dialog */}
            <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add Question'}</DialogTitle>
                        <DialogDescription>
                            Create or modify a question for this quiz.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitQuestion} className="space-y-6 py-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="q_text">Question Text</Label>
                                <Input
                                    id="q_text"
                                    value={questionForm.data.text}
                                    onChange={(e) => questionForm.setData('text', e.target.value)}
                                    placeholder="e.g. What is the capital of France?"
                                    required
                                />
                                {questionForm.errors.text && <p className="text-sm text-destructive">{questionForm.errors.text}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="q_points">Points</Label>
                                <Input
                                    id="q_points"
                                    type="number"
                                    min="1"
                                    value={questionForm.data.points}
                                    onChange={(e) => questionForm.setData('points', parseInt(e.target.value) || 0)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="q_type">Question Type</Label>
                            <Select 
                                value={questionForm.data.type} 
                                onValueChange={(val: any) => handleQuestionTypeChange(val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                    <SelectItem value="true_false">True / False</SelectItem>
                                    <SelectItem value="short_answer">Short Answer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {questionForm.data.type !== 'short_answer' && (
                            <div className="space-y-4 border rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <Label>Options</Label>
                                    {questionForm.data.type === 'multiple_choice' && (
                                        <Button type="button" variant="ghost" size="sm" onClick={addOption}>
                                            <Plus className="mr-2 h-3 w-3" /> Add Option
                                        </Button>
                                    )}
                                </div>
                                
                                <div className="space-y-3">
                                    {questionForm.data.options.map((option, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="flex items-center h-10">
                                                <Checkbox 
                                                    id={`opt_${idx}`}
                                                    checked={option.is_correct}
                                                    onCheckedChange={(checked) => updateOption(idx, 'is_correct', checked)}
                                                />
                                            </div>
                                            <Input
                                                value={option.text}
                                                onChange={(e) => updateOption(idx, 'text', e.target.value)}
                                                placeholder={`Option ${idx + 1}`}
                                                className="flex-1"
                                                required
                                            />
                                            {questionForm.data.type === 'multiple_choice' && questionForm.data.options.length > 2 && (
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(idx)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {questionForm.errors.options && <p className="text-sm text-destructive">{questionForm.errors.options}</p>}
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsQuestionDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={questionForm.processing}>
                                {questionForm.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingQuestion ? 'Update Question' : 'Add Question'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
