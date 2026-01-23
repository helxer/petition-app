<?php

namespace App\Http\Controllers;

use App\Models\Petition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;

class PetitionController extends Controller
{
    public function check(Request $request)
    {
        $request->validate(['petition_id' => 'required|integer']);
        $externalId = $request->petition_id;

        $petition = Petition::where('petition_id', $externalId)->first();

        if (!$petition) {
            Petition::create([
                'petition_id' => $externalId,
                'title' => 'Завантаження даних...',
                'author' => 'Очікування...',
                'description' => 'Дані завантажуються з офіційного сайту...',
                'published_at' => now(),
            ]);

            Artisan::call('petition:parse', ['id' => $externalId]);
        }

        return redirect()->route('petitions.show', $externalId);
    }

    public function show(Request $request, $petition_id)
    {
        $petition = Petition::where('petition_id', $petition_id)->firstOrFail();

        $chartData = $petition->votes()
            ->selectRaw('voted_at, count(*) as count')
            ->groupBy('voted_at')
            ->orderBy('voted_at', 'asc')
            ->get()
            ->map(fn($item) => [
                'x' => $item->voted_at,
                'y' => $item->count
            ]);

        $votesQuery = $petition->votes()->orderBy('voted_at', 'desc')->orderBy('id', 'desc');

        if ($request->has('search')) {
            $votesQuery->where('full_name', 'like', '%' . $request->search . '%');
        }

        $latestVotes = $votesQuery->limit(10)->get();

        return Inertia::render('Petitions/Show', [
            'petition' => $petition,
            'chartData' => $chartData,
            'latestVotes' => $latestVotes,
            'filters' => $request->only(['search'])
        ]);
    }

    public function refresh($petition_id)
    {
        Artisan::call('petition:parse', ['id' => $petition_id]);

        return back();
    }
}
