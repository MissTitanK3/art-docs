'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface MobileNavProps {
  children?: React.ReactNode;
}

export const MobileNav: React.FC<MobileNavProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mount flag so we only portal on the client
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle keyboard navigation and ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Check mobile viewport and reduced motion preferences
  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionPreference = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMotionPreference);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionPreference);
    };
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  if (!mounted) return null;

  const portalContent = (
    <div className="md:hidden">
      {/* Mobile Menu Button */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-[1020] p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[1000]"
          onClick={closeMenu}
          role="presentation"
        />
      )}

      {/* Side Panel */}
      <div
        ref={menuRef}
        id="mobile-nav-menu"
        className={`fixed left-0 top-0 h-screen w-64 bg-gray-900/95 text-white z-[50010] border-r border-gray-800 shadow-2xl backdrop-blur-sm ${prefersReducedMotion ? '' : 'transition-transform duration-300 ease-in-out'
          } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="pt-16 px-4 pb-4">
          {children}
          <button
            onClick={closeMenu}
            className="mt-4 w-full p-2 rounded-lg bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close Menu
          </button>
        </div>
      </div>
    </div>
  );

  return <>{createPortal(portalContent, document.body)}</>;
};
