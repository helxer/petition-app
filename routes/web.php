<?php

use App\Http\Controllers\PetitionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/petitions', [PetitionController::class, 'index'])->name('petitions.index');
Route::post('/petitions/{petition_id}/refresh', [PetitionController::class, 'refresh'])->name('petitions.refresh');
Route::post('/petitions/check', [PetitionController::class, 'check'])->name('petitions.check');
Route::get('/petitions/{petition_id}', [PetitionController::class, 'show'])->name('petitions.show');

//Route::middleware(['auth'])->group(function () {
//});
