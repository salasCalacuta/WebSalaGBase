import React from 'react';

interface HeaderProps {
  isLoggedIn: boolean;
  isSyncing?: boolean;
  isSupabaseConfigured?: boolean;
  syncError?: string | null;
  onViewSalas?: () => void;
  onViewQuienes?: () => void;
  onViewEspacio?: () => void;
  onOpenLogin?: () => void;
  headerLinks?: { label: string; url: string; image?: string }[];
}

export const Header: React.FC<HeaderProps> = ({ 
  isLoggedIn, 
  isSyncing, 
  isSupabaseConfigured, 
  syncError, 
  onViewSalas, 
  onViewQuienes, 
  onViewEspacio, 
  onOpenLogin,
  headerLinks = []
}) => {
  // Helper for Image Buttons
  const HeaderImgBtn = ({ src, label, onClick }: { src: string, label: string, onClick?: () => void }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center gap-2 group w-20"
    >
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#D2B48C] group-hover:scale-110 transition-transform bg-black">
            <img src={src} alt={label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <span className="text-[10px] font-bold uppercase text-[#D2B48C] group-hover:text-white tracking-wider text-center w-full leading-tight">{label}</span>
    </button>
  );

  // Helper for Image Links
  const HeaderImgLink = ({ src, label, href }: { src: string, label: string, href: string }) => (
    <div className="flex flex-col items-center gap-2 group w-20">
      <a 
          href={href}
          target="_blank" 
          rel="noreferrer"
          className="flex flex-col items-center gap-2 group w-20"
      >
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#D2B48C] group-hover:scale-110 transition-transform bg-black">
            <img src={src || '/link.png'} alt={label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <span className="text-[10px] font-bold uppercase text-[#D2B48C] group-hover:text-white tracking-wider text-center w-full leading-tight">{label}</span>
      </a>
    </div>
  );

  // Helper for SVG Buttons (Login)
  const HeaderSvgBtn = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center gap-2 group w-20"
    >
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#D2B48C] group-hover:scale-110 transition-transform bg-black flex items-center justify-center">
            {icon}
        </div>
        <span className="text-[10px] font-bold uppercase text-[#D2B48C] group-hover:text-white tracking-wider text-center w-full leading-tight">{label}</span>
    </button>
  );

  const getIconForLabel = (label: string, customImage?: string) => {
    if (customImage) return customImage;
    const l = label.toLowerCase();
    if (l.includes('instagram')) return '/instagram.png';
    if (l.includes('youtube')) return '/youtube.png';
    if (l.includes('facebook')) return '/facebook.png';
    if (l.includes('whatsapp')) return '/whatsapp.png';
    if (l.includes('map') || l.includes('ubicacion')) return '/ubicacion.png';
    return '/link.png';
  };

  return (
    <header className="w-full bg-black/90 border-b border-white/5 py-6 flex flex-col justify-center items-center shrink-0 z-50 sticky top-0 backdrop-blur-xl">
      
      {isSyncing && (
          <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5 overflow-hidden">
              <div className="h-full bg-[#D2B48C] animate-[shimmer_2s_infinite] w-1/3 shadow-[0_0_10px_#D2B48C]"></div>
          </div>
      )}

      {/* Cloud Status Indicator */}
      <div className="absolute top-3 left-6 flex items-center gap-3 group cursor-default">
          <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] transition-all duration-500 ${syncError ? 'bg-orange-500 animate-pulse' : isSupabaseConfigured ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`}></div>
          <span className="text-[7px] uppercase font-black tracking-[0.3em] text-gray-600 group-hover:text-[#D2B48C] transition-colors">
              {syncError ? 'Sync Error' : isSupabaseConfigured ? 'Cloud Active' : 'Offline Mode'}
          </span>
      </div>

      {isSyncing && (
          <div className="absolute top-3 right-6 text-[7px] text-[#D2B48C] animate-pulse uppercase font-black tracking-[0.3em]">
              Sincronizando...
          </div>
      )}
      
      {/* Centered Icons Container */}
      <div className="flex flex-wrap items-start justify-center gap-4 md:gap-8 px-4">
          
          {/* Dynamic Links */}
          {headerLinks.map((link, idx) => (
            <div key={idx}>
              <HeaderImgLink 
                src={getIconForLabel(link.label, link.image)}
                label={link.label}
                href={link.url}
              />
            </div>
          ))}

          {/* 5. Login (Visible only if logged out) */}
          {!isLoggedIn && (
             <HeaderSvgBtn 
                label="Ingresar"
                onClick={onOpenLogin}
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#D2B48C] group-hover:text-white transition-colors">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                }
             />
          )}
      </div>

    </header>
  );
};