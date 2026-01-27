<?php

namespace App\Jobs;

use App\Models\Petition;
use App\Models\Voter;
use App\Services\VoterParserService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProcessPetitionPageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = 60;

    public function __construct(
        protected int $petitionId,
        protected int $pageNumber
    ) {}

    public function handle(VoterParserService $parser): void
    {
        $petition = Petition::where('petition_id', $this->petitionId)->firstOrFail();

        $url = "https://petition.president.gov.ua/petition/{$this->petitionId}/votes/{$this->pageNumber}/json";

        $response = Http::withHeaders([
            'X-Requested-With' => 'XMLHttpRequest',
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
        ])->get($url);

        if ($response->failed()) {
            Log::error("Failed to fetch page {$this->pageNumber} for petition {$this->petitionId}");
            $this->release($this->backoff);
            return;
        }

        $parsedVoters = $parser->parseVoters($response->body());

//        $fullNames = collect($parsedVoters)->pluck('full_name')->unique()->toArray();
//
//        Voter::upsert(
//            collect($fullNames)->map(fn($name) => ['full_name' => $name])->toArray(),
//            ['full_name'],
//            ['full_name']
//        );
//
//        $votersMap = Voter::whereIn('full_name', $fullNames)->pluck('id', 'full_name');
//
//        if ($votersMap->count() !== $parsedVotersCount) {
//            Log::warning("Failed to sync voters for petition {$this->petitionId} | {$parsedVotersCount} | {$votersMap->count()}", [
//                'parsedVoters' => $parsedVoters,
//                'votersMap' => $votersMap
//            ]);
//        }
//
//        $syncData = [];
//        foreach ($parsedVoters as $parsedVoter) {
//            $voterId = $votersMap[$parsedVoter['full_name']];
//            $syncData[$voterId] = ['voted_at' => $parsedVoter['voted_at']];
//        }
//
//        $petition->voters()->syncWithoutDetaching($syncData);


//        foreach ($parsedVoters as $parsedVoter) {
//
//            $voter = Voter::firstOrCreate(['full_name' => $parsedVoter['full_name']]);
//
//            $petition->voters()->syncWithoutDetaching([
//                $voter->id => ['voted_at' => $parsedVoter['voted_at']]
//            ]);
//        }


        foreach ($parsedVoters as $parsedVoter) {

            $originalName = $parsedVoter['full_name'];
            $nameToSearch = $originalName;

            while (true) {
                $voter = Voter::where('full_name', $nameToSearch)->first();

                if ($voter) {
                    $alreadySigned = $petition->voters()
                        ->where('voter_id', $voter->id)
                        ->exists();

                    if ($alreadySigned) {
                        $nameToSearch = "_" . $nameToSearch;
                        continue;
                    }
                } else {
                    $voter = Voter::create(['full_name' => $nameToSearch]);
                }

                break;
            }

            $petition->voters()->syncWithoutDetaching([
                $voter->id => ['voted_at' => $parsedVoter['voted_at']]
            ]);
        }
    }
}
