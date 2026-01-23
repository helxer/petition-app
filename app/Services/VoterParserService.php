<?php

namespace App\Services;

use Symfony\Component\DomCrawler\Crawler;
use Carbon\Carbon;

class VoterParserService
{
    public function parseMetadata(string $html): array
    {
        $crawler = new Crawler($html);

        return [
            'title'        => $this->safeText($crawler, 'h1'),
            'description'  => $this->safeText($crawler, '.article'),
            'author'       => $this->extractByLabel($crawler, 'Автор (ініціатор):'),
            'published_at' => $this->parseDate($this->extractByLabel($crawler, 'Дата оприлюднення:')),
            'votes_count'  => $this->parseVotesCount($crawler),
        ];
    }

    private function safeText(Crawler $crawler, string $selector): string
    {
        $node = $crawler->filter($selector);
        return $node->count() > 0 ? trim($node->text()) : '';
    }

    /**
     * Парсимо кількість голосів з блоку .petition_votes_txt
     */
    private function parseVotesCount(Crawler $crawler): int
    {
        $node = $crawler->filter('.petition_votes_txt'); //
        if ($node->count() > 0) {
            // Витягуємо цифри з тексту (напр. "25000 з 25000 необхідних")
            $text = $node->text();
            preg_match('/(\d[\d\s]*)/', $text, $matches);
            return isset($matches[1]) ? (int) str_replace(' ', '', $matches[1]) : 0;
        }
        return 0;
    }

    private function extractByLabel(Crawler $crawler, string $label): string
    {
        $node = $crawler->filter('.pet_date')->reduce(function (Crawler $node) use ($label) {
            return str_contains($node->text(), $label);
        });

        if ($node->count() > 0) {
            $fullText = $node->text();
            return trim(str_replace($label, '', $fullText));
        }

        return '';
    }

    public function parseDate(string $dateString): string
    {
        if (empty($dateString)) return now()->format('Y-m-d');

        $months = [
            'січня' => '01', 'лютого' => '02', 'березня' => '03', 'квітня' => '04',
            'травня' => '05', 'червня' => '06', 'липня' => '07', 'серпня' => '08',
            'вересня' => '09', 'жовтня' => '10', 'листопада' => '11', 'грудня' => '12'
        ];

        $dateString = mb_strtolower(trim($dateString));

        foreach ($months as $name => $num) {
            if (str_contains($dateString, $name)) {
                $dateString = str_replace($name, " $num ", $dateString);
                break;
            }
        }

        try {
            $cleanDate = preg_replace('/[^\d\s]/u', '', $dateString);
            $cleanDate = preg_replace('/\s+/', ' ', trim($cleanDate));
            return Carbon::createFromFormat('j n Y', $cleanDate)->format('Y-m-d');
        } catch (\Exception $e) {
            return now()->format('Y-m-d');
        }
    }

    public function parseVoters(string $json): array
    {
        $data = json_decode($json, true);
        if (!isset($data['table_html'])) return [];

        $crawler = new Crawler($data['table_html']);
        return $crawler->filter('.table_row')->each(function (Crawler $node) {
            return [
                'full_name' => $this->safeText($node, '.name'),
                'voted_at'  => $this->parseDate($this->safeText($node, '.date')),
            ];
        });
    }

    public function getLastPage(string $pagHtml): int
    {
        if (empty($pagHtml)) return 1;
        $crawler = new Crawler($pagHtml);
        $links = $crawler->filter('.pag_link')->extract(['_text']);
        $pages = array_filter($links, fn($val) => is_numeric($val));
        return !empty($pages) ? (int) max($pages) : 1;
    }
}
