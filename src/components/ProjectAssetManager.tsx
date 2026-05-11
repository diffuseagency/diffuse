import React, { useState, useEffect, useRef } from 'react';
import { storage, db } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Upload, File, Trash2, X, Loader2, CheckCircle2, MessageSquare, Send, UserCircle, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

interface Asset {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

interface ProjectAssetManagerProps {
  project: any;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ProjectAssetManager({ project, onClose, onUpdate }: ProjectAssetManagerProps) {
  const [activeTab, setActiveTab] = useState<'files' | 'chat'>('files');
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
        scrollToBottom();
    }
  }, [messages, activeTab]);

  useEffect(() => {
    if (!project.id) return;

    const messagesQuery = query(
      collection(db, `projects/${project.id}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [project.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !project.id) return;

    setSending(true);
    try {
      await addDoc(collection(db, `projects/${project.id}/messages`), {
        text: newMessage,
        senderId: 'admin',
        senderName: 'Diffuse Admin',
        senderPhoto: '', 
        createdAt: serverTimestamp(),
        type: 'admin'
      });
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatus('uploading');
    setProgress(0);

    const assetId = Math.random().toString(36).substring(7);
    const storageRef = ref(storage, `projects/${project.id}/${assetId}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(p);
      }, 
      (error) => {
        console.error("Upload error:", error);
        setStatus('error');
        setUploading(false);
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const newAsset: Asset = {
          id: assetId,
          name: file.name,
          url: downloadURL,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        };

        try {
          const projectRef = doc(db, 'projects', project.id);
          await updateDoc(projectRef, {
            assets: arrayUnion(newAsset)
          });
          setStatus('success');
          setTimeout(() => {
            setStatus('idle');
            setUploading(false);
            onUpdate();
          }, 2000);
        } catch (error) {
          console.error("Firestore update error:", error);
          setStatus('error');
          setUploading(false);
        }
      }
    );
  };

  const handleDelete = async (asset: Asset) => {
    if (!confirm(`Deseja excluir o arquivo ${asset.name}?`)) return;

    try {
      // 1. Delete from Storage
      // We need to parse the path from URL or somehow store the path. 
      // For simplicity here, we assume the path structure.
      const storageRef = ref(storage, `projects/${project.id}/${asset.id}_${asset.name}`);
      await deleteObject(storageRef);

      // 2. Remove from Firestore
      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, {
        assets: arrayRemove(asset)
      });
      
      onUpdate();
    } catch (error) {
      console.error("Error deleting asset:", error);
      alert("Erro ao excluir arquivo.");
    }
  };

  const handleRequestApproval = async (asset: Asset) => {
    try {
      const notificationRef = collection(db, 'notifications');
      await addDoc(notificationRef, {
        clientId: project.client_id || '', 
        clientEmail: project.client_email,
        projectId: project.id,
        projectTitle: project.title,
        assetId: asset.id,
        assetName: asset.name,
        type: 'approval_request',
        status: 'pending',
        timestamp: serverTimestamp(),
        message: `A Diffuse solicitou a aprovação do arquivo: ${asset.name}`
      });
      
      const projectRef = doc(db, 'projects', project.id);
      const currentAssets = project.assets || [];
      const updatedAssets = currentAssets.map((a: any) => 
          a.id === asset.id ? { ...a, status: 'pending_approval' } : a
      );
      
      await updateDoc(projectRef, { assets: updatedAssets });
      
      alert(`Solicitação de aprovação enviada para ${asset.name}`);
      onUpdate();
    } catch (err) {
      console.error("Error requesting approval:", err);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 w-full max-w-2xl border-white/10 shadow-2xl relative"
      >
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-[0.2em]">Gestão do Projeto</h3>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1 font-bold">Cliente: {project.client_name}</p>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
                onClick={() => setActiveTab('files')}
                className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                    activeTab === 'files' ? "bg-white text-black" : "text-gray-500 hover:text-white"
                )}
            >
                Arquivos
            </button>
            <button 
                onClick={() => setActiveTab('chat')}
                className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                    activeTab === 'chat' ? "bg-white text-black" : "text-gray-500 hover:text-white"
                )}
            >
                Mensagens {messages.length > 0 && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
            </button>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {activeTab === 'files' ? (
            <>
                {/* Upload Area */}
                <div className="mb-10">
                    <label className={`
                        flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-[32px] cursor-pointer transition-all
                        ${status === 'uploading' ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}
                    `}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {status === 'idle' && (
                                <>
                                    <Upload className="w-8 h-8 mb-3 text-gray-500" />
                                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Clique para selecionar ou arraste arquivos</p>
                                </>
                            )}
                            {status === 'uploading' && (
                                <div className="w-full px-12 text-center">
                                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mb-4">
                                        <motion.div 
                                            className="h-full bg-blue-500" 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-blue-500 uppercase tracking-widest font-bold">Enviando... {Math.round(progress)}%</p>
                                </div>
                            )}
                            {status === 'success' && (
                                <div className="flex flex-col items-center text-green-500">
                                    <CheckCircle2 className="w-8 h-8 mb-2" />
                                    <p className="text-[10px] uppercase tracking-widest font-bold">Upload Concluído!</p>
                                </div>
                            )}
                            {status === 'error' && (
                                <div className="flex flex-col items-center text-red-500">
                                    <X className="w-8 h-8 mb-2" />
                                    <p className="text-[10px] uppercase tracking-widest font-bold">Erro no Upload</p>
                                </div>
                            )}
                        </div>
                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                </div>

                {/* Assets List */}
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Arquivos Enviados ({project.assets?.length || 0})</h4>
                    
                    <AnimatePresence mode="popLayout">
                        {project.assets && project.assets.length > 0 ? (
                            project.assets.map((asset: Asset) => (
                                <motion.div 
                                    key={asset.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-white/10 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500">
                                            <File size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white truncate max-w-[200px]">{asset.name}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] text-gray-500 uppercase font-mono">{formatSize(asset.size)}</span>
                                                <span className="text-[10px] text-gray-700 font-mono italic">{new Date(asset.uploadedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {((asset as any).status === 'pending_approval') ? (
                                            <div className="flex items-center gap-2 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                                                <Clock size={10} className="text-yellow-500" />
                                                <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest">Pendente</span>
                                            </div>
                                        ) : ((asset as any).status === 'approved') ? (
                                            <div className="flex items-center gap-2 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                                                <CheckCircle2 size={10} className="text-green-500" />
                                                <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Aprovado</span>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => handleRequestApproval(asset)}
                                                className="text-[8px] font-black text-blue-500 hover:text-white uppercase tracking-widest px-2 py-1 hover:bg-blue-500 rounded transition-all flex items-center gap-1 border border-blue-500/10"
                                            >
                                                <Bell size={10} /> Aprovação
                                            </button>
                                        )}
                                        <a 
                                            href={asset.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-[10px] font-bold text-blue-500 uppercase tracking-widest px-3 py-1 hover:bg-blue-500/10 rounded transition-all"
                                        >
                                            Ver
                                        </a>
                                        <button 
                                            onClick={() => handleDelete(asset)}
                                            className="p-2 text-gray-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12 border border-dashed border-white/5 rounded-[32px]">
                                <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Nenhum arquivo anexado a este projeto.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </>
        ) : (
            <div className="flex flex-col h-[500px]">
                <div className="flex-1 overflow-y-auto mb-6 pr-4 space-y-4 scrollbar-hide py-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <MessageSquare size={40} className="mb-4" />
                            <p className="text-[10px] uppercase tracking-widest font-bold">Nenhuma conversa iniciada.</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.type === 'admin';
                            return (
                                <div key={idx} className={cn(
                                    "flex gap-3 max-w-[85%]",
                                    isMe ? "ml-auto flex-row-reverse" : ""
                                )}>
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 mt-2">
                                        {msg.senderPhoto ? (
                                            <img src={msg.senderPhoto} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/20">
                                                <UserCircle size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <div className={cn(
                                            "p-4 rounded-3xl text-xs",
                                            isMe 
                                            ? "bg-blue-600 text-white rounded-tr-none" 
                                            : "bg-white/5 border border-white/10 text-gray-200 rounded-tl-none"
                                        )}>
                                            {msg.text}
                                        </div>
                                        <p className={cn(
                                            "text-[8px] text-gray-600 uppercase font-bold",
                                            isMe ? "text-right" : "text-left"
                                        )}>
                                            {msg.senderName} • {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="relative mt-auto pb-4">
                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Enviar resposta para o cliente..."
                        className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-xs text-white placeholder-gray-600 outline-none focus:border-blue-500/50 transition-all pr-14"
                    />
                    <button 
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="absolute right-2 top-1/2 -translate-y-[calc(50%+8px)] w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-500 transition-all disabled:opacity-50 disabled:grayscale"
                    >
                        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </form>
            </div>
        )}
      </motion.div>
    </div>
  );
}
