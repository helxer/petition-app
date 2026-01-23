<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PetitionVote extends Model
{
    protected $fillable = ['petition_id', 'full_name', 'voted_at'];
    protected $casts = ['voted_at' => 'date'];

    public function petition() {
        return $this->belongsTo(Petition::class, 'petition_id', 'petition_id');
    }
}
