<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Petition extends Model
{
    protected $fillable = ['petition_id', 'title', 'description', 'author', 'published_at', 'total_pages', 'votes_count'];
    protected $casts = ['published_at' => 'date:Y-m-d',];

    protected $appends = ['total_votes_collected'];

    public function votes() {
        return $this->hasMany(PetitionVote::class, 'petition_id', 'petition_id');
    }

    public function getTotalVotesCollectedAttribute(): int
    {
        return $this->votes()->count();
    }
}
