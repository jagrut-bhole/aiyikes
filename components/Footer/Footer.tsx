import React from 'react';
import WaterMark from './water-mark';

export function Footer() {
    const year = new Date().getFullYear();
  return (
    <footer className="relative bg-[#050505] pt-32 pb-12 overflow-hidden border-t border-neutral-900">
      <div className="container mx-auto px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-20">
          {/* Brand Column */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">AIYIKES</h2>
            <p className="text-neutral-500 font-medium">Designed to Move You</p>
          </div>

          {/* Links Columns */}
          <div className="flex gap-16 md:gap-32">
            <div className="flex flex-col gap-4">
              <h3 className="text-neutral-600 font-bold text-sm uppercase tracking-widest">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Color</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-neutral-600 font-bold text-sm uppercase tracking-widest">Pages</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Term of Use</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Large Watermark Text */}
        <WaterMark />
        
      </div>
    </footer>
  );
}
