import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import * as questionBankRoutes from '@/routes/admin/question-bank';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

interface Quiz {
    id: number;
    content: {
        title: string;
        module: {
            title: string;
            course: {
                title: string;
                slug: string;
            };
        };
    };
}

interface Course {
    id: number;
    title: string;
}

interface QuestionOption {
    id: number;
    text: string;
    is_correct: boolean;
}

interface Question {
    id: number;
    text: string;
    type: string;
    points: number;
    quiz: Quiz;
    options: QuestionOption[];
}

interface Props {
    questions: Question[];
    quizzes: Quiz[];
    courses: Course[];
    filters: { q: string; type?: string; course?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Question Bank',
        href: questionBankRoutes.index().url,
    },
];

export default function QuestionBankIndex({ questions, quizzes, courses, filters }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [targetQuizId, setTargetQuizId] = useState<string>('');
    const [type, setType] = useState(filters.type ?? '');
    const [courseId, setCourseId] = useState(filters.course ?? '');

    const targetQuiz = useMemo(() => quizzes.find((z) => String(z.id) === targetQuizId) ?? null, [quizzes, targetQuizId]);

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            questionBankRoutes.index({
                query: {
                    q: q || undefined,
                    type: type || undefined,
                    course: courseId || undefined,
                },
            }).url,
            {},
            { preserveScroll: true },
        );
    };

    const reset = () => {
        setQ('');
        setType('');
        setCourseId('');
        router.get(questionBankRoutes.index().url);
    };

    const copyToQuiz = (questionId: number) => {
        if (!targetQuizId) return;
        router.post(
            questionBankRoutes.copy().url,
            { question_id: questionId, quiz_id: Number(targetQuizId) },
            { preserveScroll: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Question Bank" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Question Bank</h1>
                    <p className="text-sm text-muted-foreground">
                        Search existing questions and copy them into any quiz.
                    </p>
                </div>

                <form onSubmit={submitSearch} className="grid gap-4 rounded-lg border border-sidebar-border/70 bg-card p-4 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <Label htmlFor="q">Search</Label>
                        <Input
                            id="q"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search by question text, course, or quiz title…"
                        />
                    </div>

                    <div>
                        <Label>Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All</SelectItem>
                                <SelectItem value="mcq">MCQ</SelectItem>
                                <SelectItem value="true_false">TF</SelectItem>
                                <SelectItem value="short_answer">Short</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Course</Label>
                        <Select value={courseId} onValueChange={setCourseId}>
                            <SelectTrigger>
                                <SelectValue placeholder="All courses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All</SelectItem>
                                {courses.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Target quiz</Label>
                        <Select value={targetQuizId} onValueChange={setTargetQuizId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a quiz" />
                            </SelectTrigger>
                            <SelectContent>
                                {quizzes.map((quiz) => (
                                    <SelectItem key={quiz.id} value={String(quiz.id)}>
                                        {quiz.content.module.course.title} • {quiz.content.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2 md:col-span-4">
                        <Button type="submit">Search</Button>
                        <Button type="button" variant="outline" onClick={reset}>
                            Reset
                        </Button>
                        {targetQuiz && (
                            <div className="ml-auto text-sm text-muted-foreground">
                                Copy target: <span className="font-medium text-foreground">{targetQuiz.content.title}</span>
                            </div>
                        )}
                    </div>
                </form>

                <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3 font-medium">Question</th>
                                <th className="px-6 py-3 font-medium">Type</th>
                                <th className="px-6 py-3 font-medium">Points</th>
                                <th className="px-6 py-3 font-medium">Source</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                            {questions.map((question) => (
                                <tr key={question.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-foreground line-clamp-2">{question.text}</div>
                                        {question.options?.length ? (
                                            <div className="mt-2 space-y-1 text-xs">
                                                {question.options.slice(0, 6).map((opt) => (
                                                    <div
                                                        key={opt.id}
                                                        className={
                                                            opt.is_correct
                                                                ? 'text-green-600'
                                                                : 'text-muted-foreground'
                                                        }
                                                    >
                                                        {opt.is_correct ? '✓ ' : '• '}
                                                        {opt.text}
                                                    </div>
                                                ))}
                                                {question.options.length > 6 ? (
                                                    <div className="text-muted-foreground">…</div>
                                                ) : null}
                                            </div>
                                        ) : null}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{question.type}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{question.points}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-muted-foreground">
                                            <Link className="hover:underline" href={`/courses/${question.quiz.content.module.course.slug}`}>
                                                {question.quiz.content.module.course.title}
                                            </Link>
                                        </div>
                                        <div className="text-xs text-muted-foreground">{question.quiz.content.title}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button size="sm" onClick={() => copyToQuiz(question.id)} disabled={!targetQuizId}>
                                            Copy to Quiz
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {questions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                                        No questions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
