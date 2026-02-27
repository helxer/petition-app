<?php

use App\Http\Controllers\PetitionController;
use App\Http\Controllers\VoterListController;
use App\Http\Controllers\FeedbackController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/petitions', [PetitionController::class, 'index'])->name('petitions.index');
Route::post('/petitions/{petition_id}/refresh', [PetitionController::class, 'refresh'])->name('petitions.refresh');
Route::post('/petitions/check', [PetitionController::class, 'check'])->name('petitions.check');
Route::get('/petitions/{petition_id}', [PetitionController::class, 'show'])->name('petitions.show');
Route::get('/petitions/{petition_id}/compare/{user_id}', [VoterListController::class, 'compare'])->name('petitions.compare');

Route::middleware(['auth'])->group(function () {
    Route::get('/my-list/manage', [VoterListController::class, 'manage'])->name('voter-list.manage');
    Route::get('/my-list/leaderboard', [VoterListController::class, 'leaderboard'])->name('voter-list.leaderboard');
    Route::get('/my-list/progress', [VoterListController::class, 'progress'])->name('voter-list.progress');
    Route::get('/api/search-petitions', [VoterListController::class, 'searchPetitions'])->name('api.petitions.search');
    Route::get('/api/petitions/{petition_id}/search-voters', [VoterListController::class, 'searchVoters'])->name('api.voters.search');
    Route::post('/api/my-list/set-petition', [VoterListController::class, 'togglePetition'])->name('api.my-list.toggle-petition');
    Route::post('/api/my-list/toggle', [VoterListController::class, 'toggleVoter'])->name('api.my-list.toggle');
    Route::post('/api/my-list/clear', [VoterListController::class, 'clearList'])->name('api.my-list.clear');
    Route::post('/api/petitions/{petition_id}/note', [PetitionController::class, 'saveNote'])->name('api.petitions.saveNote');
    Route::post('/api/feedback/store', [FeedbackController::class, 'store'])->name('api.feedback.store')->middleware('throttle:3,1');
});
