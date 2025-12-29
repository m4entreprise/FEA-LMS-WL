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
        if (! Schema::hasTable('questions')) {
            return;
        }

        $addQuizId = ! Schema::hasColumn('questions', 'quiz_id');

        Schema::table('questions', function (Blueprint $table) use ($addQuizId) {
            if ($addQuizId) {
                $table->foreignId('quiz_id')
                    ->nullable()
                    ->after('id')
                    ->constrained()
                    ->onDelete('cascade');
            }

            if (! Schema::hasColumn('questions', 'text')) {
                $table->text('text')->nullable();
            }

            if (! Schema::hasColumn('questions', 'type')) {
                $table->string('type')->nullable();
            }

            if (! Schema::hasColumn('questions', 'points')) {
                $table->integer('points')->default(1);
            }

            if (! Schema::hasColumn('questions', 'order')) {
                $table->integer('order')->default(0);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('questions')) {
            return;
        }

        Schema::table('questions', function (Blueprint $table) {
            if (Schema::hasColumn('questions', 'quiz_id')) {
                $table->dropConstrainedForeignId('quiz_id');
            }

            if (Schema::hasColumn('questions', 'text')) {
                $table->dropColumn('text');
            }

            if (Schema::hasColumn('questions', 'type')) {
                $table->dropColumn('type');
            }

            if (Schema::hasColumn('questions', 'points')) {
                $table->dropColumn('points');
            }

            if (Schema::hasColumn('questions', 'order')) {
                $table->dropColumn('order');
            }
        });
    }
};
