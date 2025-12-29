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

        if (Schema::hasColumn('quizzes', 'content_id')) {
            return;
        }

        Schema::table('quizzes', function (Blueprint $table) {
            $table->foreignId('content_id')
                ->nullable()
                ->after('id')
                ->constrained()
                ->onDelete('cascade');
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

        if (! Schema::hasColumn('quizzes', 'content_id')) {
            return;
        }

        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('content_id');
        });
    }
};
