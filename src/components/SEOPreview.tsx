import React from 'react';
import { Globe, MoreVertical } from 'lucide-react';
import { motion } from 'motion/react';

interface SEOPreviewProps {
  title: string;
  description: string;
  slug: string;
  baseUrl?: string;
}

export default function SEOPreview({ title, description, slug, baseUrl = 'diffuse.agency' }: SEOPreviewProps) {
  const displayTitle = title || 'Título da Página Exemplo | Diffuse Agency';
  const displayDescription = description || 'Este é um exemplo de como a descrição do seu conteúdo aparecerá nos resultados de busca do Google. Certifique-se de incluir palavras-chave relevantes.';
  const displayUrl = `https://${baseUrl}/${slug || 'post-exemplo-url'}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Pré-visualização Google (SEO)</h4>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Live Preview</span>
        </div>
      </div>

      <div className="bg-[#1a1a1b] rounded-2xl p-6 border border-white/5 shadow-2xl relative overflow-hidden group">
        {/* Google Mockup Structure */}
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-[#303134] rounded-full flex items-center justify-center text-[#969ba1]">
              <Globe size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-[#dadce0] font-medium leading-none">Diffuse Agency</span>
              <span className="text-[10px] text-[#969ba1] leading-tight">{displayUrl}</span>
            </div>
            <MoreVertical size={14} className="text-[#969ba1] ml-auto" />
          </div>

          <h3 className="text-[#8ab4f8] text-xl font-medium hover:underline cursor-pointer leading-tight tracking-normal">
            {displayTitle}
          </h3>

          <p className="text-[#bdc1c6] text-sm leading-relaxed line-clamp-2 mt-1">
            {displayDescription}
          </p>
        </div>

        {/* Decorative Google UI Elements */}
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Globe size={80} />
        </div>
      </div>

      {/* Metrics / Suggestions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
          <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Tamanho Título</p>
          <div className="flex items-center justify-between">
            <span className={title.length > 60 || title.length < 30 ? "text-amber-500 text-[10px] font-bold" : "text-green-500 text-[10px] font-bold"}>
              {title.length} carac.
            </span>
            <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
               <div 
                className={title.length > 60 || title.length < 30 ? "h-full bg-amber-500" : "h-full bg-green-500"} 
                style={{ width: `${Math.min((title.length / 60) * 100, 100)}%` }} 
               />
            </div>
          </div>
        </div>
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
          <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Tamanho Descrição</p>
          <div className="flex items-center justify-between">
            <span className={description.length > 160 || description.length < 120 ? "text-amber-500 text-[10px] font-bold" : "text-green-500 text-[10px] font-bold"}>
              {description.length} carac.
            </span>
            <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
               <div 
                className={description.length > 160 || description.length < 120 ? "h-full bg-amber-500" : "h-full bg-green-500"} 
                style={{ width: `${Math.min((description.length / 160) * 100, 100)}%` }} 
               />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
