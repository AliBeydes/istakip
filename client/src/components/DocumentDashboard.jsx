'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuthStore, api } from '@/stores/authStore';
import { useSimpleTranslation } from '@/hooks/useSimpleTranslation';
import { 
  FileText, 
  Upload, 
  Share2, 
  Eye, 
  EyeOff, 
  Users, 
  FolderOpen,
  Lock,
  Globe,
  Plus,
  X,
  ChevronDown,
  Trash2,
  Edit2,
  Download,
  Search,
  Filter,
  Calendar,
  Grid3x3,
  List,
  LayoutGrid,
  Star,
  Heart,
  Bookmark,
  History,
  GitBranch,
  MessageSquare,
  AtSign,
  Tag,
  Folder,
  FolderPlus,
  MoreVertical,
  Copy,
  Move,
  Archive,
  FilePlus,
  FileSpreadsheet,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileJson,
  FileType,
  Scan,
  Type,
  Image,
  Video,
  Music,
  Presentation,
  Table2,
  Grid,
  Maximize2,
  Minimize2,
  PanelLeft,
  PanelRight,
  Split,
  Columns,
  Rows,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Cloud,
  CloudUpload,
  CloudDownload,
  CloudOff,
  Wifi,
  WifiOff,
  RefreshCw,
  RotateCcw,
  Undo,
  Redo,
  Scissors,
  Clipboard,
  ClipboardCopy,
  ClipboardPaste,
  Wand2,
  Sparkles,
  Bot,
  Brain,
  Lightbulb,
  Zap,
  Target,
  Award,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Timer,
  Hourglass,
  CalendarDays,
  Bell,
  BellRing,
  BellOff,
  Mail,
  Send,
  Paperclip,
  Link,
  Link2,
  ExternalLink,
  QrCode,
  Hash,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Code2,
  Quote,
  List as ListIcon,
  ListOrdered,
  ListChecks,
  CheckSquare,
  Square,
  Check,
  CheckCircle2,
  Circle,
  CircleDot,
  Minus,
  PlusCircle,
  MoreHorizontal,
  GripVertical,
  DragHandleDots2,
  Expand,
  Shrink,
  Fullscreen,
  PictureInPicture,
  Cast,
  Airplay,
  ScreenShare,
  MousePointer2,
  Hand,
  HandMetal,
  Fingerprint,
  ScanFace,
  ScanLine,
  ScanSearch,
  Focus,
  Aperture,
  ZoomIn,
  ZoomOut,
  SearchSlash,
  FilterX,
  SlidersHorizontal,
  SlidersVertical,
  Settings,
  Settings2,
  Cog,
  Wrench,
  Hammer,
  Paintbrush,
  PenTool,
  Pencil,
  PencilLine,
  Highlighter,
  Marker,
  Eraser,
  Crop,
  ImagePlus,
  ImageMinus,
  ImageDown,
  Layers,
  Stack,
  Layers2,
  FileStack,
  FolderTree,
  FolderKanban,
  FolderGit,
  FolderClock,
  FolderHeart,
  FolderInput,
  FolderOutput,
  FolderSync,
  FolderSearch,
  FolderX,
  FolderCog,
  Briefcase,
  Building2,
  Store,
  School,
  University,
  GraduationCap,
  BookOpen,
  Library,
  Newspaper,
  Scroll,
  FileDigit,
  FileKey,
  FileLock,
  FileCheck,
  FileX,
  FileQuestion,
  FileWarning,
  FileClock,
  FileHeart,
  FileAudio2,
  FileVideo2,
  FileImage2,
  FileBox,
  Files,
  Notebook,
  NotebookPen,
  NotebookTabs,
  BookMarked,
  BookX,
  BookCheck,
  BookOpenCheck,
  Contact,
  Contact2,
  IdCard,
  Badge,
  BadgeCheck,
  BadgeAlert,
  BadgeX,
  Medal,
  Trophy,
  Crown,
  Gem,
  Diamond,
  Award as AwardIcon,
  Certificate,
  Stamp,
  Flag,
  FlagTriangle,
  FlagOff,
  Pin,
  PinOff,
  MapPin,
  Navigation,
  Compass,
  Locate,
  LocateFixed,
  LocateOff,
  Radar,
  Target as TargetIcon,
  Crosshair,
  Swords,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ShieldQuestion,
  ShieldOff,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Key,
  KeyRound,
  KeySquare,
  Accessibility,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Glasses,
  Sunglasses,
  View,
  ViewOff,
  Preview,
  Text,
  TextSelect,
  TextCursor,
  TextCursorInput,
  Keyboard,
  Mouse,
  Touchpad,
  Gamepad2,
  Joystick,
  Plug,
  PlugZap,
  Unplug,
  Cable,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  BatteryWarning,
  Power,
  PowerOff,
  Flame,
  FlameKindling,
  FireExtinguisher,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Wind,
  Droplets,
  Thermometer,
  ThermometerSun,
  ThermometerSnowflake,
  Snowflake,
  Fan,
  Heater,
  AirVent,
  Sprout,
  Leaf,
  Flower,
  Flower2,
  Trees,
  TreePine,
  TreeDeciduous,
  Mountain,
  MountainSnow,
  Volcano,
  Waves,
  Tent,
  TentTree,
  Camping,
  Car,
  CarFront,
  Bus,
  BusFront,
  Truck,
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  TrainFront,
  Train,
  TramFront,
  Ship,
  Sailboat,
  Anchor,
  Rocket,
  Satellite,
  SatelliteDish,
  Radar as RadarIcon,
  Radio,
  RadioTower,
  Antenna,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  SignalZero,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Bluetooth,
  BluetoothOff,
  BluetoothConnected,
  BluetoothSearching,
  Usb,
  Hdmi,
  Ethernet,
  Network,
  Server,
  ServerOff,
  ServerCrash,
  Database,
  DatabaseBackup,
  DatabaseZap,
  HardDrive,
  HardDriveDownload,
  HardDriveUpload,
  Cpu,
  CpuIcon,
  MemoryStick,
  CircuitBoard,
  Mic,
  MicOff,
  Mic2,
  VolumeX,
  Volume,
  Volume1,
  Volume2,
  Headphones,
  Headset,
  Speaker,
  SpeakerOff,
  SpeakerLow,
  SpeakerHigh,
  Watch,
  WatchDevice,
  Smartphone as SmartphoneIcon,
  Tablet as TabletIcon,
  Laptop as LaptopIcon,
  Monitor as MonitorIcon,
  Tv,
  Tv2,
  Projector,
  Webcam,
  Camera,
  CameraOff,
  Aperture as ApertureIcon,
  Focus as FocusIcon,
  Image as ImageIcon,
  Images,
  Album,
  Film,
  Clapperboard,
  Popcorn,
  Candy,
  CandyOff,
  Cookie,
  Pizza,
  IceCream,
  IceCream2,
  CupSoda,
  Coffee,
  Utensils,
  UtensilsCrossed,
  ForkKnife,
  Soup,
  Salad,
  Beef,
  Fish,
  Bird,
  Egg,
  Milk,
  Wheat,
  Grape,
  Apple,
  Citrus,
  Carrot,
  Cherry,
  Banana,
  CitrusIcon,
  Croissant,
  Sandwich,
  Hamburger,
  BeefSteak,
  Drumstick,
  DrumstickIcon,
  Ham,
  Sausage,
  Bacon,
  EggFried,
  ChefHat,
  CookingPot,
  Oven,
  Microwave,
  Refrigerator,
  WashingMachine,
  Dryer,
  Vacuum,
  Broom,
  Sparkles as SparklesIcon,
  Bomb,
  Flame as FlameIcon,
  Flashlight,
  FlashlightOff,
  Lightbulb as LightbulbIcon,
  LightbulbOff,
  Lamp,
  LampDesk,
  LampFloor,
  LampWall,
  LampCeiling,
  SunDim,
  SunMedium,
  SunMoon,
  Eclipse,
  SunriseIcon,
  SunsetIcon,
  MoonStar,
  MoonIcon,
  Cloudy,
  CloudHail,
  CloudRainWind,
  Umbrella,
  Snowman,
  ThermometerIcon,
  Droplet,
  DropletsIcon,
  WavesIcon,
  Tsunami,
  Tornado,
  Hurricane,
  WindIcon,
  Gauge,
  Ruler,
  Scale,
  ThermometerPlus,
  ThermometerMinus,
  ThermometerZero,
  Weight,
  RulerIcon,
  Maximize as MaximizeIcon,
  Minimize as MinimizeIcon,
  MoveHorizontal,
  MoveVertical,
  MoveDiagonal,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  ArrowLeftRight,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowBigUp,
  ArrowBigDown,
  ArrowBigLeft,
  ArrowBigRight,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronFirst,
  ChevronLast,
  ChevronsUpDown,
  ChevronsLeftRight,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  CornerLeftUp,
  CornerLeftDown,
  CornerRightUp,
  CornerRightDown,
  FoldHorizontal,
  FoldVertical,
  UnfoldHorizontal,
  UnfoldVertical,
  Fold,
  Unfold,
  Scissors as ScissorsIcon,
  ScissorsSquare,
  ScissorsSquareDashedBottom,
  DraftingCompass,
  Compass as CompassIcon,
  SquareIcon,
  SquareDashed,
  SquareDot,
  SquareMinus,
  SquarePlus,
  SquareEqual,
  SquareDivide,
  SquareAsterisk,
  SquareSlash,
  SquarePercent,
  SquareCode,
  SquareCheck,
  SquareCheckBig,
  SquareX,
  SquareArrowUp,
  SquareArrowDown,
  SquareArrowLeft,
  SquareArrowRight,
  SquareArrowUpLeft,
  SquareArrowUpRight,
  SquareArrowDownLeft,
  SquareArrowDownRight,
  SquareChevronUp,
  SquareChevronDown,
  SquareChevronLeft,
  SquareChevronRight,
  SquareStack,
  Squares2x2,
  SquaresPlus,
  SquaresMinus,
  Grid2x2,
  Grid3x3 as Grid3x3Icon,
  Grid4x4,
  LayoutTemplate,
  LayoutDashboard,
  LayoutList as LayoutListIcon,
  LayoutGrid as LayoutGridIcon,
  PanelLeft as PanelLeftIcon,
  PanelRight as PanelRightIcon,
  PanelTop,
  PanelBottom,
  PanelLeftClose,
  PanelRightClose,
  PanelTopClose,
  PanelBottomClose,
  Sidebar,
  SidebarClose,
  SidebarOpen,
  SidebarLeft,
  SidebarRight,
  Table as TableIcon,
  Table2 as Table2Icon,
  TableProperties,
  TableColumnsSplit,
  TableRowsSplit,
  Kanban as KanbanIcon,
  KanbanSquare,
  GalleryHorizontal,
  GalleryVertical,
  GalleryThumbnails,
  GalleryHorizontalEnd,
  GalleryVerticalEnd,
  SeparatorHorizontal,
  SeparatorVertical,
  Space,
  GapHorizontal,
  GapVertical,
  Grip as GripIcon,
  GripHorizontal,
  GripVertical as GripVerticalIcon,
  Dot,
  Circle as CircleIcon,
  CircleDashed,
  CircleDot as CircleDotIcon,
  CircleSlash,
  CircleOff,
  CircleCheck as CircleCheckIcon,
  CircleX as CircleXIcon,
  CircleAlert,
  CircleHelp,
  CirclePlus as CirclePlusIcon,
  CircleMinus as CircleMinusIcon,
  CircleStop,
  CirclePause,
  CirclePlay,
  CircleFastForward,
  CircleRewind,
  CircleArrowUp as CircleArrowUpIcon,
  CircleArrowDown as CircleArrowDownIcon,
  CircleArrowLeft as CircleArrowLeftIcon,
  CircleArrowRight as CircleArrowRightIcon,
  CircleChevronUp,
  CircleChevronDown,
  CircleChevronLeft,
  CircleChevronRight,
  CircleArrowOutUpLeft,
  CircleArrowOutUpRight,
  CircleArrowOutDownLeft,
  CircleArrowOutDownRight,
  CircleArrowInUpLeft,
  CircleArrowInUpRight,
  CircleArrowInDownLeft,
  CircleArrowInDownRight,
  CircleEllipsis,
  CirclePercent,
  CircleDollarSign,
  CircleEuro,
  CirclePoundSterling,
  CircleJapaneseYen,
  CircleFadingPlus,
  CircleFadingArrowUp,
  CircleFadingArrowDown,
  Oval,
  Triangle as TriangleIcon,
  TriangleRight,
  TriangleAlert,
  Star as StarIcon,
  StarOff,
  Sparkle,
  Sparkles as SparklesIcon2,
  PartyPopper,
  Gift,
  GiftIcon,
  TrophyIcon,
  MedalIcon,
  AwardIcon as AwardIcon2,
  Crown as CrownIcon,
  Gem as GemIcon,
  Diamond as DiamondIcon,
  Radius,
  Diameter,
  Pentagon,
  Hexagon,
  Octagon,
  PentagonIcon as PentagonIcon2,
  HexagonIcon as HexagonIcon2,
  OctagonIcon as OctagonIcon2,
  PentagonFill,
  HexagonFill,
  OctagonFill,
  PentagonDashed,
  HexagonDashed,
  OctagonDashed,
  PentagonHorizontalDashed,
  PentagonVerticalDashed,
  HexagonHorizontalDashed,
  HexagonVerticalDashed,
  OctagonHorizontalDashed,
  OctagonVerticalDashed,
  PentagonSquare,
  HexagonSquare,
  OctagonSquare,
  PentagonAsterisk,
  HexagonAsterisk,
  OctagonAsterisk,
  PentagonSlash,
  HexagonSlash,
  OctagonSlash,
  PentagonPercent,
  HexagonPercent,
  OctagonPercent,
  PentagonCode,
  HexagonCode,
  OctagonCode,
  PentagonCheck,
  HexagonCheck,
  OctagonCheck,
  PentagonX,
  HexagonX,
  OctagonX,
  PentagonPlus,
  HexagonPlus,
  OctagonPlus,
  PentagonMinus,
  HexagonMinus,
  OctagonMinus,
  PentagonEqual,
  HexagonEqual,
  OctagonEqual,
  PentagonDivide,
  HexagonDivide,
  OctagonDivide,
  PentagonDot,
  HexagonDot,
  OctagonDot,
  PentagonRing,
  HexagonRing,
  OctagonRing
} from 'lucide-react';

export default function DocumentDashboard() {
  const { user } = useAuthStore();
  const { t } = useSimpleTranslation();
  const [documents, setDocuments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedDoc, setExpandedDoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // View modes
  const [viewMode, setViewMode] = useState('grid'); // grid, list, kanban
  const [sortBy, setSortBy] = useState('updatedAt'); // updatedAt, createdAt, title, size
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [filterOwner, setFilterOwner] = useState('all');
  const [filterTags, setFilterTags] = useState([]);
  
  // Selection
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [bulkActions, setBulkActions] = useState(false);
  
  // Preview
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewMode, setPreviewMode] = useState('side'); // side, fullscreen
  
  // Favorites
  const [favorites, setFavorites] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  
  // Tags - populated from API
  const [availableTags, setAvailableTags] = useState([]);
  
  // Document templates - populated from API
  const [templates, setTemplates] = useState([]);
  
  // Drag and drop
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Form states
  const [newDoc, setNewDoc] = useState({
    title: '',
    content: '',
    type: 'NOTE',
    visibility: 'PUBLIC',
    groupId: '',
    file: null,
    selectedUsers: [],
    tags: [],
    description: '',
    folder: '',
    template: 'blank'
  });

  // Share form
  const [shareForm, setShareForm] = useState({
    userId: '',
    groupId: '',
    permission: 'READ',
    expiresAt: '',
    allowDownload: true
  });
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    byType: {},
    byVisibility: {},
    recent: 0,
    shared: 0,
    storageUsed: 0
  });

  useEffect(() => {
    fetchDocuments();
    fetchGroups();
    fetchUsers();
  }, [activeTab]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let endpoint = '/documents?workspaceId=1';
      if (activeTab === 'pool') endpoint = '/documents/pool?workspaceId=1';
      if (activeTab === 'shared') endpoint = '/documents/shared?workspaceId=1';
      
      const response = await api.get(endpoint);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      console.log('Fetching groups...');
      const response = await api.get('/groups?workspaceId=1');
      console.log('Groups response:', response.data);
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const response = await api.get('/users/workspace/1');
      console.log('Users response:', response.data);
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const createDocument = async () => {
    if (!newDoc.title.trim()) return;

    try {
      const formData = new FormData();
      formData.append('title', newDoc.title);
      formData.append('content', newDoc.content);
      formData.append('type', newDoc.type);
      formData.append('visibility', newDoc.visibility);
      formData.append('workspaceId', '1');
      
      if (newDoc.groupId) {
        formData.append('groupId', newDoc.groupId);
      }
      
      if (newDoc.file) {
        formData.append('file', newDoc.file);
      }
      
      if (newDoc.selectedUsers && newDoc.selectedUsers.length > 0) {
        newDoc.selectedUsers.forEach(userId => {
          formData.append('selectedUsers[]', userId);
        });
      }

      const response = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setDocuments([response.data.document, ...documents]);
      setShowCreateModal(false);
      setNewDoc({ 
        title: '', 
        content: '', 
        type: 'NOTE', 
        visibility: 'PUBLIC', 
        groupId: '', 
        file: null,
        selectedUsers: []
      });
    } catch (error) {
      console.error('Error creating document:', error);
      alert('Doküman oluşturulamadı: ' + (error.response?.data?.error || error.message));
    }
  };

  const deleteDocument = async (id) => {
    if (!confirm('Bu dokümanı silmek istediğinize emin misiniz?')) return;

    try {
      await api.delete(`/documents/${id}`);
      setDocuments(documents.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const shareDocument = async () => {
    if (!selectedDocument) return;
    if (!shareForm.userId && !shareForm.groupId) {
      alert('Lütfen kullanıcı veya grup seçin');
      return;
    }

    try {
      await api.post(`/documents/${selectedDocument.id}/share`, shareForm);
      alert('Doküman başarıyla paylaşıldı!');
      setShowShareModal(false);
      setShareForm({ userId: '', groupId: '', permission: 'READ' });
      fetchDocuments();
    } catch (error) {
      console.error('Error sharing document:', error);
      alert('Paylaşım hatası: ' + (error.response?.data?.error || error.message));
    }
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'PUBLIC': return <Globe className="w-4 h-4 text-green-600" />;
      case 'PRIVATE': return <Lock className="w-4 h-4 text-red-600" />;
      case 'GROUP': return <Users className="w-4 h-4 text-blue-600" />;
      case 'SPECIFIC_USERS': return <Eye className="w-4 h-4 text-purple-600" />;
      default: return <EyeOff className="w-4 h-4 text-gray-600" />;
    }
  };

  const getVisibilityLabel = (visibility) => {
    switch (visibility) {
      case 'PUBLIC': return 'Herkese Açık';
      case 'PRIVATE': return 'Özel';
      case 'GROUP': return 'Grup ile Paylaşım';
      case 'SPECIFIC_USERS': return 'Seçili Kullanıcılar';
      default: return visibility;
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Dokümanlar</h1>
                  <p className="text-sm text-gray-500">
                    Dokümanlar • {t('documents.description')}
                  </p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    {documents.filter(d => d.visibility === 'PUBLIC').length} {t('documents.public')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    {documents.filter(d => d.shares?.length > 0).length} {t('documents.shared')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    {documents.filter(d => d.visibility === 'PRIVATE').length} {t('documents.private')}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              {t('documents.new')}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('documents.searchPlaceholder') || 'Doküman ara...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              {[
                { id: 'all', label: t('documents.title'), count: documents.length },
                { id: 'shared', label: t('documents.shared'), count: documents.filter(d => d.shares?.length > 0 && d.creatorId !== user?.id).length },
                { id: 'pool', label: t('documents.public'), count: documents.filter(d => d.visibility === 'PUBLIC').length },
                { id: 'private', label: t('documents.private'), count: documents.filter(d => d.visibility === 'PRIVATE' && d.creatorId === user?.id).length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDocuments.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('documents.noDocuments')}</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || activeTab !== 'all'
                    ? t('documents.tryFilters')
                    : t('documents.createFirst')
                  }
                </p>
                {(!searchTerm && activeTab === 'all') && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                  >
                    <Plus className="w-5 h-5" />
                    {t('documents.createFirst')}
                  </button>
                )}
              </div>
            ) : (
              filteredDocuments.map((doc) => {
                const isExpanded = expandedDoc === doc.id;
                
                return (
                  <div
                    key={doc.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-green-300 overflow-hidden group"
                  >
                    {/* Document Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                              {doc.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {doc.creator?.firstName} {doc.creator?.lastName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(doc.createdAt).toLocaleDateString('tr-TR')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title={isExpanded ? "Collapse" : "Expand"}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 rotate-180" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Visibility Badge */}
                      <div className="flex items-center gap-2 mb-4">
                        {getVisibilityIcon(doc.visibility)}
                        <span className="text-sm font-medium text-gray-600">
                          {getVisibilityLabel(doc.visibility)}
                        </span>
                        {doc.group && (
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                            {doc.group.name}
                          </span>
                        )}
                        {doc.shares?.length > 0 && (
                          <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
                            Shared with {doc.shares.length}
                          </span>
                        )}
                      </div>

                      {/* Content Preview */}
                      {doc.content && (
                        <div className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {doc.content}
                        </div>
                      )}
                    </div>

                    {/* Document Actions */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {doc.content && (
                            <button
                              onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                              className="text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                              {isExpanded ? 'Hide Content' : 'View Content'}
                            </button>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {doc.creatorId === user?.id && (
                            <button
                              onClick={() => {
                                setSelectedDocument(doc);
                                setShowShareModal(true);
                              }}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                              title="Share"
                            >
                              <Share2 className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteDocument(doc.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && doc.content && (
                      <div className="px-6 py-4 border-t border-gray-100 bg-white">
                        <div className="prose prose-sm max-w-none">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Document Content</h4>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {doc.content}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>

    {/* Create Modal */}
    {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Yeni Doküman</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">Başlık *</label>
                <input
                  type="text"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="Doküman başlığı..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">İçerik</label>
                <textarea
                  value={newDoc.content}
                  onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none transition-all"
                  placeholder="Doküman içeriği..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">Dosya Ekle</label>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
                    if (file && file.size > MAX_FILE_SIZE) {
                      alert('Dosya boyutu 50MB\'dan büyük olamaz');
                      return;
                    }
                    setNewDoc({ ...newDoc, file });
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                />
                {newDoc.file && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✓ Seçilen dosya: {newDoc.file.name} ({(newDoc.file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">Görünürlük</label>
                <select
                  value={newDoc.visibility}
                  onChange={(e) => setNewDoc({ ...newDoc, visibility: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                >
                  <option value="PUBLIC">🌐 Herkese Açık (Genel Havuz)</option>
                  <option value="PRIVATE">🔒 Sadece Ben</option>
                  <option value="GROUP">👥 Grup ile Paylaş</option>
                  <option value="SPECIFIC_USERS">👤 Belirli Kişilerle Paylaş</option>
                </select>
              </div>

              {newDoc.visibility === 'GROUP' && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">Grup Seç *</label>
                  <select
                    value={newDoc.groupId}
                    onChange={(e) => setNewDoc({ ...newDoc, groupId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  >
                    <option value="">Grup seçin...</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {newDoc.visibility === 'SPECIFIC_USERS' && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Kullanıcı Seç * <span className="text-xs font-normal text-gray-500">(birden fazla seçebilirsiniz)</span>
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-800">
                    {users.length === 0 ? (
                      <p className="text-gray-500 text-sm">Kullanıcı yükleniyor...</p>
                    ) : (
                      users
                        .filter(u => u.id !== user?.id)
                        .map((u) => (
                          <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={newDoc.selectedUsers?.includes(u.id) || false}
                              onChange={(e) => {
                                const selectedUsers = e.target.checked
                                  ? [...(newDoc.selectedUsers || []), u.id]
                                  : (newDoc.selectedUsers || []).filter(id => id !== u.id);
                                setNewDoc({ ...newDoc, selectedUsers });
                              }}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                {u.firstName} {u.lastName}
                              </span>
                              <span className="text-xs text-gray-500 block">{u.email}</span>
                            </div>
                          </label>
                        ))
                    )}
                  </div>
                  {newDoc.selectedUsers?.length > 0 ? (
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      ✓ {newDoc.selectedUsers.length} kullanıcı seçildi
                    </p>
                  ) : (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      ⚠ En az bir kullanıcı seçmelisiniz
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={createDocument}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
                >
                  Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Dokümanı Paylaş</h3>
              <button onClick={() => setShowShareModal(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-xl">
              <p className="font-medium">{selectedDocument.title}</p>
              <p className="text-sm text-gray-500">
                Şu an: {getVisibilityLabel(selectedDocument.visibility)}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Kullanıcı ile Paylaş
                </label>
                <select
                  value={shareForm.userId}
                  onChange={(e) => setShareForm({ ...shareForm, userId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                >
                  <option value="">Kullanıcı seçin...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="text-center text-gray-400 font-medium">VEYA</div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Grup ile Paylaş
                </label>
                <select
                  value={shareForm.groupId}
                  onChange={(e) => setShareForm({ ...shareForm, groupId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                >
                  <option value="">Grup seçin...</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">İzin</label>
                <select
                  value={shareForm.permission}
                  onChange={(e) => setShareForm({ ...shareForm, permission: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                >
                  <option value="VIEW">Görüntüle</option>
                  <option value="EDIT">Düzenle</option>
                  <option value="ADMIN">Tam Yetki</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={shareDocument}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700"
                >
                  Paylaş
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
