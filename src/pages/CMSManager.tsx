import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, Plus, Trash2, Edit3, Image as ImageIcon, Type, Layout, Star, 
  MessageSquare, Loader2, Instagram, Linkedin, Github, Mail, Phone, MapPin,
  Smartphone, Globe, Music, Code2, Rocket, Search, Database
} from 'lucide-react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { addFirestoreDoc, updateFirestoreDoc, deleteFirestoreDoc } from '../lib/cmsHooks';
import ConfirmationModal from '../components/ConfirmationModal';

const iconMap = { Globe, Smartphone, Music, Search, Database, Code2, Rocket, Layout };

export default function CMSManager() {
  const [activeTab, setActiveTab] = useState<'settings' | 'services' | 'portfolio' | 'testimonials' | 'contact' | 'footer'>('settings');
  const [settings, setSettings] = useState<any>({});
  const [services, setServices] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, id: string, collection: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchData = async () => {
    try {
        const [settingsSnap, servicesSnap, portfolioSnap, testimonialsSnap] = await Promise.all([
            getDocs(collection(db, 'settings')),
            getDocs(collection(db, 'services')),
            getDocs(collection(db, 'portfolio')),
            getDocs(collection(db, 'testimonials'))
        ]);
        const sData: any = {};
        settingsSnap.docs.forEach(d => sData[d.data().key] = d.data().value);
        setSettings(sData);
        setServices(servicesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setPortfolio(portfolioSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTestimonials(testimonialsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
        showMessage('Erro ao carregar dados', 'error');
    }
  };

  const validateData = (data: any) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlRegex = /^(https?:\/\/)?([\w.-]+\.[a-z]{2,})(\/\S*)?$/i;

    if (data.contact_email && !emailRegex.test(data.contact_email)) {
      showMessage('E-mail de contato inválido', 'error');
      return false;
    }
    if (data.footer_email && !emailRegex.test(data.footer_email)) {
      showMessage('E-mail do rodapé inválido', 'error');
      return false;
    }
    const urls = ['footer_instagram', 'footer_linkedin', 'footer_github'];
    for (const urlField of urls) {
      if (data[urlField] && !urlRegex.test(data[urlField])) {
        showMessage(`URL ${urlField.replace('footer_', '')} inválida`, 'error');
        return false;
      }
    }
    return true;
  };

  const handleSaveSettings = async () => {
    if (!validateData(settings)) return;
    setLoading(true);
    try {
        const settingsSnap = await getDocs(collection(db, 'settings'));
        for (const [key, value] of Object.entries(settings)) {
            const settingDoc = settingsSnap.docs.find(d => d.data().key === key);
            if (settingDoc) {
                await updateFirestoreDoc('settings', settingDoc.id, { key, value });
            } else {
                await addFirestoreDoc('settings', { key, value });
            }
        }
        showMessage('Configurações salvas!');
    } catch (e) {
        showMessage('Erro ao salvar', 'error');
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (collectionName: string, id: string) => {
    setDeleteConfirm({ isOpen: true, id, collection: collectionName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setLoading(true);
    try {
        await deleteFirestoreDoc(deleteConfirm.collection, deleteConfirm.id);
        fetchData();
        showMessage('Excluído com sucesso!');
    } catch (e) {
        showMessage('Erro ao excluir', 'error');
    } finally {
        setLoading(false);
        setDeleteConfirm(null);
    }
  };

  const handleUpdate = async (collectionName: string, item: any) => {
    setLoading(true);
    try {
        const { id, ...data } = item;
        await updateFirestoreDoc(collectionName, id, data);
        fetchData();
        showMessage('Atualizado com sucesso!');
    } catch (e) {
        showMessage('Erro ao atualizar', 'error');
    } finally {
        setLoading(false);
    }
  };

  const handleCreate = async (collectionName: string, item: any) => {
    setLoading(true);
    try {
        await addFirestoreDoc(collectionName, item);
        fetchData();
        showMessage('Criado com sucesso!');
    } catch (e) {
        showMessage('Erro ao criar', 'error');
    } finally {
        setLoading(false);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingItem({});
    setShowModal(true);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl text-white shadow-2xl ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {message.text}
        </div>
      )}

      <ConfirmationModal 
        isOpen={deleteConfirm?.isOpen || false}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Manter"
      />

      {/* Item Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="glass-card p-10 w-full max-w-lg border-white/10 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-white uppercase tracking-[0.2em]">
                        {editingItem?.id ? 'Editar Registro Master' : 'Novo Registro'}
                    </h3>
                    <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all text-2xl">&times;</button>
                </div>
                
                <form 
                  key={activeTab + (editingItem?.id || 'new')}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    let data: any = Object.fromEntries(formData.entries());
                    
                    // Process features if it's a service
                    if (activeTab === 'services' && typeof data.features === 'string') {
                        data.features = data.features.split('\n').map((f: any) => f.trim()).filter((f: any) => f !== '');
                    }
                    
                    // Add icon if missing for services
                    if (activeTab === 'services' && !data.icon) {
                        data.icon = 'Layout';
                    }

                    if (editingItem?.id) {
                        await handleUpdate(activeTab, { id: editingItem.id, ...data });
                    } else {
                        await handleCreate(activeTab, data);
                    }
                    setShowModal(false);
                  }}
                  className="space-y-6"
                >
                    {activeTab === 'services' && (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Ícone (Nome Lucide)</label>
                                <select name="icon" defaultValue={editingItem?.icon} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                                    <option value="Globe">Globo</option>
                                    <option value="Smartphone">Mobile</option>
                                    <option value="Music">Áudio</option>
                                    <option value="Search">SEO</option>
                                    <option value="Database">Backend</option>
                                    <option value="Code2">Desenvolvimento</option>
                                    <option value="Rocket">Escalabilidade</option>
                                    <option value="Layout">Design</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Título</label>
                                <input name="title" defaultValue={editingItem?.title} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Descrição</label>
                                <textarea name="description" defaultValue={editingItem?.description} required rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Funcionalidades (uma por linha)</label>
                                <textarea name="features" defaultValue={editingItem?.features?.join('\n')} required rows={5} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" placeholder="Desenvolvimento Ágil&#10;Cloud Native&#10;Alta Performance" />
                            </div>
                        </>
                    )}
                    {activeTab === 'portfolio' && (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Título do Projeto</label>
                                <input name="title" defaultValue={editingItem?.title} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Categoria</label>
                                <input name="category" defaultValue={editingItem?.category} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">URL da Imagem</label>
                                <input name="image" defaultValue={editingItem?.image} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Ano</label>
                                <input name="year" defaultValue={editingItem?.year} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                            </div>
                        </>
                    )}
                    {activeTab === 'testimonials' && (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Autor</label>
                                <input name="author" defaultValue={editingItem?.author} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Função</label>
                                <input name="role" defaultValue={editingItem?.role} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Depoimento</label>
                                <textarea name="content" defaultValue={editingItem?.content} required rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                            </div>
                        </>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-white/5 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white/10">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-1 py-4 bg-blue-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-600 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20">
                            {loading ? 'Salvando...' : 'Confirmar Registro Master'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Editor de Conteúdo</h1>
          <p className="text-gray-500 text-sm">Gerencie todos os textos e mídias do site público.</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          {[
            { id: 'settings', label: 'Geral', icon: Type },
            { id: 'contact', label: 'Contato', icon: MessageSquare },
            { id: 'services', label: 'Serviços', icon: Layout },
            { id: 'portfolio', label: 'Portfólio', icon: ImageIcon },
            { id: 'testimonials', label: 'Depoimentos', icon: Star },
            { id: 'footer', label: 'Rodapé', icon: Layout },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-white text-black' : 'text-gray-500 hover:text-white'
              }`}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-8 !rounded-[40px] border-white/10">
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Título do Hero (Use vírgula para destaque)</label>
              <input 
                type="text" 
                value={settings.hero_title || ''} 
                onChange={e => setSettings({ ...settings, hero_title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Subtítulo do Hero</label>
              <textarea 
                rows={3}
                value={settings.hero_subtitle || ''} 
                onChange={e => setSettings({ ...settings, hero_subtitle: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <button 
              onClick={handleSaveSettings}
              disabled={loading}
              className="px-8 py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        )}
        {activeTab === 'contact' && (
          <div className="space-y-6 max-w-2xl">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">E-mail de Contato</label>
                <input 
                  type="email" 
                  value={settings.contact_email || ''} 
                  onChange={e => setSettings({ ...settings, contact_email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Telefone</label>
                <input 
                  type="text" 
                  value={settings.contact_phone || ''} 
                  onChange={e => setSettings({ ...settings, contact_phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Endereço Completo</label>
              <input 
                type="text" 
                value={settings.contact_address || ''} 
                onChange={e => setSettings({ ...settings, contact_address: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Frase de Efeito (Tagline)</label>
              <textarea 
                rows={2}
                value={settings.contact_tagline || ''} 
                onChange={e => setSettings({ ...settings, contact_tagline: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <button 
              onClick={handleSaveSettings}
              disabled={loading}
              className="px-8 py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? 'Salvando...' : 'Salvar Dados de Contato'}
            </button>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="grid gap-6">
            <div className="flex justify-end">
                <button onClick={openCreateModal} className="flex items-center gap-2 px-6 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">
                    <Plus size={14} /> Novo Serviço Master
                </button>
            </div>
            {services.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center p-20 bg-white/5 rounded-[40px] border border-dashed border-white/10 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-600">
                  <Layout size={32} />
                </div>
                <div>
                  <h3 className="text-white font-bold uppercase tracking-widest text-sm">Nenhum serviço cadastrado</h3>
                  <p className="text-gray-500 text-xs mt-1">Comece adicionando seu primeiro serviço para exibição no site.</p>
                </div>
                <button onClick={openCreateModal} className="px-6 py-3 bg-white text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all">
                  Cadastrar Agora
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {services.map((service, idx) => {
                const ServiceIcon = (iconMap as any)[service.icon] || Layout;
                return (
                  <div key={idx} className="group flex gap-6 p-6 bg-white/[0.03] rounded-[32px] border border-white/5 hover:border-blue-500/30 hover:bg-white/5 transition-all duration-300">
                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <ServiceIcon size={28} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-bold text-white text-lg tracking-tight">{service.title}</h3>
                        <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">{service.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {service.features?.slice(0, 4).map((f: string, i: number) => (
                          <span key={i} className="text-[7px] bg-white/5 border border-white/5 px-2 py-0.5 rounded text-gray-500 uppercase font-black tracking-widest">{f}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 justify-center">
                      <button 
                        onClick={() => openEditModal(service)}
                        className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 hover:text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/10 border border-blue-500/20"
                        title="Editar Registro Master"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete('services', service.id)}
                        className="p-3 bg-red-500/5 rounded-2xl text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 flex justify-end">
                <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all">
                    <Plus size={14} /> Novo Projeto
                </button>
            </div>
            {portfolio.map((item, idx) => (
              <div key={idx} className="group relative aspect-video rounded-3xl overflow-hidden bg-zinc-900 border border-white/5">
                <img src={item.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-all" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">{item.category} • {item.year}</p>
                </div>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                      onClick={() => openEditModal(item)}
                      className="p-2 bg-white text-black rounded-lg transition-transform hover:scale-110"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete('portfolio', item.id)}
                    className="p-2 bg-red-500 text-white rounded-lg transition-transform hover:scale-110"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div className="space-y-4">
             <div className="flex justify-end">
                <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all">
                    <Plus size={14} /> Novo Depoimento
                </button>
            </div>
             {testimonials.map((t, idx) => (
              <div key={idx} className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-white/10 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500" />
                    <div>
                      <h4 className="font-bold text-white">{t.author}</h4>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">{t.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditModal(t)}
                      className="p-2 text-gray-500 hover:text-white transition-all"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete('testimonials', t.id)}
                      className="p-2 text-red-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-400 text-sm italic">"{t.content}"</p>
              </div>
             ))}
          </div>
        )}
        {activeTab === 'footer' && (
          <div className="space-y-10 max-w-4xl">
            <div className="grid md:grid-cols-2 gap-10">
              {/* Informações de Contato do Rodapé */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Mail size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Informações de Contato</h3>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Texto Destaque do Rodapé</label>
                  <textarea 
                    rows={3}
                    placeholder="Ex: Arquitetamos experiências digitais que definem a excelência."
                    value={settings.footer_text || ''} 
                    onChange={e => setSettings({ ...settings, footer_text: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">E-mail Público</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input 
                      type="email"
                      placeholder="hello@diffuse.tech"
                      value={settings.footer_email || ''} 
                      onChange={e => setSettings({ ...settings, footer_email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Telefone de Suporte</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input 
                      type="text"
                      placeholder="+55 11 99999-0000"
                      value={settings.footer_phone || ''} 
                      onChange={e => setSettings({ ...settings, footer_phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Endereço de Escritório</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input 
                      type="text"
                      placeholder="São Paulo, BR"
                      value={settings.footer_address || ''} 
                      onChange={e => setSettings({ ...settings, footer_address: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Redes Sociais */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                    <Instagram size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Presença Digital (URLs)</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Instagram</label>
                  <div className="relative">
                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input 
                      type="url"
                      placeholder="https://instagram.com/diffuse"
                      value={settings.footer_instagram || ''} 
                      onChange={e => setSettings({ ...settings, footer_instagram: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">LinkedIn</label>
                  <div className="relative">
                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input 
                      type="url"
                      placeholder="https://linkedin.com/company/diffuse"
                      value={settings.footer_linkedin || ''} 
                      onChange={e => setSettings({ ...settings, footer_linkedin: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">GitHub</label>
                  <div className="relative">
                    <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input 
                      type="url"
                      placeholder="https://github.com/diffuse"
                      value={settings.footer_github || ''} 
                      onChange={e => setSettings({ ...settings, footer_github: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <button 
                onClick={handleSaveSettings}
                disabled={loading}
                className="px-10 py-5 bg-white text-black rounded-full font-bold uppercase tracking-[0.15em] text-xs flex items-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-xl"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {loading ? 'Processando...' : 'Publicar Alterações no Rodapé'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
