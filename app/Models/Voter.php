<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voter extends Model
{
    protected $fillable = ['full_name'];

    public function petitions()
    {
        return $this->belongsToMany(Petition::class, 'petition_voter', 'voter_id', 'petition_id')
            ->withPivot('voted_at');
    }
}
