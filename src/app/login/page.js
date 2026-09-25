'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../utils/authContext'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Loader from '../_components/loader';
import Link from 'next/link';
import { loginUser } from './_actions';
import { ArrowLeft, Mail, Lock, LogIn, AlertCircle, Clock } from 'lucide-react';

export default function Login() {
    const router = useRouter()
    const { user, loading, login } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loginLoading, setLoginLoading] = useState(false)
    const [rateLimitTimer, setRateLimitTimer] = useState(0)

    useEffect(() => {
        let interval;
        if (rateLimitTimer > 0) {
            interval = setInterval(() => {
                setRateLimitTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(interval)
                        return 0
                    }
                    return prev - 1
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [rateLimitTimer]);

    useEffect(() => {
        if (user && !loading) {
            setLoginLoading(true);
            router.push('/dashboard')
        }
    }, [user, loading, router]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (user) {
                router.push('/dashboard')
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [user, router]);

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoginLoading(true)

        try {
            const result = await loginUser(email, password)

            if (!result.success) {
                setError(result.message || 'Invalid email or password')
                if (result.message.includes('Too many login attempts')) {
                    const match = result.message.match(/(\d+)\s*minute/);
                    if (match) {
                        setRateLimitTimer(parseInt(match[1]) * 60);
                    }
                }
                setLoginLoading(false)
                return
            }

            if (result.requiresOTP === false) {
                // User doesn't need OTP, log them in directly
                login(result.user, result.token)
                setLoginLoading(false)
                return
            }

            router.push(`/OTP?email=${encodeURIComponent(result.email)}`)
        } catch (err) {
            setError('Login failed. Please try again.')
            console.error(err)
            setLoginLoading(false)
        }
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return <Loader loading={true} />
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-700 via-green-500 via-teal-400 to-green-400 bg-[length:200%_200%] animate-[gradientMove_10s_ease_infinite] shadow-[inset_0_0_120px_rgba(0,0,0,0.25)]">
            <Loader loading={loginLoading} />
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

                <div className="pt-16 pb-8 px-8 sm:px-10 text-center">
                    <div className="flex justify-center mb-6">
                        <img src="/SANTEH-LOGO/SFC.png" alt="SANTEH Logo" className="h-14 w-auto drop-shadow-md" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome Back
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Sign in to access your Santeh Feeds Corporation ERP
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="px-8 sm:px-10 pb-8 space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Mail className="text-blue-500" />
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                disabled={rateLimitTimer > 0}
                                className={`text-black block w-full px-4 py-3 border rounded-xl shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:ring-opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 hover:border-gray-400 ${error ? 'border-red-500' : 'border-gray-300'}`}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                        >
                            <Lock className="text-blue-500" />
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                disabled={rateLimitTimer > 0}
                                className={`text-black block w-full px-4 py-3 pr-12 border rounded-xl shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:ring-opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 hover:border-gray-400 ${error ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={rateLimitTimer > 0}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-start gap-3 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm font-medium shadow-sm">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {rateLimitTimer > 0 && (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 font-medium">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>Rate limited. Try again in {formatTime(rateLimitTimer)}</span>
                        </div>
                    )}

                    <div className="space-y-4 pt-2">
                        <button
                            type="submit"
                            disabled={loginLoading || rateLimitTimer > 0}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-md disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {rateLimitTimer > 0
                                ? `Try again in ${formatTime(rateLimitTimer)}`
                                : loginLoading
                                ? 'Signing in...'
                                : 'Sign In'
                            }
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push('/signup')}
                            disabled={rateLimitTimer > 0}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-blue-500 rounded-xl shadow-sm text-sm font-semibold text-blue-700 bg-white hover:bg-blue-50 hover:border-blue-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            Request Account
                        </button>
                    </div>

                    <div className="flex items-center justify-center pt-2">
                        <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200">
                            Forgot password?
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
