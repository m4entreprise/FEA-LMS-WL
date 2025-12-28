<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('certificates/verify/{uuid}', [\App\Http\Controllers\CertificateController::class, 'verify'])->name('certificates.verify');

Route::get('support', function () {
    return Inertia::render('support');
})->name('support');

Route::get('privacy', function () {
    return Inertia::render('privacy');
})->name('privacy');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    Route::get('certificates', [\App\Http\Controllers\CertificateController::class, 'index'])->name('certificates.index');

    Route::get('courses', [\App\Http\Controllers\CourseController::class, 'index'])->name('courses.index');
    Route::post('courses/{course}/enroll', [\App\Http\Controllers\CourseController::class, 'enroll'])->name('courses.enroll');
    Route::get('courses/{course:slug}', [\App\Http\Controllers\CourseController::class, 'show'])->name('courses.show');
    Route::get('courses/{course:slug}/lessons/{content}', [\App\Http\Controllers\LessonController::class, 'show'])->name('lessons.show');
    Route::post('courses/{course:slug}/lessons/{content}/complete', [\App\Http\Controllers\LessonController::class, 'complete'])->name('lessons.complete');

    Route::get('courses/{course:slug}/certificate', [\App\Http\Controllers\CertificateController::class, 'download'])->name('certificates.download');
    
    // SCORM API
    Route::get('scorm/api/{content}', [\App\Http\Controllers\ScormController::class, 'get'])->name('scorm.get');
    Route::post('scorm/api/{content}', [\App\Http\Controllers\ScormController::class, 'put'])->name('scorm.put');

    Route::post('quizzes/{quiz}/start', [\App\Http\Controllers\QuizAttemptController::class, 'start'])->name('quizzes.start');
    Route::post('quizzes/{quiz}/submit', [\App\Http\Controllers\QuizAttemptController::class, 'submit'])->name('quizzes.submit');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('reports/enrollments.csv', [\App\Http\Controllers\Admin\ReportController::class, 'enrollmentsCsv'])->name('reports.enrollments.csv');
    Route::resource('users', \App\Http\Controllers\Admin\UserController::class);
    Route::get('certificates', [\App\Http\Controllers\Admin\CertificateController::class, 'index'])->name('certificates.index');
    Route::get('certificates/{certificate}', [\App\Http\Controllers\Admin\CertificateController::class, 'show'])->name('certificates.show');
    Route::get('question-bank', [\App\Http\Controllers\Admin\QuestionBankController::class, 'index'])->name('question-bank.index');
    Route::post('question-bank/copy', [\App\Http\Controllers\Admin\QuestionBankController::class, 'copy'])->name('question-bank.copy');
    Route::resource('courses', \App\Http\Controllers\Admin\CourseController::class);
    Route::resource('courses.modules', \App\Http\Controllers\Admin\ModuleController::class)->shallow();
    Route::resource('modules.contents', \App\Http\Controllers\Admin\ContentController::class)->shallow();
    Route::resource('quizzes', \App\Http\Controllers\Admin\QuizController::class)->only(['edit', 'update']);
    Route::resource('quizzes.questions', \App\Http\Controllers\Admin\QuestionController::class)->shallow();
});

require __DIR__.'/settings.php';
