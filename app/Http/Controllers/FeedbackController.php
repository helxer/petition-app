<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeedbackController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'message' => 'required|string|min:5|max:2000',
            'rating' => 'nullable|integer|min:1|max:5'
        ]);

        DB::table('feedbacks')->insert([
            'user_id' => auth()->id(),
            'message' => strip_tags($request->message),
            'rating' => $request->rating,
            'page_url' => $request->input('page_url', url()->previous()),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Дякуємо! Ваш відгук отримано.']);
    }
}
