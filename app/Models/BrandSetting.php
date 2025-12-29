<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BrandSetting extends Model
{
    protected $fillable = [
        'name',
        'logo_path',
        'favicon_path',
        'favicon_svg_path',
        'terms_url',
        'privacy_url',
        'support_url',
        'tagline',
        'tagline_fr',
        'description',
        'description_fr',
    ];
}
