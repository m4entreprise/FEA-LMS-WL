<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    protected $fillable = [
        'content_id',
        'description',
        'passing_score',
        'time_limit',
        'shuffle_questions',
    ];

    public function content()
    {
        return $this->belongsTo(Content::class);
    }

    public function questions()
    {
        return $this->hasMany(Question::class)->orderBy('order');
    }

    public function attempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }
}
