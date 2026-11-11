import React, { useRef, useState } from 'react';
import { Upload, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'escrow_agent_custom_hero_image';

export const HeroPadlockSlot: React.FC = () => {
  const [customImage, setCustomImage] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      setCustomImage(result);
      try {
        localStorage.setItem(STORAGE_KEY, result);
      } catch {
        // Ignore storage quota errors for very large files
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomImage(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
      onClick={() => fileInputRef.current?.click()}
      className={`relative group cursor-pointer border border-[#08090B] bg-[#08090B] text-[#FAF8F3] overflow-hidden flex flex-col justify-between min-h-[380px] lg:min-h-[460px] transition-transform duration-150 ${
        isDragging ? 'ring-2 ring-[#CDF22B]' : ''
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* Top technical header bar inside the Hero Image Slot */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#FAF8F3]/15 z-10 bg-[#08090B]/90">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CDF22B]" />
          <span className="font-mono-tech text-[10px] text-[#FAF8F3]">
            FIG 01. CUSTODY LOCK // HERO ASSET SLOT
          </span>
        </div>
        <div className="flex items-center gap-2">
          {customImage && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#FAF8F3]/30 font-mono-tech text-[10px] text-[#FAF8F3] hover:bg-[#FAF8F3] hover:text-[#08090B] transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              RESET ART
            </button>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#CDF22B] font-mono-tech text-[10px] text-[#CDF22B] group-hover:bg-[#CDF22B] group-hover:text-[#08090B] transition-colors whitespace-nowrap shrink-0">
            <Upload className="w-3 h-3" />
            {customImage ? 'REPLACE IMAGE' : 'UPLOAD HERO IMAGE'}
          </span>
        </div>
      </div>

      {/* Main visual area: User's uploaded 3D ribbon + padlock image OR default 3D ribbon + lime padlock render */}
      <div className="relative flex-1 flex items-center justify-center p-6 overflow-hidden">
        {customImage ? (
          <img
            src={customImage}
            alt="Uploaded 3D black ribbon and lime padlock hero artwork"
            referrerPolicy="no-referrer"
            className="w-full h-full max-h-[360px] object-contain"
          />
        ) : (
          <svg
            viewBox="0 0 600 440"
            className="w-full h-full max-h-[350px]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="3D Matte Black Ribbon and Neon Lime Escrow Padlock"
          >
            {/* Subtle Architectural Grid Lines */}
            <line x1="0" y1="110" x2="600" y2="110" stroke="#FAF8F3" strokeOpacity="0.08" />
            <line x1="0" y1="220" x2="600" y2="220" stroke="#FAF8F3" strokeOpacity="0.08" />
            <line x1="0" y1="330" x2="600" y2="330" stroke="#FAF8F3" strokeOpacity="0.08" />
            <line x1="150" y1="0" x2="150" y2="440" stroke="#FAF8F3" strokeOpacity="0.08" />
            <line x1="300" y1="0" x2="300" y2="440" stroke="#FAF8F3" strokeOpacity="0.08" />
            <line x1="450" y1="0" x2="450" y2="440" stroke="#FAF8F3" strokeOpacity="0.08" />

            {/* 3D Matte Black Flowing Ribbon — Back Loop */}
            <path
              d="M-40 310 C110 340, 170 80, 310 110 C450 140, 470 360, 640 280"
              stroke="#1E2025"
              strokeWidth="66"
              strokeLinecap="square"
            />
            <path
              d="M-40 310 C110 340, 170 80, 310 110 C450 140, 470 360, 640 280"
              stroke="#FAF8F3"
              strokeOpacity="0.22"
              strokeWidth="68"
              strokeLinecap="square"
              strokeDasharray="2 6"
            />

            {/* 3D Matte Black Ribbon — Shadow Core */}
            <path
              d="M-20 140 C140 60, 230 370, 380 290 C490 230, 520 95, 630 130"
              stroke="#08090B"
              strokeWidth="76"
            />
            <path
              d="M-20 140 C140 60, 230 370, 380 290 C490 230, 520 95, 630 130"
              stroke="#2C2E35"
              strokeWidth="54"
            />
            {/* Specular highlight edge on 3D Black Ribbon */}
            <path
              d="M-20 124 C140 44, 230 354, 380 274 C490 214, 520 79, 630 114"
              stroke="#FAF8F3"
              strokeOpacity="0.4"
              strokeWidth="2"
            />

            {/* Neon Lime Padlock — Isometric 3D Architectural Block */}
            {/* Shackle (3D Extruded) */}
            <path
              d="M248 185 V122 C248 84 275 58 308 58 C341 58 368 84 368 122 V185"
              stroke="#08090B"
              strokeWidth="36"
            />
            <path
              d="M242 185 V118 C242 80 269 54 302 54 C335 54 362 80 362 118 V185"
              stroke="#CDF22B"
              strokeWidth="26"
            />
            <path
              d="M236 185 V118 C236 76 265 48 302 48"
              stroke="#FAF8F3"
              strokeWidth="2"
            />

            {/* Padlock 3D Hard Offset Shadow Slab */}
            <rect
              x="212"
              y="182"
              width="196"
              height="186"
              fill="#08090B"
              stroke="#CDF22B"
              strokeWidth="2"
            />

            {/* Padlock Primary Neon Lime Body */}
            <rect
              x="198"
              y="168"
              width="196"
              height="186"
              fill="#CDF22B"
              stroke="#08090B"
              strokeWidth="4"
            />

            {/* Technical Engraving inside Padlock */}
            <line x1="198" y1="204" x2="394" y2="204" stroke="#08090B" strokeWidth="2" />
            <circle cx="218" cy="186" r="4" fill="#08090B" />
            <text
              x="232"
              y="190"
              fill="#08090B"
              fontFamily="Space Mono, monospace"
              fontSize="11"
              fontWeight="700"
              letterSpacing="1.5"
            >
              AUTH // LOCKED
            </text>

            {/* Keyhole Escutcheon */}
            <circle cx="296" cy="258" r="22" fill="#08090B" />
            <path d="M288 268 L283 314 H309 L304 268 Z" fill="#08090B" />
            <circle cx="296" cy="258" r="7" fill="#CDF22B" />

            {/* Front Ribbon Intersecting Overlap for 3D Depth */}
            <path
              d="M150 345 C225 365, 295 350, 445 245"
              stroke="#14161A"
              strokeWidth="38"
            />
            <path
              d="M150 332 C225 352, 295 337, 445 232"
              stroke="#CDF22B"
              strokeWidth="2"
            />
          </svg>
        )}
      </div>

      {/* Bottom Telemetry Strip */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[#FAF8F3]/15 bg-[#08090B] font-mono-tech text-[10px] text-[#8A8780]">
        <span>PAYPAL INTENT: AUTHORIZE</span>
        <span className="text-[#CDF22B]">CLICK OR DROP 3D PADLOCK PNG</span>
      </div>
    </div>
  );
};
