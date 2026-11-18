'use client';

import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleSuccess: (credential: string) => Promise<void>;
  onGuestLogin: () => Promise<void>;
  isDemo: boolean;
}

export function AuthModal({
  isOpen,
  onClose,
  onGoogleSuccess,
  onGuestLogin,
  isDemo,
}: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (response.credential) {
      try {
        setLoading(true);
        setError(null);
        await onGoogleSuccess(response.credential);
        onClose();
      } catch (err: any) {
        setError(err.message || 'Lỗi khi đăng nhập bằng Google');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGuestClick = async () => {
    try {
      setLoading(true);
      setError(null);
      await onGuestLogin();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi chuyển chế độ khách');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-150 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logo Monogram */}
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-bold text-2xl mx-auto shadow-md">
          F
        </div>

        <h2 className="mt-4 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Đăng nhập vào FinG
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Quản lý tài chính cá nhân tối giản, an toàn và trực quan
        </p>

        {error && (
          <div className="mt-4 p-3 text-xs rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/50 flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Login Component */}
        <div className="mt-6 flex flex-col items-center justify-center gap-3">
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Đăng nhập Google thất bại hoặc bị hủy')}
              useOneTap
              theme="outline"
              shape="pill"
              text="continue_with"
              locale="vi"
            />
          </div>

          <div className="relative w-full my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-zinc-900 px-3 text-zinc-400">hoặc</span>
            </div>
          </div>

          {/* Quick Demo Mode Button */}
          <button
            onClick={handleGuestClick}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{isDemo ? 'Tiếp tục dùng Chế độ Khách (Demo)' : 'Trải nghiệm ngay không cần đăng nhập'}</span>
          </button>
        </div>

        {/* Security badges */}
        <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-left">
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Giao diện minimal, tập trung 100% vào dữ liệu của bạn</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Dữ liệu lưu trữ độc lập theo tài khoản Google cá nhân</span>
          </div>
        </div>
      </div>
    </div>
  );
}
