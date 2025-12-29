import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { CheckCircle2, XCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import * as quizzesRoutes from '@/routes/quizzes';

export interface Option {
    id: number;
    text: string;
}

export interface Question {
    id: number;
    text: string;
    type: 'multiple_choice' | 'true_false' | 'short_answer';
    points: number;
    options: Option[];
}

export interface Attempt {
    id: number;
    score: number;
    passed: boolean;
    created_at: string;
    correct_answers_count?: number;
    answers_count?: number;
}

export interface Quiz {
    id: number;
    title: string;
    description: string | null;
    passing_score: number;
    time_limit: number | null;
    questions: Question[];
    attempts?: Attempt[];
}

interface Props {
    quiz: Quiz;
}

export default function QuizPlayer({ quiz }: Props) {
    const lastAttempt = quiz.attempts && quiz.attempts.length > 0 ? quiz.attempts[0] : null;
    const [hasStarted, setHasStarted] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const requiredPoints = Math.ceil((quiz.passing_score / 100) * totalPoints);
    const lastAttemptPercent = lastAttempt && totalPoints > 0 ? Math.round((lastAttempt.score / totalPoints) * 100) : 0;

    // Form state for answers
    // answers structure: [ { question_id: 1, option_id: 2, text_answer: null }, ... ]
    const { data, setData, post, processing, errors, reset } = useForm<{
        answers: {
            question_id: number;
            option_id?: number;
            text_answer?: string;
        }[]
    }>({
        answers: []
    });

    const handleStart = () => {
        // Initialize answers array with empty entries for each question
        const initialAnswers = quiz.questions.map(q => ({
            question_id: q.id,
            option_id: undefined,
            text_answer: ''
        }));
        setData('answers', initialAnswers);
        setHasStarted(true);
        
        // Optional: Call backend to log start time
        // axios.post(quizzesRoutes.start(quiz.id).url); 
    };

    const handleOptionChange = (questionId: number, optionId: string) => {
        const newAnswers = data.answers.map(a => 
            a.question_id === questionId 
                ? { ...a, option_id: parseInt(optionId), text_answer: undefined } 
                : a
        );
        setData('answers', newAnswers);
    };

    const handleTextChange = (questionId: number, text: string) => {
        const newAnswers = data.answers.map(a => 
            a.question_id === questionId 
                ? { ...a, text_answer: text, option_id: undefined } 
                : a
        );
        setData('answers', newAnswers);
    };

    const submitQuiz = (e: React.FormEvent) => {
        e.preventDefault();
        post(quizzesRoutes.submit(quiz.id).url, {
            onSuccess: () => {
                setHasStarted(false);
                reset();
            },
            preserveScroll: true,
        });
    };

    if (lastAttempt && !hasStarted) {
        const passed = lastAttempt.passed;
        const correctAnswers = lastAttempt.correct_answers_count;
        const totalAnswered = lastAttempt.answers_count;
        const hasAnswerCounts = typeof correctAnswers === 'number' && typeof totalAnswered === 'number';
        return (
            <div className="space-y-6">
                {passed ? (
                    <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-300">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertTitle>Quiz Passed!</AlertTitle>
                        <AlertDescription>
                            {hasAnswerCounts
                                ? `You answered ${correctAnswers} / ${totalAnswered} questions correctly.`
                                : `You scored ${lastAttempt.score} / ${totalPoints} points (${lastAttemptPercent}%).`}
                            <div className="mt-1 text-xs text-muted-foreground">
                                Points: {lastAttempt.score} / {totalPoints}
                            </div>
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Quiz Failed</AlertTitle>
                        <AlertDescription>
                            {hasAnswerCounts
                                ? `You answered ${correctAnswers} / ${totalAnswered} questions correctly.`
                                : `You scored ${lastAttempt.score} / ${totalPoints} points (${lastAttemptPercent}%).`}
                            You need {quiz.passing_score}% ({requiredPoints} points) to pass.
                            <div className="mt-1 text-xs text-muted-foreground">
                                Points: {lastAttempt.score} / {totalPoints}
                            </div>
                        </AlertDescription>
                    </Alert>
                )}
                
                <Card>
                    <CardHeader>
                        <CardTitle>Results History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {quiz.attempts?.map((attempt) => (
                                <div key={attempt.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <Badge variant={attempt.passed ? "default" : "destructive"}>
                                            {attempt.passed ? "Passed" : "Failed"}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(attempt.created_at).toLocaleDateString()} {new Date(attempt.created_at).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="font-semibold">
                                        {attempt.score} pts
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button variant="outline" onClick={handleStart}>Retake Quiz</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // Intro Screen
    if (!hasStarted) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Quiz Instructions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {quiz.description && (
                            <div className="prose dark:prose-invert text-sm">
                                <p>{quiz.description}</p>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>Time Limit: {quiz.time_limit ? `${quiz.time_limit} mins` : 'None'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                <span>Passing Score: {quiz.passing_score}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                <span>Questions: {quiz.questions.length}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleStart} size="lg" className="w-full sm:w-auto">Start Quiz</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // Quiz Questions Form
    return (
        <form onSubmit={submitQuiz} className="space-y-8">
            <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 py-4 border-b">
                <h3 className="text-lg font-semibold">Question {quiz.questions.length} / {quiz.questions.length}</h3>
                {quiz.time_limit && (
                    <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Timer Placeholder
                    </Badge>
                )}
            </div>

            <div className="space-y-6">
                {quiz.questions.map((question, index) => {
                    const answerIndex = data.answers.findIndex(a => a.question_id === question.id);
                    // This shouldn't happen if initialized correctly, but safe fallback
                    if (answerIndex === -1) return null; 
                    
                    const currentAnswer = data.answers[answerIndex];

                    return (
                        <Card key={question.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex items-start gap-3">
                                    <Badge variant="secondary" className="shrink-0 h-6 w-6 flex items-center justify-center rounded-full p-0">
                                        {index + 1}
                                    </Badge>
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-medium leading-relaxed">
                                            {question.text}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">{question.points} points</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {question.type === 'short_answer' ? (
                                    <div className="space-y-2">
                                        <Label htmlFor={`q_${question.id}`} className="sr-only">Your Answer</Label>
                                        <Textarea
                                            id={`q_${question.id}`}
                                            placeholder="Type your answer here..."
                                            value={currentAnswer.text_answer || ''}
                                            onChange={(e) => handleTextChange(question.id, e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                ) : (
                                    <RadioGroup
                                        value={currentAnswer.option_id?.toString()}
                                        onValueChange={(val: string) => handleOptionChange(question.id, val)}
                                        className="space-y-3"
                                    >
                                        {question.options.map((option) => (
                                            <div key={option.id} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                                                <RadioGroupItem value={option.id.toString()} id={`opt_${option.id}`} />
                                                <Label htmlFor={`opt_${option.id}`} className="flex-1 cursor-pointer font-normal">
                                                    {option.text}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setCancelOpen(true)}>
                    Cancel
                </Button>
                <Button type="submit" disabled={processing} size="lg">
                    {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Submit Quiz
                </Button>
            </div>

            <ConfirmDialog
                open={cancelOpen}
                onOpenChange={setCancelOpen}
                title="Cancel quiz?"
                description="Progress will be lost."
                confirmText="Cancel quiz"
                confirmVariant="destructive"
                onConfirm={() => {
                    setHasStarted(false);
                    reset();
                }}
            />
            
            {Object.keys(errors).length > 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Please answer all required questions.
                    </AlertDescription>
                </Alert>
            )}
        </form>
    );
}
