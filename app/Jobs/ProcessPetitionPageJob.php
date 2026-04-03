<?php

namespace App\Jobs;

use App\Models\Petition;
use App\Models\Voter;
use App\Services\VoterParserService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\RateLimited;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class ProcessPetitionPageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 10;
    public $backoff = 30;

    public function __construct(
        protected int $petitionId,
        protected int $pageNumber
    ) {}

    public function handle(VoterParserService $parser): void
    {
        \Illuminate\Support\Facades\RateLimiter::attempt(
            'telegram-notifications-manual',
            2,
            function () use ($parser) {
                $petition = Petition::where('petition_id', $this->petitionId)->firstOrFail();

                $pageUrl = "https://petition.president.gov.ua/petition/{$this->petitionId}/votes/{$this->pageNumber}/json";
                $petitionUrl = "https://petition.president.gov.ua/petition/{$this->petitionId}";

                $response = $parser->getWithFailover($pageUrl, $petitionUrl);

                if (!$response || $response->failed()) {
                    Log::error("Failed to fetch page {$this->pageNumber} for petition {$this->petitionId}");
                    $this->release($this->backoff);
                    return;
                }

                $parsedVoters = $parser->parseVoters($response->body());

                $fullNames = collect($parsedVoters)->pluck('full_name')->unique()->toArray();

                Voter::upsert(
                    collect($fullNames)->map(fn($name) => ['full_name' => $name])->toArray(),
                    ['full_name'],
                    ['full_name']
                );

                $votersMap = Voter::whereIn('full_name', $fullNames)->pluck('id', 'full_name');

                $syncData = [];
                foreach ($parsedVoters as $parsedVoter) {
                    $voterId = $votersMap[$parsedVoter['full_name']];
                    $syncData[$voterId] = ['voted_at' => $parsedVoter['voted_at']];
                }

                $petition->voters()->syncWithoutDetaching($syncData);

    //        foreach ($parsedVoters as $parsedVoter) {
    //            $voter = Voter::firstOrCreate(['full_name' => $parsedVoter['full_name']]);
    //
    //            $petition->voters()->syncWithoutDetaching([
    //                $voter->id => ['voted_at' => $parsedVoter['voted_at']]
    //            ]);
    //        }
            },
            10
        ) || (function () {
            sleep(10);
            $this->handle();
        })();

    }
}
