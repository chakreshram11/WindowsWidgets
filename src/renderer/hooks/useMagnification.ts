import { useState, useCallback, useRef } from 'react';
import { DockMagnificationSettings } from '../types/dock';

export function useMagnification(settings: DockMagnificationSettings, isEnabled: boolean) {
  const [mouseX, setMouseX] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEnabled || !containerRef.current) {
      setMouseX(null);
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
  }, [isEnabled]);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
  }, []);

  /**
   * Physics calculation for item size based on cursor distance from item center.
   * Standard Gaussian / Smooth Cosine falloff curve.
   */
  const getItemSize = useCallback((itemCenterX: number): number => {
    if (!isEnabled || mouseX === null) {
      return settings.baseIconSize;
    }

    const distance = Math.abs(mouseX - itemCenterX);
    const radius = settings.radius;

    if (distance >= radius) {
      return settings.baseIconSize;
    }

    // Cosine decay interpolation for ultra-smooth macOS feel
    const cosineDecay = 0.5 * (1 + Math.cos((Math.PI * distance) / radius));
    const delta = (settings.maxIconSize - settings.baseIconSize) * cosineDecay * (settings.strength || 1);

    return Math.min(settings.maxIconSize, settings.baseIconSize + delta);
  }, [isEnabled, mouseX, settings]);

  return {
    containerRef,
    mouseX,
    handleMouseMove,
    handleMouseLeave,
    getItemSize
  };
}
