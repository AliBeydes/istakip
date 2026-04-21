'use client';

import { useEffect, useState } from 'react';
import { api } from '@/stores/authStore';
import { useSimpleTranslation } from '@/hooks/useSimpleTranslation';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Edit2, 
  ToggleLeft, 
  ToggleRight,
  AlertCircle,
  X
} from 'lucide-react';

export default function AutomationRulesDashboard() {
  const { t } = useSimpleTranslation();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      console.log('Fetching automation rules...');
      const response = await api.get('/automation-rules?workspaceId=1');
      console.log('Automation rules response:', response.data);
      setRules(response.data.rules || []);
    } catch (error) {
      console.error('Error fetching automation rules:', error);
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (ruleId, currentStatus) => {
    try {
      console.log('Toggling rule:', ruleId, 'to', !currentStatus);
      await api.put(`/automation-rules/${ruleId}`, {
        isActive: !currentStatus
      });
      fetchRules();
    } catch (error) {
      console.error('Error toggling rule:', error);
      alert('Kural durumu değiştirilemedi');
    }
  };

  const deleteRule = async (ruleId) => {
    if (!confirm('Bu otomasyon kuralını silmek istediğinize emin misiniz?')) return;
    try {
      console.log('Deleting rule:', ruleId);
      await api.delete(`/automation-rules/${ruleId}`);
      fetchRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
      alert('Kural silinemedi');
    }
  };

  const createRule = async (ruleData) => {
    try {
      console.log('Creating rule:', ruleData);
      await api.post('/automation-rules', {
        ...ruleData,
        workspaceId: '1'
      });
      setShowCreateModal(false);
      fetchRules();
    } catch (error) {
      console.error('Error creating rule:', error);
      alert('Kural oluşturulamadı');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Create Rule Modal Component
  const CreateRuleModal = ({ onClose, onCreate }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      trigger: 'TASK_CREATED',
      action: 'SEND_NOTIFICATION'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onCreate(formData);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Yeni Otomasyon Kuralı</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Otomasyon Kuralları Nedir?</strong><br/>
              Belirli durumlarda otomatik işlemler yapmak için kurallar oluşturun. Örneğin: "Görev tamamlandığında bildirim gönder" veya "Son tarih yaklaştığında e-posta at".
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kural Adı
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Örn: Yeni görev bildirimi"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Kural açıklaması..."
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tetikleyici
              </label>
              <select
                value={formData.trigger}
                onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="TASK_CREATED">Görev Oluşturuldu</option>
                <option value="TASK_COMPLETED">Görev Tamamlandı</option>
                <option value="STATUS_CHANGED">Durum Değişti</option>
                <option value="DUE_DATE_APPROACHING">Son Tarih Yaklaşıyor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Eylem
              </label>
              <select
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="SEND_NOTIFICATION">Bildirim Gönder</option>
                <option value="ASSIGN_USER">Kullanıcı Ata</option>
                <option value="UPDATE_STATUS">Durum Güncelle</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Oluştur
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {showCreateModal && (
        <CreateRuleModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createRule}
        />
      )}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Zap className="w-8 h-8 text-purple-600" />
            Otomasyon Kuralları
          </h2>
          <p className="text-gray-600 mt-1">
            Görevler için otomatik işlemler oluşturun
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          Yeni Kural
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Henüz otomasyon kuralı yok
          </h3>
          <p className="text-gray-600 mb-6">
            Görevleriniz için otomatik işlemler oluşturmaya başlayın
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            İlk Kuralı Oluştur
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`bg-white rounded-xl border p-6 transition-all ${
                rule.isActive ? 'border-purple-200' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {rule.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      rule.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {rule.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{rule.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Tetikleyici: {rule.trigger}
                    </span>
                    <span>→</span>
                    <span>Eylem: {rule.action}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleRule(rule.id, rule.isActive)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    {rule.isActive ? (
                      <ToggleRight className="w-6 h-6 text-purple-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => setEditingRule(rule)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit2 className="w-5 h-5 text-gray-500" />
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
