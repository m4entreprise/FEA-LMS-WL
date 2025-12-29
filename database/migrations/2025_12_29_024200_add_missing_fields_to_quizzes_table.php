<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('quizzes')) {
            return;
        }

        Schema::table('quizzes', function (Blueprint $table) {
            if (! Schema::hasColumn('quizzes', 'description')) {
                $table->text('description')->nullable();
            }

            if (! Schema::hasColumn('quizzes', 'passing_score')) {
                $table->integer('passing_score')->default(70);
            }

            if (! Schema::hasColumn('quizzes', 'time_limit')) {
                $table->integer('time_limit')->nullable();
            }

            if (! Schema::hasColumn('quizzes', 'shuffle_questions')) {
                $table->boolean('shuffle_questions')->default(false);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('quizzes')) {
            return;
        }

        Schema::table('quizzes', function (Blueprint $table) {
            if (Schema::hasColumn('quizzes', 'description')) {
                $table->dropColumn('description');
            }

            if (Schema::hasColumn('quizzes', 'passing_score')) {
                $table->dropColumn('passing_score');
            }

            if (Schema::hasColumn('quizzes', 'time_limit')) {
                $table->dropColumn('time_limit');
            }

            if (Schema::hasColumn('quizzes', 'shuffle_questions')) {
                $table->dropColumn('shuffle_questions');
            }
        });
    }
};
