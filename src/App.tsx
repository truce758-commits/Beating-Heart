/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

// --- Constants ---
const CANVAS_WIDTH = 840;
const CANVAS_HEIGHT = 680;
const IMAGE_ENLARGE = 11;
const HEART_COLOR = "#EEAEEE";
const BG_COLOR = "#0a0502";

// --- Math Functions ---

const heartFunction = (t: number, centerX: number, centerY: number) => {
  const x = 17 * Math.pow(Math.sin(t), 3);
  const y = -(16 * Math.cos(t) - 5 * Math.cos(2 * t) - 3 * Math.cos(3 * t));

  return {
    x: x * IMAGE_ENLARGE + centerX,
    y: y * IMAGE_ENLARGE + centerY
  };
};

const scatterInside = (x: number, y: number, centerX: number, centerY: number, beta = 0.15) => {
  const ratioX = -beta * Math.log(Math.random());
  const ratioY = -beta * Math.log(Math.random());

  const dx = ratioX * (x - centerX);
  const dy = ratioY * (y - centerY);

  return { x: x - dx, y: y - dy };
};

const shrink = (x: number, y: number, centerX: number, centerY: number, ratio: number) => {
  const distSq = Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2);
  const force = -1 / Math.pow(distSq, 0.6);
  const dx = ratio * force * (x - centerX);
  const dy = ratio * force * (y - centerY);
  return { x: x - dx, y: y - dy };
};

const curve = (p: number) => {
  return 2 * (2 * Math.sin(4 * p)) / (2 * Math.PI);
};

const calcPosition = (x: number, y: number, centerX: number, centerY: number, ratio: number) => {
  const distSq = Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2);
  const force = 1 / Math.pow(distSq, 0.420);

  const dx = ratio * force * (x - centerX) + (Math.random() * 2 - 1);
  const dy = ratio * force * (y - centerY) + (Math.random() * 2 - 1);

  return { x: x - dx, y: y - dy };
};

// --- Heart Logic ---

interface Point {
  x: number;
  y: number;
  size: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
}

class HeartGenerator {
  private points: { x: number; y: number }[] = [];
  private edgeDiffusionPoints: { x: number; y: number }[] = [];
  private centerDiffusionPoints: { x: number; y: number }[] = [];
  private frames: Point[][] = [];
  private generateFrameCount: number;
  private centerX: number;
  private centerY: number;

  constructor(generateFrameCount = 20, centerX: number, centerY: number) {
    this.generateFrameCount = generateFrameCount;
    this.centerX = centerX;
    this.centerY = centerY;
    this.build(1000);
    for (let i = 0; i < generateFrameCount; i++) {
      this.frames[i] = this.calc(i);
    }
  }

  private build(number: number) {
    // Outline
    for (let i = 0; i < number; i++) {
      const t = Math.random() * 2 * Math.PI;
      const pos = heartFunction(t, this.centerX, this.centerY);
      this.points.push(pos);
    }

    // Edge diffusion
    this.points.forEach(p => {
      for (let i = 0; i < 3; i++) {
        const pos = scatterInside(p.x, p.y, this.centerX, this.centerY, 0.05);
        this.edgeDiffusionPoints.push(pos);
      }
    });

    // Center diffusion
    for (let i = 0; i < 5000; i++) {
      const p = this.points[Math.floor(Math.random() * this.points.length)];
      const pos = scatterInside(p.x, p.y, this.centerX, this.centerY, 0.27);
      this.centerDiffusionPoints.push(pos);
    }
  }

  private calc(frame: number): Point[] {
    const ratio = 15 * curve((frame / 10) * Math.PI);
    const haloRadius = Math.floor(4 + 6 * (1 + curve((frame / 10) * Math.PI)));
    const haloNumber = Math.floor(1500 + 2000 * Math.pow(Math.abs(curve((frame / 10) * Math.PI)), 2));

    const allPoints: Point[] = [];

    // Halo
    for (let i = 0; i < haloNumber; i++) {
      const t = Math.random() * 2 * Math.PI;
      let pos = heartFunction(t, this.centerX, this.centerY);
      pos = shrink(pos.x, pos.y, this.centerX, this.centerY, haloRadius);
      
      const x = pos.x + (Math.random() * 120 - 60);
      const y = pos.y + (Math.random() * 120 - 60);
      const size = Math.random() > 0.33 ? 1 : 2;
      allPoints.push({ x, y, size });
    }

    // Outline
    this.points.forEach(p => {
      const pos = calcPosition(p.x, p.y, this.centerX, this.centerY, ratio);
      const size = Math.floor(Math.random() * 3) + 1;
      allPoints.push({ ...pos, size });
    });

    // Edge diffusion
    this.edgeDiffusionPoints.forEach(p => {
      const pos = calcPosition(p.x, p.y, this.centerX, this.centerY, ratio);
      const size = Math.floor(Math.random() * 2) + 1;
      allPoints.push({ ...pos, size });
    });

    // Center diffusion
    this.centerDiffusionPoints.forEach(p => {
      const pos = calcPosition(p.x, p.y, this.centerX, this.centerY, ratio);
      const size = Math.floor(Math.random() * 2) + 1;
      allPoints.push({ ...pos, size });
    });

    return allPoints;
  }

  getFrame(frame: number) {
    return this.frames[frame % this.generateFrameCount];
  }
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
  const heartRef = useRef<HeartGenerator | null>(null);
  const starsRef = useRef<Star[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
        
        // Regenerate stars on resize
        const starCount = Math.floor((clientWidth * clientHeight) / 2000);
        const newStars: Star[] = [];
        for (let i = 0; i < starCount; i++) {
          newStars.push({
            x: Math.random() * clientWidth,
            y: Math.random() * clientHeight,
            size: Math.random() * 2,
            opacity: Math.random(),
            twinkleSpeed: 0.01 + Math.random() * 0.03
          });
        }
        starsRef.current = newStars;
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!heartRef.current || heartRef.current['centerX'] !== dimensions.width / 2) {
      heartRef.current = new HeartGenerator(20, dimensions.width / 2, dimensions.height / 2);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Render Stars
      starsRef.current.forEach(star => {
        const twinkle = Math.sin(frameRef.current * star.twinkleSpeed) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2);
        ctx.fill();
      });

      if (heartRef.current) {
        const points = heartRef.current.getFrame(Math.floor(frameRef.current / 10));
        ctx.fillStyle = HEART_COLOR;
        points.forEach(p => {
          ctx.fillRect(p.x, p.y, p.size, p.size);
        });
      }

      frameRef.current++;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [dimensions]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#0a0502] flex items-center justify-center"
    >
      {/* Top Text Overlay */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-full text-center px-4">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
          className="text-4xl md:text-6xl font-serif text-white/90 tracking-[0.2em] drop-shadow-[0_0_20px_rgba(238,174,238,0.4)]"
        >
          祝爸爸妈妈新年快乐
        </motion.h2>
      </div>

      {/* Immersive Background Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20"
          style={{
            background: `radial-gradient(circle, ${HEART_COLOR} 0%, transparent 70%)`,
            filter: 'blur(100px)'
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative z-10"
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="block"
        />
      </motion.div>

      {/* Editorial Overlay */}
      <div className="absolute bottom-12 left-12 z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <h1 className="text-4xl font-light tracking-tighter text-white/80 font-serif italic">
            Beating Heart
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono mt-2">
            Parametric Equation • Particle System • React Canvas
          </p>
        </motion.div>
      </div>

      <div className="absolute top-12 right-12 z-20">
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest">System Status</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-white/60 font-mono">PULSE_ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Glass Morphism Controls (Optional/Decorative) */}
      <div className="absolute bottom-12 right-12 z-20 flex gap-4">
        <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <span className="text-[10px] text-white/50 font-mono">FPS: 60</span>
        </div>
        <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <span className="text-[10px] text-white/50 font-mono">PARTICLES: ~15K</span>
        </div>
      </div>
    </div>
  );
}
