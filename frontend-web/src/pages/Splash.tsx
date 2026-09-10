import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';
import { Sparkles } from 'lucide-react';

export const Splash: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          navigate('/');
        } else {
          navigate('/login');
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center font-black text-5xl text-white shadow-2xl shadow-blue-500/30 animate-bounce-short">
          B
        </div>
        <Sparkles className="w-8 h-8 text-amber-400 absolute -top-2 -right-2 animate-pulse" />
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">
        BINGO
      </h1>
      <p className="text-slate-400 mt-2 text-sm font-medium tracking-wide">
        REAL-TIME MULTIPLAYER
      </p>

      <div className="mt-8 flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
        <span className="text-xs text-slate-500 font-mono">Loading game engine...</span>
      </div>
    </div>
  );
};
