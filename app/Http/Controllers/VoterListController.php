<?php

namespace App\Http\Controllers;

use App\Models\Petition;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VoterListController extends Controller
{
    public function manage()
    {
        $user = auth()->user();

        return Inertia::render('VoterList/Manage', [
            'initialPetition' => $user->currentPetition,
            'initialSelectedVoters' => $user->voterList?->voters()
                    ->select('voters.id', 'full_name')
                    ->get() ?? []
        ]);
    }

    public function togglePetition(Request $request)
    {
        $user = $request->user();
        $newId = $request->petition_id;

        if ($newId !== $user->current_petition_id && $user->voterList?->voters()->exists()) {
            $user->voterList->voters()->detach();
        }

        $user->update(['current_petition_id' => $newId]);

        return response()->json(['status' => 'success']);
    }

    public function searchPetitions(Request $request)
    {
        $q = $request->query('q');
        return Petition::where('title', 'like', "%{$q}%")
            ->orWhere('petition_id', 'like', "%{$q}%")
            ->limit(10)
            ->get(['petition_id', 'title']);
    }

    public function clearList(Request $request)
    {
        $request->user()->voterList?->voters()->detach();
        return response()->json(['status' => 'cleared']);
    }

    public function searchVoters(Request $request, $petition_id)
    {
        $search = $request->query('q');
        if (strlen($search) < 3) return response()->json([]);

        $petition = Petition::where('petition_id', $petition_id)->firstOrFail();

        $voters = $petition->voters()
            ->where('full_name', 'like', "%{$search}%")
            ->limit(20)
            ->get(['voters.id', 'full_name']);

        return response()->json($voters);
    }

    public function toggleVoter(Request $request)
    {
        $userList = $request->user()->voterList()->firstOrCreate();
        $voterId = $request->voter_id;

        $exists = $userList->voters()->where('voter_id', $voterId)->exists();

        if ($exists) {
            $userList->voters()->detach($voterId);
            return response()->json(['status' => 'detached']);
        } else {
            $userList->voters()->attach($voterId);
            return response()->json(['status' => 'attached']);
        }
    }

    public function compare($petition_id, $user_id)
    {
        $targetUser = User::findOrFail($user_id);
        $petition = Petition::where('petition_id', $petition_id)->firstOrFail();

        $voters = $targetUser->voterList->voters()
            ->select('voters.id', 'voters.full_name')
            ->get()
            ->map(function ($voter) use ($petition_id) {
                $signature = DB::table('petition_voter')
                    ->where('petition_id', $petition_id)
                    ->where('voter_id', $voter->id)
                    ->first(['voted_at']);

                $voter->is_signed = !is_null($signature);
                $voter->voted_at = $signature ? $signature->voted_at : null;
                return $voter;
            })
            ->sort(function ($a, $b) {
                if ($a->is_signed === $b->is_signed) {
                    if (!$a->is_signed) return 0;
                    return strcmp($b->voted_at, $a->voted_at);
                }
                return $b->is_signed <=> $a->is_signed;
            })
            ->values();

        $compareChartData = $voters->where('is_signed', true)
            ->groupBy('voted_at')
            ->map(function ($group, $date) {
                return [
                    'x' => $date,
                    'y' => $group->count()
                ];
            })
            ->values()
            ->sortBy('x')
            ->values();

        $userNote = DB::table('user_petition_notes')
            ->where('user_id', auth()->id())
            ->where('petition_id', $petition_id)
            ->value('content') ?? '';

        return Inertia::render('VoterList/Compare', [
            'petition' => $petition,
            'targetUser' => $targetUser,
            'voters' => $voters,
            'compareChartData' => $compareChartData,
            'userNote' => $userNote,
            'stats' => [
                'total' => $voters->count(),
                'signed' => $voters->where('is_signed', true)->count(),
            ]
        ]);
    }

    public function leaderboard()
    {
        $user = auth()->user();
        if (!$user->voterList) return redirect()->route('voter-list.manage');

        $voterIds = $user->voterList->voters()->pluck('voters.id');

        $leaderboard = DB::table('petition_voter')
            ->whereIn('voter_id', $voterIds)
            ->join('voters', 'petition_voter.voter_id', '=', 'voters.id')
            ->select(
                'voters.id',
                'voters.full_name',
                DB::raw('count(petition_id) as total_signed')
            )
            ->groupBy('voters.id', 'voters.full_name')
            ->orderBy('total_signed', 'desc')
            ->get();

        return Inertia::render('VoterList/Leaderboard', [
            'leaderboard' => $leaderboard
        ]);
    }

    public function progress()
    {
        $user = auth()->user();
        if (!$user->voterList) return redirect()->route('voter-list.manage');

        $voterIds = $user->voterList->voters()->pluck('voters.id');
        $totalInList = $voterIds->count();

        $progressData = DB::table('petition_voter')
            ->whereIn('voter_id', $voterIds)
            ->join('petitions', 'petition_voter.petition_id', '=', 'petitions.petition_id')
            ->select(
                'petitions.petition_id',
                'petitions.title',
                DB::raw('count(distinct voter_id) as signed_count')
            )
            ->groupBy('petitions.petition_id', 'petitions.title')
            ->orderBy('signed_count', 'asc')
            ->get()
            ->map(function ($item) use ($totalInList) {
                $item->percentage = $totalInList > 0
                    ? round(($item->signed_count / $totalInList) * 100, 1)
                    : 0;
                return $item;
            });

        return Inertia::render('VoterList/Progress', [
            'progressData' => $progressData,
            'totalInList' => $totalInList
        ]);
    }
}
