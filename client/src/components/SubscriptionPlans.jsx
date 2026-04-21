'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { api } from '@/stores/authStore';
import { toast } from 'sonner';
import { Check, Zap, Crown, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PLANS = [
  { id: 'starter', name: 'Başlangıç', price: 490, users: 10, storage: '5 GB', icon: Zap, color: 'from-blue-500 to-blue-600' },
  { id: 'pro', name: 'Profesyonel', price: 1490, users: 50, storage: '50 GB', icon: Crown, color: 'from-violet-500 to-violet-600', popular: true },
  { id: 'enterprise', name: 'Enterprise', price: 4900, users: 'Sınırsız', storage: '500 GB', icon: Building2, color: 'from-amber-500 to-amber-600' }
];

export default function SubscriptionPlans() {
  const [loading, setLoading] = useState(null);
  const [currentPlan, setCurrentPlan] = useState('starter');

  const handleSubscribe = async (planId) => {
    setLoading(planId);
    try {
      await new Promise(r => setTimeout(r, 1000));
      toast.success(`${planId} planına geçiş başlatıldı`);
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Abonelik Planları</h1>
        <p className="text-slate-600">İşTakip ile ekibinizi verimli yönetin</p>
        {currentPlan && (
          <Badge className="mt-4 bg-blue-100 text-blue-700">
            Mevcut: {PLANS.find(p => p.id === currentPlan)?.name}
          </Badge>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan, i) => (
          <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={`h-full ${plan.popular ? 'border-2 border-violet-500 shadow-lg' : ''}`}>
              {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-500">En Popüler</Badge>}
              <CardHeader className={`bg-gradient-to-r ${plan.color} text-white rounded-t-lg`}>
                <plan.icon className="w-8 h-8 mb-2" />
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-3xl font-bold">₺{plan.price}<span className="text-sm font-normal">/ay</span></p>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> {plan.users} kullanıcı</li>
                  <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> {plan.storage} depolama</li>
                  <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> Görev yönetimi</li>
                  <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> 7/24 Destek</li>
                </ul>
                <Button
                  className="w-full"
                  variant={currentPlan === plan.id ? 'outline' : 'default'}
                  disabled={loading === plan.id || currentPlan === plan.id}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {loading === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> :
                   currentPlan === plan.id ? 'Mevcut Plan' : 'Planı Seç'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
