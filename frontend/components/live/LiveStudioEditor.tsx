"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Radio,
  Camera,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorUp,
  Volume2,
  VolumeX,
  Settings,
  Disc,
  Play,
  Square,
  Pause,
  RefreshCw,
  Layers,
  Sliders,
  ShieldCheck,
  Gavel,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  CheckCircle,
  Copy,
  ExternalLink,
  ArrowRight,
  Maximize2,
  Minimize2,
  Grid,
  Users,
  MessageSquare,
  Flame,
  Clock,
  Lock,
  Unlock,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle,
  Scissors,
  Repeat,
  Send,
  Download,
  Upload,
  FolderOpen,
  Film,
  PictureInPicture,
} from "lucide-react";

export interface LiveStudioLot {
  id: number;
  lot_number: number;
  title: string;
  starting_price: number;
  current_price: number;
  bid_increment: number;
  status: "active" | "up_next" | "queued" | "sold" | "passed";
  highest_bidder?: string;
  image_url: string;
}

interface SceneOption {
  id: string;
  name: string;
  type: "camera" | "screen" | "pip" | "split" | "intermission" | "video_file";
  icon: string;
  description: string;
}

interface SourceLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  category: "video" | "audio" | "graphic" | "overlay";
}

interface DeviceOption {
  deviceId: string;
  label: string;
}

interface LiveStudioProps {
  roomId?: number;
  roomTitle?: string;
  hostName?: string;
  hostRole?: string;
  defaultStreamKey?: string;
  portalType?: "creator" | "seller" | "staff" | "admin";
}

export default function LiveStudioEditor({
  roomId = 1,
  roomTitle = "Sacred Newar Lost-Wax Bronze & Thangka Live Auction",
  hostName = "Umesh Shakya",
  hostRole = "Master Sculptor & 7th Gen Bronze Founder",
  defaultStreamKey = "live_bronze_master_key_99",
  portalType = "creator",
}: LiveStudioProps) {
  // Broadcaster State
  const [isLive, setIsLive] = useState(false);
  const [liveDuration, setLiveDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  // OBS Modes
  const [studioMode, setStudioMode] = useState(false); // Dual Monitor: Preview + Program
  const [activeTab, setActiveTab] = useState<"studio" | "rtmp" | "settings">("studio");

  // Multi-Source Video Engine States
  type VideoSourceMode = "camera" | "video_file" | "screen" | "preset_loop";
  const [inputMode, setInputMode] = useState<VideoSourceMode>("preset_loop");
  const [customVideoFileUrl, setCustomVideoFileUrl] = useState<string | null>(null);
  const [customVideoFileName, setCustomVideoFileName] = useState<string | null>(null);

  // High-Definition Preloaded Artisan Workshop Loops
  const presetVideos = [
    {
      id: "patan_bronze",
      name: "Patan Lost-Wax Bronze Casting (4K Atelier)",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
    {
      id: "woodcraft",
      name: "Bhaktapur Traditional Woodcarving Atelier",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    },
    {
      id: "singing_bowl",
      name: "Himalayan 7-Metal Singing Bowl Master Chasing",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    },
  ];
  const [selectedPresetVideo, setSelectedPresetVideo] = useState(presetVideos[0]);

  // Picture-in-Picture (PiP) State
  const [pipActive, setPipActive] = useState(false);

  // Device & Hardware Stream States
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [selectedMicId, setSelectedMicId] = useState<string>("");
  const [videoDevices, setVideoDevices] = useState<DeviceOption[]>([]);
  const [audioDevices, setAudioDevices] = useState<DeviceOption[]>([]);

  // Telemetry Stats
  const [fps] = useState(60);
  const [bitrate, setBitrate] = useState(4850);
  const [droppedFrames] = useState(0);
  const [cpuLoad, setCpuLoad] = useState(14);
  const [viewerCount, setViewerCount] = useState(1420);

  // Scenes & Sources
  const defaultScenes: SceneOption[] = [
    { id: "scene_cam_main", name: "Master Artisan (Direct Camera)", type: "camera", icon: "📹", description: "Full HD live device camera of artisan in atelier" },
    { id: "scene_video_file", name: "System Video File (Workshop Reel)", type: "video_file", icon: "📁", description: "Stream attached MP4/WebM video file from your computer" },
    { id: "scene_screen", name: "Screen Share (Blueprints & Mandala)", type: "screen", icon: "🖥️", description: "Live display presentation of iconometry and drawings" },
    { id: "scene_pip", name: "Picture-in-Picture (Video + Camera PiP)", type: "pip", icon: "🖼️", description: "Artisan camera overlay in corner on top of workshop feed" },
    { id: "scene_split", name: "Split Screen (Lot Showcase + Studio)", type: "split", icon: "⚖️", description: "Dual equal view of current lot catalog and studio" },
    { id: "scene_intermission", name: "Intermission (Be Right Back)", type: "intermission", icon: "☕", description: "Traditional Mandala standby screen with chime countdown" },
  ];

  const [scenes] = useState<SceneOption[]>(defaultScenes);
  const [programScene, setProgramScene] = useState<SceneOption>(defaultScenes[0]);
  const [previewScene, setPreviewScene] = useState<SceneOption>(defaultScenes[1]);

  const [sources, setSources] = useState<SourceLayer[]>([
    { id: "src_video_cam", name: "Active Video Engine (Cam / File / Screen)", visible: true, locked: true, category: "video" },
    { id: "src_lower_third", name: "Artisan Name & Credential Banner", visible: true, locked: false, category: "graphic" },
    { id: "src_lot_hud", name: "Live Auction Lot & Floor Bidding Ticker", visible: true, locked: false, category: "overlay" },
    { id: "src_watermark", name: "Dharohar Heritage Authentic Seal", visible: true, locked: true, category: "graphic" },
    { id: "src_chat_ticker", name: "Live Audience Comments Overlay", visible: true, locked: false, category: "overlay" },
  ]);

  // Audio Mixer States
  const [micVolume, setMicVolume] = useState(85);
  const [micMuted, setMicMuted] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(35);
  const [ambientMuted, setAmbientMuted] = useState(false);
  const [masterVolume, setMasterVolume] = useState(100);
  const [micPeakLevel, setMicPeakLevel] = useState(0);

  // Auction Lot Management
  const [lots, setLots] = useState<LiveStudioLot[]>([
    {
      id: 101,
      lot_number: 1,
      title: "18th-Century Style Shakyamuni Buddha Bronze (24K Gold Gilded)",
      starting_price: 75000,
      current_price: 145000,
      bid_increment: 5000,
      status: "active",
      highest_bidder: "Pradeep Thapa (Kathmandu)",
      image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
    },
    {
      id: 102,
      lot_number: 2,
      title: "Mineral Pigment Chenrezig Mandalas on Organic Cotton Canvas",
      starting_price: 45000,
      current_price: 45000,
      bid_increment: 2500,
      status: "up_next",
      image_url: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=600",
    },
    {
      id: 103,
      lot_number: 3,
      title: "Hand-Forged 7-Metal Full Moon Singing Bowl with Striker",
      starting_price: 28000,
      current_price: 28000,
      bid_increment: 1500,
      status: "queued",
      image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600",
    },
  ]);

  const [activeLot, setActiveLot] = useState<LiveStudioLot>(lots[0]);
  const [antiSnipingSeconds, setAntiSnipingSeconds] = useState(180);
  const [lotSoldNotification, setLotSoldNotification] = useState<string | null>(null);

  // Chat & Audience Simulation
  const [liveChat, setLiveChat] = useState<{ id: number; user: string; role: string; text: string; time: string }[]>([
    { id: 1, user: "Dharohar System", role: "system", text: "Studio broadcast encoder linked to Nepal Ingest Node.", time: "20:00" },
    { id: 2, user: "Pradeep Thapa", role: "buyer", text: "Namaste Master Umesh! The 24K gilding on the lotus base is breathtaking.", time: "20:01" },
    { id: 3, user: "Elena Rostova", role: "buyer", text: "Is the certificate of the Archaeology Department included with Lot 1?", time: "20:02" },
    { id: 4, user: "Sunita Sharma", role: "staff", text: "Yes Elena, certified seal and export permit included in final hammer price.", time: "20:02" },
  ]);
  const [announcementInput, setAnnouncementInput] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Settings State
  const [resolution, setResolution] = useState<"1080p" | "720p" | "4k">("1080p");
  const [targetFps, setTargetFps] = useState<"60" | "30">("60");
  const [videoBitrateSetting, setVideoBitrateSetting] = useState(4500);
  const [serverRegion, setServerRegion] = useState("Kathmandu Local Mesh (Sub-100ms)");

  // Video Refs
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const videoProgramRef = useRef<HTMLVideoElement | null>(null);
  const pipPreviewRef = useRef<HTMLVideoElement | null>(null);
  const pipProgramRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stream Refs
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Synchronize state across tabs and localStorage
  const syncBroadcastState = useCallback((overrideState?: Partial<Record<string, unknown>>) => {
    if (typeof window === "undefined") return;
    const currentStreamUrl =
      inputMode === "video_file" && customVideoFileUrl
        ? customVideoFileUrl
        : inputMode === "preset_loop"
        ? selectedPresetVideo.url
        : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

    const broadcastPayload = {
      is_live: isLive,
      room_id: roomId,
      host_name: hostName,
      scene_id: programScene.id,
      scene_name: programScene.name,
      active_lot: activeLot,
      seconds_remaining: antiSnipingSeconds,
      input_mode: inputMode,
      stream_video_url: currentStreamUrl,
      timestamp: Date.now(),
      ...overrideState,
    };

    try {
      localStorage.setItem("dharohar_active_broadcast_state", JSON.stringify(broadcastPayload));
      broadcastChannelRef.current?.postMessage({
        type: "BROADCAST_STATE_UPDATE",
        payload: broadcastPayload,
      });
    } catch {
      // ignore
    }
  }, [isLive, roomId, hostName, programScene, activeLot, antiSnipingSeconds, inputMode, customVideoFileUrl, selectedPresetVideo]);

  // Unified Video Application Engine: handles camera, screen, file, or preset loop
  const updateVideoElement = useCallback((
    el: HTMLVideoElement | null,
    mode: VideoSourceMode,
    camStream: MediaStream | null,
    scrStream: MediaStream | null,
    fileUrl: string | null,
    presetUrl: string
  ) => {
    if (!el) return;

    try {
      if (mode === "camera" && camStream) {
        if (el.src) el.removeAttribute("src");
        el.srcObject = camStream;
        el.play().catch(() => {});
      } else if (mode === "screen" && scrStream) {
        if (el.src) el.removeAttribute("src");
        el.srcObject = scrStream;
        el.play().catch(() => {});
      } else if (mode === "video_file" && fileUrl) {
        el.srcObject = null;
        el.src = fileUrl;
        el.loop = true;
        el.play().catch(() => {});
      } else {
        // Preset Loop (guarantees the monitor is NEVER black!)
        el.srcObject = null;
        el.src = presetUrl;
        el.loop = true;
        el.play().catch(() => {});
      }
    } catch (e) {
      console.warn("Video source update caught:", e);
    }
  }, []);

  // Update monitors whenever source mode or inputs change
  useEffect(() => {
    updateVideoElement(
      videoPreviewRef.current,
      inputMode,
      localStreamRef.current,
      screenStreamRef.current,
      customVideoFileUrl,
      selectedPresetVideo.url
    );
    updateVideoElement(
      videoProgramRef.current,
      inputMode,
      localStreamRef.current,
      screenStreamRef.current,
      customVideoFileUrl,
      selectedPresetVideo.url
    );

    // Also update PiP camera elements if active
    if (pipActive || programScene.type === "pip") {
      if (localStreamRef.current) {
        if (pipProgramRef.current) pipProgramRef.current.srcObject = localStreamRef.current;
        if (pipPreviewRef.current) pipPreviewRef.current.srcObject = localStreamRef.current;
      } else {
        if (pipProgramRef.current) {
          pipProgramRef.current.srcObject = null;
          pipProgramRef.current.src = presetVideos[1].url;
          pipProgramRef.current.play().catch(() => {});
        }
        if (pipPreviewRef.current) {
          pipPreviewRef.current.srcObject = null;
          pipPreviewRef.current.src = presetVideos[1].url;
          pipPreviewRef.current.play().catch(() => {});
        }
      }
    }

    syncBroadcastState();
  }, [inputMode, customVideoFileUrl, selectedPresetVideo, pipActive, programScene, updateVideoElement, syncBroadcastState]);

  // Cross-Tab Broadcast Synchronization setup
  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("dharohar_live_broadcast");
        broadcastChannelRef.current = bc;
        bc.onmessage = (event) => {
          if (event.data?.type === "USER_BID") {
            const { amount, bidderName } = event.data;
            handleIncomingAudienceBid(amount, bidderName);
          }
        };
      } catch (err) {
        console.warn("BroadcastChannel not supported", err);
      }
    }

    return () => {
      broadcastChannelRef.current?.close();
    };
  }, [activeLot]);

  // Countdown timer for active lot and live durations
  useEffect(() => {
    const timer = setInterval(() => {
      if (isLive) {
        setLiveDuration((prev) => prev + 1);
        setBitrate(4800 + Math.floor(Math.sin(Date.now() / 1000) * 120));
        setCpuLoad(12 + Math.floor(Math.random() * 5));
        setViewerCount((prev) => Math.max(1200, prev + (Math.random() > 0.4 ? 3 : -2)));
      }
      if (isRecording) {
        setRecordingDuration((prev) => prev + 1);
      }
      setAntiSnipingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isLive, isRecording]);

  // Audio VU Meter Synthesizer / Web Audio Reader
  useEffect(() => {
    let active = true;

    const updateAudioLevel = () => {
      if (!active) return;

      if (analyserRef.current && micActive && !micMuted) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * (micVolume / 100) * 100));
        setMicPeakLevel(normalized);
      } else if (micActive && !micMuted) {
        const simulated = Math.min(
          95,
          Math.max(12, Math.round(35 + Math.sin(Date.now() / 180) * 25 + Math.random() * 15) * (micVolume / 100))
        );
        setMicPeakLevel(simulated);
      } else {
        setMicPeakLevel(0);
      }

      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);

    return () => {
      active = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [micActive, micMuted, micVolume]);

  // Hardware Device Discovery (Webcam & Mic)
  const discoverDevices = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs: DeviceOption[] = [];
      const audioInputs: DeviceOption[] = [];

      devices.forEach((device, index) => {
        if (device.kind === "videoinput") {
          videoInputs.push({
            deviceId: device.deviceId || `cam-${index}`,
            label: device.label || `Device Camera ${videoInputs.length + 1} (Built-in / USB)`,
          });
        } else if (device.kind === "audioinput") {
          audioInputs.push({
            deviceId: device.deviceId || `mic-${index}`,
            label: device.label || `Microphone ${audioInputs.length + 1} (Studio Input)`,
          });
        }
      });

      if (videoInputs.length === 0) {
        videoInputs.push({ deviceId: "default_webcam", label: "Front Integrated Studio HD Camera" });
        videoInputs.push({ deviceId: "usb_cam_macro", label: "External USB Craft Macro Rig (1080p)" });
      }
      if (audioInputs.length === 0) {
        audioInputs.push({ deviceId: "default_mic", label: "Internal Studio Array Microphone" });
        audioInputs.push({ deviceId: "usb_condenser", label: "Broadcast Condenser Mic (Patan Atelier)" });
      }

      setVideoDevices(videoInputs);
      setAudioDevices(audioInputs);
      if (!selectedCameraId && videoInputs[0]) setSelectedCameraId(videoInputs[0].deviceId);
      if (!selectedMicId && audioInputs[0]) setSelectedMicId(audioInputs[0].deviceId);
    } catch (e) {
      console.warn("Device enumeration failed", e);
    }
  }, [selectedCameraId, selectedMicId]);

  // Start / Connect In-Browser Device Camera
  const startDeviceCamera = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      showToast("Camera access requires HTTPS or localhost.");
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: selectedCameraId
          ? { deviceId: { exact: selectedCameraId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: "user" },
        audio: selectedMicId
          ? { deviceId: { exact: selectedMicId }, echoCancellation: true, noiseSuppression: true }
          : { echoCancellation: true, noiseSuppression: true },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setHasCameraPermission(true);
      setCameraActive(true);
      setInputMode("camera");

      // Attach AudioContext Analyser
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const sourceNode = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          sourceNode.connect(analyser);
          analyserRef.current = analyser;
        }
      } catch {}

      await discoverDevices();
      showToast("🟢 Device Camera Connected! Live on program monitors.");
    } catch (err: any) {
      console.warn("Camera access denied or failed", err);
      setHasCameraPermission(false);
      setInputMode("preset_loop");
      showToast("Camera permission not granted. Switched to high-definition workshop feed.");
      await discoverDevices();
    }
  };

  // Initial setup: try camera or fall back to preset workshop loop
  useEffect(() => {
    discoverDevices();
    // Start with preset workshop loop so video is NEVER black!
    updateVideoElement(
      videoPreviewRef.current,
      "preset_loop",
      null,
      null,
      null,
      selectedPresetVideo.url
    );
    updateVideoElement(
      videoProgramRef.current,
      "preset_loop",
      null,
      null,
      null,
      selectedPresetVideo.url
    );

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [discoverDevices, selectedPresetVideo, updateVideoElement]);

  // Handle Local System Video File Upload / Selection
  const handleAttachVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileUrl = URL.createObjectURL(file);
      setCustomVideoFileUrl(fileUrl);
      setCustomVideoFileName(file.name);
      setInputMode("video_file");
      showToast(`🎬 Attached System Video File: "${file.name}". Playing live on stream!`);
    } catch (err) {
      showToast("Could not load video file. Please select a valid MP4 or WebM video.");
    }
  };

  // Start Screen Share to Stream
  const startScreenShare = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
      showToast("Display capture not supported in this browser.");
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      screenStreamRef.current = screenStream;
      setIsScreenSharing(true);
      setInputMode("screen");
      const screenScene = scenes.find((s) => s.type === "screen") || defaultScenes[2];
      setProgramScene(screenScene);

      screenStream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
        screenStreamRef.current = null;
        setInputMode(localStreamRef.current ? "camera" : "preset_loop");
        showToast("Screen share concluded. Returned to primary stream.");
      };

      showToast("🖥️ Screen Share Active! Window or screen transmitting on stream.");
    } catch (err) {
      console.warn("Screen share cancelled", err);
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
    setInputMode(localStreamRef.current ? "camera" : "preset_loop");
    showToast("Screen share stopped.");
  };

  // Sound Synthesizer for Gavel Hammer & Anti-Sniping Chimes
  const playSoundEffect = (type: "gavel" | "chime" | "warning") => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === "gavel") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);
        gain.gain.setValueAtTime(1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (type === "chime") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.8);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
        osc.start(now);
        osc.stop(now + 0.86);
      } else {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.setValueAtTime(680, now + 0.1);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.31);
      }
    } catch {}
  };

  // Toggle Camera Feed (Blackout vs Active)
  const toggleCamera = () => {
    if (inputMode !== "camera" && !localStreamRef.current) {
      startDeviceCamera();
      return;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !cameraActive;
      });
    }
    setCameraActive(!cameraActive);
    showToast(!cameraActive ? "Video capture resumed." : "Video capture paused.");
  };

  // Toggle Microphone
  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !micActive;
      });
    }
    setMicActive(!micActive);
    showToast(!micActive ? "Microphone unmuted." : "Microphone muted.");
  };

  // Go Live / Stop Streaming
  const toggleGoLive = () => {
    if (!isLive) {
      setIsLive(true);
      setLiveDuration(0);
      playSoundEffect("chime");
      syncBroadcastState({ is_live: true });
      showToast("🔴 YOU ARE NOW LIVE ON AIR! Broadcast transmitted to Dharohar Live Hall.");
    } else {
      setIsLive(false);
      syncBroadcastState({ is_live: false });
      showToast("Live broadcast completed. Master session archived.");
    }
  };

  // Local Recording (MediaRecorder API)
  const toggleRecording = () => {
    if (!isRecording) {
      try {
        const streamToRecord = localStreamRef.current || screenStreamRef.current;
        if (streamToRecord && typeof MediaRecorder !== "undefined") {
          const recorder = new MediaRecorder(streamToRecord, { mimeType: "video/webm;codecs=vp9,opus" });
          const chunks: Blob[] = [];

          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
          };

          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/webm" });
            const url = URL.createObjectURL(blob);
            setRecordedVideoUrl(url);
            setRecordedChunks(chunks);
            showToast("Recording saved! Download ready.");
          };

          recorder.start(1000);
          mediaRecorderRef.current = recorder;
        }
      } catch (e) {
        console.warn("MediaRecorder start error", e);
      }
      setIsRecording(true);
      setRecordingDuration(0);
      showToast("⚫ Local Master Recording started (1080p WebM).");
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      showToast("Recording finished. File saved to browser cache.");
    }
  };

  // Transition / Switch Scene in Studio Mode
  const transitionToProgram = (type: "cut" | "fade") => {
    playSoundEffect("chime");
    setProgramScene(previewScene);
    if (previewScene.type === "pip") setPipActive(true);
    if (previewScene.type === "screen" && !isScreenSharing) startScreenShare();
    if (previewScene.type === "video_file" && customVideoFileUrl) setInputMode("video_file");
    syncBroadcastState({ scene_id: previewScene.id, scene_name: previewScene.name });
    showToast(`Pushed "${previewScene.name}" to Program (${type.toUpperCase()}).`);
  };

  // Toggle Source Visibility
  const toggleSourceVisibility = (id: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  };

  // Hammer Down (SOLD)
  const hammerDownCurrentLot = () => {
    playSoundEffect("gavel");
    const soldAmount = activeLot.current_price;
    const winner = activeLot.highest_bidder || "Master Collector (Floor)";

    setLots((prev) =>
      prev.map((l) =>
        l.id === activeLot.id ? { ...l, status: "sold" } : l
      )
    );
    setActiveLot((prev) => ({ ...prev, status: "sold" }));

    setLotSoldNotification(`GAVEL DOWN! LOT #${activeLot.lot_number} SOLD FOR NPR ${soldAmount.toLocaleString()} TO ${winner}!`);
    setTimeout(() => setLotSoldNotification(null), 6000);

    syncBroadcastState({
      event: "LOT_HAMMER_DOWN",
      sold_lot: activeLot,
      sold_price: soldAmount,
    });

    setLiveChat((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: "Gavel Master",
        role: "system",
        text: `🔨 SOLD! Lot #${activeLot.lot_number} knocked down at NPR ${soldAmount.toLocaleString()} to ${winner}! Congratulations!`,
        time: "Just now",
      },
    ]);
  };

  // Anti-Sniping Extension (+60s)
  const extendLotTimer = () => {
    playSoundEffect("chime");
    setAntiSnipingSeconds((prev) => prev + 60);
    showToast("+60 Seconds Anti-Sniping Extension Activated!");
    syncBroadcastState({ seconds_remaining: antiSnipingSeconds + 60 });
  };

  // Activate Next Lot
  const activateLot = (lot: LiveStudioLot) => {
    setActiveLot(lot);
    setAntiSnipingSeconds(240);
    setLots((prev) =>
      prev.map((l) =>
        l.id === lot.id
          ? { ...l, status: "active" }
          : l.status === "active"
          ? { ...l, status: "passed" }
          : l
      )
    );
    playSoundEffect("chime");
    showToast(`Switched active floor lot to Lot #${lot.lot_number}: ${lot.title}`);
    syncBroadcastState({ active_lot: lot });
  };

  // Handle simulated / cross-tab incoming bids
  const handleIncomingAudienceBid = (amount: number, bidderName: string) => {
    playSoundEffect("chime");
    setActiveLot((prev) => {
      const updated = {
        ...prev,
        current_price: amount,
        highest_bidder: bidderName,
      };
      setLots((all) => all.map((l) => (l.id === prev.id ? updated : l)));
      return updated;
    });

    setLiveChat((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: bidderName,
        role: "buyer",
        text: `💰 Placed bid: NPR ${amount.toLocaleString()}`,
        time: "Just now",
      },
    ]);
  };

  // Broadcast Announcement
  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementInput.trim()) return;

    const newMsg = {
      id: Date.now(),
      user: `${hostName} (Host)`,
      role: "creator",
      text: announcementInput.trim(),
      time: "Just now",
    };
    setLiveChat((prev) => [...prev, newMsg]);
    setAnnouncementInput("");
    showToast("Announcement pinned on viewer screens!");
  };

  // Formatting helpers
  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard.`);
    }
  };

  return (
    <div className="bg-stone-950 text-stone-100 rounded-3xl border border-stone-800 shadow-2xl overflow-hidden flex flex-col font-sans select-none">
      {/* Hidden File Input for Attaching Local System Video Files */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/mkv"
        onChange={handleAttachVideoFile}
        className="hidden"
      />

      {/* ======================================================== */}
      {/* 1. OBS TOP APPLICATION BAR & TELEMETRY HEADER             */}
      {/* ======================================================== */}
      <div className="bg-stone-900 border-b border-stone-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
            <div>
              <div className="font-black text-stone-100 tracking-tight flex items-center gap-2">
                <span>Dharohar OBS WebStudio</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 font-mono">v2.5-PRO</span>
              </div>
              <div className="text-[10px] text-stone-400 truncate max-w-[260px] sm:max-w-md">
                Room #{roomId}: {roomTitle}
              </div>
            </div>
          </div>

          <div className="h-5 w-px bg-stone-800 hidden sm:block" />

          {/* Tab Navigation */}
          <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setActiveTab("studio")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "studio"
                  ? "bg-stone-800 text-amber-400 shadow-sm"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Studio Mixer</span>
            </button>
            <button
              onClick={() => setActiveTab("rtmp")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "rtmp"
                  ? "bg-stone-800 text-amber-400 shadow-sm"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>External OBS / RTMP</span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "settings"
                  ? "bg-stone-800 text-amber-400 shadow-sm"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Live Broadcast Telemetry (Bitrate, FPS, Status) */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Live Indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-bold border transition ${
              isLive
                ? "bg-red-950/80 text-red-400 border-red-700/60 shadow-[0_0_15px_rgba(220,38,38,0.35)]"
                : "bg-stone-900 text-stone-400 border-stone-800"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-red-500 animate-ping" : "bg-stone-600"}`} />
            <span>{isLive ? `LIVE ${formatTimer(liveDuration)}` : "STANDBY"}</span>
          </div>

          {/* Recording Indicator */}
          {isRecording && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-400 border border-amber-700/60 text-[11px] font-mono font-bold animate-pulse">
              <Disc className="w-3 h-3 text-red-500" />
              <span>REC {formatTimer(recordingDuration)}</span>
            </div>
          )}

          {/* Telemetry Stats */}
          <div className="hidden xl:flex items-center gap-3 font-mono text-[11px] text-stone-400 bg-stone-950 px-3 py-1 rounded-xl border border-stone-800">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {bitrate} kbps
            </span>
            <span className="text-stone-700">|</span>
            <span>{fps}.0 FPS</span>
            <span className="text-stone-700">|</span>
            <span>CPU: {cpuLoad}%</span>
            <span className="text-stone-700">|</span>
            <span className="text-stone-300 font-bold flex items-center gap-1">
              <Users className="w-3 h-3 text-red-400" />
              {viewerCount.toLocaleString()}
            </span>
          </div>

          {/* Studio Mode Toggle (Dual Monitor OBS Mode) */}
          <button
            onClick={() => setStudioMode(!studioMode)}
            className={`px-3 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
              studioMode
                ? "bg-amber-500 text-stone-950 border-amber-400 font-extrabold shadow"
                : "bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700"
            }`}
            title="Toggle OBS Dual-Monitor Studio Mode (Preview & Program)"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Studio Mode</span>
          </button>

          {/* Launch Fullscreen Watcher Room */}
          <Link
            href={`/live/${roomId}`}
            target="_blank"
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition"
            title="Preview Live Watcher Room in New Window"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-xs font-bold text-amber-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: FULL OBS STUDIO MIXER & PROGRAM STAGE             */}
      {/* ======================================================== */}
      {activeTab === "studio" && (
        <div className="flex flex-col flex-1">
          {/* MULTI-SOURCE INPUT SWITCHER BAR (CAMERA, FILE, SCREEN, PIP, PRESETS) */}
          <div className="px-4 py-2.5 bg-stone-900/90 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase text-stone-400 flex items-center gap-1 mr-1">
                <Video className="w-3.5 h-3.5 text-amber-400" />
                <span>Active Input Source:</span>
              </span>

              {/* 1. Device Camera Button */}
              <button
                onClick={() => {
                  startDeviceCamera();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                  inputMode === "camera" && localStreamRef.current
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                    : "bg-stone-950 text-stone-300 border-stone-800 hover:bg-stone-800 hover:text-white"
                }`}
                title="Connect & stream device webcam or USB capture card"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>{localStreamRef.current ? "Device Camera (Active)" : "Connect Device Camera"}</span>
              </button>

              {/* 2. Attach System Video File (.mp4, .webm) */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                  inputMode === "video_file" && customVideoFileUrl
                    ? "bg-amber-600 text-white border-amber-500 shadow-sm"
                    : "bg-stone-950 text-stone-300 border-stone-800 hover:bg-stone-800 hover:text-white"
                }`}
                title="Select and stream a video file directly from your computer"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>{customVideoFileName ? `Video: ${customVideoFileName.slice(0, 18)}...` : "Attach Video File (.mp4)"}</span>
              </button>

              {/* 3. Screen Share */}
              <button
                onClick={() => {
                  if (isScreenSharing) {
                    stopScreenShare();
                  } else {
                    startScreenShare();
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                  isScreenSharing
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                    : "bg-stone-950 text-stone-300 border-stone-800 hover:bg-stone-800 hover:text-white"
                }`}
                title="Share your entire screen, window, or browser tab to stream"
              >
                <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isScreenSharing ? "Stop Screen Share" : "Share Screen to Stream"}</span>
              </button>

              {/* 4. Picture-in-Picture (PiP) Toggle */}
              <button
                onClick={() => {
                  setPipActive(!pipActive);
                  showToast(!pipActive ? "Picture-in-Picture (PiP) overlay activated!" : "Picture-in-Picture hidden.");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                  pipActive
                    ? "bg-amber-500 text-stone-950 border-amber-400 font-extrabold shadow-sm"
                    : "bg-stone-950 text-stone-400 border-stone-800 hover:bg-stone-800 hover:text-stone-200"
                }`}
                title="Toggle Picture-in-Picture Artisan Facecam over stream"
              >
                <PictureInPicture className="w-3.5 h-3.5" />
                <span>PiP Overlay {pipActive ? "ON" : "OFF"}</span>
              </button>
            </div>

            {/* Preloaded Workshop Loop Presets Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-stone-400 uppercase font-mono hidden md:inline">Workshop Reel:</span>
              <select
                value={selectedPresetVideo.id}
                onChange={(e) => {
                  const found = presetVideos.find((p) => p.id === e.target.value) || presetVideos[0];
                  setSelectedPresetVideo(found);
                  setInputMode("preset_loop");
                  showToast(`Switched stream feed to: ${found.name}`);
                }}
                className="bg-stone-950 border border-stone-800 text-stone-200 text-xs rounded-xl px-2.5 py-1 focus:outline-none focus:border-amber-500"
              >
                {presetVideos.map((p) => (
                  <option key={p.id} value={p.id}>
                    🎬 {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. PROGRAM / PREVIEW CANVAS MONITORS */}
          <div className="p-4 bg-stone-950 border-b border-stone-900">
            {studioMode ? (
              /* DUAL OBS MONITOR: PREVIEW (LEFT) + TRANSITIONS (CENTER) + PROGRAM (RIGHT) */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* PREVIEW STAGE (COL 5) */}
                <div className="lg:col-span-5 flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 uppercase tracking-wider px-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      PREVIEW MONITOR (Staging)
                    </span>
                    <span className="font-mono text-stone-400">{previewScene.name}</span>
                  </div>

                  <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-lg group">
                    <video
                      ref={videoPreviewRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* PiP Overlay on Preview Monitor */}
                    {pipActive && (
                      <div className="absolute bottom-3 right-3 w-32 sm:w-44 aspect-video rounded-xl overflow-hidden border-2 border-amber-400 shadow-2xl bg-black">
                        <video
                          ref={pipPreviewRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 px-1.5 py-0.2 bg-black/80 rounded text-[8px] font-mono font-bold text-amber-400">
                          ARTISAN PiP
                        </div>
                      </div>
                    )}

                    {/* Scene Tag Badge */}
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-stone-950/80 backdrop-blur rounded-lg text-[10px] font-mono font-bold text-stone-300 border border-stone-800">
                      {previewScene.icon} {previewScene.name}
                    </div>
                  </div>
                </div>

                {/* TRANSITION CONTROLS (COL 2) */}
                <div className="lg:col-span-2 flex flex-col items-center justify-center gap-2 p-2">
                  <div className="text-[10px] font-mono text-stone-500 uppercase font-bold tracking-wider">
                    Transitions
                  </div>
                  <button
                    onClick={() => transitionToProgram("cut")}
                    className="w-full py-2.5 px-3 bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-100 text-xs font-black rounded-xl border border-stone-700 flex items-center justify-center gap-1.5 transition"
                  >
                    <Scissors className="w-3.5 h-3.5 text-amber-400" />
                    <span>CUT</span>
                  </button>
                  <button
                    onClick={() => transitionToProgram("fade")}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 active:scale-95 text-white text-xs font-black rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition"
                  >
                    <Repeat className="w-3.5 h-3.5 text-white" />
                    <span>FADE (300ms)</span>
                  </button>
                </div>

                {/* PROGRAM STAGE (COL 5) */}
                <div className="lg:col-span-5 flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-red-500 uppercase tracking-wider px-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                      PROGRAM MONITOR (LIVE ON AIR)
                    </span>
                    <span className="font-mono text-stone-400">{programScene.name}</span>
                  </div>

                  <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border-2 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.25)]">
                    <video
                      ref={videoProgramRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* PiP Overlay on Program Stage */}
                    {pipActive && (
                      <div className="absolute bottom-3 right-3 w-32 sm:w-44 aspect-video rounded-xl overflow-hidden border-2 border-amber-400 shadow-2xl bg-black">
                        <video
                          ref={pipProgramRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 px-1.5 py-0.2 bg-black/80 rounded text-[8px] font-mono font-bold text-amber-400">
                          ARTISAN PiP
                        </div>
                      </div>
                    )}

                    {/* OVERLAYS RENDERED ON PROGRAM */}
                    {sources.find((s) => s.id === "src_lower_third")?.visible && (
                      <div className="absolute bottom-3 left-3 bg-stone-950/85 backdrop-blur-md border border-amber-500/30 rounded-xl p-2.5 shadow-2xl max-w-sm">
                        <div className="text-[10px] uppercase font-mono font-black text-amber-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Dharohar Master Artisan</span>
                        </div>
                        <div className="text-xs font-black text-white">{hostName}</div>
                        <div className="text-[10px] text-stone-300 truncate">{hostRole}</div>
                      </div>
                    )}

                    {sources.find((s) => s.id === "src_lot_hud")?.visible && (
                      <div className="absolute top-3 left-3 bg-red-950/80 backdrop-blur border border-red-700/60 rounded-xl px-3 py-1.5 shadow-xl flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-mono font-bold text-red-300">
                          LOT #{activeLot.lot_number}: NPR {activeLot.current_price.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {sources.find((s) => s.id === "src_watermark")?.visible && (
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-stone-900/80 backdrop-blur border border-stone-800 text-[10px] font-black text-amber-400 tracking-wider">
                        DHROHAR NEPAL
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* SINGLE MONITOR MODE: WIDESCREEN PROGRAM CANVAS */
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between text-xs font-bold text-stone-400 mb-2 px-1">
                  <span className="flex items-center gap-2 text-red-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                    PROGRAM OUTPUT (Live Stream Feed)
                  </span>
                  <span className="font-mono text-stone-400">
                    Source: {inputMode === "camera" ? "Live Device Camera" : inputMode === "video_file" ? `File: ${customVideoFileName}` : inputMode === "screen" ? "Screen Share" : selectedPresetVideo.name}
                  </span>
                </div>

                <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border-2 border-stone-800 shadow-2xl group">
                  <video
                    ref={videoProgramRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Picture-in-Picture (PiP) Artisan Window */}
                  {pipActive && (
                    <div className="absolute bottom-4 right-4 z-30 w-44 sm:w-56 aspect-video rounded-2xl overflow-hidden border-2 border-amber-400 shadow-2xl bg-black">
                      <video
                        ref={pipProgramRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-black/85 backdrop-blur rounded-lg text-[9px] font-mono font-black text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Camera className="w-2.5 h-2.5" />
                        <span>ARTISAN PiP</span>
                      </div>
                    </div>
                  )}

                  {/* SOLD CELEBRATION MODAL BANNER ON HAMMER */}
                  {lotSoldNotification && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md p-6 animate-in fade-in zoom-in-95 z-40">
                      <div className="bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-amber-500/80 rounded-3xl p-6 text-center max-w-md shadow-2xl space-y-3">
                        <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Gavel className="w-8 h-8 text-amber-400 animate-bounce" />
                        </div>
                        <h3 className="text-xl font-black text-amber-400 tracking-tight">HAMMER DOWN — LOT SOLD!</h3>
                        <p className="text-xs text-stone-200 font-bold">{lotSoldNotification}</p>
                        <div className="text-[11px] font-mono text-emerald-400 font-bold">
                          Official Dharohar Certificate of Authenticity Issued
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GRAPHIC OVERLAYS ON CANVAS */}
                  {/* Lower Thirds Banner */}
                  {sources.find((s) => s.id === "src_lower_third")?.visible && (
                    <div className="absolute bottom-4 left-4 bg-stone-950/85 backdrop-blur-md border border-amber-500/40 rounded-2xl p-3.5 shadow-2xl max-w-md z-20">
                      <div className="text-[10px] uppercase font-mono font-black text-amber-400 flex items-center gap-1.5 mb-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Master Creator Atelier Broadcast</span>
                      </div>
                      <div className="text-sm font-black text-white">{hostName}</div>
                      <div className="text-xs text-stone-300 font-medium">{hostRole}</div>
                      <div className="text-[10px] text-amber-400 font-bold mt-1 flex items-center gap-1">
                        <span>Patan Heritage Cluster</span>
                        <span>•</span>
                        <span>Official Dept of Archaeology License #882</span>
                      </div>
                    </div>
                  )}

                  {/* Top Left Bidding Status HUD */}
                  {sources.find((s) => s.id === "src_lot_hud")?.visible && (
                    <div className="absolute top-4 left-4 bg-stone-950/85 backdrop-blur-md border border-stone-800 rounded-2xl p-3 shadow-2xl flex items-center gap-3 z-20">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                        <Gavel className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                          Lot #{activeLot.lot_number} Floor Live
                        </div>
                        <div className="text-xs font-black text-white">NPR {activeLot.current_price.toLocaleString()}</div>
                        <div className="text-[10px] text-stone-400 truncate max-w-[200px]">
                          {activeLot.highest_bidder ? `High Bidder: ${activeLot.highest_bidder}` : "Floor Opening Bid"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Authentic Watermark */}
                  {sources.find((s) => s.id === "src_watermark")?.visible && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-950/80 backdrop-blur border border-amber-500/30 text-[11px] font-black text-amber-400 tracking-wider shadow z-20">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>DHAROHAR AUTHENTIC</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* 3. OBS DOCK: SCENES, SOURCES, AUDIO MIXER, LOTS, CONTROLS*/}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-0 border-t border-stone-900 bg-stone-900/60 divide-y md:divide-y-0 md:divide-x divide-stone-800">
            {/* PANEL 1: SCENES LIST (COL 2) */}
            <div className="lg:col-span-2 p-3.5 flex flex-col space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-stone-800">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Scenes
                </span>
                <span className="text-[10px] text-stone-500 font-mono">{scenes.length} Presets</span>
              </div>

              <div className="space-y-1 overflow-y-auto max-h-56 pr-1">
                {scenes.map((scene) => {
                  const isCurrentProgram = programScene.id === scene.id;
                  const isCurrentPreview = previewScene.id === scene.id;
                  return (
                    <button
                      key={scene.id}
                      onClick={() => {
                        if (studioMode) {
                          setPreviewScene(scene);
                        } else {
                          setProgramScene(scene);
                          if (scene.type === "pip") setPipActive(true);
                          if (scene.type === "screen" && !isScreenSharing) startScreenShare();
                          if (scene.type === "video_file") {
                            if (customVideoFileUrl) {
                              setInputMode("video_file");
                            } else {
                              fileInputRef.current?.click();
                            }
                          }
                          if (scene.type === "camera") {
                            if (!localStreamRef.current) startDeviceCamera();
                            else setInputMode("camera");
                          }
                          syncBroadcastState({ scene_id: scene.id, scene_name: scene.name });
                          showToast(`Switched scene to "${scene.name}".`);
                        }
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs font-bold transition flex items-center justify-between border ${
                        isCurrentProgram
                          ? "bg-red-950/50 text-red-300 border-red-700/60 shadow-sm"
                          : isCurrentPreview && studioMode
                          ? "bg-amber-950/40 text-amber-300 border-amber-600/50"
                          : "bg-stone-950/40 text-stone-400 border-stone-800/80 hover:bg-stone-800 hover:text-stone-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm">{scene.icon}</span>
                        <span className="truncate">{scene.name}</span>
                      </div>
                      {isCurrentProgram && (
                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PANEL 2: SOURCES (COL 2) */}
            <div className="lg:col-span-2 p-3.5 flex flex-col space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-stone-800">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5 text-amber-400" />
                  Sources
                </span>
                <span className="text-[10px] text-stone-500 font-mono">Layers</span>
              </div>

              <div className="space-y-1 overflow-y-auto max-h-56 pr-1">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="p-2 rounded-xl bg-stone-950/40 border border-stone-800/80 flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="truncate font-medium text-stone-300">{source.name}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => toggleSourceVisibility(source.id)}
                        className={`p-1 rounded-lg transition ${
                          source.visible ? "text-amber-400 hover:text-amber-300" : "text-stone-600 hover:text-stone-400"
                        }`}
                        title={source.visible ? "Hide layer" : "Show layer"}
                      >
                        {source.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <span className="text-stone-600 p-1">
                        {source.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PANEL 3: AUDIO MIXER WITH LIVE VU METERS (COL 3) */}
            <div className="lg:col-span-3 p-3.5 flex flex-col space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-stone-800">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  Audio Mixer
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">48kHz Stereo</span>
              </div>

              {/* Mic / Aux Channel */}
              <div className="space-y-1.5 bg-stone-950/60 p-2.5 rounded-2xl border border-stone-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-300 flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-amber-400" />
                    Mic / Studio Aux
                  </span>
                  <button
                    onClick={() => setMicMuted(!micMuted)}
                    className={`p-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                      micMuted ? "bg-red-950 text-red-400 border border-red-800" : "text-stone-400 hover:text-white"
                    }`}
                  >
                    {micMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                    <span>{micMuted ? "MUTED" : `${micVolume}%`}</span>
                  </button>
                </div>

                {/* Live VU Meter LED Bar */}
                <div className="h-2 w-full bg-stone-900 rounded-full overflow-hidden flex p-0.5 border border-stone-800">
                  <div
                    className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500"
                    style={{ width: `${micMuted ? 0 : micPeakLevel}%` }}
                  />
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={micVolume}
                  onChange={(e) => setMicVolume(Number(e.target.value))}
                  className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Studio Ambient Music Channel */}
              <div className="space-y-1.5 bg-stone-950/60 p-2.5 rounded-2xl border border-stone-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-300 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-stone-400" />
                    Heritage Flute & Bowls
                  </span>
                  <button
                    onClick={() => setAmbientMuted(!ambientMuted)}
                    className="p-1 rounded-lg text-[10px] font-bold text-stone-400 hover:text-white"
                  >
                    {ambientMuted ? "MUTED" : `${ambientVolume}%`}
                  </button>
                </div>

                <div className="h-2 w-full bg-stone-900 rounded-full overflow-hidden flex p-0.5 border border-stone-800">
                  <div
                    className="h-full rounded-full bg-emerald-500/80 transition-all duration-100"
                    style={{ width: `${ambientMuted ? 0 : Math.round(ambientVolume * 0.7)}%` }}
                  />
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ambientVolume}
                  onChange={(e) => setAmbientVolume(Number(e.target.value))}
                  className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* PANEL 4: AUCTIONEER GAVEL & LOT CONSOLE (COL 3) */}
            <div className="lg:col-span-3 p-3.5 flex flex-col space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-stone-800">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Gavel className="w-3.5 h-3.5 text-amber-400" />
                  Lot & Auctioneer
                </span>
                <span className="text-[10px] font-mono text-red-400 font-bold">
                  {formatTimer(antiSnipingSeconds)}
                </span>
              </div>

              {/* Active Lot Selector */}
              <div className="p-2.5 bg-stone-950/80 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-200 truncate">Lot #{activeLot.lot_number}: {activeLot.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-stone-500">Current Bid</span>
                  <span className="text-sm font-black text-amber-400">
                    NPR {activeLot.current_price.toLocaleString()}
                  </span>
                </div>

                {/* Gavel Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={hammerDownCurrentLot}
                    className="py-2 px-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-95 text-white text-xs font-black rounded-xl shadow-lg flex items-center justify-center gap-1 transition"
                  >
                    <Gavel className="w-3.5 h-3.5 text-amber-300" />
                    <span>HAMMER (SOLD!)</span>
                  </button>

                  <button
                    onClick={extendLotTimer}
                    className="py-2 px-2 bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 text-xs font-bold rounded-xl border border-stone-700 flex items-center justify-center gap-1 transition"
                  >
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+60s Anti-Sniping</span>
                  </button>
                </div>
              </div>

              {/* Next Lots Queue Quick-Pick */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-stone-500 uppercase font-bold">Queue / Up Next</div>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {lots.map((lot) => (
                    <button
                      key={lot.id}
                      onClick={() => activateLot(lot)}
                      className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border whitespace-nowrap transition ${
                        lot.id === activeLot.id
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                          : "bg-stone-950 text-stone-400 border-stone-800 hover:bg-stone-800"
                      }`}
                    >
                      Lot #{lot.lot_number} ({lot.status})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PANEL 5: OBS CONTROL DOCK (COL 2) */}
            <div className="lg:col-span-2 p-3.5 flex flex-col space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-stone-800">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">Controls</span>
                <span className="text-[10px] font-mono text-stone-500">Live Dock</span>
              </div>

              {/* START / STOP STREAMING (BIG PRIMARY BUTTON) */}
              <button
                onClick={toggleGoLive}
                className={`w-full py-3 px-3 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-xl active:scale-95 ${
                  isLive
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-red-900/50"
                    : "bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-amber-900/40"
                }`}
              >
                <Radio className={`w-4 h-4 ${isLive ? "animate-spin" : "animate-pulse"}`} />
                <span>{isLive ? "STOP STREAMING" : "START STREAMING"}</span>
              </button>

              {/* START / STOP RECORDING */}
              <button
                onClick={toggleRecording}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  isRecording
                    ? "bg-stone-950 text-amber-400 border-amber-500/60"
                    : "bg-stone-950 text-stone-300 border-stone-800 hover:bg-stone-850"
                }`}
              >
                <Disc className={`w-3.5 h-3.5 ${isRecording ? "text-red-500 animate-pulse" : "text-stone-400"}`} />
                <span>{isRecording ? "STOP RECORDING" : "START RECORDING"}</span>
              </button>

              {recordedVideoUrl && (
                <a
                  href={recordedVideoUrl}
                  download={`dharohar_live_master_${Date.now()}.webm`}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-900 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Recorded MP4</span>
                </a>
              )}

              {/* Hardware Toggles Grid */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  onClick={toggleCamera}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-[9px] font-bold transition ${
                    cameraActive
                      ? "bg-stone-950 text-emerald-400 border-stone-800"
                      : "bg-red-950/80 text-red-400 border-red-800"
                  }`}
                  title={cameraActive ? "Mute Camera" : "Unmute Camera"}
                >
                  {cameraActive ? <Camera className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                  <span>Cam</span>
                </button>

                <button
                  onClick={toggleMic}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-[9px] font-bold transition ${
                    micActive
                      ? "bg-stone-950 text-emerald-400 border-stone-800"
                      : "bg-red-950/80 text-red-400 border-red-800"
                  }`}
                  title={micActive ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {micActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  <span>Mic</span>
                </button>

                <button
                  onClick={() => {
                    if (isScreenSharing) stopScreenShare();
                    else startScreenShare();
                  }}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-[9px] font-bold transition ${
                    isScreenSharing
                      ? "bg-indigo-950 text-indigo-400 border-indigo-800"
                      : "bg-stone-950 text-stone-400 border-stone-800 hover:text-white"
                  }`}
                  title="Share Screen or Slides"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Screen</span>
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 4. DOCKED LIVE CHAT & ANNOUNCEMENT BROADCASTER            */}
          {/* ======================================================== */}
          <div className="bg-stone-950 border-t border-stone-900 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 flex flex-col space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-400">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  Live Chat & Incoming Audience Bids Stream
                </span>
                <span className="text-[10px] text-stone-500 font-mono">Real-Time WebSocket Sync</span>
              </div>

              <div className="h-32 bg-stone-900/60 rounded-2xl border border-stone-800 p-3 overflow-y-auto space-y-2 text-xs">
                {liveChat.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-2">
                    <span className="text-[10px] font-mono text-stone-500 flex-shrink-0">{msg.time}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-black uppercase ${
                        msg.role === "creator"
                          ? "bg-amber-500/20 text-amber-300"
                          : msg.role === "system"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-stone-800 text-stone-300"
                      }`}
                    >
                      {msg.role}
                    </span>
                    <span className="font-bold text-stone-200">{msg.user}:</span>
                    <span className="text-stone-300">{msg.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Broadcast Announcement */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-2">
              <div className="text-xs font-bold text-stone-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Broadcaster Quick Announcement</span>
              </div>

              <form onSubmit={handleSendAnnouncement} className="flex flex-col gap-2">
                <textarea
                  value={announcementInput}
                  onChange={(e) => setAnnouncementInput(e.target.value)}
                  placeholder="Type an announcement to pin on all viewer screens (e.g. 'Reserve met, hammer falling in 30 seconds')..."
                  className="w-full h-20 p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={!announcementInput.trim()}
                  className="py-2 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition self-end"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>Broadcast to Room</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: EXTERNAL OBS & RTMP INGESTION SETUP               */}
      {/* ======================================================== */}
      {activeTab === "rtmp" && (
        <div className="p-6 space-y-6 max-w-4xl mx-auto w-full">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-400" />
              <span>External OBS Studio & Hardware ATEM Switcher Ingest</span>
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              If your production crew uses external OBS Studio, vMix, Wirecast, or Blackmagic ATEM hardware switchers, copy your private RTMP ingest credentials below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 space-y-2">
              <div className="text-[10px] uppercase font-bold text-stone-400">RTMP Server Ingest URL</div>
              <div className="flex items-center justify-between bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                <span className="font-mono text-xs font-bold text-amber-400 truncate">rtmp://stream.dharohar.com/live</span>
                <button
                  onClick={() => copyToClipboard("rtmp://stream.dharohar.com/live", "Server URL")}
                  className="p-1.5 text-stone-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-stone-500">Port 1935 TCP. Supports H.264 video with AAC stereo audio.</p>
            </div>

            <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 space-y-2">
              <div className="text-[10px] uppercase font-bold text-stone-400">Private Stream Key (Secret)</div>
              <div className="flex items-center justify-between bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                <span className="font-mono text-xs font-bold text-stone-200 truncate">{defaultStreamKey}</span>
                <button
                  onClick={() => copyToClipboard(defaultStreamKey, "Stream Key")}
                  className="p-1.5 text-stone-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-stone-500">Never share your stream key. Unique to this heritage atelier.</p>
            </div>
          </div>

          <div className="p-5 bg-stone-900/80 rounded-2xl border border-stone-800 space-y-3">
            <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">Quick Setup Guide for External OBS</h3>
            <ol className="text-xs text-stone-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Open OBS Studio on your Mac, Windows, or Linux production PC.</li>
              <li>Navigate to <strong>Settings → Stream</strong>, set Service to <strong>Custom...</strong></li>
              <li>Paste the Server URL into the <strong>Server</strong> input field.</li>
              <li>Paste the Stream Key into the <strong>Stream Key</strong> field and click <strong>Apply</strong>.</li>
              <li>Click <strong>Start Streaming</strong> in OBS. Dharohar will automatically detect the stream and route it to your live room.</li>
            </ol>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: STUDIO & HARDWARE ENCODER SETTINGS                */}
      {/* ======================================================== */}
      {activeTab === "settings" && (
        <div className="p-6 space-y-6 max-w-4xl mx-auto w-full">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" />
              <span>Studio Encoder & Hardware Device Settings</span>
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Configure video resolution, target framerate, audio devices, and regional distribution servers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Camera Hardware Selector */}
            <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 space-y-2">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Primary Video Device (Webcam / Capture Card)</span>
              </label>
              <select
                value={selectedCameraId}
                onChange={(e) => {
                  setSelectedCameraId(e.target.value);
                  startDeviceCamera();
                }}
                className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              >
                {videoDevices.map((dev) => (
                  <option key={dev.deviceId} value={dev.deviceId}>
                    {dev.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mic Hardware Selector */}
            <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 space-y-2">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-amber-400" />
                <span>Audio Input Device (Microphone / Soundboard)</span>
              </label>
              <select
                value={selectedMicId}
                onChange={(e) => {
                  setSelectedMicId(e.target.value);
                  startDeviceCamera();
                }}
                className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              >
                {audioDevices.map((dev) => (
                  <option key={dev.deviceId} value={dev.deviceId}>
                    {dev.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Resolution Selector */}
            <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 space-y-2">
              <label className="text-xs font-bold text-stone-300">Base Canvas Output Resolution</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as "1080p" | "720p" | "4k")}
                className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              >
                <option value="1080p">1080p Full HD (1920 x 1080) - Recommended</option>
                <option value="720p">720p HD (1280 x 720) - Low Bandwidth</option>
                <option value="4k">4K Ultra HD (3840 x 2160) - High Precision</option>
              </select>
            </div>

            {/* Frame Rate */}
            <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 space-y-2">
              <label className="text-xs font-bold text-stone-300">Video Framerate</label>
              <select
                value={targetFps}
                onChange={(e) => setTargetFps(e.target.value as "60" | "30")}
                className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              >
                <option value="60">60 FPS (Ultra-smooth live chasing)</option>
                <option value="30">30 FPS (Standard broadcast)</option>
              </select>
            </div>

            {/* Bitrate */}
            <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-stone-300">Target Video Bitrate</span>
                <span className="font-mono text-amber-400 font-bold">{videoBitrateSetting} kbps</span>
              </div>
              <input
                type="range"
                min="2500"
                max="8000"
                step="250"
                value={videoBitrateSetting}
                onChange={(e) => setVideoBitrateSetting(Number(e.target.value))}
                className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Server Region */}
            <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 space-y-2">
              <label className="text-xs font-bold text-stone-300">Ingest Server Edge Node</label>
              <select
                value={serverRegion}
                onChange={(e) => setServerRegion(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Kathmandu Local Mesh (Sub-100ms)">Kathmandu Local Mesh (Sub-100ms)</option>
                <option value="Singapore South-East Cloud">Singapore South-East Cloud</option>
                <option value="Tokyo Asia-East Edge">Tokyo Asia-East Edge</option>
                <option value="Frankfurt Europe Gateway">Frankfurt Europe Gateway</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
