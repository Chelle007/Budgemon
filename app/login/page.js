'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useUser } from '../context/UserContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!userLoading && user) {
      router.push('/app');
    }
  }, [user, userLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          if (data.session) {
            router.push('/app');
          } else {
            setMessage('Success! We sent a confirmation email to ' + email + '. Please check your inbox and click the verification link to activate your account.');
          }
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          router.push('/app');
        }
      }
    } catch (err) {
      let errorMessage = 'An error occurred. Please try again.';
      
      if (err.message) {
        if (err.message.includes('Invalid login credentials') || err.message.includes('invalid_credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (err.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before signing in. Check your inbox for the verification email.';
        } else if (err.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (err.message.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (err.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (err.message.includes('Signups not allowed')) {
          errorMessage = 'New signups are currently disabled. Please contact support.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setMessage('Password reset email sent! Check your inbox.');
    } catch (err) {
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (err.message) {
        if (err.message.includes('Invalid email') || err.message.includes('not found')) {
          errorMessage = 'No account found with this email address.';
        } else if (err.message.includes('rate limit')) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="font-sans max-w-md mx-auto h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-green-50 to-green-100 p-8 justify-center items-center">
      <div className="w-32 h-32 rounded-full mb-8 shadow-xl overflow-hidden">
        <Image
          src="/app logo2.png"
          alt="BudgeMon Logo"
          width={128}
          height={128}
          className="object-cover w-full h-full"
        />
      </div>
      <h1 className="text-3xl font-bold text-green-800 mb-2">BudgeMon</h1>
      <p className="text-green-600 mb-8">Your AI Financial Companion</p>

      <div className="w-full max-w-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Full Name"
              className="w-full p-4 rounded-xl border border-green-200 bg-white/80 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            placeholder="Email"
            required
            className="w-full p-4 rounded-xl border border-green-200 bg-white/80 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            placeholder="Password"
            required
            minLength={6}
            className="w-full p-4 rounded-xl border border-green-200 bg-white/80 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-red-700 text-sm font-medium">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {message && (
            <div className="p-4 bg-green-50 border-2 border-green-300 rounded-xl text-green-800 text-sm shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">✅</span>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Account Created!</p>
                  <p className="text-green-700 leading-relaxed">{message}</p>
                  {message.includes('confirmation email') && (
                    <button
                      type="button"
                      onClick={() => {
                        setMessage('');
                        setIsSignUp(false);
                      }}
                      className="mt-3 text-green-700 hover:text-green-800 font-semibold text-sm underline"
                    >
                      Continue to Login →
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setMessage('')}
                  className="text-green-600 hover:text-green-800 flex-shrink-0"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-600 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div className="flex justify-between text-sm text-green-700 mt-4">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="hover:underline"
            disabled={loading}
          >
            Forgot Password?
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setMessage('');
            }}
            className="font-bold hover:underline"
            disabled={loading}
          >
            {isSignUp ? 'Log In' : 'Sign Up!'}
          </button>
        </div>
      </div>
    </div>
  );
}
