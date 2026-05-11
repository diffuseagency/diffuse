import React from 'react';

interface TechStackPillsProps {
  stack: string[];
}

export default function TechStackPills({ stack }: TechStackPillsProps) {
  if (!stack || stack.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {stack.map((tech, i) => (
        <span 
          key={i} 
          className="px-3 py-1 bg-white/[0.03] border border-white/10 rounded-full text-[10px] text-white/60 uppercase tracking-widest font-bold hover:bg-white/5 hover:text-white transition-all cursor-default"
        >
          {tech}
        </span>
      ))}
    </div>
  );
}
