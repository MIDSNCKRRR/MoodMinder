import { useEffect, useRef, useState } from 'react';

interface VoiceOrbProps {
  isListening?: boolean;
  palette?: 'seafoam' | 'sunset' | 'violet';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onMicEnabled?: (enabled: boolean) => void;
}

class VoiceOrbEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr: number;
  private w: number;
  private h: number;
  private center: { x: number; y: number };
  private baseR: number;
  private time: number = 0;
  private level: number = 0;
  private micEnabled: boolean = false;
  private audio: {
    ctx: AudioContext | null;
    analyser: AnalyserNode | null;
    data: Uint8Array | null;
    stream: MediaStream | null;
  };
  private opts: {
    palette: string;
    blur: number;
    ringWidth: number;
    ringMaxBoost: number;
    wobbleLayers: number;
    wobbleDepth: number;
    idleBreath: number;
  };
  private animationId: number | null = null;

  constructor(canvas: HTMLCanvasElement, opts: Partial<VoiceOrbProps> = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.dpr = Math.max(1, window.devicePixelRatio || 1);
    this.w = canvas.width;
    this.h = canvas.height;
    this.center = { x: this.w / 2, y: this.h * 0.58 };
    this.baseR = Math.min(this.w, this.h) * 0.22;
    this.audio = { ctx: null, analyser: null, data: null, stream: null };

    this.opts = {
      palette: opts.palette || 'seafoam',
      blur: 30 * this.dpr,
      ringWidth: 12 * this.dpr,
      ringMaxBoost: 0.55,
      wobbleLayers: 5,
      wobbleDepth: 0.12,
      idleBreath: 0.06,
    };

    this._resize();
    this._tick = this._tick.bind(this);
    this.start();
  }

  start() {
    if (this.animationId) return;
    this.animationId = requestAnimationFrame(this._tick);
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  _resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(400, Math.floor(rect.width * this.dpr));
    this.canvas.height = Math.max(280, Math.floor(rect.width * 0.7 * this.dpr));
    this.w = this.canvas.width;
    this.h = this.canvas.height;
    this.center = { x: this.w / 2, y: this.h * 0.58 };
    this.baseR = Math.min(this.w, this.h) * 0.22;
  }

  async enableMic() {
    if (this.micEnabled) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.85;
      src.connect(analyser);
      this.audio = { ctx, analyser, data: new Uint8Array(analyser.frequencyBinCount), stream };
      this.micEnabled = true;
      return true;
    } catch (err) {
      console.warn('Mic permission denied or unavailable:', err);
      this.micEnabled = false;
      return false;
    }
  }

  disableMic() {
    if (!this.micEnabled) return;
    try {
      this.audio.stream?.getTracks().forEach(t => t.stop());
      this.audio.ctx?.close();
    } catch {}
    this.micEnabled = false;
  }

  _tick(t: number) {
    this.time = t / 1000;
    this._updateLevel();
    this._draw();
    this.animationId = requestAnimationFrame(this._tick);
  }

  _updateLevel() {
    if (this.micEnabled && this.audio.analyser) {
      const { analyser, data } = this.audio;
      if (data) {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        this.level = this.level * 0.8 + Math.min(1, rms * 3.0) * 0.2;
      }
    } else {
      const breath = (Math.sin(this.time * 1.5) + 1) / 2;
      this.level = this.opts.idleBreath * (0.4 + 0.6 * breath);
    }
  }

  _palette() {
    switch (this.opts.palette) {
      case 'sunset': return ['#ffd29e', '#ff9a9e', '#fad0c4'];
      case 'violet': return ['#a78bfa', '#7dd3fc', '#f0abfc'];
      default: return ['#8bd6d1', '#8aa4ff', '#c08bff']; // seafoam
    }
  }

  _draw() {
    const ctx = this.ctx;
    const { w, h } = this;
    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // Background
    const vign = ctx.createRadialGradient(
      this.center.x, this.center.y * 0.9, this.baseR * 0.2,
      this.center.x, this.center.y, Math.max(w, h) * 0.7
    );
    vign.addColorStop(0, 'rgba(0,0,0,0.0)');
    vign.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = vign;
    ctx.fillRect(0, 0, w, h);

    const boost = this.level;
    const r = this.baseR * (1 + boost * 0.6);
    const wobble = this.opts.wobbleDepth * (0.6 + 0.4 * Math.min(1, boost * 2));

    // Glow
    ctx.save();
    ctx.translate(this.center.x, this.center.y);
    ctx.filter = `blur(${this.opts.blur}px)`;
    const g = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 1.35);
    const [c1, c2, c3] = this._palette();
    g.addColorStop(0, this._withAlpha(c1, 0.95));
    g.addColorStop(0.6, this._withAlpha(c2, 0.9));
    g.addColorStop(1, this._withAlpha(c3, 0.75));
    ctx.fillStyle = g;
    this._organicBlob(ctx, r * 1.06, wobble, 0.8);
    ctx.restore();

    // Core orb
    ctx.save();
    ctx.translate(this.center.x, this.center.y);
    const coreGrad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.1);
    coreGrad.addColorStop(0, this._withAlpha(c1, 1));
    coreGrad.addColorStop(0.65, this._withAlpha(c2, 0.95));
    coreGrad.addColorStop(1, this._withAlpha(c3, 0.9));
    ctx.fillStyle = coreGrad;
    this._organicBlob(ctx, r, wobble, 1);
    ctx.restore();

    // Highlights
    ctx.save();
    ctx.translate(this.center.x, this.center.y);
    const angle = this.time * 0.7;
    this._highlight(ctx, r, angle, 0.9);
    this._highlight(ctx, r * 0.85, -angle * 1.15, 0.6);
    ctx.restore();

    // Outer ring
    ctx.save();
    ctx.translate(this.center.x, this.center.y);
    ctx.lineWidth = this.opts.ringWidth * (0.6 + boost * 1.2);
    const ringGrad = ctx.createLinearGradient(-r, 0, r, 0);
    ringGrad.addColorStop(0, this._withAlpha(c1, 0.8));
    ringGrad.addColorStop(0.5, this._withAlpha(c2, 0.9));
    ringGrad.addColorStop(1, this._withAlpha(c3, 0.8));
    ctx.strokeStyle = ringGrad;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    const ringR = r * (1 + this.opts.ringMaxBoost * (0.25 + boost));
    ctx.arc(0, 0, ringR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  _highlight(ctx: CanvasRenderingContext2D, r: number, angle: number, alpha: number) {
    ctx.save();
    ctx.rotate(angle);
    const grad = ctx.createRadialGradient(r * 0.3, -r * 0.2, r * 0.1, r * 0.3, -r * 0.2, r * 0.8);
    grad.addColorStop(0, `rgba(255,255,255,${0.14 * alpha})`);
    grad.addColorStop(1, `rgba(255,255,255,0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(r * 0.35, -r * 0.22, r * 0.9, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _organicBlob(ctx: CanvasRenderingContext2D, radius: number, depth: number, alpha: number) {
    const steps = 180;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const n = this._noiseAngle(t, this.time);
      const k = 1 + depth * n;
      const rr = radius * k;
      const x = Math.cos(t) * rr;
      const y = Math.sin(t) * rr;
      (i === 0) ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.globalAlpha = alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  _noiseAngle(theta: number, time: number) {
    const a = Math.sin(theta * 1 + time * 0.9) * 0.7;
    const b = Math.sin(theta * 2.3 + time * 0.55) * 0.2;
    const c = Math.sin(theta * 3.7 - time * 0.35) * 0.1;
    return a + b + c;
  }

  _withAlpha(hex: string, a: number) {
    const { r, g, b } = this._hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  }

  _hexToRgb(hex: string) {
    const s = hex.replace('#', '');
    const bigint = parseInt(s.length === 3 ? s.split('').map(ch => ch + ch).join('') : s, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }
}

export function VoiceOrb({ 
  isListening = false, 
  palette = 'seafoam', 
  size = 'medium',
  className = '',
  onMicEnabled
}: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbRef = useRef<VoiceOrbEngine | null>(null);
  const [micEnabled, setMicEnabled] = useState(false);

  const sizeClasses = {
    small: 'w-32 h-24',
    medium: 'w-48 h-36',
    large: 'w-64 h-48'
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    orbRef.current = new VoiceOrbEngine(canvasRef.current, { palette });

    const handleResize = () => {
      if (orbRef.current) {
        orbRef.current._resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (orbRef.current) {
        orbRef.current.stop();
        orbRef.current.disableMic();
      }
    };
  }, [palette]);

  useEffect(() => {
    if (!orbRef.current) return;

    if (isListening && !micEnabled) {
      orbRef.current.enableMic().then((enabled) => {
        setMicEnabled(enabled);
        onMicEnabled?.(enabled);
      });
    } else if (!isListening && micEnabled) {
      orbRef.current.disableMic();
      setMicEnabled(false);
      onMicEnabled?.(false);
    }
  }, [isListening, micEnabled, onMicEnabled]);

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <canvas
        ref={canvasRef}
        width={400}
        height={280}
        className="w-full h-full rounded-2xl"
        style={{
          background: 'radial-gradient(600px 420px at 50% 30%, rgba(31, 41, 55, 0.15) 0%, rgba(17, 24, 39, 0.2) 60%, rgba(2, 6, 15, 0.3) 100%)'
        }}
      />
      
      {/* Status indicator */}
      <div className="absolute top-2 right-2">
        <div className={`w-2 h-2 rounded-full ${
          micEnabled ? 'bg-green-400 animate-pulse' : 'bg-stone-400'
        }`} />
      </div>
    </div>
  );
}