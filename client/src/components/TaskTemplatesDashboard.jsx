'use client';

import { useEffect, useState } from 'react';
import { api } from '@/stores/authStore';
import { useSimpleTranslation } from '@/hooks/useSimpleTranslation';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit2, 
  Copy,
  CheckSquare,
  Clock,
  Users,
  X
} from 'lucide-react';

export default function TaskTemplatesDashboard() {
  const { t } = useSimpleTranslation();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      console.log('Fetching task templates...');
      const response = await api.get('/task-templates?workspaceId=1');
      console.log('Task templates response:', response.data);
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = async (templateId) => {
    try {
      console.log('Using template:', templateId);
      const response = await api.post(`/task-templates/${templateId}/create-task`, {
        workspaceId: '1'
      });
      console.log('Template used successfully:', response.data);
      alert('Görev şablondan başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Error using template:', error);
      alert('Görev oluşturulurken bir hata oluştu');
    }
  };

  const deleteTemplate = async (templateId) => {
    if (!confirm('Bu şablonu silmek istediğinize emin misiniz?')) return;
    try {
      console.log('Deleting template:', templateId);
      await api.delete(`/task-templates/${templateId}`);
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Şablon silinemedi');
    }
  };

  const createTemplate = async (templateData) => {
    try {
      console.log('Creating template:', templateData);
      await api.post('/task-templates', {
        ...templateData,
        workspaceId: '1'
      });
      setShowCreateModal(false);
      fetchTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Şablon oluşturulamadı');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Create Template Modal Component
  const CreateTemplateModal = ({ onClose, onCreate }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      defaultTitle: '',
      defaultDescription: '',
      defaultPriority: 'MEDIUM',
      estimatedHours: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onCreate(formData);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Yeni Görev Şablonu</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-indigo-800">
              <strong>💡 Görev Şablonları Nedir?</strong><br/>
              Tekrarlayan görevler için hazır şablonlar oluşturun. Örneğin haftalık raporlar, standart kontrol listeleri veya rutin bakım görevleri için şablon kullanabilirsiniz.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şablon Adı
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Örn: Haftalık Rapor"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Şablon açıklaması..."
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Varsayılan Başlık
              </label>
              <input
                type="text"
                value={formData.defaultTitle}
                onChange={(e) => setFormData({ ...formData, defaultTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Görev başlığı..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Varsayılan Açıklama
              </label>
              <textarea
                value={formData.defaultDescription}
                onChange={(e) => setFormData({ ...formData, defaultDescription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Görev açıklaması..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Öncelik
                </label>
                <select
                  value={formData.defaultPriority}
                  onChange={(e) => setFormData({ ...formData, defaultPriority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="LOW">Düşük</option>
                  <option value="MEDIUM">Orta</option>
                  <option value="HIGH">Yüksek</option>
                  <option value="URGENT">Acil</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tahmini Süre (saat)
                </label>
                <input
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="2"
                />
              </div>
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
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
        <CreateTemplateModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createTemplate}
        />
      )}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-600" />
            Görev Şablonları
          </h2>
          <p className="text-gray-600 mt-1">
            Tekrarlayan görevler için şablonlar oluşturun
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5" />
          Yeni Şablon
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Henüz şablon yok
          </h3>
          <p className="text-gray-600 mb-6">
            Tekrarlayan görevler için şablonlar oluşturun
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            İlk Şablonu Oluştur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => useTemplate(template.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Şablonu Kullan"
                  >
                    <Copy className="w-5 h-5 text-gray-500" />
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {template.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {template.description || 'Açıklama yok'}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                {template.defaultPriority && (
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-4 h-4" />
                    Öncelik: {template.defaultPriority}
                  </span>
                )}
                {template.estimatedHours && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {template.estimatedHours} saat
                  </span>
                )}
              </div>

              <button
                onClick={() => useTemplate(template.id)}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Şablonu Kullan
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
