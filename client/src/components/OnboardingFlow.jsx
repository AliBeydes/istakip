'use client';
import { useState } from 'react';
import { Check, ArrowRight, X } from 'lucide-react';

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const steps = [
    {
      title: 'İlk Görevinizi Oluşturun',
      description: 'Takip etmeniz gereken ilk görevi ekleyin',
      action: 'create_task'
    },
    {
      title: 'Ekip Üyesi Davet Edin',
      description: 'Takımınızı büyütün ve birlikte çalışın',
      action: 'invite_member'
    },
    {
      title: 'Dosya Yükleyin',
      description: 'Proje dosyalarınızı yükleyin',
      action: 'upload_file'
    },
    {
      title: 'Hazır! 🎉',
      description: 'Taskera kullanmaya başlayın',
      action: 'complete'
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setShowOnboarding(false);
    }
  };

  const handleSkip = () => {
    setShowOnboarding(false);
  };

  if (!showOnboarding) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8">
          <div className="flex gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1 rounded-full ${
                  index <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {steps[step].title}
          </h3>
          <p className="text-gray-600">{steps[step].description}</p>
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
            {step === steps.length - 1 ? 'Başla' : 'Devam'}
            {step < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
