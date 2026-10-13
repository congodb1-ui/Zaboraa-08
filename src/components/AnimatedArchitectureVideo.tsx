import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Sparkles,
  Zap,
  Activity,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { EnvironmentNode, InterconnectLink } from '../types/multiCloudBlueprint';

interface AnimatedArchitectureVideoProps {
  environments: EnvironmentNode[];
  links: InterconnectLink[];
  customerName: string;
  drEngine: string;
  cloudPlatform: string;
  onSynthesizeAIVideo?: () => void;
  isSynthesizingAI?: boolean;
}

interface Particle {
  linkId: string;
  progress: number; // 0 to 1
  speed: number;
  color: string;
  size: number;
}

export const AnimatedArchitectureVideo: React.FC<AnimatedArchitectureVideoProps> = ({
  environments,
  links,
  customerName,
  drEngine,
  cloudPlatform,
  onSynthesizeAIVideo,
  isSynthesizingAI = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [isFailoverActive, setIsFailoverActive] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingProgress, setRecordingProgress] = useState<number>(0);
  const [videoDownloadUrl, setVideoDownloadUrl] = useState<string | null>(null);
  const [activePacketCount, setActivePacketCount] = useState<number>(0);

  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Initialize and maintain particles
  useEffect(() => {
    const particles: Particle[] = [];
    const colors = ['#06b6d4', '#10b981', '#38bdf8', '#a855f7', '#fbbf24'];

    links.forEach((link, linkIdx) => {
      const particleDensity = Math.max(6, Math.min(24, (link.bandwidthGbps || 10) * 2));
      for (let i = 0; i < particleDensity; i++) {
        particles.push({
          linkId: link.id,
          progress: i / particleDensity,
          speed: (0.003 + Math.random() * 0.004) * (link.bandwidthGbps >= 40 ? 1.5 : 1.0),
          color: colors[linkIdx % colors.length],
          size: Math.random() > 0.7 ? 4 : 2.5
        });
      }
    });

    particlesRef.current = particles;
    setActivePacketCount(particles.length * 120);
  }, [links]);

  // Main Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear background with subtle deep space gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(0.5, '#0b0f19');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle cyber grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Tier Column divider markers
      const tierWidth = width / 3;
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tierWidth, 40);
      ctx.lineTo(tierWidth, height - 40);
      ctx.moveTo(tierWidth * 2, 40);
      ctx.lineTo(tierWidth * 2, height - 40);
      ctx.stroke();

      // Tier Header Labels
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
      ctx.fillText('TIER 1: ON-PREM / SOURCE', 40, 32);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.7)';
      ctx.fillText('TIER 2: TRANSIT & SECURITY MESH', tierWidth + 40, 32);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.7)';
      ctx.fillText('TIER 3: TARGET CLOUD & DR', tierWidth * 2 + 40, 32);

      // Scale positions to fit canvas dimensions (1280x720 base)
      const scaleX = width / 1280;
      const scaleY = height / 720;

      // 2. Draw Interconnect Link Paths and Traffic Flows
      links.forEach(link => {
        const source = environments.find(e => e.id === link.sourceId);
        const target = environments.find(e => e.id === link.targetId);
        if (!source || !target) return;

        const sx = ((source.x ?? 80) + 200) * scaleX;
        const sy = ((source.y ?? 120) + 60) * scaleY;
        const tx = (target.x ?? 780) * scaleX;
        const ty = ((target.y ?? 120) + 60) * scaleY;

        const dx = Math.abs(tx - sx) * 0.45;
        const p1x = sx + dx;
        const p1y = sy;
        const p2x = tx - dx;
        const p2y = ty;

        // Path glow
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.bezierCurveTo(p1x, p1y, p2x, p2y, tx, ty);

        const strokeColor = isFailoverActive && link.protocol.includes('Move')
          ? '#f59e0b'
          : link.protocol.includes('ExpressRoute')
          ? '#38bdf8'
          : link.protocol.includes('Direct Connect')
          ? '#fbbf24'
          : link.protocol.includes('Move') || link.protocol.includes('HCX')
          ? '#10b981'
          : '#06b6d4';

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 5;
        ctx.globalAlpha = 0.25;
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.9;
        ctx.stroke();

        // Pulsing animated energy dashes
        ctx.setLineDash([8, 12]);
        ctx.lineDashOffset = -tick * speedMultiplier * 1.5;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.7;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1.0;

        // Protocol badge at midpoint
        const midX = (sx + tx) / 2;
        const midY = (sy + ty) / 2;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(midX - 45, midY - 12, 90, 24, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${link.bandwidthGbps}G ${link.protocol.split(' ')[0]}`, midX, midY + 4);
        ctx.textAlign = 'left';
      });

      // 3. Update and Draw Moving Flow Particles
      if (isPlaying) {
        particlesRef.current.forEach(p => {
          p.progress += p.speed * speedMultiplier;
          if (p.progress > 1) p.progress -= 1;
        });
      }

      particlesRef.current.forEach(p => {
        const link = links.find(l => l.id === p.linkId);
        if (!link) return;
        const source = environments.find(e => e.id === link.sourceId);
        const target = environments.find(e => e.id === link.targetId);
        if (!source || !target) return;

        const sx = ((source.x ?? 80) + 200) * scaleX;
        const sy = ((source.y ?? 120) + 60) * scaleY;
        const tx = (target.x ?? 780) * scaleX;
        const ty = ((target.y ?? 120) + 60) * scaleY;

        const dx = Math.abs(tx - sx) * 0.45;
        const p1x = sx + dx;
        const p1y = sy;
        const p2x = tx - dx;
        const p2y = ty;

        // Cubic Bezier interpolation: B(t) = (1-t)^3*P0 + 3(1-t)^2*t*P1 + 3(1-t)*t^2*P2 + t^3*P3
        const t = p.progress;
        const mt = 1 - t;
        const px =
          mt * mt * mt * sx +
          3 * mt * mt * t * p1x +
          3 * mt * t * t * p2x +
          t * t * t * tx;
        const py =
          mt * mt * mt * sy +
          3 * mt * mt * t * p1y +
          3 * mt * t * t * p2y +
          t * t * t * ty;

        // Glowing packet head
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = isFailoverActive ? '#f59e0b' : p.color;
        ctx.shadowColor = isFailoverActive ? '#f59e0b' : p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 4. Draw Environment Cluster Nodes with Live Animation Rings
      environments.forEach(env => {
        const nx = (env.x ?? 80) * scaleX;
        const ny = (env.y ?? 120) * scaleY;
        const nw = 220 * scaleX;
        const nh = 130 * scaleY;

        const isDRTarget = env.role === 'Disaster Recovery';
        const isProdSource = env.role === 'Production';

        // Outer glow
        const pulse = Math.sin(tick * 0.05) * 0.2 + 0.8;
        ctx.beginPath();
        ctx.roundRect(nx, ny, nw, nh, 12);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fill();

        ctx.strokeStyle = isFailoverActive && isDRTarget
          ? `rgba(245, 158, 11, ${pulse})`
          : isProdSource
          ? `rgba(6, 182, 212, ${pulse * 0.7})`
          : 'rgba(51, 65, 85, 0.8)';
        ctx.lineWidth = isFailoverActive && isDRTarget ? 3 : 1.5;
        ctx.stroke();

        // Node Header Banner
        ctx.fillStyle = isFailoverActive && isDRTarget
          ? 'rgba(245, 158, 11, 0.2)'
          : isProdSource
          ? 'rgba(6, 182, 212, 0.15)'
          : 'rgba(30, 41, 59, 0.5)';
        ctx.beginPath();
        ctx.roundRect(nx, ny, nw, 28, [12, 12, 0, 0]);
        ctx.fill();

        // Status Indicator Dot
        ctx.beginPath();
        ctx.arc(nx + 16, ny + 14, 4, 0, Math.PI * 2);
        ctx.fillStyle = isFailoverActive && isProdSource
          ? '#ef4444' // Source degraded during failover
          : isFailoverActive && isDRTarget
          ? '#f59e0b' // DR Active
          : '#10b981'; // Healthy
        ctx.fill();

        // Node Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(env.name, nx + 28, ny + 18);

        // Platform & Region Subtitle
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`${env.platform} · ${env.region}`, nx + 14, ny + 46);

        // Compute / Storage Grid Bar
        ctx.fillStyle = 'rgba(2, 6, 23, 0.6)';
        ctx.beginPath();
        ctx.roundRect(nx + 14, ny + 56, nw - 28, 42, 6);
        ctx.fill();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillText(`${env.hostCount} Hosts`, nx + 22, ny + 74);
        ctx.fillText(`${env.totalVcpu} Cores`, nx + 80, ny + 74);
        ctx.fillText(`${env.storageTB}T`, nx + 150, ny + 74);

        ctx.fillStyle = '#64748b';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(`CIDR: ${env.cidrBlock}`, nx + 22, ny + 90);

        // Activity Pulse Wave on Target or Active Gateway
        if (isPlaying) {
          const waveRadius = (tick * 1.5) % 30;
          const waveAlpha = Math.max(0, 1 - waveRadius / 30);
          ctx.beginPath();
          ctx.arc(nx + nw - 16, ny + 14, waveRadius, 0, Math.PI * 2);
          ctx.strokeStyle = isFailoverActive ? `rgba(245, 158, 11, ${waveAlpha})` : `rgba(6, 182, 212, ${waveAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // 5. Watermark & HUD Telemetry Overlay (Bottom Bar)
      ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
      ctx.fillRect(0, height - 36, width, 36);
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height - 36);
      ctx.lineTo(width, height - 36);
      ctx.stroke();

      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`CUSTOMER: ${customerName.toUpperCase()}`, 20, height - 14);

      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`DR ENGINE: ${drEngine}`, 280, height - 14);

      ctx.fillStyle = isFailoverActive ? '#f59e0b' : '#10b981';
      ctx.fillText(
        isFailoverActive ? 'MODE: SIMULATED FAILOVER DRILL ACTIVE' : 'MODE: CONTINUOUS ACTIVE-ACTIVE REPLICATION',
        620,
        height - 14
      );

      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'right';
      ctx.fillText(`ANIMATION: 60 FPS · ${speedMultiplier}x SPEED`, width - 20, height - 14);
      ctx.textAlign = 'left';

      tick += 1;
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [environments, links, isPlaying, speedMultiplier, isFailoverActive, customerName, drEngine]);

  // Video Recording & Export Handler
  const handleStartRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsRecording(true);
      setRecordingProgress(0);
      recordedChunksRef.current = [];

      // Capture canvas stream at 30fps
      const stream = canvas.captureStream(30);

      // Choose supported MIME type
      const mimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm',
        'video/mp4'
      ];
      let selectedMime = 'video/webm';
      for (const m of mimeTypes) {
        if (MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType: selectedMime });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: selectedMime });
        const url = URL.createObjectURL(blob);
        setVideoDownloadUrl(url);
        setIsRecording(false);
        setRecordingProgress(100);

        // Auto trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${customerName.replace(/\s+/g, '_')}_Infrastructure_Animation.webm`;
        a.click();
      };

      recorder.start();

      // Record for 6 seconds with progress bar
      let elapsed = 0;
      const duration = 6000;
      const interval = setInterval(() => {
        elapsed += 200;
        const pct = Math.min(95, Math.round((elapsed / duration) * 100));
        setRecordingProgress(pct);
        if (elapsed >= duration) {
          clearInterval(interval);
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }
      }, 200);
    } catch (err) {
      console.error('Canvas video recording error:', err);
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Canvas Viewport Frame */}
      <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-950 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-auto block select-none aspect-video"
        />

        {/* Live Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-rose-950/90 border border-rose-500 text-rose-300 text-xs font-mono flex items-center gap-2 shadow-lg backdrop-blur-md animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Recording Animated Video ({recordingProgress}%)</span>
          </div>
        )}

        {/* Failover Mode Banner */}
        {isFailoverActive && (
          <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-amber-950/90 border border-amber-500 text-amber-300 text-xs font-mono flex items-center gap-2 shadow-lg backdrop-blur-md">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulated DR Failover In Progress</span>
          </div>
        )}
      </div>

      {/* Playback Controls & Video Export Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Play/Pause & Speed */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer shadow transition"
            title={isPlaying ? 'Pause Animation' : 'Play Animation'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
            {[0.5, 1.0, 2.0].map(sp => (
              <button
                key={sp}
                type="button"
                onClick={() => setSpeedMultiplier(sp)}
                className={`px-2 py-1 rounded cursor-pointer transition ${
                  speedMultiplier === sp
                    ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sp}x
              </button>
            ))}
          </div>

          {/* Failover Simulation Toggle */}
          <button
            type="button"
            onClick={() => setIsFailoverActive(!isFailoverActive)}
            className={`px-3 py-2 rounded-lg border font-semibold flex items-center gap-1.5 cursor-pointer transition ${
              isFailoverActive
                ? 'bg-amber-950 text-amber-300 border-amber-500 shadow-lg shadow-amber-950/50'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-600/60'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isFailoverActive ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>{isFailoverActive ? 'Failover Active' : 'Simulate Failover Drill'}</span>
          </button>
        </div>

        {/* Video Download & AI Synthesis Buttons */}
        <div className="flex items-center gap-2.5">
          {videoDownloadUrl && !isRecording && (
            <a
              href={videoDownloadUrl}
              download={`${customerName.replace(/\s+/g, '_')}_Infrastructure_Animation.webm`}
              className="px-3 py-2 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-300 font-semibold flex items-center gap-1.5 hover:bg-emerald-900 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download Ready Video</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleStartRecording}
            disabled={isRecording}
            className="px-3.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center gap-2 cursor-pointer shadow transition disabled:opacity-50"
            title="Record 60 FPS animation loop and export as high-definition WebM/MP4 video"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>{isRecording ? `Recording (${recordingProgress}%)` : 'Export Animated Video (.webm)'}</span>
          </button>

          {onSynthesizeAIVideo && (
            <button
              type="button"
              onClick={onSynthesizeAIVideo}
              disabled={isSynthesizingAI}
              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-purple-900/30 cursor-pointer transition disabled:opacity-50"
              title="Synthesize cinema-grade 3D architectural flythrough video using Google Veo"
            >
              {isSynthesizingAI ? (
                <RefreshCw className="w-4 h-4 animate-spin text-purple-200" />
              ) : (
                <Sparkles className="w-4 h-4 text-purple-200" />
              )}
              <span>{isSynthesizingAI ? 'Synthesizing Veo Video...' : 'AI Video Synthesis (Veo)'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
