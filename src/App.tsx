import * as Dialog from "@radix-ui/react-dialog";
import * as Slider from "@radix-ui/react-slider";
import * as Switch from "@radix-ui/react-switch";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  Activity,
  AppWindow,
  Archive,
  ArrowLeft,
  ArrowRight,
  Battery,
  Bell,
  Bot,
  Box,
  Calendar,
  Check,
  Circle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Cloud,
  Command,
  Copy,
  Cpu,
  Database,
  Download,
  Eye,
  FileText,
  Folder,
  Gauge,
  Globe2,
  Grid2X2,
  HardDrive,
  Home,
  Image as ImageIcon,
  Leaf,
  Mail,
  Maximize2,
  Mic,
  Minimize2,
  MoreHorizontal,
  Music2,
  Network,
  NotebookPen,
  Paintbrush,
  Palette,
  PenLine,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Shield,
  SlidersHorizontal,
  Square,
  Star,
  Trash2,
  Triangle,
  Type,
  Upload,
  Volume2,
  VolumeX,
  Wifi,
  X,
  Zap
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  type CSSProperties,
  type Dispatch,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

type ModuleId = "workspace" | "files" | "settings" | "notes" | "dashboard" | "assistant" | "browser" | "paint";
type LaunchOrigin = { x: number; y: number };
type OpenWindowHandler = (module: ModuleId, origin?: LaunchOrigin) => void;

type NoteItem = { id: string; title: string; content: string };

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === "aurora" || password === "") {
      onUnlock();
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="lock-screen">
      <div style={{ textAlign: "center" }}>
        <div className="lock-avatar" />
        <h2>Welcome Back</h2>
        <p>Enter password or leave blank to unlock</p>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={e => { setPassword(e.target.value); setError(false); }}
          placeholder="Password..."
          style={error ? { borderColor: "var(--rose)" } : undefined}
        />
        {error && <span style={{ color: "var(--rose)", fontSize: 12, textAlign: "center" }}>Incorrect password</span>}
        <button type="submit">Unlock</button>
      </form>
    </div>
  );
}

const NOTES_KEY = "atomos-notes-v1";

function loadNotes(): NoteItem[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (raw) return JSON.parse(raw) as NoteItem[];
  } catch { /* ignore */ }
  return [
    { id: "project-notes", title: "Project Notes", content: "AtomOS uses light, depth, and motion as functional material. Panels should arrive softly, controls should answer immediately, and visual density should stay low enough for the wallpaper to breathe." },
    { id: "ideas", title: "Ideas", content: "" },
    { id: "today", title: "Today", content: "" }
  ];
}

function saveNotes(notes: NoteItem[]): void {
  try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); } catch { /* ignore */ }
}

type AppSettings = {
  theme: string;
  style: string;
  accent: string;
  glass: number;
  uiScale: number;
  volume: number;
  soundEffects: boolean;
  notificationsEnabled: boolean;
  compactInterface: boolean;
  networkEnabled: boolean;
  syncEnabled: boolean;
  profileLock: boolean;
  reduceMotion: boolean;
  backgroundEffects: boolean;
};

const SETTINGS_KEY = "atomos-settings-v1";

const defaultSettings: AppSettings = {
  theme: "Light",
  style: "Normal",
  accent: "#7c6bff",
  glass: 72,
  uiScale: 100,
  volume: 54,
  soundEffects: true,
  notificationsEnabled: true,
  compactInterface: false,
  networkEnabled: true,
  syncEnabled: true,
  profileLock: true,
  reduceMotion: false,
  backgroundEffects: true
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...defaultSettings };
}

function persistSettings(settings: AppSettings): void {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* ignore */ }
}

function applySettingsCSS(s: AppSettings): void {
  const [h, sat, l] = hexToHsl(s.accent);
  const root = document.documentElement;
  root.style.setProperty("--accent-h", String(h));
  root.style.setProperty("--accent-s", `${sat}%`);
  root.style.setProperty("--accent-l", `${l}%`);
  root.style.setProperty("--glass-strength", `${s.glass / 100}`);
  root.style.setProperty("--ui-scale", `${s.uiScale / 100}`);
  root.toggleAttribute("data-reduce-motion", s.reduceMotion);
  root.toggleAttribute("data-background-effects-off", !s.backgroundEffects);
  root.toggleAttribute("data-compact-interface", s.compactInterface);
  root.toggleAttribute("data-theme-dark", s.theme === "Dark");
  root.toggleAttribute("data-style-glass", s.style === "Glass");
}

function hexToHsl(hex: string): [number, number, number] {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

type WindowState = {
  id: string;
  module: ModuleId;
  title: string;
  position: LaunchOrigin;
  size: { width: number; height: number };
  z: number;
  minimized: boolean;
  maximized?: boolean;
  origin?: LaunchOrigin;
  restoreBounds?: { position: LaunchOrigin; size: { width: number; height: number } };
};

type ContextMenuState = {
  x: number;
  y: number;
  kind: "desktop" | "file" | "window";
  label?: string;
};

type SystemSettings = {
  browserHomePage: string;
  searchEngine: string;
};

type ModuleMeta = {
  id: ModuleId;
  title: string;
  subtitle: string;
  color: string;
  icon: ReactNode;
  defaultPosition: LaunchOrigin;
  defaultSize: { width: number; height: number };
};

function defaultLaunchOrigin(): LaunchOrigin {
  const width = typeof window === "undefined" ? 1536 : window.innerWidth;
  const height = typeof window === "undefined" ? 1024 : window.innerHeight;
  return { x: width - 96, y: height / 2 };
}

function originFromElement(element: HTMLElement): LaunchOrigin {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function originFromEvent<T extends HTMLElement>(event: ReactMouseEvent<T>): LaunchOrigin {
  return originFromElement(event.currentTarget);
}

function launcherPanelAnchor(): LaunchOrigin {
  const width = typeof window === "undefined" ? 1536 : window.innerWidth;
  const height = typeof window === "undefined" ? 1024 : window.innerHeight;
  return { x: width / 2, y: Math.max(160, Math.min(height - 180, 418)) };
}

const referenceImages = [
  "/reference/ChatGPT Image Apr 24, 2026, 08_34_14 PM.png",
  "/reference/ChatGPT Image Apr 24, 2026, 08_34_09 PM.png",
  "/reference/ChatGPT Image Apr 24, 2026, 08_34_05 PM.png",
  "/reference/ChatGPT Image Apr 24, 2026, 08_33_48 PM.png",
  "/reference/ChatGPT Image Apr 24, 2026, 08_33_30 PM.png"
];

const modules: ModuleMeta[] = [
  {
    id: "workspace",
    title: "Workspace",
    subtitle: "A calm canvas for active projects",
    color: "var(--accent)",
    icon: <AppWindow />,
    defaultPosition: { x: 120, y: 90 },
    defaultSize: { width: 920, height: 640 }
  },
  {
    id: "files",
    title: "Explorer",
    subtitle: "Files, spaces, and visual assets",
    color: "#5b9cff",
    icon: <Folder />,
    defaultPosition: { x: 160, y: 120 },
    defaultSize: { width: 960, height: 660 }
  },
  {
    id: "browser",
    title: "Browser",
    subtitle: "Private local web workspace",
    color: "#5bd8e8",
    icon: <Globe2 />,
    defaultPosition: { x: 200, y: 100 },
    defaultSize: { width: 1024, height: 720 }
  },
  {
    id: "settings",
    title: "Settings",
    subtitle: "System preferences and appearance",
    color: "var(--accent)",
    icon: <Settings />,
    defaultPosition: { x: 240, y: 140 },
    defaultSize: { width: 960, height: 660 }
  },
  {
    id: "notes",
    title: "Notes",
    subtitle: "Quiet writing and saved context",
    color: "#f6b65d",
    icon: <NotebookPen />,
    defaultPosition: { x: 280, y: 160 },
    defaultSize: { width: 820, height: 580 }
  },
  {
    id: "dashboard",
    title: "System Pulse",
    subtitle: "Health, activity, and device status",
    color: "#5ad38b",
    icon: <Gauge />,
    defaultPosition: { x: 320, y: 110 },
    defaultSize: { width: 880, height: 620 }
  },
  {
    id: "assistant",
    title: "Aurora Assistant",
    subtitle: "Contextual command companion",
    color: "#5bd8e8",
    icon: <Bot />,
    defaultPosition: { x: 500, y: 150 },
    defaultSize: { width: 440, height: 580 }
  },
  {
    id: "paint",
    title: "Canvas Paint",
    subtitle: "Draw, sketch, and create",
    color: "#ef7187",
    icon: <PenLine />,
    defaultPosition: { x: 180, y: 130 },
    defaultSize: { width: 980, height: 680 }
  }
];

const moduleById = Object.fromEntries(modules.map((item) => [item.id, item])) as Record<ModuleId, ModuleMeta>;

const initialWindows: WindowState[] = [
  {
    id: "workspace",
    module: "workspace",
    title: moduleById.workspace.title,
    position: moduleById.workspace.defaultPosition,
    size: moduleById.workspace.defaultSize,
    z: 4,
    minimized: false
  },
  {
    id: "dashboard",
    module: "dashboard",
    title: moduleById.dashboard.title,
    position: moduleById.dashboard.defaultPosition,
    size: moduleById.dashboard.defaultSize,
    z: 3,
    minimized: false
  }
];

const files = [
  { name: "Project Aurora", type: "fig", size: "2.4 MB", color: "#b59cff", image: referenceImages[1], openWith: "paint" as ModuleId },
  { name: "Concept Notes", type: "docx", size: "1.2 MB", color: "#f6b65d", image: referenceImages[2], openWith: "notes" as ModuleId },
  { name: "Moodboard", type: "board", size: "3.6 MB", color: "#5bd8e8", image: referenceImages[4], openWith: "paint" as ModuleId },
  { name: "Flow Architecture", type: "pdf", size: "5.8 MB", color: "#5b9cff", image: referenceImages[0], openWith: "browser" as ModuleId },
  { name: "Brand Assets", type: "zip", size: "9.1 MB", color: "#ef7187", image: referenceImages[3], openWith: "files" as ModuleId },
  { name: "User Journey", type: "mind", size: "4.3 MB", color: "#5ad38b", image: referenceImages[2], openWith: "notes" as ModuleId }
];

const folders = [
  { name: "Design", items: "12 items", color: "#8bbcff", icon: <Palette /> },
  { name: "Projects", items: "8 items", color: "#ffc678", icon: <Leaf /> },
  { name: "Ideas", items: "23 items", color: "#7be0c5", icon: <PenLine /> },
  { name: "References", items: "16 items", color: "#b59cff", icon: <Archive /> },
  { name: "Archive", items: "10 items", color: "#c5cad5", icon: <Box /> }
];

const notifications: Array<{ title: string; body: string; time: string; color: string; icon: ReactNode; module: ModuleId }> = [
  { title: "Design Sync", body: "Your meeting starts in 10 minutes", time: "10:14 AM", color: "#5b9cff", icon: <Calendar />, module: "workspace" },
  { title: "Project Update", body: "The Aurora workspace has been updated", time: "9:58 AM", color: "#7c6bff", icon: <Folder />, module: "files" },
  { title: "System Update", body: "Your system is up to date", time: "9:30 AM", color: "#5ad38b", icon: <Shield />, module: "settings" },
  { title: "File Upload Complete", body: "Design_Concept_v3.fig uploaded", time: "9:21 AM", color: "#5bd8e8", icon: <Cloud />, module: "files" },
  { title: "AI Insight", body: "You have been in deep focus for 2h 15m", time: "9:00 AM", color: "#b59cff", icon: <Bot />, module: "assistant" }
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(): string {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function App() {
  const [userName, setUserName] = useState<string | null>(() => localStorage.getItem("atomos-user"));
  const [nameInput, setNameInput] = useState("");
  const [windows, setWindows] = useState<WindowState[]>(initialWindows);
  const [nextZ, setNextZ] = useState(8);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [launcherOrigin, setLauncherOrigin] = useState<LaunchOrigin>(defaultLaunchOrigin);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsEnabled = loadSettings().notificationsEnabled;
  const toggleNotifications = () => {
    if (!notificationsEnabled) return;
    setNotificationsOpen((open) => !open);
  };
  const [query, setQuery] = useState("");
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    browserHomePage: "atom://home",
    searchEngine: "Aurora"
  });
  const [widgetsVisible, setWidgetsVisible] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [greeting, setGreeting] = useState(getGreeting);
  const [dateStr, setDateStr] = useState(formatDate);
  const [timeStr, setTimeStr] = useState(formatTime);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const resetIdle = () => {
      clearTimeout(timeout);
      const s = loadSettings();
      if (s.profileLock && !isLocked) {
        timeout = setTimeout(() => setIsLocked(true), 60000); // 1 minute idle
      }
    };
    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("keydown", resetIdle);
    window.addEventListener("click", resetIdle);
    resetIdle();
    return () => {
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("keydown", resetIdle);
      window.removeEventListener("click", resetIdle);
      clearTimeout(timeout);
    };
  }, [isLocked]);

  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    const handleUserClick = (e: MouseEvent) => {
      const s = loadSettings();
      if (!s.soundEffects || s.volume === 0) return;
      const target = e.target as HTMLElement;
      if (target.closest("button, [role='switch'], .rail-item-wrap, input[type='range'], input[type='checkbox']")) {
        if (!audioCtx) {
          const AC = window.AudioContext || (window as any).webkitAudioContext;
          if (AC) audioCtx = new AC();
        }
        if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
        if (!audioCtx) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
        
        gain.gain.setValueAtTime((s.volume / 100) * 0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      }
    };
    window.addEventListener("click", handleUserClick, { capture: true });
    return () => {
      window.removeEventListener("click", handleUserClick, { capture: true });
      audioCtx?.close();
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setGreeting(getGreeting());
      setDateStr(formatDate());
      setTimeStr(formatTime());
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  const submitName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    localStorage.setItem("atomos-user", trimmed);
    setUserName(trimmed);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isCommandSearch = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isCommandSearch) {
        event.preventDefault();
        setLauncherOpen((open) => !open);
      }
      if (event.key === "Escape") {
        if (notificationsOpen) {
          setNotificationsOpen(false);
        } else if (contextMenu) {
          setContextMenu(null);
        } else {
          setWindows((current) => {
            const visible = current.filter((w) => !w.minimized);
            if (!visible.length) return current;
            const top = visible.reduce((a, b) => (a.z > b.z ? a : b));
            return current.map((w) => (w.id === top.id ? { ...w, minimized: true } : w));
          });
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [notificationsOpen, contextMenu]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const resetIdle = () => {
      clearTimeout(timeout);
      const s = loadSettings();
      if (s.profileLock && !isLocked) {
        timeout = setTimeout(() => {
          setIsLocked(true);
        }, 60000); // 1 minute idle
      }
    };

    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("keydown", resetIdle);
    window.addEventListener("click", resetIdle);
    resetIdle();

    return () => {
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("keydown", resetIdle);
      window.removeEventListener("click", resetIdle);
      clearTimeout(timeout);
    };
  }, [isLocked]);

  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    const handleUserClick = (e: MouseEvent) => {
      const s = loadSettings();
      if (!s.soundEffects || s.volume === 0) return;
      const target = e.target as HTMLElement;
      if (target.closest("button, [role='switch'], .rail-item-wrap, input[type='range'], input[type='checkbox']")) {
        if (!audioCtx) {
          const AC = window.AudioContext || (window as any).webkitAudioContext;
          if (AC) audioCtx = new AC();
        }
        if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
        if (!audioCtx) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
        
        gain.gain.setValueAtTime((s.volume / 100) * 0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      }
    };
    window.addEventListener("click", handleUserClick, { capture: true });
    return () => {
      window.removeEventListener("click", handleUserClick, { capture: true });
      audioCtx?.close();
    };
  }, []);

  useEffect(() => {
    const s = loadSettings();
    applySettingsCSS(s);
  }, []);

  const focusWindow = (id: string) => {
    setWindows((current) => current.map((win) => (win.id === id ? { ...win, z: nextZ, minimized: false } : win)));
    setNextZ((z) => z + 1);
  };

  const iconOrigin = (event?: ReactMouseEvent<HTMLElement>) => {
    if (!event) return defaultLaunchOrigin();
    return originFromEvent(event);
  };

  const openLauncher = (origin?: LaunchOrigin) => {
    setLauncherOrigin(origin ?? defaultLaunchOrigin());
    setLauncherOpen(true);
  };

  const openWindow: OpenWindowHandler = (module, origin) => {
    const meta = moduleById[module];
    const resolvedOrigin = origin ?? defaultLaunchOrigin();
    setWindows((current) => {
      const existing = current.find((win) => win.module === module);
      if (existing) {
        return current.map((win) => (win.id === existing.id ? { ...win, minimized: false, z: nextZ, origin: resolvedOrigin } : win));
      }
      return [
        ...current,
        {
          id: `${module}-${Date.now()}`,
          module,
          title: meta.title,
          position: meta.defaultPosition,
          size: meta.defaultSize,
          z: nextZ,
          minimized: false,
          origin: resolvedOrigin
        }
      ];
    });
    setNextZ((z) => z + 1);
    setLauncherOpen(false);
  };

  const toggleWindow: OpenWindowHandler = (module, origin) => {
    const existing = windows.find((win) => win.module === module);
    if (existing && !existing.minimized) {
      minimizeWindow(existing.id);
    } else {
      openWindow(module, origin);
    }
  };

  const closeWindow = (id: string) => {
    const win = windows.find((w) => w.id === id);
    const railIcon = win ? document.querySelector<HTMLElement>(`[data-rail-module="${win.module}"]`) : null;
    const railOrigin = railIcon ? originFromElement(railIcon) : defaultLaunchOrigin();
    setWindows((current) =>
      current.map((w) => (w.id === id ? { ...w, origin: railOrigin } : w))
    );
    requestAnimationFrame(() => {
      setWindows((current) => current.filter((w) => w.id !== id));
    });
  };

  const minimizeWindow = (id: string) => {
    const win = windows.find((w) => w.id === id);
    const railIcon = win ? document.querySelector<HTMLElement>(`[data-rail-module="${win.module}"]`) : null;
    const railOrigin = railIcon ? originFromElement(railIcon) : defaultLaunchOrigin();
    setWindows((current) =>
      current.map((w) =>
        w.id === id ? { ...w, minimized: true, origin: railOrigin } : w
      )
    );
  };

  const moveWindow = (id: string, position: LaunchOrigin) => {
    setWindows((current) =>
      current.map((win) =>
        win.id === id
          ? {
              ...win,
              position: {
                x: clamp(position.x, 16, Math.max(16, window.innerWidth - 260)),
                y: clamp(position.y, 72, Math.max(72, window.innerHeight - 180))
              }
            }
          : win
      )
    );
  };

  const resizeWindow = (id: string, size: { width: number; height: number }) => {
    setWindows((current) =>
      current.map((win) => (win.id === id ? { ...win, size } : win))
    );
  };

  const toggleMaximizeWindow = (id: string) => {
    setWindows((current) =>
      current.map((win) => {
        if (win.id !== id) return win;
        if (win.maximized) {
          const meta = moduleById[win.module];
          return {
            ...win,
            maximized: false,
            position: win.restoreBounds?.position ?? meta.defaultPosition,
            size: win.restoreBounds?.size ?? meta.defaultSize,
            z: nextZ,
            restoreBounds: undefined
          };
        }
        return {
          ...win,
          maximized: true,
          restoreBounds: { position: win.position, size: win.size },
          position: { x: 104, y: 84 },
          size: {
            width: Math.max(360, window.innerWidth - 136),
            height: Math.max(360, window.innerHeight - 188)
          },
          z: nextZ
        };
      })
    );
    setNextZ((z) => z + 1);
  };

  const openContextMenu = (event: ReactMouseEvent<HTMLElement>) => {
    event.preventDefault();
    const target = event.target as HTMLElement;
    const fileTarget = target.closest<HTMLElement>("[data-context-file]");
    const windowTarget = target.closest<HTMLElement>("[data-context-window]");
    setContextMenu({
      x: Math.min(event.clientX, window.innerWidth - 220),
      y: Math.min(event.clientY, window.innerHeight - 240),
      kind: fileTarget ? "file" : windowTarget ? "window" : "desktop",
      label: fileTarget?.dataset.contextFile ?? windowTarget?.dataset.contextWindow
    });
  };

  const visibleWindows = windows.filter((win) => !win.minimized);
  const openModules = new Set(windows.filter((win) => !win.minimized).map((win) => win.module));
  const minimizedModules = new Set(windows.filter((win) => win.minimized).map((win) => win.module));

  if (!userName) {
    return (
      <main className="desktop-shell">
        <div className="wallpaper" aria-hidden="true" />
        <div className="ambient ambient-one" aria-hidden="true" />
        <div className="ambient ambient-two" aria-hidden="true" />
        <div className="desktop-noise" aria-hidden="true" />
        <div className="welcome-screen">
          <div className="welcome-card glass-window">
            <span className="welcome-orb"><Command /></span>
            <h1>Welcome to AtomOS</h1>
            <p>Your personal workspace awaits. What should we call you?</p>
            <form onSubmit={(e) => { e.preventDefault(); submitName(); }}>
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name"
                className="welcome-input"
              />
              <button type="submit" className="welcome-btn" disabled={!nameInput.trim()}>
                Get Started
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <Tooltip.Provider delayDuration={260}>
      <main
        className="desktop-shell"
        ref={shellRef}
        onClick={() => setContextMenu(null)}
        onContextMenu={openContextMenu}
      >
        {isLocked && <LockScreen onUnlock={() => setIsLocked(false)} />}
        <div className="wallpaper" aria-hidden="true" />
        <div className="ambient ambient-one" aria-hidden="true" />
        <div className="ambient ambient-two" aria-hidden="true" />
        <div className="desktop-noise" aria-hidden="true" />

        <SideRail
          onLauncher={openLauncher}
          onToggleWindow={toggleWindow}
          getOrigin={iconOrigin}
          onNotifications={toggleNotifications}
          openModules={openModules}
          minimizedModules={minimizedModules}
          userName={userName}
        />

        <TopStatus onNotifications={toggleNotifications} dateStr={dateStr} timeStr={timeStr} />
        {/* ModePill removed — Nebula Flow pill no longer shown */}
        <DesktopWidgets
          onOpenWindow={openWindow}
          visible={widgetsVisible}
          setVisible={setWidgetsVisible}
          greeting={greeting}
          userName={userName}
        />

        <section className="window-layer" aria-label="Open windows">
          <AnimatePresence>
            {windows.map((win, index) => (
              <WindowFrame
                key={win.id}
                index={index}
                windowState={win}
                onFocus={focusWindow}
                onClose={closeWindow}
                onMinimize={minimizeWindow}
                onMove={moveWindow}
                onResize={resizeWindow}
                onToggleMaximize={toggleMaximizeWindow}
              >
                <ModuleContent
                  module={win.module}
                  openWindow={openWindow}
                  systemSettings={systemSettings}
                  setSystemSettings={setSystemSettings}
                />
              </WindowFrame>
            ))}
          </AnimatePresence>
        </section>

        <LauncherDialog
          open={launcherOpen}
          origin={launcherOrigin}
          onOpenChange={setLauncherOpen}
          query={query}
          setQuery={setQuery}
          onOpenWindow={openWindow}
        />

        <NotificationPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} onOpenWindow={openWindow} />
        <AnimatePresence>
          {contextMenu && (
            <DesktopContextMenu
              menu={contextMenu}
              onClose={() => setContextMenu(null)}
              onOpenWindow={openWindow}
              onNotifications={() => setNotificationsOpen(true)}
            />
          )}
        </AnimatePresence>
      </main>
    </Tooltip.Provider>
  );
}

function SideRail({
  onLauncher,
  onToggleWindow,
  getOrigin,
  onNotifications,
  openModules,
  minimizedModules,
  userName
}: {
  onLauncher: (origin?: LaunchOrigin) => void;
  onToggleWindow: OpenWindowHandler;
  getOrigin: (event?: ReactMouseEvent<HTMLElement>) => LaunchOrigin;
  onNotifications: () => void;
  openModules: Set<ModuleId>;
  minimizedModules: Set<ModuleId>;
  userName: string;
}) {
  const items: Array<{ label: string; module?: ModuleId; icon: ReactNode; action?: (origin: LaunchOrigin) => void }> = [
    { label: "Open Workspace", module: "workspace", icon: <AppWindow /> },
    { label: "Open Files", module: "files", icon: <Folder /> },
    { label: "Open Browser", module: "browser", icon: <Globe2 /> },
    { label: "Open Notes", module: "notes", icon: <NotebookPen /> },
    { label: "Open Dashboard", module: "dashboard", icon: <Gauge /> },
    { label: "Open Settings", module: "settings", icon: <Settings /> }
  ];

  const pinnedModules = new Set(items.map((i) => i.module).filter(Boolean));
  const activeModules = new Set([...openModules, ...minimizedModules]);
  
  for (const mod of activeModules) {
    if (!pinnedModules.has(mod)) {
      const meta = moduleById[mod as ModuleId];
      if (meta) {
        items.push({ label: `Open ${meta.title}`, module: mod as ModuleId, icon: meta.icon });
      }
    }
  }

  return (
    <nav className="side-rail glass-panel" aria-label="Primary">
      <IconButton label="Open command center" className="rail-orb" onClick={(event) => onLauncher(getOrigin(event))}>
        <Command />
      </IconButton>
      <div className="rail-stack">
        {items.map((item) => (
          <div key={item.label} className="rail-item-wrap" data-rail-module={item.module ?? ""}>
            <IconButton
              label={item.label}
              active={item.module ? openModules.has(item.module) : false}
              onClick={(event) => {
                const origin = getOrigin(event);
                if (item.action) item.action(origin);
                else if (item.module) onToggleWindow(item.module, origin);
              }}
            >
              {item.icon}
            </IconButton>
            {item.module && minimizedModules.has(item.module) && !openModules.has(item.module) && (
              <span className="minimized-dot" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
      <div className="rail-stack rail-bottom">
        <IconButton label="Show notifications" onClick={onNotifications}>
          <Bell />
        </IconButton>
        <button className="avatar-button" aria-label="Open profile">
          <span>{userName.charAt(0).toUpperCase()}</span>
        </button>
      </div>
    </nav>
  );
}

function TopStatus({ onNotifications, dateStr, timeStr }: { onNotifications: () => void; dateStr: string; timeStr: string }) {
  const [popup, setPopup] = useState<"connection" | "calendar" | null>(null);
  const s = loadSettings();
  const muted = s.volume === 0 || !s.soundEffects;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const today = now.getDate();
  const monthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const calendarDays = Array.from({ length: firstDay }, () => 0).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  return (
    <>
      <div className="top-status glass-panel" aria-label="System status">
        <span className="status-cluster" onClick={() => setPopup(popup === "connection" ? null : "connection")} style={{ cursor: "pointer" }}>
          <Wifi size={17} />
          {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          <Battery size={18} />
        </span>
        <button className="status-date-btn" onClick={() => setPopup(popup === "calendar" ? null : "calendar")}>
          <span className="status-date">{dateStr}</span>
          <strong>{timeStr}</strong>
        </button>
        <IconButton label="Show notifications" className="status-button" onClick={onNotifications}>
          <Bell />
        </IconButton>
      </div>
      <AnimatePresence>
        {popup && (
          <>
            <motion.div
              className="status-popup-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setPopup(null)}
            />
            <motion.div
              className="status-popup glass-panel"
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ right: popup === "calendar" ? 100 : 180 }}
            >
              {popup === "connection" && (
                <div className="status-popup-content">
                  <h4>Connections</h4>
                  <div className="status-popup-row">
                    <span className="status-popup-icon"><Wifi size={16} /></span>
                    <div><strong>Wi-Fi</strong><small>AuroraNet · Connected</small></div>
                    <span className="status-badge on">On</span>
                  </div>
                  <div className="status-popup-row">
                    <span className="status-popup-icon"><Volume2 size={16} /></span>
                    <div><strong>Sound</strong><small>{muted ? "Muted" : `Volume ${s.volume}%`}</small></div>
                    <span className={`status-badge ${muted ? "off" : "on"}`}>{muted ? "Off" : "On"}</span>
                  </div>
                  <div className="status-popup-row">
                    <span className="status-popup-icon"><Battery size={16} /></span>
                    <div><strong>Battery</strong><small>87% · Charging</small></div>
                    <span className="status-badge on">Good</span>
                  </div>
                  <div className="status-popup-row">
                    <span className="status-popup-icon"><Globe2 size={16} /></span>
                    <div><strong>Network</strong><small>{s.networkEnabled ? "320 Mbps · Online" : "Paused"}</small></div>
                    <span className={`status-badge ${s.networkEnabled ? "on" : "off"}`}>{s.networkEnabled ? "On" : "Off"}</span>
                  </div>
                </div>
              )}
              {popup === "calendar" && (
                <div className="status-popup-content">
                  <h4>{monthName}</h4>
                  <div className="mini-calendar">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                      <span key={`h${i}`} className="cal-header">{d}</span>
                    ))}
                    {calendarDays.map((d, i) => (
                      <span key={i} className={`cal-day ${d === 0 ? "empty" : ""} ${d === today ? "today" : ""}`}>
                        {d > 0 ? d : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ModePill({ onOpen }: { onOpen: (event: ReactMouseEvent<HTMLButtonElement>) => void }) {
  return (
    <div className="mode-pill glass-panel">
      <Command size={18} />
      <button onClick={onOpen}>
        Nebula Flow
        <ChevronDown size={15} />
      </button>
    </div>
  );
}

function DesktopWidgets({
  onOpenWindow,
  visible,
  setVisible,
  greeting,
  userName
}: {
  onOpenWindow: OpenWindowHandler;
  visible: boolean;
  setVisible: (next: boolean) => void;
  greeting: string;
  userName: string;
}) {
  return (
    <>
      <header className="greeting">
        <span className="brand-mark">
          <Command />
        </span>
        <h1>{greeting}, {userName}</h1>
        <p>The world is your interface. What will you bring to life today?</p>
      </header>

      <button
        className={`widget-edge widget-edge-right ${visible ? "is-open" : ""}`}
        aria-label={visible ? "Hide widgets" : "Show widgets"}
        onClick={() => setVisible(!visible)}
      >
        {visible ? <ChevronRight /> : <ChevronLeft />}
      </button>

      <aside className={`widget-column right-widgets ${visible ? "is-visible" : ""}`} aria-label="Widgets" onMouseLeave={() => setVisible(false)}>
        <button className="widget-close right" aria-label="Hide widgets" onClick={() => setVisible(false)}>
          <ChevronRight />
        </button>
        <GlassCard className="focus-card">
          <div className="card-head">
            <span className="mini-icon violet">
              <CircleDot />
            </span>
            <span>Focus</span>
            <button className="card-icon-action" aria-label="Open notifications" onClick={(event) => onOpenWindow("dashboard", originFromEvent(event))}>
              <Bell size={17} />
            </button>
          </div>
          <div className="focus-ring" style={{ "--progress": "78%" } as CSSProperties}>
            <span>Deep Work</span>
            <strong>120 min</strong>
            <button aria-label="Start focus">
              <Zap size={16} />
            </button>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="card-head">
            <span className="mini-icon blue">
              <Activity />
            </span>
            <span>Pulse</span>
            <button className="card-icon-action" aria-label="Open pulse dashboard" onClick={(event) => onOpenWindow("dashboard", originFromEvent(event))}>
              <ChevronDown size={16} />
            </button>
          </div>
          <div className="pulse-row">
            <strong>98</strong>
            <span>System Score</span>
          </div>
          <Sparkline color="#5b7cff" />
          <p className="success">Optimal</p>
        </GlassCard>

        <GlassCard className="ambient-card">
          <div className="card-head">
            <span className="mini-icon cyan">
              <CircleDot />
            </span>
            <span>Ambient</span>
            <button className="card-icon-action" aria-label="Open ambient files" onClick={(event) => onOpenWindow("files", originFromEvent(event))}>
              <ChevronDown size={16} />
            </button>
          </div>
          <div>
            <strong>Mount Elysia</strong>
            <p>Live Scene</p>
          </div>
          <img src={referenceImages[0]} alt="" />
        </GlassCard>
        <GlassCard className="agenda-card">
          <div className="card-head">
            <Calendar size={18} />
            <span>Today</span>
            <ChevronDown size={16} />
          </div>
          {["Design Sync", "Focus Block", "Team Huddle"].map((item, index) => (
            <div className="agenda-item" key={item}>
              <span style={{ "--dot": index === 2 ? "#f6b65d" : index === 1 ? "#5b9cff" : "#7c6bff" } as CSSProperties} />
              <div>
                <strong>{item}</strong>
                <p>{index === 0 ? "10:00 - 11:00 AM" : index === 1 ? "1:00 - 4:00 PM" : "5:00 - 5:30 PM"}</p>
              </div>
            </div>
          ))}
        </GlassCard>

        <GlassCard className="quick-actions">
          <div className="card-head">
            <Command size={18} />
            <span>Quick Actions</span>
          </div>
          <button onClick={(event) => onOpenWindow("notes", originFromEvent(event))}>
            <PenLine /> Take a Note
          </button>
          <button onClick={(event) => onOpenWindow("files", originFromEvent(event))}>
            <Upload /> Upload Files
          </button>
          <button onClick={(event) => onOpenWindow("assistant", originFromEvent(event))}>
            <Bot /> New Idea
          </button>
        </GlassCard>
      </aside>
    </>
  );
}

function WindowFrame({
  children,
  index,
  windowState,
  onFocus,
  onClose,
  onMinimize,
  onMove,
  onResize,
  onToggleMaximize
}: {
  children: ReactNode;
  index: number;
  windowState: WindowState;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMove: (id: string, position: LaunchOrigin) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
  onToggleMaximize: (id: string) => void;
}) {
  const meta = moduleById[windowState.module];
  const origin = windowState.origin ?? defaultLaunchOrigin();
  const originX = origin.x - windowState.position.x;
  const originY = origin.y - windowState.position.y;
  const frameRef = useRef<HTMLElement>(null);

  const sizeRef = useRef(windowState.size);
  sizeRef.current = windowState.size;
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (windowState.maximized || dragRef.current || w <= 0 || h <= 0) return;
      if (Math.abs(w - sizeRef.current.width) > 2 || Math.abs(h - sizeRef.current.height) > 2) {
        onResize(windowState.id, { width: w, height: h });
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [windowState.id, windowState.maximized, onResize]);
  const dragRef = useRef<{
    startX: number; startY: number;
    originX: number; originY: number;
    curX: number; curY: number;
  } | null>(null);

  const startDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0 || windowState.maximized) return;
    onFocus(windowState.id);
    if (frameRef.current) frameRef.current.style.transition = "none";
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: windowState.position.x,
      originY: windowState.position.y,
      curX: windowState.position.x,
      curY: windowState.position.y
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const updateDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragRef.current || !frameRef.current) return;
    const x = clamp(
      dragRef.current.originX + event.clientX - dragRef.current.startX,
      16, Math.max(16, window.innerWidth - 260)
    );
    const y = clamp(
      dragRef.current.originY + event.clientY - dragRef.current.startY,
      72, Math.max(72, window.innerHeight - 180)
    );
    dragRef.current.curX = x;
    dragRef.current.curY = y;
    frameRef.current.style.left = `${x}px`;
    frameRef.current.style.top = `${y}px`;
  };

  const endDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (dragRef.current) {
      onMove(windowState.id, { x: dragRef.current.curX, y: dragRef.current.curY });
    }
    dragRef.current = null;
    if (frameRef.current) frameRef.current.style.transition = "";
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const toOrigin = {
    opacity: 0,
    scale: 0.08,
    x: origin.x - windowState.position.x - windowState.size.width / 2,
    y: origin.y - windowState.position.y - windowState.size.height / 2,
    filter: "blur(12px)",
  };

  const visible = {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    filter: "blur(0px)",
  };

  const smoothEase = [0.4, 0, 0.2, 1] as const;

  return (
    <motion.section
      ref={frameRef as RefObject<HTMLElement>}
      className={`window-frame glass-window ${windowState.maximized ? "is-maximized" : ""}`}
      aria-label={`${windowState.title} window`}
      data-context-window={windowState.title}
      data-module={windowState.module}
      data-stack={index}
      initial={toOrigin}
      animate={windowState.minimized ? toOrigin : visible}
      exit={toOrigin}
      transition={{
        duration: 0.55,
        ease: smoothEase,
        scale: { duration: 0.6, ease: smoothEase },
        opacity: { duration: windowState.minimized ? 0.45 : 0.35, ease: smoothEase },
        filter: { duration: 0.4, ease: smoothEase },
      }}
      onPointerDown={() => onFocus(windowState.id)}
      style={
        {
          left: windowState.position.x,
          top: windowState.position.y,
          width: windowState.size.width,
          height: windowState.size.height,
          zIndex: windowState.z,
          transformOrigin: `${originX}px ${originY}px`,
          borderRadius: windowState.maximized ? 22 : 28,
          pointerEvents: windowState.minimized ? "none" : "auto",
          transition: "left 0.5s cubic-bezier(0.4,0,0.2,1), top 0.5s cubic-bezier(0.4,0,0.2,1), width 0.5s cubic-bezier(0.4,0,0.2,1), height 0.5s cubic-bezier(0.4,0,0.2,1), border-radius 0.5s cubic-bezier(0.4,0,0.2,1)",
          "--stack": index,
          "--module-color": meta.color
        } as CSSProperties
      }
    >
      <header
        className="window-titlebar"
        onPointerDown={startDrag}
        onPointerMove={updateDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div>
          <span className="window-icon" style={{ "--module-color": meta.color } as CSSProperties}>
            {meta.icon}
          </span>
          <div>
            <h2>{windowState.title}</h2>
            <p>{meta.subtitle}</p>
          </div>
        </div>
        <div className="window-controls" onPointerDown={(event) => event.stopPropagation()}>
          <button aria-label={`Minimize ${windowState.title}`} onClick={() => onMinimize(windowState.id)}>
            <Minimize2 />
          </button>
          <button
            aria-label={`${windowState.maximized ? "Restore" : "Maximize"} ${windowState.title}`}
            onClick={() => onToggleMaximize(windowState.id)}
          >
            {windowState.maximized ? <Copy /> : <Maximize2 />}
          </button>
          <button aria-label={`Close ${windowState.title}`} onClick={() => onClose(windowState.id)}>
            <X />
          </button>
        </div>
      </header>
      <div className="window-content">{children}</div>
      <span
        className="resize-grip"
        aria-hidden="true"
        onPointerDown={(e) => {
          if (e.button !== 0 || windowState.maximized) return;
          e.stopPropagation();
          e.preventDefault();
          const startX = e.clientX;
          const startY = e.clientY;
          const startW = windowState.size.width;
          const startH = windowState.size.height;
          if (frameRef.current) frameRef.current.style.transition = "none";
          const onMove = (ev: PointerEvent) => {
            const w = Math.max(340, startW + ev.clientX - startX);
            const h = Math.max(290, startH + ev.clientY - startY);
            if (frameRef.current) {
              frameRef.current.style.width = `${w}px`;
              frameRef.current.style.height = `${h}px`;
            }
          };
          const onUp = (ev: PointerEvent) => {
            const w = Math.max(340, startW + ev.clientX - startX);
            const h = Math.max(290, startH + ev.clientY - startY);
            onResize(windowState.id, { width: w, height: h });
            if (frameRef.current) frameRef.current.style.transition = "";
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
          };
          window.addEventListener("pointermove", onMove);
          window.addEventListener("pointerup", onUp);
        }}
      />
    </motion.section>
  );
}

function ModuleContent({
  module,
  openWindow,
  systemSettings,
  setSystemSettings
}: {
  module: ModuleId;
  openWindow: OpenWindowHandler;
  systemSettings: SystemSettings;
  setSystemSettings: Dispatch<SetStateAction<SystemSettings>>;
}) {
  if (module === "files") return <FilesModule openWindow={openWindow} />;
  if (module === "settings") return <SettingsModule openWindow={openWindow} systemSettings={systemSettings} setSystemSettings={setSystemSettings} />;
  if (module === "notes") return <NotesModule />;
  if (module === "dashboard") return <DashboardModule />;
  if (module === "assistant") return <AssistantModule openWindow={openWindow} />;
  if (module === "browser") return <BrowserModule openWindow={openWindow} systemSettings={systemSettings} />;
  if (module === "paint") return <PaintModule />;
  return <WorkspaceModule openWindow={openWindow} />;
}

function WorkspaceModule({ openWindow }: { openWindow: OpenWindowHandler }) {
  const [activeView, setActiveView] = useState("Flow");
  const cards = [
    { title: "Project Aurora", text: "Design workspace", icon: <ImageIcon />, module: "files" as ModuleId },
    { title: "Exploring Organic Structures", text: "Mind canvas", icon: <Network />, module: "notes" as ModuleId },
    { title: "System Update", text: "Version 1.0.0.77", icon: <Activity />, module: "dashboard" as ModuleId },
    { title: "Health Check", text: "All systems optimal", icon: <Shield />, module: "settings" as ModuleId }
  ];
  const workspaceViews = [
    { title: "Horizon", subtitle: "Workspaces", icon: <Grid2X2 /> },
    { title: "Flow", subtitle: "Focus Mode", icon: <CircleDot /> },
    { title: "Nexus", subtitle: "AI Companion", icon: <Bot /> },
    { title: "Canvas", subtitle: "Create Anything", icon: <PenLine /> },
    { title: "Pulse", subtitle: "System Health", icon: <Activity /> }
  ];
  return (
    <div className="workspace-module">
      <div className="command-strip">
        <Search />
        <button onClick={(event) => openWindow("assistant", originFromEvent(event))}>Ask anything...</button>
        <kbd>Ctrl K</kbd>
      </div>
      <div className="workspace-grid">
        <aside className="workspace-menu">
          {workspaceViews.map(({ title, subtitle, icon }) => (
            <button className={activeView === title ? "selected" : ""} key={title} onClick={() => setActiveView(title)}>
              <span>{icon}</span>
              <strong>{title}</strong>
              <small>{subtitle}</small>
            </button>
          ))}
        </aside>
        <section className="workspace-main">
          <div className="section-title">
            <h3>{activeView}</h3>
            <button onClick={(event) => openWindow(activeView === "Pulse" ? "dashboard" : activeView === "Nexus" ? "assistant" : "files", originFromEvent(event))}>
              Open
            </button>
          </div>
          <WorkspaceView activeView={activeView} openWindow={openWindow} />
          <div className="section-title compact">
            <h3>Recommended</h3>
            <button onClick={(event) => openWindow("files", originFromEvent(event))}>See all</button>
          </div>
          <div className="recommend-grid">
            {cards.map((card) => (
              <button key={card.title} onClick={(event) => openWindow(card.module, originFromEvent(event))}>
                <span>{card.icon}</span>
                <strong>{card.title}</strong>
                <small>{card.text}</small>
              </button>
            ))}
          </div>
          <div className="section-title">
            <h3>Your Spaces</h3>
            <button onClick={() => setActiveView("Horizon")}>See all</button>
          </div>
          <div className="space-grid">
            {["Work", "Personal", "Creative"].map((space, index) => (
              <button key={space} onClick={() => setActiveView(space === "Creative" ? "Canvas" : "Horizon")}>
                <span style={{ "--space-color": ["#f6b65d", "#5ad38b", "#ef7187"][index] } as CSSProperties}>
                  <Command />
                </span>
                <strong>{space}</strong>
                <small>{index === 0 ? "12 apps" : index === 1 ? "8 apps" : "15 apps"}</small>
              </button>
            ))}
            <button className="add-space" onClick={() => setActiveView("Canvas")}>
              <Plus />
              Add Space
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function WorkspaceView({ activeView, openWindow }: { activeView: string; openWindow: OpenWindowHandler }) {
  const viewCopy: Record<string, { title: string; body: string; action: string; module: ModuleId; icon: ReactNode }> = {
    Horizon: {
      title: "Spaces aligned for the day",
      body: "Switch between work, personal, and creative contexts without leaving the flow.",
      action: "Open Explorer",
      module: "files",
      icon: <Grid2X2 />
    },
    Flow: {
      title: "Deep work session ready",
      body: "Focus widgets, system pulse, and ambient context are tuned for a quiet workspace.",
      action: "Open Notes",
      module: "notes",
      icon: <CircleDot />
    },
    Nexus: {
      title: "Aurora is listening",
      body: "Ask for files, summarize notes, or turn loose ideas into structured next actions.",
      action: "Open Assistant",
      module: "assistant",
      icon: <Bot />
    },
    Canvas: {
      title: "Create a new surface",
      body: "Start a sketch, illustration, or visual planning board on a blank canvas.",
      action: "Open Canvas",
      module: "paint",
      icon: <PenLine />
    },
    Pulse: {
      title: "System remains balanced",
      body: "Performance, memory, battery, and network activity are stable.",
      action: "Open Pulse",
      module: "dashboard",
      icon: <Activity />
    }
  };
  const selected = viewCopy[activeView] ?? viewCopy.Flow;

  return (
    <div className="workspace-hero">
      <span>{selected.icon}</span>
      <div>
        <strong>{selected.title}</strong>
        <p>{selected.body}</p>
      </div>
      <button onClick={(event) => openWindow(selected.module, originFromEvent(event))}>{selected.action}</button>
    </div>
  );
}

function FilesModule({ openWindow }: { openWindow: OpenWindowHandler }) {
  const [activeView, setActiveView] = useState("Home");
  const [selectedFolder, setSelectedFolder] = useState("Design");
  const [selectedFile, setSelectedFile] = useState(files[0].name);
  const [search, setSearch] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const selectedFileData = files.find((f) => f.name === selectedFile);
  const filteredFiles = files.filter((file) => {
    const target = `${file.name} ${file.type}`.toLowerCase();
    return target.includes(search.toLowerCase());
  });

  return (
    <div className="files-module">
      <aside className="file-sidebar">
        <h3>Smart Views</h3>
        {[
          ["Home", <Home />],
          ["Recent", <Calendar />],
          ["Favorites", <Star />],
          ["Shared", <Network />],
          ["Tags", <SlidersHorizontal />]
        ].map(([label, icon]) => (
          <button className={activeView === label ? "selected" : ""} key={String(label)} onClick={() => setActiveView(String(label))}>
            {icon}
            {label}
          </button>
        ))}
        <h3>Spaces</h3>
        {[
          ["Personal Space", <CircleDot />],
          ["Work Space", <Archive />],
          ["Creative Hub", <Palette />]
        ].map(([label, icon]) => (
          <button className={activeView === label ? "selected" : ""} key={String(label)} onClick={() => setActiveView(String(label))}>
            {icon}
            {label}
          </button>
        ))}
        <div className="storage-meter">
          <strong>Flow Drive</strong>
          <p>256 GB / 1 TB</p>
          <span />
        </div>
      </aside>
      <section className="file-browser">
        <div className="browser-toolbar">
          <div className="breadcrumbs">Flow Drive / {activeView} / {selectedFolder}</div>
          <label>
            <Search />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search in ${activeView}`} />
          </label>
          <button aria-label="Grid view" onClick={() => setActiveView("Home")}>
            <Grid2X2 />
          </button>
          <button aria-label="Sort files" onClick={() => setActiveView("Recent")}>
            <SlidersHorizontal />
          </button>
          <button aria-label="More file options" onClick={() => setActiveView("Favorites")}>
            <MoreHorizontal />
          </button>
        </div>
        <div className="file-view-summary">
          <div>
            <strong>{activeView}</strong>
            <p>{selectedFolder} contains {filteredFiles.length} visible objects.</p>
          </div>
          <button onClick={() => setSearch("")}>Reset</button>
        </div>
        <div className="folder-grid">
          {folders.map((folder) => (
            <button
              key={folder.name}
              className={`folder-tile ${selectedFolder === folder.name ? "selected" : ""}`}
              onClick={() => setSelectedFolder(folder.name)}
              data-context-file={folder.name}
            >
              <span style={{ "--folder-color": folder.color } as CSSProperties}>{folder.icon}</span>
              <strong>{folder.name}</strong>
              <small>{folder.items}</small>
            </button>
          ))}
        </div>
        <div className="asset-grid">
          {filteredFiles.map((file, index) => (
            <button
              key={file.name}
              className={`asset-tile ${selectedFile === file.name ? "selected" : ""}`}
              onClick={() => setSelectedFile(file.name)}
              onDoubleClick={() => setPreviewImage(file.image)}
              data-context-file={file.name}
            >
              <img src={file.image} alt="" draggable={false} />
              <span className="favorite">{index % 2 === 0 ? <Star /> : <CircleDot />}</span>
              <strong>{file.name}</strong>
              <small>
                .{file.type} <br />
                {file.size}
              </small>
            </button>
          ))}
        </div>
        <div className="file-inspector">
          <strong>{selectedFile}</strong>
          <span>{activeView} / {selectedFolder}</span>
          <button onClick={() => {
            const f = files.find((file) => file.name === selectedFile);
            if (f?.image) setPreviewImage(f.image);
          }}><Eye size={14} /> Preview</button>
          {selectedFileData?.openWith && (
            <button onClick={(event) => openWindow(selectedFileData.openWith, originFromEvent(event))}>
              <AppWindow size={14} /> Open in {moduleById[selectedFileData.openWith]?.title}
            </button>
          )}
          <button onClick={() => setActiveView("Favorites")}><Star size={14} /> Favorite</button>
          <button onClick={() => {
            if (selectedFileData?.image) { const a = document.createElement("a"); a.download = `${selectedFileData.name}.png`; a.href = selectedFileData.image; a.click(); }
          }}><Download size={14} /> Download</button>
        </div>
        {previewImage && (
          <div className="file-preview-overlay" onClick={() => setPreviewImage(null)}>
            <div className="file-preview-card" onClick={(e) => e.stopPropagation()}>
              <img src={previewImage} alt={selectedFile} />
              <div className="file-preview-info">
                <strong>{selectedFile}</strong>
                <span>{files.find((f) => f.name === selectedFile)?.type} — {files.find((f) => f.name === selectedFile)?.size}</span>
              </div>
              <button className="file-preview-close" onClick={() => setPreviewImage(null)}><X size={18} /></button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function SettingsModule({
  openWindow,
  systemSettings,
  setSystemSettings
}: {
  openWindow: OpenWindowHandler;
  systemSettings: SystemSettings;
  setSystemSettings: Dispatch<SetStateAction<SystemSettings>>;
}) {
  const [activeSection, setActiveSection] = useState("General");
  const [settingSearch, setSettingSearch] = useState("");
  const [settings, setSettingsRaw] = useState<AppSettings>(loadSettings);
  const [recentCleared, setRecentCleared] = useState(false);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettingsRaw((prev) => {
      const next = { ...prev, [key]: value };
      persistSettings(next);
      applySettingsCSS(next);
      return next;
    });
  };

  const { theme, style, accent, glass, uiScale, volume, soundEffects, notificationsEnabled, compactInterface, networkEnabled, syncEnabled, profileLock, reduceMotion, backgroundEffects } = settings;

  const settingsSections: Array<[string, string, ReactNode]> = [
    ["General", "Status & preferences", <Settings />],
    ["Display", "Theme, colors & scaling", <Palette />],
    ["Audio", "Volume & sound effects", <Volume2 />],
    ["Connectivity", "Network & sync", <Wifi />],
    ["Web Browser", "Homepage & search", <Globe2 />],
    ["Privacy", "Security & data", <Shield />],
    ["Advanced", "Accessibility & reset", <Database />]
  ];
  const filteredSections = settingsSections.filter(([title, subtitle]) =>
    `${title} ${subtitle}`.toLowerCase().includes(settingSearch.toLowerCase())
  );

  useEffect(() => {
    applySettingsCSS(settings);
  }, [settings]);

  return (
    <div className="settings-module">
      <aside className="settings-nav">
        {filteredSections.map(([title, subtitle, icon]) => (
          <button
            className={activeSection === title ? "selected" : ""}
            key={String(title)}
            onClick={() => setActiveSection(String(title))}
          >
            {icon}
            <span>
              <strong>{title}</strong>
              <small>{subtitle}</small>
            </span>
          </button>
        ))}
      </aside>
      <section className="settings-content">
        <div className="settings-heading">
          <div>
            <h3>{activeSection}</h3>
            <p>{settingsSections.find(([title]) => title === activeSection)?.[1] ?? "Manage your system settings and preferences."}</p>
          </div>
          <label>
            <Search />
            <input value={settingSearch} onChange={(event) => setSettingSearch(event.target.value)} placeholder="Search settings" />
          </label>
        </div>
        {activeSection === "General" && (
          <>
            <SettingsGroup title="Status">
              <div className="setting-row">
                <span className="setting-icon"><Check /></span>
                <div>
                  <strong>AtomOS Shell</strong>
                  <small>Running locally with {networkEnabled ? "sync ready" : "sync paused"}.</small>
                </div>
                <span className="setting-value">Ready</span>
              </div>
              <SwitchRow label="Notifications" description="Allow in-app notification panels and badges." checked={notificationsEnabled} onCheckedChange={(v) => updateSetting("notificationsEnabled", v)} />
              <SwitchRow label="Compact Interface" description="Use tighter spacing in dense windows." checked={compactInterface} onCheckedChange={(v) => updateSetting("compactInterface", v)} />
            </SettingsGroup>
          </>
        )}

        {activeSection === "Display" && (
          <>
            <SettingsGroup title="Appearance">
              <SettingRow icon={<Palette />} label="Theme" value={theme} onClick={() => updateSetting("theme", theme === "Light" ? "Dark" : "Light")} />
              <SettingRow icon={<Globe2 />} label="Style" value={style} onClick={() => updateSetting("style", style === "Normal" ? "Glass" : "Normal")} />
              <div className="setting-row">
                <span className="setting-icon"><CircleDot /></span>
                <div>
                  <strong>Accent Color</strong>
                  <small>Updates controls, focus states, and selected surfaces.</small>
                </div>
                <div className="swatches">
                  {["#7c6bff", "#5b9cff", "#ef7187", "#f6b65d", "#5ad38b", "#5bd8e8", "#8da2b8"].map((color, index) => (
                    <button
                      aria-label={`Accent color ${index + 1}`}
                      className={accent === color ? "selected" : ""}
                      key={color}
                      onClick={() => updateSetting("accent", color)}
                      style={{ "--swatch": color } as CSSProperties}
                    />
                  ))}
                </div>
              </div>
              <SliderRow label="Glass Intensity" description="Controls translucency depth across the OS." value={glass} onChange={(v) => updateSetting("glass", v)} />
              <SliderRow label="Interface Scale" description="Adjusts the app-level UI density." value={uiScale} min={88} max={116} onChange={(v) => updateSetting("uiScale", v)} />
            </SettingsGroup>
          </>
        )}

        {activeSection === "Audio" && (
          <SettingsGroup title="Sound Output">
            <SliderRow label="System Volume" description="Controls AtomOS feedback volume." value={volume} onChange={(v) => updateSetting("volume", v)} />
            <SwitchRow label="Sound Effects" description="Play quiet interface feedback for actions." checked={soundEffects} onCheckedChange={(v) => updateSetting("soundEffects", v)} />
          </SettingsGroup>
        )}

        {activeSection === "Connectivity" && (
          <SettingsGroup title="Network">
            <SwitchRow label="Network Access" description="Allow apps to show online-ready state." checked={networkEnabled} onCheckedChange={(v) => updateSetting("networkEnabled", v)} />
            <SwitchRow label="Flow Sync" description="Sync recent windows, notes, and browser state locally." checked={syncEnabled} onCheckedChange={(v) => updateSetting("syncEnabled", v)} />
            <div className="setting-row">
              <span className="setting-icon"><Network /></span>
              <div>
                <strong>Status</strong>
                <small>{networkEnabled ? "AuroraNet is available for local app features." : "Network features are paused."}</small>
              </div>
              <span className="setting-value">{networkEnabled ? "Online" : "Paused"}</span>
            </div>
          </SettingsGroup>
        )}

        {activeSection === "Web Browser" && (
          <SettingsGroup title="Browser Preferences">
            <div className="setting-row">
              <span className="setting-icon"><Home /></span>
              <div>
                <strong>Home Page</strong>
                <small>Used by the Browser app start surface.</small>
              </div>
              <input
                className="setting-input"
                value={systemSettings.browserHomePage}
                onChange={(event) => setSystemSettings({ ...systemSettings, browserHomePage: event.target.value })}
              />
            </div>
            <SettingRow
              icon={<Search />}
              label="Search Engine"
              value={systemSettings.searchEngine}
              onClick={() =>
                setSystemSettings({
                  ...systemSettings,
                  searchEngine: systemSettings.searchEngine === "Aurora" ? "Private" : "Aurora"
                })
              }
            />
            <div className="setting-row">
              <span className="setting-icon"><Globe2 /></span>
              <div>
                <strong>Browser App</strong>
                <small>Open the local browser workspace.</small>
              </div>
              <button className="select-pill" onClick={(event) => openWindow("browser", originFromEvent(event))}>Open</button>
            </div>
          </SettingsGroup>
        )}

        {activeSection === "Privacy" && (
          <SettingsGroup title="Security & Privacy">
            <SwitchRow label="Profile Lock" description="Require local profile unlock after idle." checked={profileLock} onCheckedChange={(v) => updateSetting("profileLock", v)} />
            <div className="setting-row">
              <span className="setting-icon"><Archive /></span>
              <div>
                <strong>Recent Items</strong>
                <small>Clear local recent files and browser history for this session.</small>
              </div>
              <button className="select-pill" onClick={() => setRecentCleared(true)}>{recentCleared ? "Cleared" : "Clear"}</button>
            </div>
          </SettingsGroup>
        )}

        {activeSection === "Advanced" && (
          <SettingsGroup title="System Preferences">
            <SwitchRow label="Reduce Motion" description="Lower transition movement for accessibility." checked={reduceMotion} onCheckedChange={(v) => updateSetting("reduceMotion", v)} />
            <SwitchRow label="Background Effects" description="Show ambient light and glass depth layers." checked={backgroundEffects} onCheckedChange={(v) => updateSetting("backgroundEffects", v)} />
            <div className="setting-row">
              <span className="setting-icon"><RefreshCw /></span>
              <div>
                <strong>Layout</strong>
                <small>Reset window layout on the next app refresh.</small>
              </div>
              <button className="select-pill" onClick={() => location.reload()}>Reset</button>
            </div>
          </SettingsGroup>
        )}
      </section>
    </div>
  );
}

function NotesModule() {
  const [notes, setNotes] = useState<NoteItem[]>(loadNotes);
  const [activeId, setActiveId] = useState<string>(notes[0]?.id ?? "");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState("");
  const activeNote = notes.find((n) => n.id === activeId) ?? notes[0];

  const updateContent = (content: string) => {
    setNotes((prev) => {
      const next = prev.map((n) => (n.id === activeId ? { ...n, content } : n));
      saveNotes(next);
      return next;
    });
  };

  const addNote = () => {
    const id = `note-${Date.now()}`;
    const newNote: NoteItem = { id, title: "New Note", content: "" };
    setNotes((prev) => {
      const next = [...prev, newNote];
      saveNotes(next);
      return next;
    });
    setActiveId(id);
    setRenamingId(id);
    setRenameInput("New Note");
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      saveNotes(next);
      if (activeId === id) setActiveId(next[0]?.id ?? "");
      return next;
    });
  };

  const renameNote = (id: string, title: string) => {
    setNotes((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, title } : n));
      saveNotes(next);
      return next;
    });
  };

  const commitRename = (id: string) => {
    if (renameInput.trim()) renameNote(id, renameInput.trim());
    setRenamingId(null);
  };

  const noteIcons: Record<string, ReactNode> = {
    "project-notes": <NotebookPen />,
    "ideas": <PenLine />,
    "today": <Calendar />
  };

  return (
    <div className="notes-module">
      <aside>
        {notes.map((note) =>
          renamingId === note.id ? (
            <div key={note.id} className="note-rename-row">
              <input
                autoFocus
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename(note.id);
                  if (e.key === "Escape") setRenamingId(null);
                }}
                onBlur={() => commitRename(note.id)}
              />
            </div>
          ) : (
            <button
              className={activeId === note.id ? "selected" : ""}
              key={note.id}
              onClick={() => setActiveId(note.id)}
              onDoubleClick={() => {
                setRenamingId(note.id);
                setRenameInput(note.title);
              }}
            >
              {noteIcons[note.id] ?? <NotebookPen />}
              {note.title}
            </button>
          )
        )}
        <button onClick={addNote}>
          <Plus />
          New Note
        </button>
      </aside>
      <article>
        <div className="note-toolbar">
          <button className="selected" aria-label="Write mode">B</button>
          <button aria-label="Review mode">I</button>
          <button aria-label="Expand note" onClick={() => {}}><Grid2X2 /></button>
          <button aria-label="Ask assistant" onClick={() => {}}><Command /></button>
          <button
            aria-label="Save as text file"
            style={{ marginLeft: "auto" }}
            onClick={() => {
              if (!activeNote) return;
              const blob = new Blob([activeNote.content], { type: "text/plain" });
              const a = document.createElement("a");
              a.download = `${activeNote.title}.txt`;
              a.href = URL.createObjectURL(blob);
              a.click();
              URL.revokeObjectURL(a.href);
            }}
          >
            <Save size={15} />
          </button>
          {notes.length > 1 && (
            <button
              aria-label="Delete this note"
              style={{ color: "var(--rose)" }}
              onClick={() => activeNote && deleteNote(activeNote.id)}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
        <h3>{activeNote?.title ?? ""}</h3>
        <textarea
          aria-label="Note editor"
          key={activeId}
          value={activeNote?.content ?? ""}
          onChange={(e) => updateContent(e.target.value)}
          placeholder="Start writing..."
        />
        <div className="note-callout">
          <Command />
          Notes are saved automatically to your browser storage.
        </div>
      </article>
    </div>
  );
}

function DashboardModule() {
  const [view, setView] = useState<"cards" | "table">("cards");
  const metrics = [
    { title: "System Health", value: "92", unit: "Score", icon: <Gauge />, color: "#7c6bff", status: "Optimal" },
    { title: "CPU Performance", value: "18", unit: "%", icon: <Cpu />, color: "#5b9cff", status: "Low" },
    { title: "Memory", value: "7.1", unit: "GB", icon: <HardDrive />, color: "#7c6bff", status: "44% used" },
    { title: "Battery", value: "87", unit: "%", icon: <Battery />, color: "#5ad38b", status: "Charging" }
  ];
  const activity = [
    { label: "CPU Usage", value: "18%", color: "#5b9cff" },
    { label: "Memory Usage", value: "7.1 / 16 GB", color: "#7c6bff" },
    { label: "Disk Activity", value: "Low", color: "#5bd8e8" },
    { label: "Network", value: "320 Mbps", color: "#5b9cff" }
  ];

  return (
    <div className="dashboard-module">
      <div className="dashboard-header">
        <h3>System Pulse</h3>
        <div className="dashboard-view-toggle">
          <button className={view === "cards" ? "selected" : ""} onClick={() => setView("cards")}><Grid2X2 size={15} /></button>
          <button className={view === "table" ? "selected" : ""} onClick={() => setView("table")}><SlidersHorizontal size={15} /></button>
        </div>
      </div>
      {view === "cards" ? (
        <>
          <div className="dashboard-cards">
            {metrics.map((m) => (
              <MetricCard key={m.title} title={m.title} value={m.value} unit={m.unit} icon={m.icon} color={m.color} />
            ))}
          </div>
          <div className="activity-list">
            <h3>System Activity</h3>
            {activity.map(({ label, value, color }) => (
              <div key={label}>
                <span><strong>{label}</strong><small>{value}</small></span>
                <Sparkline color={color} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr><th>Metric</th><th>Value</th><th>Status</th><th>Trend</th></tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={m.title}>
                <td><span className="table-metric-icon" style={{ "--metric-color": m.color } as CSSProperties}>{m.icon}</span>{m.title}</td>
                <td><strong>{m.value}</strong> {m.unit}</td>
                <td><span className="table-status">{m.status}</span></td>
                <td><Sparkline color={m.color} /></td>
              </tr>
            ))}
            {activity.map((a) => (
              <tr key={a.label}>
                <td>{a.label}</td>
                <td><strong>{a.value}</strong></td>
                <td><span className="table-status">Active</span></td>
                <td><Sparkline color={a.color} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function BrowserModule({ openWindow, systemSettings }: { openWindow: OpenWindowHandler; systemSettings: SystemSettings }) {
  const pages = [
    {
      title: "Home",
      url: systemSettings.browserHomePage,
      heading: "Nebula Start",
      body: "A private local start page for search, workspaces, and recent system activity."
    },
    {
      title: "Docs",
      url: "atom://docs",
      heading: "Design Notes",
      body: "Open project notes, interface references, and saved writing surfaces."
    },
    {
      title: "Cloud",
      url: "atom://drive",
      heading: "Flow Drive",
      body: "Browse local file objects, visual references, and project folders."
    }
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const [address, setAddress] = useState(systemSettings.browserHomePage);
  const [loadedUrl, setLoadedUrl] = useState(systemSettings.browserHomePage);
  const [history, setHistory] = useState([systemSettings.browserHomePage]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const activePage = pages[activeIndex];
  const isExternalUrl = /^https?:\/\//i.test(loadedUrl);

  const navigate = (url: string) => {
    setAddress(url);
    setLoadedUrl(url);
    setHistory((current) => [...current.slice(0, historyIndex + 1), url]);
    setHistoryIndex((current) => current + 1);
    const pageIndex = pages.findIndex((p) => p.url === url);
    if (pageIndex >= 0) setActiveIndex(pageIndex);
  };

  const navigateTo = (index: number) => {
    navigate(pages[index].url);
  };

  const goHistory = (direction: -1 | 1) => {
    const nextIndex = clamp(historyIndex + direction, 0, history.length - 1);
    const nextUrl = history[nextIndex];
    const pageIndex = pages.findIndex((page) => page.url === nextUrl);
    setHistoryIndex(nextIndex);
    setAddress(nextUrl);
    setLoadedUrl(nextUrl);
    if (pageIndex >= 0) setActiveIndex(pageIndex);
  };

  return (
    <div className="browser-module">
      <div className="browser-chrome">
        <button aria-label="Back" onClick={() => goHistory(-1)} disabled={historyIndex === 0}>
          <ArrowLeft />
        </button>
        <button aria-label="Forward" onClick={() => goHistory(1)} disabled={historyIndex === history.length - 1}>
          <ArrowRight />
        </button>
        <button aria-label="Reload" onClick={() => { setLoadedUrl(""); requestAnimationFrame(() => setLoadedUrl(address)); }}>
          <RefreshCw />
        </button>
        <label>
          <Globe2 />
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                let url = address.trim();
                if (url && !url.startsWith("atom://") && !url.startsWith("http://") && !url.startsWith("https://")) {
                  url = `https://${url}`;
                  setAddress(url);
                }
                navigate(url);
              }
            }}
          />
        </label>
      </div>
      <div className="browser-tabs">
        {pages.map((page, index) => (
          <button key={page.url} className={activeIndex === index ? "selected" : ""} onClick={() => navigateTo(index)}>
            {page.title}
          </button>
        ))}
        <button onClick={(event) => openWindow("notes", originFromEvent(event))}>
          <Plus />
          Note
        </button>
      </div>
      {isExternalUrl ? (
        <BrowserIframe url={loadedUrl} />
      ) : (
        <section className="browser-page">
          <div>
            <span>
              <Globe2 />
            </span>
            <h3>{activePage.heading}</h3>
            <p>
              {loadedUrl === activePage.url
                ? `${activePage.body} Search is set to ${systemSettings.searchEngine}.`
                : "Type a URL and press Enter to browse."}
            </p>
          </div>
          <div className="browser-actions">
            <button onClick={(event) => openWindow("workspace", originFromEvent(event))}>Open Workspace</button>
            <button onClick={(event) => openWindow("files", originFromEvent(event))}>Open Files</button>
            <button onClick={(event) => openWindow("notes", originFromEvent(event))}>Write Note</button>
          </div>
        </section>
      )}
    </div>
  );
}

function BrowserIframe({ url }: { url: string }) {
  const [blocked, setBlocked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setBlocked(false);
    const timer = setTimeout(() => {
      try {
        const doc = iframeRef.current?.contentDocument;
        if (doc && doc.body && doc.body.innerHTML === "") setBlocked(true);
      } catch {
        setBlocked(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [url]);

  if (blocked) {
    return (
      <section className="browser-blocked">
        <Shield size={40} />
        <h3>This site can't be embedded</h3>
        <p>{url}</p>
        <p>This website blocks being loaded inside frames for security reasons.</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="browser-open-tab">
          Open in New Tab
        </a>
      </section>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      className="browser-iframe"
      src={url}
      title="Browser"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      onError={() => setBlocked(true)}
    />
  );
}

function AssistantModule({ openWindow }: { openWindow: OpenWindowHandler }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;
    setQuery("");
    if (q.includes("file") || q.includes("folder") || q.includes("drive")) openWindow("files");
    else if (q.includes("note") || q.includes("write") || q.includes("summar")) openWindow("notes");
    else if (q.includes("setting") || q.includes("appear") || q.includes("theme")) openWindow("settings");
    else if (q.includes("pulse") || q.includes("cpu") || q.includes("system") || q.includes("insight")) openWindow("dashboard");
    else if (q.includes("canvas") || q.includes("paint") || q.includes("draw")) openWindow("paint");
    else openWindow("workspace");
  };

  return (
    <div className="assistant-module">
      <div className="assistant-orb">
        <Bot />
      </div>
      <h3>How can I help you today?</h3>
      {[
        ["Summarize my meeting notes", "notes"],
        ["Find files from last week", "files"],
        ["Tune visual settings", "settings"],
        ["Show system insights", "dashboard"]
      ].map(([label, module]) => (
        <button key={label} onClick={(event) => openWindow(module as ModuleId, originFromEvent(event))}>
          {label}
        </button>
      ))}
      <form onSubmit={handleSubmit}>
        <label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Aurora..."
          />
          <button type="submit" aria-label="Send" disabled={!query.trim()}>
            <Mic />
          </button>
        </label>
      </form>
    </div>
  );
}

function LauncherDialog({
  open,
  origin,
  onOpenChange,
  query,
  setQuery,
  onOpenWindow
}: {
  open: boolean;
  origin: LaunchOrigin;
  onOpenChange: (open: boolean) => void;
  query: string;
  setQuery: (query: string) => void;
  onOpenWindow: OpenWindowHandler;
}) {
  const [activeTab, setActiveTab] = useState("All Apps");
  const tabTargets = useMemo<Record<string, ModuleId[]>>(
    () => ({
      "All Apps": modules.map((module) => module.id),
      Productivity: ["workspace", "files", "notes", "browser"],
      Creative: ["paint", "notes", "workspace"],
      Developer: ["browser", "dashboard", "assistant"],
      Utilities: ["settings", "dashboard", "assistant"]
    }),
    []
  );
  const filteredModules = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const scoped = modules.filter((module) => tabTargets[activeTab]?.includes(module.id));
    if (!normalized) return scoped;
    return scoped.filter((module) => `${module.title} ${module.subtitle}`.toLowerCase().includes(normalized));
  }, [activeTab, query, tabTargets]);
  const anchor = launcherPanelAnchor();
  const launchX = origin.x - anchor.x;
  const launchY = origin.y - anchor.y;
  const transformOrigin = `${origin.x >= anchor.x ? "100%" : "0%"} ${origin.y >= anchor.y ? "100%" : "0%"}`;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal forceMount>
        <AnimatePresence>
          {open && (
            <>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  className="dialog-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.26, ease: [0.2, 0.8, 0.2, 1] }}
                />
              </Dialog.Overlay>
              <Dialog.Content className="launcher-content" forceMount>
                <motion.section
                  className="launcher-panel glass-window"
                  initial={{ opacity: 0, scale: 0.24, x: launchX, y: launchY, filter: "blur(22px)", borderRadius: 54 }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0, filter: "blur(0px)", borderRadius: 32 }}
                  exit={{ opacity: 0, scale: 0.2, x: launchX, y: launchY, filter: "blur(24px)", borderRadius: 54 }}
                  transition={{ type: "spring", stiffness: 150, damping: 24, mass: 1.16 }}
                  style={{ transformOrigin }}
                >
                  <Dialog.Title className="sr-only">Launcher</Dialog.Title>
                  <Dialog.Description className="sr-only">Search and open AtomOS modules.</Dialog.Description>
                  <div className="launcher-search">
                    <Search />
                    <input
                      autoFocus
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search apps, files, people and more..."
                    />
                    <kbd>Ctrl K</kbd>
                    <Dialog.Close aria-label="Close launcher">
                      <X />
                    </Dialog.Close>
                  </div>
                  <div className="launcher-tabs">
                    {Object.keys(tabTargets).map((tab) => (
                      <button className={activeTab === tab ? "selected" : ""} key={tab} onClick={() => setActiveTab(tab)}>
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="app-grid">
                    {filteredModules.map((module) => (
                      <button key={module.id} onClick={(event) => onOpenWindow(module.id, originFromEvent(event))}>
                        <span style={{ "--module-color": module.color } as CSSProperties}>{module.icon}</span>
                        <strong>{module.title === "Explorer" ? "Files" : module.title}</strong>
                        <small>{module.subtitle}</small>
                      </button>
                    ))}
                  </div>
                </motion.section>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function NotificationPanel({ open, onClose, onOpenWindow }: { open: boolean; onClose: () => void; onOpenWindow: OpenWindowHandler }) {
  const [items, setItems] = useState(notifications);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          className="notification-panel glass-window"
          role="complementary"
          aria-label="Notifications"
          initial={{ opacity: 0, x: 36, filter: "blur(8px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: 36, filter: "blur(8px)" }}
          transition={{ type: "spring", stiffness: 230, damping: 30, mass: 0.95 }}
        >
          <header>
            <h2>Notifications</h2>
            <button onClick={() => setItems([])}>Clear All</button>
            <button aria-label="Close notifications" onClick={onClose}>
              <X />
            </button>
          </header>
          {items.length === 0 && <p className="empty-state">No notifications right now.</p>}
          {items.map((item) => (
            <button
              className={`notification-item ${selected === item.title ? "selected" : ""}`}
              key={item.title}
              onClick={(event) => {
                setSelected(item.title);
                onOpenWindow(item.module, originFromEvent(event));
              }}
            >
              <span style={{ "--notification-color": item.color } as CSSProperties}>{item.icon}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </div>
              <time>{item.time}</time>
            </button>
          ))}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function DesktopContextMenu({
  menu,
  onClose,
  onOpenWindow,
  onNotifications
}: {
  menu: ContextMenuState | null;
  onClose: () => void;
  onOpenWindow: OpenWindowHandler;
  onNotifications: () => void;
}) {
  if (!menu) return null;

  const actions: Array<[string, ModuleId | "notifications", ReactNode]> =
    menu.kind === "file"
      ? [
          ["Open", "files", <Folder />],
          ["Open in Notes", "notes", <NotebookPen />],
          ["Mark Favorite", "files", <Star />],
          ["Show Details", "dashboard", <Gauge />]
        ]
      : menu.kind === "window"
        ? [
            ["Open Settings", "settings", <Settings />],
            ["Open Browser", "browser", <Globe2 />],
            ["Open Files", "files", <Folder />],
            ["Open Notes", "notes", <NotebookPen />],
            ["Notifications", "notifications", <Bell />]
          ]
        : [
            ["Open Workspace", "workspace", <AppWindow />],
            ["Open Browser", "browser", <Globe2 />],
            ["Open Files", "files", <Folder />],
            ["Create Note", "notes", <NotebookPen />],
            ["Settings", "settings", <Settings />]
          ];

  return (
    <motion.div
      className="context-menu glass-panel"
      style={{ left: menu.x, top: menu.y }}
      initial={{ opacity: 0, scale: 0.96, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -4 }}
      transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <strong>{menu.label ?? "AtomOS"}</strong>
      {actions.map(([label, target, icon]) => (
        <button
          key={String(label)}
          onClick={(event) => {
            if (target === "notifications") onNotifications();
            else onOpenWindow(target, originFromEvent(event));
            onClose();
          }}
        >
          {icon}
          {label}
        </button>
      ))}
    </motion.div>
  );
}

function IconButton({
  label,
  children,
  active,
  className = "",
  onClick
}: {
  label: string;
  children: ReactNode;
  active?: boolean;
  className?: string;
  onClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <motion.button
          aria-label={label}
          className={`icon-button ${active ? "active" : ""} ${className}`}
          onClick={onClick}
          whileHover={{ y: -3, scale: 1.035 }}
          whileTap={{ scale: 0.965 }}
          transition={{ type: "spring", stiffness: 300, damping: 28, mass: 0.8 }}
        >
          {children}
        </motion.button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="tooltip" sideOffset={10}>
          {label}
          <Tooltip.Arrow className="tooltip-arrow" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <article className={`glass-card ${className}`}>{children}</article>;
}

function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="settings-group">
      <h4>{title}</h4>
      <div>{children}</div>
    </section>
  );
}

function SettingRow({ icon, label, value, onClick }: { icon: ReactNode; label: string; value: string; onClick?: () => void }) {
  return (
    <div className="setting-row">
      <span className="setting-icon">{icon}</span>
      <div>
        <strong>{label}</strong>
      </div>
      <button className="select-pill" onClick={onClick}>
        {value}
        <ChevronDown />
      </button>
    </div>
  );
}

function SliderRow({
  label,
  description,
  value,
  min = 0,
  max = 100,
  onChange
}: {
  label: string;
  description: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="setting-row">
      <span className="setting-icon">
        <SlidersHorizontal />
      </span>
      <div>
        <strong>{label}</strong>
        <small>{description}</small>
      </div>
      <Slider.Root className="slider-root" value={[value]} min={min} max={max} step={1} onValueChange={([next = value]) => onChange(next)} aria-label={label}>
        <Slider.Track className="slider-track">
          <Slider.Range className="slider-range" />
        </Slider.Track>
        <Slider.Thumb className="slider-thumb" />
      </Slider.Root>
      <span className="setting-value">{value}%</span>
    </div>
  );
}

function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="setting-row">
      <span className="setting-icon">
        <Check />
      </span>
      <div>
        <strong>{label}</strong>
        <small>{description}</small>
      </div>
      <Switch.Root className="switch-root" checked={checked} onCheckedChange={onCheckedChange} aria-label={label}>
        <Switch.Thumb className="switch-thumb" />
      </Switch.Root>
    </div>
  );
}

function useCountUp(target: number, duration = 900): string {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf: number;
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrent(eased * target);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return target % 1 === 0 ? String(Math.round(current)) : current.toFixed(1);
}

function MetricCard({
  title,
  value,
  unit,
  icon,
  color
}: {
  title: string;
  value: string;
  unit: string;
  icon: ReactNode;
  color: string;
}) {
  const display = useCountUp(parseFloat(value));
  return (
    <article className="metric-card">
      <header>
        <span style={{ "--metric-color": color } as CSSProperties}>{icon}</span>
        <strong>{title}</strong>
      </header>
      <div className="metric-value">
        <strong>{display}</strong>
        <small>{unit}</small>
      </div>
      <Sparkline color={color} />
    </article>
  );
}

function Sparkline({ color = "var(--accent)" }: { color?: string }) {
  return (
    <svg className="sparkline" viewBox="0 0 160 44" aria-hidden="true">
      <path
        d="M2 29 C14 18 20 18 31 28 S49 32 58 22 S78 17 89 28 S107 31 119 18 S140 8 158 14"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function PaintModule() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<"pencil" | "eraser" | "rect" | "circle" | "triangle" | "fill">("pencil");
  const [paintColor, setPaintColor] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}");
      return typeof s.accent === "string" ? s.accent : "#7c6bff";
    } catch { return "#7c6bff"; }
  });
  const [strokeSize, setStrokeSize] = useState(6);
  const isDrawing = useRef(false);
  const lastPt = useRef<{ x: number; y: number } | null>(null);
  const history = useRef<ImageData[]>([]);
  const [canUndo, setCanUndo] = useState(false);

  const ctx = () => canvasRef.current?.getContext("2d", { willReadFrequently: true }) ?? null;
  const didInit = useRef(false);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    const c = ctx();
    if (!canvas || !c) return;
    const { width, height } = canvas.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    const w = Math.round(width * devicePixelRatio);
    const h = Math.round(height * devicePixelRatio);

    if (didInit.current && canvas.width > 0 && canvas.height > 0) {
      // Preserve existing drawing: copy to temp before resizing
      const temp = document.createElement("canvas");
      temp.width = canvas.width;
      temp.height = canvas.height;
      temp.getContext("2d")?.drawImage(canvas, 0, 0);
      canvas.width = w;
      canvas.height = h;
      c.scale(devicePixelRatio, devicePixelRatio);
      c.fillStyle = "#ffffff";
      c.fillRect(0, 0, width, height);
      c.drawImage(temp, 0, 0, width, height);
    } else {
      canvas.width = w;
      canvas.height = h;
      c.scale(devicePixelRatio, devicePixelRatio);
      c.fillStyle = "#ffffff";
      c.fillRect(0, 0, width, height);
      didInit.current = true;
    }
  };

  useEffect(() => {
    initCanvas();
    const obs = new ResizeObserver(initCanvas);
    if (canvasRef.current) obs.observe(canvasRef.current);
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    const c = ctx();
    if (!canvas || !c) return;
    const snap = c.getImageData(0, 0, canvas.width, canvas.height);
    history.current = [...history.current.slice(-29), snap];
    setCanUndo(true);
  };

  const undo = () => {
    const canvas = canvasRef.current;
    const c = ctx();
    if (!canvas || !c || history.current.length === 0) return;
    const prev = history.current[history.current.length - 1];
    history.current = history.current.slice(0, -1);
    c.putImageData(prev, 0, 0);
    setCanUndo(history.current.length > 0);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const c = ctx();
    if (!canvas || !c) return;
    saveSnapshot();
    const { width, height } = canvas.getBoundingClientRect();
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, width, height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "atomos-canvas.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const getPoint = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const shapeStart = useRef<{ x: number; y: number } | null>(null);
  const shapeSnap = useRef<ImageData | null>(null);

  const drawShape = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const c = ctx();
    if (!c) return;
    c.fillStyle = paintColor;
    c.strokeStyle = paintColor;
    c.lineWidth = strokeSize;
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const w = Math.abs(end.x - start.x);
    const h = Math.abs(end.y - start.y);
    if (tool === "rect") {
      c.fillRect(x, y, w, h);
    } else if (tool === "circle") {
      c.beginPath();
      c.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      c.fill();
    } else if (tool === "triangle") {
      c.beginPath();
      c.moveTo(x + w / 2, y);
      c.lineTo(x + w, y + h);
      c.lineTo(x, y + h);
      c.closePath();
      c.fill();
    }
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    saveSnapshot();
    const pt = getPoint(e);
    const c = ctx();
    const canvas = canvasRef.current;
    if (!c || !canvas) return;
    e.currentTarget.setPointerCapture(e.pointerId);

    if (tool === "fill") {
      c.fillStyle = paintColor;
      c.fillRect(0, 0, canvas.getBoundingClientRect().width, canvas.getBoundingClientRect().height);
      return;
    }

    if (tool === "rect" || tool === "circle" || tool === "triangle") {
      shapeStart.current = pt;
      shapeSnap.current = c.getImageData(0, 0, canvas.width, canvas.height);
      return;
    }

    isDrawing.current = true;
    lastPt.current = pt;
    c.beginPath();
    c.arc(pt.x, pt.y, strokeSize / 2, 0, Math.PI * 2);
    c.fillStyle = tool === "eraser" ? "#ffffff" : paintColor;
    c.fill();
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const c = ctx();
    const canvas = canvasRef.current;
    if (!c || !canvas) return;

    if (shapeStart.current && shapeSnap.current) {
      c.putImageData(shapeSnap.current, 0, 0);
      drawShape(shapeStart.current, getPoint(e));
      return;
    }

    if (!isDrawing.current || !lastPt.current) return;
    const pt = getPoint(e);
    c.beginPath();
    c.moveTo(lastPt.current.x, lastPt.current.y);
    c.lineTo(pt.x, pt.y);
    c.strokeStyle = tool === "eraser" ? "#ffffff" : paintColor;
    c.lineWidth = strokeSize;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.stroke();
    lastPt.current = pt;
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (shapeStart.current) {
      drawShape(shapeStart.current, getPoint(e));
      shapeStart.current = null;
      shapeSnap.current = null;
    }
    isDrawing.current = false;
    lastPt.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const COLORS = ["#7c6bff", "#5b9cff", "#5bd8e8", "#5ad38b", "#f6b65d", "#ef7187", "#17233e", "#ffffff"];

  return (
    <div className="paint-module">
      <div className="paint-toolbar">
        <div className="paint-toolbar-group">
          <button
            className={`paint-tool-btn ${tool === "pencil" ? "active" : ""}`}
            aria-label="Pencil"
            onClick={() => setTool("pencil")}
          >
            <PenLine />
          </button>
          <button
            className={`paint-tool-btn ${tool === "eraser" ? "active" : ""}`}
            aria-label="Eraser"
            onClick={() => setTool("eraser")}
          >
            <X />
          </button>
        </div>
        <div className="paint-toolbar-group">
          <button className={`paint-tool-btn ${tool === "rect" ? "active" : ""}`} aria-label="Rectangle" onClick={() => setTool("rect")}><Square /></button>
          <button className={`paint-tool-btn ${tool === "circle" ? "active" : ""}`} aria-label="Circle" onClick={() => setTool("circle")}><Circle /></button>
          <button className={`paint-tool-btn ${tool === "triangle" ? "active" : ""}`} aria-label="Triangle" onClick={() => setTool("triangle")}><Triangle /></button>
          <button className={`paint-tool-btn ${tool === "fill" ? "active" : ""}`} aria-label="Fill" onClick={() => setTool("fill")}><Paintbrush /></button>
        </div>
        <div className="paint-toolbar-group">
          {COLORS.map((c) => (
            <button
              key={c}
              aria-label={`Color ${c}`}
              style={{
                width: 22, height: 22, borderRadius: "50%",
                background: c,
                border: paintColor === c ? "3px solid var(--accent)" : "2px solid var(--line)",
                cursor: "pointer"
              }}
              onClick={() => { setPaintColor(c); setTool("pencil"); }}
            />
          ))}
          <input
            type="color"
            className="paint-color-input"
            value={paintColor}
            aria-label="Custom color"
            onChange={(e) => { setPaintColor(e.target.value); setTool("pencil"); }}
          />
        </div>
        <div className="paint-toolbar-group">
          <label className="paint-size-label">
            Size
            <input
              type="range"
              min={1} max={40}
              value={strokeSize}
              onChange={(e) => setStrokeSize(Number(e.target.value))}
              aria-label="Stroke size"
            />
            {strokeSize}px
          </label>
        </div>
        <div className="paint-actions">
          <button className="paint-action-btn" disabled={!canUndo} onClick={undo} aria-label="Undo">Undo</button>
          <button className="paint-action-btn danger" onClick={clearCanvas} aria-label="Clear canvas">Clear</button>
          <button className="paint-action-btn" onClick={downloadCanvas} aria-label="Download canvas">Save PNG</button>
        </div>
      </div>
      <div className="paint-canvas-wrap">
        <canvas
          ref={canvasRef}
          className={`paint-canvas ${tool === "eraser" ? "eraser-mode" : ""}`}
          aria-label="Drawing canvas"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>
    </div>
  );
}

export default App;
