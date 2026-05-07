import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Trash2, 
  Link as LinkIcon, 
  Check, 
  Search, 
  Loader2, 
  Copy,
  Plus
} from 'lucide-react';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp, 
  onSnapshot 
} from 'firebase/firestore';
import { storage, db, auth } from '../lib/firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: any;
  uploadedBy: string;
}

interface MediaLibraryProps {
  onSelect?: (url: string) => void;
  onClose?: () => void;
  isPicker?: boolean;
}

export default function MediaLibrary({ onSelect, onClose, isPicker = false }: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Real-time sync of media library
    const q = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MediaFile[];
      setFiles(items);
      setLoading(false);
    }, (error) => {
      console.error("Error syncing media:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setUploading(true);
    setUploadProgress(0);

    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
    const storageRef = ref(storage, `media/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      }, 
      (error) => {
        console.error("Upload error:", error);
        setUploading(false);
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        // Add to firestore
        await addDoc(collection(db, 'media'), {
          name: file.name,
          url: downloadURL,
          type: file.type,
          size: file.size,
          createdAt: serverTimestamp(),
          uploadedBy: auth.currentUser?.uid,
          storagePath: `media/${fileName}`
        });

        setUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    );
  };

  const handleDelete = async (file: any) => {
    if (!confirm('Deseja excluir permanentemente este arquivo?')) return;

    try {
      // 1. Delete from storage if path exists
      if (file.storagePath) {
        const storageRef = ref(storage, file.storagePath);
        await deleteObject(storageRef);
      }
      
      // 2. Delete from firestore
      await deleteDoc(doc(db, 'media', file.id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Erro ao excluir arquivo.");
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn(
      "flex flex-col h-full bg-brand-bg relative overflow-hidden",
      !isPicker && "rounded-[40px] border border-white/10 shadow-2xl"
    )}>
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <ImageIcon size={20} />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg tracking-tight">Biblioteca de Mídia</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Imagens e Ativos Digitais</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-all">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.02]">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input 
            type="text"
            placeholder="Pesquisar arquivos..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
            accept="image/*"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? `Enviando ${Math.round(uploadProgress)}%` : 'Fazer Upload'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-[10px] uppercase tracking-widest font-bold">Carregando ativos...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 opacity-30">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
              <Plus size={32} />
            </div>
            <p className="text-xs uppercase tracking-widest font-bold">Nenhum arquivo encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <AnimatePresence>
              {filteredFiles.map((file) => (
                <motion.div 
                  key={file.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative aspect-square rounded-2xl bg-white/5 border border-white/5 overflow-hidden border-white/10 hover:border-blue-500/50 transition-all shadow-lg"
                >
                  <img 
                    src={file.url} 
                    alt={file.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    {onSelect ? (
                      <button 
                        onClick={() => onSelect(file.url)}
                        className="w-full py-2 bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest"
                      >
                        Selecionar
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={() => copyToClipboard(file.url, file.id)}
                          className="w-full py-2 bg-white/10 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/20"
                        >
                          {copyStatus === file.id ? <Check size={12} /> : <Copy size={12} />}
                          {copyStatus === file.id ? 'Copiado' : 'Link'}
                        </button>
                        <button 
                          onClick={() => handleDelete(file)}
                          className="w-full py-2 bg-red-500/20 text-red-500 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={12} /> Excluir
                        </button>
                      </>
                    )}
                  </div>

                  {/* Info Badge */}
                  <div className="absolute bottom-1 left-1 right-1 p-1.5 bg-black/40 backdrop-blur-md rounded-lg overflow-hidden group-hover:hidden">
                    <p className="text-[8px] text-white/80 font-medium truncate">{file.name}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Upload Progress Bar */}
      {uploading && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
          <motion.div 
            className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}
