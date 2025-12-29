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
        if (! Schema::hasTable('question_options')) {
            return;
        }

        $addQuestionId = ! Schema::hasColumn('question_options', 'question_id');

        Schema::table('question_options', function (Blueprint $table) use ($addQuestionId) {
            if ($addQuestionId) {
                $table->foreignId('question_id')
                    ->nullable()
                    ->after('id')
                    ->constrained()
                    ->onDelete('cascade');
            }

            if (! Schema::hasColumn('question_options', 'text')) {
                $table->text('text')->nullable();
            }

            if (! Schema::hasColumn('question_options', 'is_correct')) {
                $table->boolean('is_correct')->default(false);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('question_options')) {
            return;
        }

        Schema::table('question_options', function (Blueprint $table) {
            if (Schema::hasColumn('question_options', 'question_id')) {
                $table->dropConstrainedForeignId('question_id');
            }

            if (Schema::hasColumn('question_options', 'text')) {
                $table->dropColumn('text');
            }

            if (Schema::hasColumn('question_options', 'is_correct')) {
                $table->dropColumn('is_correct');
            }
        });
    }
};
