<?php

namespace App\Console\Commands;

use App\Models\Petition;
use App\Jobs\ProcessPetitionPageJob;
use App\Services\VoterParserService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class ParsePetitionCommand extends Command
{
    protected $signature = 'petition:parse {id=000000}';
    protected $description = 'Повний парсинг петиції: метадані та голоси сторінка за сторінкою';

    public function handle(VoterParserService $parser)
    {
        $petitionId = (int) $this->argument('id');
        $this->info("Початок аналізу петиції #{$petitionId}...");

        $htmlResponse = Http::withHeaders([
            'X-Requested-With' => 'XMLHttpRequest',
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
        ])->get("https://petition.president.gov.ua/petition/{$petitionId}");

        if ($htmlResponse->failed()) {
            $this->error("Не вдалося отримати доступ до головної сторінки петиції.");
            return Command::FAILURE;
        }

        $jsonResponse = Http::withHeaders([
            'X-Requested-With' => 'XMLHttpRequest',
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
        ])->get("https://petition.president.gov.ua/petition/{$petitionId}/votes/1/json");

        if ($jsonResponse->failed()) {
            $this->error("Не вдалося отримати дані голосування (JSON).");
            return Command::FAILURE;
        }

        $data = $jsonResponse->json();
        $meta = $parser->parseMetadata($htmlResponse->body());
        $lastPage = $parser->getLastPage($data['pag_html'] ?? '');

        $existingPetition = Petition::where('petition_id', $petitionId)->first();
        $oldTotalPages = $existingPetition ? $existingPetition->total_pages : 0;
        $oldProcessedPages = $existingPetition ? $existingPetition->processed_pages : 0;

        $petition = Petition::updateOrCreate(
            ['petition_id' => $petitionId],
            array_merge($meta, [
                'total_pages'     => $lastPage,
                'processed_pages' => $oldProcessedPages,
            ])
        );

        $this->info("Петиція: {$petition->title}");
        $this->info("Автор: {$petition->author}");
        $this->info("Голосів на сайті: {$petition->votes_count}");
        $this->info("Знайдено сторінок: $lastPage. Додаю завдання в чергу...");

        if ($oldTotalPages === 0) {
            $this->info("Перший запуск. Додаю всі сторінки ($lastPage)...");
            $pagesToDispatch = range(1, $lastPage);
        } else {
            $frontPages = range(1, min(1, $lastPage));

            $newPages = [];
            if ($lastPage > $oldTotalPages) {
                $newPages = range($oldTotalPages + 1, $lastPage);
                $this->info("Знайдено " . count($newPages) . " нових сторінок.");
            }

            $pagesToDispatch = array_unique(array_merge($frontPages, $newPages));
            sort($pagesToDispatch);
        }

        $bar = $this->output->createProgressBar(count($pagesToDispatch));
        $bar->start();

        foreach ($pagesToDispatch as $page) {
            ProcessPetitionPageJob::dispatch($petitionId, $page)
                ->delay(now()->addSeconds($page * 0.5));

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Готово! Очікуйте на обробку воркером.");

        return Command::SUCCESS;
    }
}
