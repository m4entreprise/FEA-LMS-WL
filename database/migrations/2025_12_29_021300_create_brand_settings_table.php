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
        Schema::create('brand_settings', function (Blueprint $table) {
            $table->id();

            $table->string('name')->nullable();

            $table->string('logo_path')->nullable();
            $table->string('favicon_path')->nullable();
            $table->string('favicon_svg_path')->nullable();

            $table->string('terms_url')->nullable();
            $table->string('privacy_url')->nullable();
            $table->string('support_url')->nullable();

            $table->string('tagline')->nullable();
            $table->string('tagline_fr')->nullable();

            $table->text('description')->nullable();
            $table->text('description_fr')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('brand_settings');
    }
};
