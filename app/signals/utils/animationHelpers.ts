/**
 * Animation configuration and timing functions
 */

export const ANIMATION_TIMINGS = {
  // Durations
  fast: 100,
  normal: 200,
  slow: 300,
  verySlow: 400,
  
  // Delays
  staggerDelay: 50, // Delay between staggered items
  pulseDelay: 2000, // Pulse animation duration
  
  // Debounce/Throttle
  searchDebounce: 300,
  scrollThrottle: 16, // ~60fps
} as const;

export const EASING_FUNCTIONS = {
  easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.6, 1)',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

/**
 * Get staggered animation delay based on index
 * @param index - Item index
 * @param baseDelay - Base delay in milliseconds
 * @returns Delay in milliseconds
 */
export function getStaggerDelay(index: number, baseDelay: number = ANIMATION_TIMINGS.staggerDelay): number {
  return index * baseDelay;
}

/**
 * Throttle function for performance optimization
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Debounce function for input handling
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Get card animation style based on index
 * @param index - Card index
 * @returns CSS style object for animation
 */
export function getCardAnimationStyle(index: number): React.CSSProperties {
  return {
    animationDelay: `${getStaggerDelay(index)}ms`,
    animationFillMode: 'both',
  };
}

/**
 * Parallax scroll effect calculator
 * @param scrollY - Current scroll position
 * @param factor - Parallax factor (0.5 = half speed)
 * @returns Transform value
 */
export function calculateParallax(scrollY: number, factor: number = 0.5): number {
  return scrollY * factor;
}
