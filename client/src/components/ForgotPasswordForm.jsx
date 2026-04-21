'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleTranslation } from '@/hooks/useSimpleTranslation';
import { api } from '@/stores/authStore';
import { toast } from 'sonner';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { t } = useSimpleTranslation();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasyon
    if (!email) {
      setError('Email adresi gereklidir');
      return;
    }

    if (!validateEmail(email)) {
      setError('Geçerli bir email adresi giriniz');
      return;
    }

    setIsLoading(true);

    try {
      // API çağrısı - şifre sıfırlama emaili gönder
      const response = await api.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        setIsSuccess(true);
        toast.success('Şifre sıfırlama linki email adresinize gönderildi!');
      }
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      
      if (error.response?.status === 404) {
        setError('Bu email adresiyle kayıtlı kullanıcı bulunamadı');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Şifre sıfırlama işlemi başarısız oldu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Başarı durumu - email gönderildi
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Başarı İkonu */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Email Gönderildi!
            </h2>

            <p className="text-gray-600 mb-6">
              <span className="font-medium text-gray-900">{email}</span> adresine şifre sıfırlama linki gönderdik.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Not:</strong> Email 15 dakika içinde geçerliliğini yitirecektir. Spam klasörünü de kontrol etmeyi unutmayın.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Giriş Sayfasına Dön
              </button>

              <button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Farklı Email Dene
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Başlık */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-blue-100 mb-4">
              <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Şifrenizi mi Unuttunuz?
            </h2>
            <p className="text-gray-600 text-sm">
              Email adresinizi girin, size şifre sıfırlama linki gönderelim.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none block w-full pl-10 pr-3 py-3 border ${
                    error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 sm:text-sm transition-colors`}
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                />
              </div>

              {error && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
            </div>

            {/* Güvenlik Bilgisi */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-yellow-800">
                  Güvenlik için şifre sıfırlama linki sadece 15 dakika geçerlidir.
                </p>
              </div>
            </div>

            {/* Gönder Butonu */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Gönderiliyor...
                </>
              ) : (
                'Şifre Sıfırlama Linki Gönder'
              )}
            </button>

            {/* Geri Dön Linki */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors flex items-center justify-center"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Giriş sayfasına dön
              </button>
            </div>
          </form>
        </div>

        {/* Yardım Linki */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Yardım mı gerekiyor?{' '}
            <a href="mailto:support@istakip.com" className="font-medium text-blue-600 hover:text-blue-500">
              Destek ekibiyle iletişime geçin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
