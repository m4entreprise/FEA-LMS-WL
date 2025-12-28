<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'description',
        'category',
        'estimated_duration',
        'image_path',
        'is_published',
        'certificate_title',
        'certificate_body',
    ];

    public function modules()
    {
        return $this->hasMany(Module::class)->orderBy('order');
    }

    public function students()
    {
        return $this->belongsToMany(User::class)->withPivot('progress', 'completed_at')->withTimestamps();
    }

    public function prerequisites()
    {
        return $this->belongsToMany(self::class, 'course_prerequisites', 'course_id', 'prerequisite_course_id');
    }

    public function dependentCourses()
    {
        return $this->belongsToMany(self::class, 'course_prerequisites', 'prerequisite_course_id', 'course_id');
    }
}
