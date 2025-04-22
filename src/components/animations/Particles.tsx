import React from 'react';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  angle: number;
}

interface ParticlesProps {
  count?: number;
  type?: 'confirm' | 'liquidity' | 'pool';
}

const Particles: React.FC<ParticlesProps> = ({ 
  count = 50, 
  type = 'confirm'
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Generate colors based on type
  const getColors = () => {
    switch (type) {
      case 'confirm':
        return ['#FC72FF', '#9B51E0', '#2172E5', '#27AE60'];
      case 'liquidity':
        return ['#FC72FF', '#9B51E0', '#2172E5'];
      case 'pool':
        return ['#2172E5', '#FC72FF'];
      default:
        return ['#FC72FF', '#FFFFFF'];
    }
  };

  useEffect(() => {
    const colors = getColors();
    
    // Generate initial particles
    const initialParticles: Particle[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 5 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 2 + 0.5,
      angle: Math.random() * 360
    }));
    
    setParticles(initialParticles);
    
    // Animation loop
    const interval = setInterval(() => {
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          // Convert angle to radians
          const angleRad = particle.angle * (Math.PI / 180);
          
          // Calculate new position
          let newX = particle.x + Math.cos(angleRad) * particle.speed * 0.2;
          let newY = particle.y + Math.sin(angleRad) * particle.speed * 0.2;
          
          // Bounce off edges
          let newAngle = particle.angle;
          
          if (newX < 0 || newX > 100) {
            newAngle = 180 - newAngle;
            newX = Math.max(0, Math.min(100, newX));
          }
          
          if (newY < 0 || newY > 100) {
            newAngle = 360 - newAngle;
            newY = Math.max(0, Math.min(100, newY));
          }
          
          return {
            ...particle,
            x: newX,
            y: newY,
            angle: newAngle
          };
        })
      );
    }, 50);
    
    return () => clearInterval(interval);
  }, [count, type]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full opacity-80"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}
    </div>
  );
};

export default Particles;