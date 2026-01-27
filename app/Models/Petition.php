<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Petition extends Model
{
    protected $fillable = ['petition_id', 'title', 'description', 'author', 'published_at', 'total_pages', 'votes_count'];
    protected $casts = ['published_at' => 'date:Y-m-d',];

    protected $appends = ['total_votes_collected'];

    public function voters()
    {
        return $this->belongsToMany(
            Voter::class,
            'petition_voter',
            'petition_id',
            'voter_id',
            'petition_id',
            'id'
        )->withPivot('voted_at');
    }

    public function getTotalVotesCollectedAttribute(): int
    {
        return $this->voters()->count();
    }
}
