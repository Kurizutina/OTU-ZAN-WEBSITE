<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials)) {
            return back()->withErrors(['email' => 'These credentials are not valid.']);
        }

        $request->session()->regenerate();

        if (! in_array($request->user()->role, ['owner', 'rider'], true)) {
            Auth::logout();

            return back()->withErrors(['email' => 'This account does not have admin access.']);
        }

        return $request->user()->role === 'rider'
            ? to_route('rider.orders')
            : to_route('admin.orders');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return to_route('home');
    }
}