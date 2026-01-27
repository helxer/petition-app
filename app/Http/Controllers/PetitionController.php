<?php

namespace App\Http\Controllers;

use App\Models\Petition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PetitionController extends Controller
{
    public function index(Request $request)
    {
        $petitions = Petition::withCount('voters')
            ->when($request->search, function($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('petition_id', 'like', "%{$search}%");
            })
            ->orderBy('updated_at', 'desc')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Petitions/Index', [
            'petitions' => $petitions,
            'filters' => $request->only(['search'])
        ]);
    }
    public function check(Request $request)
    {
        $request->validate(['petition_id' => 'required|integer']);
        $petitionId = $request->petition_id;

        $petition = Petition::where('petition_id', $petitionId)->first();

        if (!$petition) {
            Petition::create([
                'petition_id' => $petitionId,
                'title' => 'Завантаження даних...',
                'author' => 'Очікування...',
                'description' => 'Дані завантажуються з офіційного сайту...',
                'published_at' => now(),
            ]);

            Artisan::call('petition:parse', ['id' => $petitionId]);
        }

        return redirect()->route('petitions.show', $petitionId);
    }

    public function show(Request $request, $petition_id)
    {
        $petition = Petition::where('petition_id', $petition_id)->firstOrFail();
        $user = auth()->user();

        $voterListStats = null;
        if ($user && $user->voterList) {
            $totalInList = $user->voterList->voters()->count();

            $signedInList = $user->voterList->voters()
                ->whereExists(function ($query) use ($petition_id) {
                    $query->select(DB::raw(1))
                        ->from('petition_voter')
                        ->whereColumn('petition_voter.voter_id', 'voters.id')
                        ->where('petition_voter.petition_id', $petition_id);
                })
                ->count();

            $voterListStats = [
                'signed' => $signedInList,
                'total' => $totalInList,
            ];
        }

        $chartData = $petition->voters()
            ->selectRaw('petition_voter.voted_at as x, count(*) as y')
            ->groupBy('petition_voter.voted_at')
            ->getQuery()
            ->orderBy('x', 'asc')
            ->get();

        $votesQuery = $petition->voters()
            ->withPivot('voted_at')
            ->orderByPivot('voted_at', 'desc')
            ->orderByPivot('id', 'desc');

        if ($request->has('search')) {
            $votesQuery->where('full_name', 'like', '%' . $request->search . '%');
        }

        $latestVotes = $votesQuery->limit(10)->get()->map(function($voter) {
            return [
                'id' => $voter->id,
                'full_name' => $voter->full_name,
                'voted_at' => $voter->pivot->voted_at,
            ];
        });


        $isProcessing = DB::table('jobs')
            ->where('payload', 'like', '%petitionId%:' . $petition_id . '%')
            ->exists();

        return Inertia::render('Petitions/Show', [
            'petition' => $petition,
            'chartData' => $chartData,
            'latestVotes' => $latestVotes,
            'isProcessing' => $isProcessing,
            'voterListStats' => $voterListStats,
            'filters' => $request->only(['search'])
        ]);
    }

    public function refresh($petition_id)
    {
        Artisan::call('petition:parse', ['id' => $petition_id]);

        return back();
    }
}
