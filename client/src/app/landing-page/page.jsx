'use client';
import { useState } from 'react';
import { useSimpleTranslation } from '@/hooks/useSimpleTranslation';
import SimpleLanguageToggle from '@/components/SimpleLanguageToggle';
import DemoMode from '@/components/DemoMode';
import { 
  CheckSquare, 
  MessageSquare, 
  Folder, 
  Users,
  ArrowRight,
  Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { t } = useSimpleTranslation();
  const router = useRouter();
  const [showDemo, setShowDemo] = useState(false);

  const features = [
    {
      icon: CheckSquare,
      title: 'Görev Yönetimi',
      description: 'Kanban, liste ve takvim görünümleri ile görevlerinizi organize edin'
    },
    {
      icon: MessageSquare,
      title: 'Gerçek Zamanlı İletişim',
      description: 'Ekibinizle anında mesajlaşın ve toplantılar düzenleyin'
    },
    {
      icon: Folder,
      title: 'Dosya Yönetimi',
      description: 'Tüm proje dosyalarınızı güvenli bir şekilde saklayın ve paylaşın'
    },
    {
      icon: Users,
      title: 'Ekip İşbirliği',
      description: 'Gruplar ve atamalar ile ekip çalışmasını optimize edin'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {showDemo && <DemoMode onClose={() => setShowDemo(false)} />}
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Taskera</h1>
        <div className="flex items-center gap-4">
          <SimpleLanguageToggle />
          <button 
            onClick={() => router.push('/login')}
            className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            Giriş
          </button>
          <button 
            onClick={() => router.push('/register')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Ücretsiz Dene
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            {t('brand.hero')}
          </h2>
          <p className="text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('brand.sub')}
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => router.push('/register')}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              Ücretsiz Dene
            </button>
            <button 
              onClick={() => setShowDemo(true)}
              className="px-8 py-4 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
              Demo İzle
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Her Şey Tek Yerde
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <feature.icon className="w-8 h-8 text-blue-600 mb-4" />
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Basit Fiyatlandırma
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl border-2 border-gray-200">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                Ücretsiz
              </h4>
              <p className="text-4xl font-bold text-gray-900 mb-4">
                ₺0
              </p>
              <p className="text-gray-600 mb-6">3 kullanıcı</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">1 çalışma alanı</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Sınırsız görev</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">5 GB depolama</span>
                </li>
              </ul>
              <button 
                onClick={() => router.push('/register')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Başla
              </button>
            </div>
            <div className="p-8 rounded-xl border-2 border-blue-600 bg-blue-50">
              <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full mb-4">
                Popüler
              </span>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                Pro
              </h4>
              <p className="text-4xl font-bold text-gray-900 mb-4">
                $29/ay
              </p>
              <p className="text-gray-600 mb-6">Sınırsız kullanıcı</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Sınırsız çalışma alanı</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Gelişmiş analitikler</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">50 GB depolama</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Öncelikli destek</span>
                </li>
              </ul>
              <button 
                onClick={() => router.push('/register')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Başla
              </button>
            </div>
            <div className="p-8 rounded-xl border-2 border-gray-200">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                İşletme
              </h4>
              <p className="text-4xl font-bold text-gray-900 mb-4">
                $79/ay
              </p>
              <p className="text-gray-600 mb-6">Sınırsız kullanıcı</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Her şey Pro planında</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">SSO</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Sınırsız depolama</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">7/24 destek</span>
                </li>
              </ul>
              <button 
                onClick={() => router.push('/register')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Başla
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Hemen Başlayın
          </h3>
          <p className="text-xl text-white/90 mb-8">
            Kredi kartı gerekmez. 14 gün ücretsiz deneme.
          </p>
          <button 
            onClick={() => router.push('/register')}
            className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            Ücretsiz Deneyin
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex justify-between items-center">
            <h4 className="text-2xl font-bold">Taskera</h4>
            <p className="text-gray-400">© 2024 Taskera. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
