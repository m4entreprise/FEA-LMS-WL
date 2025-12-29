<?php

namespace Database\Seeders;

use App\Models\Content;
use App\Models\Course;
use App\Models\Module;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Quiz;
use App\Models\User;
use App\Models\UserProgress;
use App\Services\CourseProgressService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoLmsSeeder extends Seeder
{
    public function run(): void
    {
        $demoUser = User::updateOrCreate(
            ['email' => 'demo@student.com'],
            [
                'name' => 'Demo Student',
                'password' => Hash::make('password'),
                'role' => User::ROLE_STUDENT,
                'email_verified_at' => now(),
            ]
        );

        $courses = [
            [
                'title' => 'FEA Basics: Getting Started',
                'slug' => 'fea-basics-getting-started',
                'description' => 'A complete beginner-friendly training with lessons, a quiz, and a certificate.',
                'category' => 'Onboarding',
                'estimated_duration' => 45,
                'is_published' => true,
                'certificate_title' => 'Certificate of Completion',
                'certificate_body' => 'This certifies that the learner successfully completed the training.',
            ],
            [
                'title' => 'FEA Intermediate: Best Practices',
                'slug' => 'fea-intermediate-best-practices',
                'description' => 'A deeper course with multiple modules and a quiz to validate knowledge.',
                'category' => 'Skills',
                'estimated_duration' => 90,
                'is_published' => true,
                'certificate_title' => 'Certificate of Achievement',
                'certificate_body' => 'Awarded for completing the intermediate training track.',
            ],
            [
                'title' => 'FEA Advanced: Real-World Scenarios',
                'slug' => 'fea-advanced-real-world-scenarios',
                'description' => 'Scenario-based learning with checklists, resources, and final assessment.',
                'category' => 'Advanced',
                'estimated_duration' => 120,
                'is_published' => true,
                'certificate_title' => 'Advanced Certificate',
                'certificate_body' => 'Issued for successfully completing the advanced scenario-based course.',
            ],
        ];

        $createdCourses = [];
        foreach ($courses as $courseData) {
            $createdCourses[$courseData['slug']] = Course::updateOrCreate(
                ['slug' => $courseData['slug']],
                $courseData
            );
        }

        // Make Advanced require Basics to showcase prerequisites gating
        $basics = $createdCourses['fea-basics-getting-started'];
        $advanced = $createdCourses['fea-advanced-real-world-scenarios'];
        $advanced->prerequisites()->syncWithoutDetaching([$basics->id]);

        // Build content for each course (idempotent)
        $this->seedCourseStructure($basics, [
            [
                'title' => 'Welcome & Setup',
                'contents' => [
                    [
                        'title' => 'Welcome',
                        'type' => 'text',
                        'body' => "# Welcome\n\nThis is a demo course.\n\n- Read the lesson\n- Mark it complete\n- Continue\n",
                    ],
                    [
                        'title' => 'Platform tour (video)',
                        'type' => 'video',
                        'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    ],
                ],
            ],
            [
                'title' => 'Knowledge Check',
                'contents' => [
                    [
                        'title' => 'Basics Quiz',
                        'type' => 'quiz',
                        'quiz' => [
                            'description' => 'Quick quiz to validate basics.',
                            'passing_score' => 70,
                            'shuffle_questions' => false,
                            'questions' => [
                                [
                                    'type' => 'multiple_choice',
                                    'text' => 'What should you do after finishing a lesson?',
                                    'points' => 1,
                                    'options' => [
                                        ['text' => 'Mark it as complete', 'is_correct' => true],
                                        ['text' => 'Close the browser', 'is_correct' => false],
                                        ['text' => 'Delete your account', 'is_correct' => false],
                                    ],
                                ],
                                [
                                    'type' => 'true_false',
                                    'text' => 'You can only download a certificate after completing a course.',
                                    'points' => 1,
                                    'options' => [
                                        ['text' => 'True', 'is_correct' => true],
                                        ['text' => 'False', 'is_correct' => false],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ]);

        $intermediate = $createdCourses['fea-intermediate-best-practices'];
        $this->seedCourseStructure($intermediate, [
            [
                'title' => 'Core concepts',
                'contents' => [
                    [
                        'title' => 'Best practices overview',
                        'type' => 'text',
                        'body' => "# Best Practices\n\nThis lesson contains realistic demo content for UI testing.\n",
                    ],
                    [
                        'title' => 'Resource pack (document)',
                        'type' => 'document',
                        'file_path' => null,
                        'body' => null,
                    ],
                ],
            ],
            [
                'title' => 'Validation',
                'contents' => [
                    [
                        'title' => 'Intermediate Quiz',
                        'type' => 'quiz',
                        'quiz' => [
                            'description' => 'Test your knowledge on best practices.',
                            'passing_score' => 70,
                            'shuffle_questions' => true,
                            'questions' => [
                                [
                                    'type' => 'multiple_choice',
                                    'text' => 'Which is a good practice?',
                                    'points' => 2,
                                    'options' => [
                                        ['text' => 'Keep modules organized', 'is_correct' => true],
                                        ['text' => 'Use random slugs', 'is_correct' => false],
                                        ['text' => 'Never write descriptions', 'is_correct' => false],
                                    ],
                                ],
                                [
                                    'type' => 'short_answer',
                                    'text' => 'Type the word "progress" to pass this question.',
                                    'points' => 1,
                                    'options' => [
                                        ['text' => 'progress', 'is_correct' => true],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ]);

        $this->seedCourseStructure($advanced, [
            [
                'title' => 'Scenarios',
                'contents' => [
                    [
                        'title' => 'Scenario #1',
                        'type' => 'text',
                        'body' => "# Scenario #1\n\nFollow the steps and mark complete.\n",
                    ],
                    [
                        'title' => 'Scenario #2',
                        'type' => 'text',
                        'body' => "# Scenario #2\n\nMore demo content.\n",
                    ],
                ],
            ],
            [
                'title' => 'Final assessment',
                'contents' => [
                    [
                        'title' => 'Final Quiz',
                        'type' => 'quiz',
                        'quiz' => [
                            'description' => 'Final assessment quiz.',
                            'passing_score' => 70,
                            'shuffle_questions' => false,
                            'questions' => [
                                [
                                    'type' => 'true_false',
                                    'text' => 'Prerequisites can block access to a course.',
                                    'points' => 1,
                                    'options' => [
                                        ['text' => 'True', 'is_correct' => true],
                                        ['text' => 'False', 'is_correct' => false],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ]);

        // Enroll demo user
        $this->enrollUserIfNeeded($demoUser, $basics);
        $this->enrollUserIfNeeded($demoUser, $intermediate);
        $this->enrollUserIfNeeded($demoUser, $advanced);

        // Progress setup:
        // - Basics: fully completed (100%) so certificates are accessible
        // - Intermediate: partially completed
        // - Advanced: 0% (but prerequisites satisfied because Basics is completed)
        $this->completeCourseForUser($demoUser, $basics);
        $this->partiallyCompleteCourseForUser($demoUser, $intermediate);

        app(CourseProgressService::class)->updateForUserAndCourse($demoUser, $advanced);
    }

    private function seedCourseStructure(Course $course, array $modulesSpec): void
    {
        foreach (array_values($modulesSpec) as $moduleIndex => $moduleSpec) {
            $module = Module::updateOrCreate(
                [
                    'course_id' => $course->id,
                    'order' => $moduleIndex,
                ],
                [
                    'title' => $moduleSpec['title'],
                ]
            );

            foreach (array_values($moduleSpec['contents']) as $contentIndex => $contentSpec) {
                $content = Content::updateOrCreate(
                    [
                        'module_id' => $module->id,
                        'order' => $contentIndex,
                    ],
                    [
                        'title' => $contentSpec['title'],
                        'type' => $contentSpec['type'],
                        'body' => $contentSpec['body'] ?? null,
                        'video_url' => $contentSpec['video_url'] ?? null,
                        'file_path' => $contentSpec['file_path'] ?? null,
                        'scorm_version' => $contentSpec['scorm_version'] ?? null,
                    ]
                );

                if ($content->type === 'quiz' && isset($contentSpec['quiz'])) {
                    $quizSpec = $contentSpec['quiz'];

                    $quiz = Quiz::updateOrCreate(
                        ['content_id' => $content->id],
                        [
                            'description' => $quizSpec['description'] ?? null,
                            'passing_score' => $quizSpec['passing_score'] ?? 70,
                            'time_limit' => $quizSpec['time_limit'] ?? null,
                            'shuffle_questions' => $quizSpec['shuffle_questions'] ?? false,
                        ]
                    );

                    foreach (array_values($quizSpec['questions'] ?? []) as $qIndex => $qSpec) {
                        $question = Question::updateOrCreate(
                            [
                                'quiz_id' => $quiz->id,
                                'order' => $qIndex,
                            ],
                            [
                                'text' => $qSpec['text'],
                                'type' => $qSpec['type'],
                                'points' => $qSpec['points'] ?? 1,
                            ]
                        );

                        $options = $qSpec['options'] ?? [];
                        foreach ($options as $optIndex => $optSpec) {
                            QuestionOption::updateOrCreate(
                                [
                                    'question_id' => $question->id,
                                    'text' => $optSpec['text'],
                                ],
                                [
                                    'is_correct' => (bool) ($optSpec['is_correct'] ?? false),
                                ]
                            );
                        }
                    }
                }
            }
        }
    }

    private function enrollUserIfNeeded(User $user, Course $course): void
    {
        if (! $course->students()->where('user_id', $user->id)->exists()) {
            $course->students()->attach($user->id);
        }
    }

    private function completeCourseForUser(User $user, Course $course): void
    {
        $course->loadMissing(['modules.contents' => function ($q) {
            $q->select('id', 'module_id');
        }]);

        $contentIds = $course->modules->flatMap->contents->pluck('id')->values();

        foreach ($contentIds as $contentId) {
            UserProgress::updateOrCreate(
                ['user_id' => $user->id, 'content_id' => $contentId],
                ['completed_at' => now()]
            );
        }

        app(CourseProgressService::class)->updateForUserAndCourse($user, $course);

        // Ensure completed_at is present even if no contents
        $user->courses()->updateExistingPivot($course->id, [
            'progress' => 100,
            'completed_at' => now(),
        ]);
    }

    private function partiallyCompleteCourseForUser(User $user, Course $course): void
    {
        $course->loadMissing(['modules.contents' => function ($q) {
            $q->select('id', 'module_id');
        }]);

        $contentIds = $course->modules->flatMap->contents->pluck('id')->values();
        $half = (int) max(1, floor($contentIds->count() / 2));

        foreach ($contentIds->take($half) as $contentId) {
            UserProgress::updateOrCreate(
                ['user_id' => $user->id, 'content_id' => $contentId],
                ['completed_at' => now()]
            );
        }

        app(CourseProgressService::class)->updateForUserAndCourse($user, $course);
    }
}
