'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4'
      }`}
    >
      {children}
    </div>
  );
}

export function FadeInWrapper({ 
  children, 
  delay = 0,
  direction = 'up' 
}: { 
  children: React.ReactNode; 
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const directionClasses = {
    up: isVisible ? 'translate-y-0' : 'translate-y-8',
    down: isVisible ? 'translate-y-0' : '-translate-y-8',
    left: isVisible ? 'translate-x-0' : 'translate-x-8',
    right: isVisible ? 'translate-x-0' : '-translate-x-8',
  };

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${directionClasses[direction]}`}
    >
      {children}
    </div>
  );
}

export function StaggeredFadeIn({ 
  children, 
  staggerDelay = 100 
}: { 
  children: React.ReactNode[]; 
  staggerDelay?: number;
}) {
  return (
    <>
      {children.map((child, index) => (
        <FadeInWrapper key={index} delay={index * staggerDelay}>
          {child}
        </FadeInWrapper>
      ))}
    </>
  );
}