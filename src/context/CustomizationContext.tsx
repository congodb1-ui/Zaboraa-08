import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteConfig, ArchitectureDiagram, VideoItem, TutorialArticle, ServicePillar, CaseStudy, PhotoStyle, PlatformShowcase, ArchitectureDesignItem, WatermarkConfig, AdminSettings } from '../types/siteData';
import { INITIAL_SITE_DATA } from '../data/initialData';

const STORAGE_KEY = 'zaboraa_site_config_v8';
const THEME_STORAGE_KEY = 'zaboraa_theme_mode';

function cleanOldStorageKeys() {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('zaboraa_site_config_') || key.startsWith('zaboraa_config_'))) {
        if (key !== STORAGE_KEY) {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch {
        // ignore
      }
    });
  } catch {
    // ignore
  }
}

function sanitizeImagePaths<T>(data: T): T {
  if (!data) return data;
  try {
    const jsonStr = JSON.stringify(data);
    const fixedStr = jsonStr.replace(/\/src\/assets\/images\//g, '/assets/images/');
    return JSON.parse(fixedStr);
  } catch {
    return data;
  }
}

interface CustomizationContextType {
  siteConfig: SiteConfig;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  isAdminLoginModalOpen: boolean;
  setIsAdminLoginModalOpen: (open: boolean) => void;
  isWatermarkModalOpen: boolean;
  setIsWatermarkModalOpen: (open: boolean) => void;
  verifyAdminPasscode: (passcode: string) => boolean;
  signOutAdmin: () => void;
  updateWatermarkConfig: (cfg: Partial<WatermarkConfig>) => void;
  updateEnableHotspots: (enabled: boolean) => void;
  updateAdminSettings: (cfg: Partial<AdminSettings>) => void;
  isCustomizerOpen: boolean;
  setIsCustomizerOpen: (open: boolean) => void;
  isPhotoEditorOpen: boolean;
  setIsPhotoEditorOpen: (open: boolean) => void;
  activeEditPlatformId: string | null;
  setActiveEditPlatformId: (id: string | null) => void;
  isBriefingModalOpen: boolean;
  setIsBriefingModalOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  selectedTutorial: TutorialArticle | null;
  setSelectedTutorial: (tutorial: TutorialArticle | null) => void;
  selectedDiagram: ArchitectureDiagram | null;
  setSelectedDiagram: (diagram: ArchitectureDiagram | null) => void;
  selectedVideo: VideoItem | null;
  setSelectedVideo: (video: VideoItem | null) => void;
  
  // Customization methods
  updateGeneralInfo: (info: { brand: string; brandTagline: string; founder: SiteConfig['founder'] }) => void;
  updateFounderPhoto: (portraitImage: string, photoStyle?: PhotoStyle) => void;
  setFeaturedVideoId: (id: string) => void;
  updatePlatformShowcase: (id: string, updated: Partial<PlatformShowcase>) => void;
  addPlatformShowcase: (platform: PlatformShowcase) => void;
  deletePlatformShowcase: (id: string) => void;
  togglePlatformEnabled: (id: string) => void;
  addPlatformDesign: (platformId: string, design: ArchitectureDesignItem) => void;
  updatePlatformDesign: (platformId: string, designId: string, updated: Partial<ArchitectureDesignItem>) => void;
  deletePlatformDesign: (platformId: string, designId: string) => void;
  toggleDesignEnabled: (platformId: string, designId: string) => void;
  updateHero: (hero: SiteConfig['hero']) => void;
  addDiagram: (diagram: ArchitectureDiagram) => void;
  updateDiagram: (id: string, diagram: Partial<ArchitectureDiagram>) => void;
  deleteDiagram: (id: string) => void;
  addVideo: (video: VideoItem) => void;
  updateVideo: (id: string, video: Partial<VideoItem>) => void;
  deleteVideo: (id: string) => void;
  addTutorial: (tutorial: TutorialArticle) => void;
  updateTutorial: (id: string, tutorial: Partial<TutorialArticle>) => void;
  deleteTutorial: (id: string) => void;
  resetToDefaults: () => void;
  exportConfigJson: () => string;
  importConfigJson: (json: string) => boolean;
}

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

export const CustomizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
    } catch (e) {
      console.warn('Failed to read theme from localStorage', e);
    }
    return 'dark';
  });

  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    try {
      cleanOldStorageKeys();
      const saved =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem('zaboraa_site_config_v6') ||
        localStorage.getItem('zaboraa_site_config_v3');
      if (saved) {
        const parsed = sanitizeImagePaths(JSON.parse(saved));
        if (parsed.brand && parsed.founder) {
          const merged: SiteConfig = {
            ...INITIAL_SITE_DATA,
            ...parsed,
            founder: {
              ...INITIAL_SITE_DATA.founder,
              ...(parsed.founder || {})
            },
            hero: {
              ...INITIAL_SITE_DATA.hero,
              ...(parsed.hero || {})
            },
            platformShowcases: parsed.platformShowcases || INITIAL_SITE_DATA.platformShowcases,
            diagrams: parsed.diagrams || INITIAL_SITE_DATA.diagrams,
            videos: parsed.videos || INITIAL_SITE_DATA.videos,
            tutorials: parsed.tutorials || INITIAL_SITE_DATA.tutorials,
            knowledgeBase: parsed.knowledgeBase || INITIAL_SITE_DATA.knowledgeBase,
            caseStudies: parsed.caseStudies || INITIAL_SITE_DATA.caseStudies,
            services: parsed.services || INITIAL_SITE_DATA.services,
            enableHotspots: parsed.enableHotspots !== undefined ? parsed.enableHotspots : true
          };
          if (!merged.founder.portraitImage || merged.founder.portraitImage.includes('founder_architect_portrait')) {
            merged.founder.portraitImage = INITIAL_SITE_DATA.founder.portraitImage;
          }
          if (!merged.featuredVideoId) {
            merged.featuredVideoId = INITIAL_SITE_DATA.featuredVideoId;
          }
          if (!merged.founder.photoStyle) {
            merged.founder.photoStyle = INITIAL_SITE_DATA.founder.photoStyle;
          }
          // If fewer than 8 platforms, missing nutanix or aria, using old fallbacks, or missing subsections, upgrade to complete initial set
          const hasOldFallbacks = merged.platformShowcases?.some((p: any) =>
            p.designs?.some((d: any) => d.imageUrl?.includes('architecture_avs_mesh') && p.id !== 'avs')
          );
          const hasAria = merged.platformShowcases?.some((p: any) => p.id === 'aria');
          const hasNutanix = merged.platformShowcases?.some((p: any) => p.id === 'nutanix-nc2-azure');
          const hasIncompleteDesigns = merged.platformShowcases?.some((p: any) =>
            !p.designs || p.designs.length < 3 || p.designs.some((d: any) => !d.id || !d.imageUrl)
          );
          if (!merged.platformShowcases || merged.platformShowcases.length < 8 || hasOldFallbacks || !hasAria || !hasNutanix || hasIncompleteDesigns) {
            merged.platformShowcases = INITIAL_SITE_DATA.platformShowcases;
          }
          if (!merged.adminSettings) {
            merged.adminSettings = INITIAL_SITE_DATA.adminSettings;
          }
          return sanitizeImagePaths(merged);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved config from localStorage', e);
    }
    return INITIAL_SITE_DATA;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem('zaboraa_admin_session') === 'active';
    } catch {
      return false;
    }
  });
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isWatermarkModalOpen, setIsWatermarkModalOpen] = useState(false);

  const verifyAdminPasscode = (passcode: string): boolean => {
    const clean = passcode.trim().toLowerCase();
    if (clean === 'zaboraa2026' || clean === 'admin' || clean === 'wasim') {
      setIsAdmin(true);
      try {
        localStorage.setItem('zaboraa_admin_session', 'active');
      } catch {}
      return true;
    }
    return false;
  };

  const signOutAdmin = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem('zaboraa_admin_session');
    } catch {}
  };

  const updateWatermarkConfig = (cfg: Partial<WatermarkConfig>) => {
    setSiteConfig(prev => ({
      ...prev,
      watermark: {
        ...(prev.watermark || {
          enabled: true,
          type: 'text',
          text: 'ZABORAA TECHNOLOGIES · HYBRID CLOUD BLUEPRINT',
          position: 'bottom-right',
          opacity: 0.35
        }),
        ...cfg
      }
    }));
  };

  const updateEnableHotspots = (enabled: boolean) => {
    setSiteConfig(prev => ({
      ...prev,
      enableHotspots: enabled
    }));
  };

  const updateAdminSettings = (cfg: Partial<AdminSettings>) => {
    setSiteConfig(prev => ({
      ...prev,
      adminSettings: {
        ...(prev.adminSettings || INITIAL_SITE_DATA.adminSettings!),
        ...cfg
      }
    }));
  };

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isPhotoEditorOpen, setIsPhotoEditorOpen] = useState(false);
  const [activeEditPlatformId, setActiveEditPlatformId] = useState<string | null>(null);
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialArticle | null>(null);
  const [selectedDiagram, setSelectedDiagram] = useState<ArchitectureDiagram | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  // Sync theme to root class and localStorage
  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn('Could not save theme to storage', e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light-high-contrast');
    } else {
      root.classList.remove('light-high-contrast');
      root.classList.add('dark');
    }

    const currentTheme = siteConfig.adminSettings?.themePreset || 'default';
    const currentDensity = siteConfig.adminSettings?.layoutDensity || 'balanced';
    const currentHeader = siteConfig.adminSettings?.headerStyle || 'glass';
    const currentPattern = siteConfig.adminSettings?.backgroundPattern || 'tech-grid';
    root.setAttribute('data-ui-theme', currentTheme);
    root.setAttribute('data-ui-density', currentDensity);
    root.setAttribute('data-ui-header', currentHeader);
    root.setAttribute('data-ui-pattern', currentPattern);
  }, [theme, siteConfig.adminSettings]);

  // Sync to localStorage with quota protection and fallback
  useEffect(() => {
    try {
      cleanOldStorageKeys();

      // Filter out giant base64 data URLs from localStorage payload to respect quota limits
      const safeWatermark = siteConfig.watermark ? {
        ...siteConfig.watermark,
        imageUrl: siteConfig.watermark.imageUrl && siteConfig.watermark.imageUrl.startsWith('data:') && siteConfig.watermark.imageUrl.length > 50000
          ? undefined // Large uploaded watermark preserved in active session memory
          : siteConfig.watermark.imageUrl
      } : undefined;

      const safeFounder = siteConfig.founder ? {
        ...siteConfig.founder,
        portraitImage: siteConfig.founder.portraitImage && siteConfig.founder.portraitImage.startsWith('data:') && siteConfig.founder.portraitImage.length > 50000
          ? INITIAL_SITE_DATA.founder.portraitImage
          : siteConfig.founder.portraitImage
      } : INITIAL_SITE_DATA.founder;

      // Store customized configuration safely
      const payloadToSave: Partial<SiteConfig> = {
        brand: siteConfig.brand,
        brandTagline: siteConfig.brandTagline,
        enableHotspots: siteConfig.enableHotspots,
        featuredVideoId: siteConfig.featuredVideoId,
        watermark: safeWatermark,
        founder: safeFounder,
        hero: siteConfig.hero,
        platformShowcases: siteConfig.platformShowcases,
        diagrams: siteConfig.diagrams,
        videos: siteConfig.videos,
        services: siteConfig.services
      };

      if (siteConfig.tutorials !== INITIAL_SITE_DATA.tutorials) {
        payloadToSave.tutorials = siteConfig.tutorials;
      }
      if (siteConfig.knowledgeBase !== INITIAL_SITE_DATA.knowledgeBase) {
        payloadToSave.knowledgeBase = siteConfig.knowledgeBase;
      }
      if (siteConfig.caseStudies !== INITIAL_SITE_DATA.caseStudies) {
        payloadToSave.caseStudies = siteConfig.caseStudies;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(payloadToSave));
    } catch (e: any) {
      // If quota exceeded or storage unavailable, clean and save minimal essential config
      try {
        cleanOldStorageKeys();
        const minimalPayload = {
          brand: siteConfig.brand,
          brandTagline: siteConfig.brandTagline,
          enableHotspots: siteConfig.enableHotspots,
          founder: {
            name: siteConfig.founder.name,
            role: siteConfig.founder.role,
            location: siteConfig.founder.location
          },
          hero: {
            eyebrow: siteConfig.hero.eyebrow,
            headline: siteConfig.hero.headline,
            subheadline: siteConfig.hero.subheadline,
            stats: siteConfig.hero.stats
          },
          watermark: siteConfig.watermark ? {
            enabled: siteConfig.watermark.enabled,
            type: siteConfig.watermark.type,
            text: siteConfig.watermark.text,
            position: siteConfig.watermark.position,
            opacity: siteConfig.watermark.opacity
          } : undefined
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalPayload));
      } catch {
        // Silently preserve in active React state
      }
    }
  }, [siteConfig]);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsPhotoEditorOpen(false);
        if (selectedTutorial) setSelectedTutorial(null);
        if (selectedDiagram) setSelectedDiagram(null);
        if (selectedVideo) setSelectedVideo(null);
        setIsBriefingModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTutorial, selectedDiagram, selectedVideo]);

  const updateGeneralInfo = (info: { brand: string; brandTagline: string; founder: SiteConfig['founder'] }) => {
    setSiteConfig(prev => ({
      ...prev,
      brand: info.brand,
      brandTagline: info.brandTagline,
      founder: info.founder
    }));
  };

  const updateFounderPhoto = (portraitImage: string, photoStyle?: PhotoStyle) => {
    setSiteConfig(prev => ({
      ...prev,
      founder: {
        ...prev.founder,
        portraitImage,
        photoStyle: photoStyle !== undefined ? photoStyle : prev.founder.photoStyle
      }
    }));
  };

  const setFeaturedVideoId = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      featuredVideoId: id
    }));
  };

  const updatePlatformShowcase = (id: string, updated: Partial<PlatformShowcase>) => {
    setSiteConfig(prev => ({
      ...prev,
      platformShowcases: (prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases).map(item =>
        item.id === id ? { ...item, ...updated } : item
      )
    }));
  };

  const addPlatformShowcase = (platform: PlatformShowcase) => {
    setSiteConfig(prev => ({
      ...prev,
      platformShowcases: [...(prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases), platform]
    }));
  };

  const deletePlatformShowcase = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      platformShowcases: (prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases).filter(item => item.id !== id)
    }));
  };

  const togglePlatformEnabled = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      platformShowcases: (prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases).map(item =>
        item.id === id ? { ...item, enabled: item.enabled === false ? true : false } : item
      )
    }));
  };

  const addPlatformDesign = (platformId: string, design: ArchitectureDesignItem) => {
    setSiteConfig(prev => ({
      ...prev,
      platformShowcases: (prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases).map(item => {
        if (item.id === platformId) {
          const existingDesigns = item.designs || [];
          return {
            ...item,
            designs: [design, ...existingDesigns]
          };
        }
        return item;
      })
    }));
  };

  const updatePlatformDesign = (platformId: string, designId: string, updated: Partial<ArchitectureDesignItem>) => {
    setSiteConfig(prev => ({
      ...prev,
      platformShowcases: (prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases).map(item => {
        if (item.id === platformId && item.designs) {
          return {
            ...item,
            designs: item.designs.map(d => (d.id === designId ? { ...d, ...updated } : d))
          };
        }
        return item;
      })
    }));
  };

  const deletePlatformDesign = (platformId: string, designId: string) => {
    setSiteConfig(prev => ({
      ...prev,
      platformShowcases: (prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases).map(item => {
        if (item.id === platformId && item.designs) {
          return {
            ...item,
            designs: item.designs.filter(d => d.id !== designId)
          };
        }
        return item;
      })
    }));
  };

  const toggleDesignEnabled = (platformId: string, designId: string) => {
    setSiteConfig(prev => ({
      ...prev,
      platformShowcases: (prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases).map(item => {
        if (item.id === platformId && item.designs) {
          return {
            ...item,
            designs: item.designs.map(d =>
              d.id === designId ? { ...d, enabled: d.enabled === false ? true : false } : d
            )
          };
        }
        return item;
      })
    }));
  };

  const updateHero = (hero: SiteConfig['hero']) => {
    setSiteConfig(prev => ({
      ...prev,
      hero
    }));
  };

  const addDiagram = (diagram: ArchitectureDiagram) => {
    setSiteConfig(prev => ({
      ...prev,
      diagrams: [diagram, ...prev.diagrams]
    }));
  };

  const updateDiagram = (id: string, updated: Partial<ArchitectureDiagram>) => {
    setSiteConfig(prev => ({
      ...prev,
      diagrams: prev.diagrams.map(d => (d.id === id ? { ...d, ...updated } : d))
    }));
  };

  const deleteDiagram = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      diagrams: prev.diagrams.filter(d => d.id !== id)
    }));
    if (selectedDiagram?.id === id) setSelectedDiagram(null);
  };

  const addVideo = (video: VideoItem) => {
    setSiteConfig(prev => ({
      ...prev,
      videos: [video, ...prev.videos]
    }));
  };

  const updateVideo = (id: string, updated: Partial<VideoItem>) => {
    setSiteConfig(prev => ({
      ...prev,
      videos: prev.videos.map(v => (v.id === id ? { ...v, ...updated } : v))
    }));
  };

  const deleteVideo = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      videos: prev.videos.filter(v => v.id !== id)
    }));
    if (selectedVideo?.id === id) setSelectedVideo(null);
  };

  const addTutorial = (tutorial: TutorialArticle) => {
    setSiteConfig(prev => ({
      ...prev,
      tutorials: [tutorial, ...prev.tutorials]
    }));
  };

  const updateTutorial = (id: string, updated: Partial<TutorialArticle>) => {
    setSiteConfig(prev => ({
      ...prev,
      tutorials: prev.tutorials.map(t => (t.id === id ? { ...t, ...updated } : t))
    }));
  };

  const deleteTutorial = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      tutorials: prev.tutorials.filter(t => t.id !== id)
    }));
    if (selectedTutorial?.id === id) setSelectedTutorial(null);
  };

  const resetToDefaults = () => {
    setSiteConfig(INITIAL_SITE_DATA);
    cleanOldStorageKeys();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const exportConfigJson = () => {
    return JSON.stringify(siteConfig, null, 2);
  };

  const importConfigJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.brand && parsed.founder && Array.isArray(parsed.diagrams)) {
        setSiteConfig(parsed);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Invalid JSON imported', e);
      return false;
    }
  };

  return (
    <CustomizationContext.Provider
      value={{
        siteConfig,
        theme,
        toggleTheme,
        setTheme,
        isAdmin,
        setIsAdmin,
        isAdminLoginModalOpen,
        setIsAdminLoginModalOpen,
        isWatermarkModalOpen,
        setIsWatermarkModalOpen,
        verifyAdminPasscode,
        signOutAdmin,
        updateWatermarkConfig,
        updateEnableHotspots,
        updateAdminSettings,
        isCustomizerOpen,
        setIsCustomizerOpen,
        isPhotoEditorOpen,
        setIsPhotoEditorOpen,
        activeEditPlatformId,
        setActiveEditPlatformId,
        isBriefingModalOpen,
        setIsBriefingModalOpen,
        isSearchOpen,
        setIsSearchOpen,
        selectedTutorial,
        setSelectedTutorial,
        selectedDiagram,
        setSelectedDiagram,
        selectedVideo,
        setSelectedVideo,
        updateGeneralInfo,
        updateFounderPhoto,
        setFeaturedVideoId,
        updatePlatformShowcase,
        addPlatformShowcase,
        deletePlatformShowcase,
        togglePlatformEnabled,
        addPlatformDesign,
        updatePlatformDesign,
        deletePlatformDesign,
        toggleDesignEnabled,
        updateHero,
        addDiagram,
        updateDiagram,
        deleteDiagram,
        addVideo,
        updateVideo,
        deleteVideo,
        addTutorial,
        updateTutorial,
        deleteTutorial,
        resetToDefaults,
        exportConfigJson,
        importConfigJson
      }}
    >
      {children}
    </CustomizationContext.Provider>
  );
};

export const useCustomization = () => {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useCustomization must be used within a CustomizationProvider');
  }
  return context;
};
