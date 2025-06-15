import React from 'react';
import { motion } from 'framer-motion';

interface CaveParticlesProps {
  count?: number;
  duration?: number;
  colors?: string[];
}

const CaveParticles: React.FC<CaveParticlesProps> = ({
  count = 20,
  duration = 10,
  colors = ['#FFD700', '#FFA500', '#B8860B'],
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const initialX = Math.random() * 100 + '%';
        const initialY = Math.random() * 100 + '%';
        const destX = Math.random() * 100 + '%';
        const destY = Math.random() * 100 + '%';
        const color = colors[Math.floor(Math.random() * colors.length)];
        const d = Math.random() * duration + duration;
        const delay = Math.random() * duration;
        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{ backgroundColor: color }}
            initial={{ x: initialX, y: initialY, scale: 0 }}
            animate={{ x: destX, y: destY, scale: [0, Math.random() * 2 + 1, 0] }}
            transition={{ duration: d, repeat: Infinity, delay }}
          />
        );
      })}
    </>
  );
};

export default CaveParticles;
