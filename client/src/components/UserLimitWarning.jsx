'use client';

import React from 'react';
import { AlertTriangle, Users, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function UserLimitWarning({ current, limit, plan }) {
  const router = useRouter();
  const percentage = (current / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= limit;

  if (!isNearLimit) return null;

  return (
    <div className={`rounded-lg p-4 mb-4 ${isAtLimit ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-5 h-5 mt-0.5 ${isAtLimit ? 'text-red-600' : 'text-amber-600'}`} />
        <div className="flex-1">
          <h4 className={`font-semibold ${isAtLimit ? 'text-red-900' : 'text-amber-900'}`}>
            {isAtLimit ? 'Kullanıcı Limitine Ulaşıldı!' : 'Kullanıcı Limitine Yaklaşıyorsunuz'}
          </h4>
          <p className={`text-sm mt-1 ${isAtLimit ? 'text-red-700' : 'text-amber-700'}`}>
            {current}/{limit} kullanıcı ({Math.round(percentage)}%)
            {isAtLimit ? ' Yeni kullanıcı eklemek için planınızı yükseltin.' : ' Planınızı yükseltmeyi düşünün.'}
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant={isAtLimit ? 'default' : 'outline'}
              onClick={() => router.push('/dashboard?tab=plans')}
            >
              <ArrowUpRight className="w-4 h-4 mr-1" />
              Planı Yükselt
            </Button>
          </div>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${isAtLimit ? 'bg-red-500' : 'bg-amber-500'}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
