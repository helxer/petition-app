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
                $voter->is_signed = DB::table('petition_voter')
                    ->where('petition_id', $petition_id)
                    ->where('voter_id', $voter->id)
                    ->exists();
                return $voter;
            });

        return Inertia::render('VoterList/Compare', [
            'petition' => $petition,
            'targetUser' => $targetUser,
            'voters' => $voters,
            'stats' => [
                'total' => $voters->count(),
                'signed' => $voters->where('is_signed', true)->count(),
            ]
        ]);
    }
}
