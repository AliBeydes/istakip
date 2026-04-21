'use client';
import { useState } from 'react';
import { Play, X, ArrowRight, Check } from 'lucide-react';

export default function DemoMode({ onClose }) {
  const [step, setStep] = useState(0);
  const [showDemo, setShowDemo] = useState(true);

  const demoSteps = [
    {
      title: 'Görev Yönetimi',
      description: 'Görevlerinizi Kanban panosunda organize edin',
      icon: '📋'
    },
    {
      title: 'Ekip İletişimi',
      description: 'Gerçek zamanlı mesajlaşma ve toplantılar',
      icon: '💬'
    },
    {
      title: 'Dosya Paylaşımı',
      description: 'Dokümanları güvenli bir şekilde paylaşın',
      icon: '📁'
    },
    {
      title: 'Analitikler',
      description: 'Ekip performansını takip edin',
      icon: '📊'
    }
  ];

  const handleNext = () => {
    if (step < demoSteps.length - 1) {
      setStep(step + 1);
    } else {
      setShowDemo(false);
      onClose();
    }
  };

  const handleSkip = () => {
    setShowDemo(false);
    onClose();
  };

  if (!showDemo) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <Play className="w-6 h-6 text-blue-600" />
          <h3 className="text-2xl font-bold text-gray-900">Taskera Demo</h3>
        </div>

        <div className="mb-8">
          <div className="flex gap-2 mb-6">
            {demoSteps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1 rounded-full ${
                  index <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <div className="text-center">
            <div className="text-6xl mb-4">{demoSteps[step].icon}</div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">
              {demoSteps[step].title}
            </h4>
            <p className="text-gray-600 text-lg">
              {demoSteps[step].description}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSkip}
            className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Atla
          </button>
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            {step === demoSteps.length - 1 ? 'Başla' : 'Sonraki'}
            {step < demoSteps.length - 1 && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Kredi kartı gerekmez. 14 gün ücretsiz deneme.
          </p>
        </div>
      </div>
    </div>
  );
}
