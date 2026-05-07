import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Save, Plus, Trash2, Edit3, Image as ImageIcon, Type, Layout, Star, 
  MessageSquare, Loader2, Instagram, Linkedin, Github, Mail, Phone, MapPin,
  Smartphone, Globe, Music, Code2, Rocket, Search, Database,
  GripVertical
} from 'lucide-react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { addFirestoreDoc, updateFirestoreDoc, deleteFirestoreDoc } from '../lib/cmsHooks';
import ConfirmationModal from '../components/ConfirmationModal';
import MediaLibrary from '../components/MediaLibrary';

const iconMap = { Globe, Smartphone, Music, Search, Database, Code2, Rocket, Layout };

export default function CMSManager() {
  const [activeTab, setActiveTab] = useState<'settings' | 'services' | 'portfolio' | 'testimonials' | 'contact' | 'footer' | 'institucional' | 'navigation' | 'media'>('settings');
  const [navFilter, setNavFilter] = useState<'header' | 'footer' | 'legal'>('header');
  const [showMediaPicker, setShowMediaPicker] = useState<{ isOpen: boolean, targetField: string } | null>(null);
  const [settings, setSettings] = useState<any>({});
  const [services, setServices] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [navigation, setNavigation] = useState<any[]>([]);
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
        const [settingsSnap, servicesSnap, portfolioSnap, testimonialsSnap, navigationSnap] = await Promise.all([
            getDocs(collection(db, 'settings')),
            getDocs(collection(db, 'services')),
            getDocs(collection(db, 'portfolio')),
            getDocs(collection(db, 'testimonials')),
            getDocs(collection(db, 'navigation'))
        ]);
        const sData: any = {};
        settingsSnap.docs.forEach(d => sData[d.data().key] = d.data().value);
        setSettings(sData);
        setServices(servicesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setPortfolio(portfolioSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTestimonials(testimonialsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setNavigation(navigationSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    } catch (e) {
        showMessage('Erro ao carregar dados', 'error');
    }
  };

  const sortedNavigation = [...navigation].sort((a, b) => (a.order || 0) - (b.order || 0));
  const filteredNavigation = sortedNavigation.filter(n => n.type === navFilter);

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

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    if (sourceIndex === destIndex) return;

    const items = Array.from(filteredNavigation);
    const [reorderedItem] = items.splice(sourceIndex, 1);
    items.splice(destIndex, 0, reorderedItem);

    // Optimized batch update local state immediately
    const updatedNavigation = navigation.map(nav => {
      if (nav.type !== navFilter) return nav;
      const indexInFiltered = items.findIndex(i => i.id === nav.id);
      if (indexInFiltered === -1) return nav;
      return { ...nav, order: indexInFiltered };
    });

    setNavigation(updatedNavigation);

    // Persist to Firebase
    setLoading(true);
    try {
      const promises = items.map((item, index) => 
        updateFirestoreDoc('navigation', item.id, { order: index })
      );
      await Promise.all(promises);
      showMessage('Ordem atualizada!');
    } catch (error) {
      console.error("Reorder error:", error);
      showMessage('Erro ao salvar nova ordem', 'error');
      fetchData(); // Rollback
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
                    
                    // Process field types
                    if (data.order !== undefined) data.order = Number(data.order);
                    if (activeTab === 'navigation') {
                        data.isActive = formData.get('isActive') === 'true';
                    }
                    
                    // Process features if it's a service
                    if (activeTab === 'services' && typeof data.features === 'string') {
                        data.features = data.features.split('\n').map((f: any) => f.trim()).filter((f: any) => f !== '');
                    }

                    // Process gallery if it's a portfolio item
                    if (activeTab === 'portfolio' && typeof data.gallery === 'string') {
                        data.gallery = data.gallery.split('\n').map((f: any) => f.trim()).filter((f: any) => f !== '');
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
                    {activeTab === 'navigation' && (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Posição</label>
                                <select name="type" defaultValue={editingItem?.type || navFilter} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                                    <option value="header">Header (Navbar)</option>
                                    <option value="footer">Footer (Navegação)</option>
                                    <option value="legal">Footer (Legal)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Label (Texto do Link)</label>
                                <input name="label" defaultValue={editingItem?.label} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Path (Rota)</label>
                                <input name="path" defaultValue={editingItem?.path} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" placeholder="/sobre" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Ordem</label>
                                <input type="number" name="order" defaultValue={editingItem?.order !== undefined ? editingItem.order : filteredNavigation.length} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                            </div>
                            <div className="flex items-center gap-3 py-2">
                                <input 
                                    type="checkbox" 
                                    name="isActive" 
                                    value="true"
                                    defaultChecked={editingItem?.isActive !== false} 
                                    className="w-4 h-4 bg-white/5 border-white/10 rounded" 
                                />
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Link Ativo</label>
                            </div>
                        </>
                    )}
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
                        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 scrollbar-hide">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Título do Projeto</label>
                                    <input name="title" defaultValue={editingItem?.title} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Slug (URL amigável)</label>
                                    <input name="slug" defaultValue={editingItem?.slug} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" placeholder="meu-projeto-premium" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Categoria</label>
                                    <input name="category" defaultValue={editingItem?.category} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Ano</label>
                                    <input name="year" defaultValue={editingItem?.year} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Imagem de Capa (Principal)</label>
                                <div className="flex gap-2">
                                    <input 
                                        name="image" 
                                        value={editingItem?.image || ''} 
                                        onChange={e => setEditingItem({...editingItem, image: e.target.value})}
                                        required 
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowMediaPicker({ isOpen: true, targetField: 'image' })}
                                        className="px-4 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white"
                                    >
                                        <ImageIcon size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Descrição Resumida (Intro)</label>
                                <textarea name="full_description" defaultValue={editingItem?.full_description} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">O Desafio</label>
                                    <textarea name="challenge_text" defaultValue={editingItem?.challenge_text} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">A Solução</label>
                                    <textarea name="solution_text" defaultValue={editingItem?.solution_text} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Galeria do Projeto (Uma URL de imagem por linha)</label>
                                <textarea name="gallery" defaultValue={editingItem?.gallery?.join('\n')} rows={5} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xs" placeholder="https://...img1.jpg&#10;https://...img2.jpg" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Nome do Cliente</label>
                                    <input name="client_name" defaultValue={editingItem?.client_name} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Depoimento Curto</label>
                                    <input name="client_testimonial" defaultValue={editingItem?.client_testimonial} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                                </div>
                            </div>
                        </div>
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

      {/* Media Picker Modal */}
      {showMediaPicker?.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-4xl h-[80vh] flex flex-col">
            <MediaLibrary 
              isPicker 
              onClose={() => setShowMediaPicker(null)} 
              onSelect={(url) => {
                const target = showMediaPicker.targetField;
                setEditingItem({ ...editingItem, [target]: url });
                setShowMediaPicker(null);
              }}
            />
          </div>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Editor de Conteúdo</h1>
          <p className="text-gray-500 text-sm">Gerencie todos os textos e mídias do site público.</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto max-w-full">
          {[
            { id: 'settings', label: 'Geral', icon: Type },
            { id: 'media', label: 'Mídia', icon: ImageIcon },
            { id: 'navigation', label: 'Menu', icon: Layout },
            { id: 'institucional', label: 'Institucional', icon: Layout },
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
        {activeTab === 'media' && (
          <div className="h-[600px]">
            <MediaLibrary />
          </div>
        )}
        {activeTab === 'navigation' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex gap-4">
                {[
                  { id: 'header', label: 'Navbar' },
                  { id: 'footer', label: 'Footer Nav' },
                  { id: 'legal', label: 'Footer Legal' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setNavFilter(f.id as any)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                      navFilter === f.id ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <button 
                onClick={openCreateModal} 
                className="flex items-center gap-2 px-6 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-blue-500/10"
              >
                <Plus size={14} /> Novo Link
              </button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="navigation-list">
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid gap-3"
                  >
                    {filteredNavigation.length === 0 && (
                      <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                        <p className="text-gray-500 text-xs uppercase tracking-widest">Nenhum link cadastrado nesta seção.</p>
                      </div>
                    )}
                    {filteredNavigation.map((link, index) => {
                      const dProps = {
                        draggableId: String(link.id),
                        index: index,
                        key: String(link.id)
                      };
                      return (
                        <Draggable {...(dProps as any)}>
                          {(provided: any, snapshot: any) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                "flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group transition-all",
                                snapshot.isDragging ? "bg-white/10 border-blue-500/50 shadow-2xl scale-[1.02] z-50" : "hover:border-white/10"
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <div 
                                  {...provided.dragHandleProps}
                                  className="p-2 text-gray-600 hover:text-white cursor-grab active:cursor-grabbing transition-colors"
                                >
                                  <GripVertical size={18} />
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex flex-col items-center justify-center font-bold text-[10px] text-gray-500">
                                  <span className="text-[8px] opacity-40">ORD</span>
                                  {link.order}
                                </div>
                                <div>
                                  <h4 className="text-white font-bold text-sm flex items-center gap-2">
                                    {link.label}
                                    {!link.isActive && <span className="text-[8px] bg-red-500/20 text-red-500 px-1 rounded uppercase">Inativo</span>}
                                  </h4>
                                  <p className="text-[10px] text-gray-500 font-mono italic">{link.path}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => openEditModal(link)} className="p-2 text-gray-500 hover:text-white transition-all"><Edit3 size={16} /></button>
                                <button onClick={() => handleDelete('navigation', link.id)} className="p-2 text-red-500/40 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <p className="text-[10px] text-gray-500 italic text-center uppercase tracking-widest opacity-40">Dica: Arraste os itens para reordenar a navegação.</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Logo Oficial da Agência</label>
              <div className="flex items-center gap-6 p-4 bg-white/[0.02] border border-white/10 rounded-2xl">
                <div className="w-16 h-16 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                  {settings.agency_logo ? (
                    <img src={settings.agency_logo} alt="Logo Preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded flex items-center justify-center font-bold text-white uppercase italic">
                      {settings.agency_name?.charAt(0) || 'D'}
                    </div>
                  )}
                </div>
                <div className="flex-1 flex gap-2">
                  <input 
                    type="text" 
                    value={settings.agency_logo || ''} 
                    onChange={e => setSettings({ ...settings, agency_logo: e.target.value })}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium text-xs"
                    placeholder="URL da logo (PNG transparente recomendado)"
                  />
                  <button 
                    onClick={() => setShowMediaPicker({ isOpen: true, targetField: 'agency_logo' })}
                    className="px-4 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
                  >
                    <ImageIcon size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nome da Agência</label>
                <input 
                  type="text" 
                  value={settings.agency_name || ''} 
                  onChange={e => setSettings({ ...settings, agency_name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Slogan</label>
                <input 
                  type="text" 
                  value={settings.slogan || ''} 
                  onChange={e => setSettings({ ...settings, slogan: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

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

            <div className="pt-6 border-t border-white/5 space-y-6">
              <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest">Configurações de SEO</h3>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Meta Title (Global)</label>
                <input 
                  type="text" 
                  value={settings.seo_title || ''} 
                  onChange={e => setSettings({ ...settings, seo_title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                  placeholder="Ex: Agency | Creative Development"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Meta Description</label>
                <textarea 
                  rows={2}
                  value={settings.seo_description || ''} 
                  onChange={e => setSettings({ ...settings, seo_description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">OG Image URL (SEO Image)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={settings.seo_image || ''} 
                    onChange={e => setSettings({ ...settings, seo_image: e.target.value })}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                    placeholder="https://..."
                  />
                  <button 
                    onClick={() => setShowMediaPicker({ isOpen: true, targetField: 'seo_image' })}
                    className="px-4 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white"
                  >
                    <ImageIcon size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Google Analytics ID</label>
                <input 
                  type="text" 
                  value={settings.analytics_id || ''} 
                  onChange={e => setSettings({ ...settings, analytics_id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                  placeholder="G-XXXXXXX"
                />
              </div>
            </div>

            <button 
              onClick={handleSaveSettings}
              disabled={loading}
              className="px-8 py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? 'Salvando...' : 'Salvar Configurações Gerais'}
            </button>
          </div>
        )}
        {activeTab === 'institucional' && (
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Manifesto (About Title)</label>
              <textarea 
                rows={3}
                value={settings.about_manifesto || ''} 
                onChange={e => setSettings({ ...settings, about_manifesto: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Visão</label>
              <textarea 
                rows={3}
                value={settings.about_vision || ''} 
                onChange={e => setSettings({ ...settings, about_vision: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Missão</label>
              <textarea 
                rows={3}
                value={settings.about_mission || ''} 
                onChange={e => setSettings({ ...settings, about_mission: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">DNA</label>
              <textarea 
                rows={3}
                value={settings.about_dna || ''} 
                onChange={e => setSettings({ ...settings, about_dna: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <button 
              onClick={handleSaveSettings}
              disabled={loading}
              className="px-8 py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? 'Salvando...' : 'Salvar Conteúdo Institucional'}
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
