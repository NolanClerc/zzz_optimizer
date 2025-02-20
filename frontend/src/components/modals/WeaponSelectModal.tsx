import { useRef, useState } from 'react';
import { MODAL_STYLES } from '@/styles/shared';

interface WeaponSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (weapon: any) => void;
  weapons: any[];
  selectedLevel: number;
}

export function WeaponSelectModal({ isOpen, onClose, onSelect, weapons, selectedLevel }: WeaponSelectModalProps) {
  // ... existing modal implementation ...
  if (!isOpen) return null;
  
  return (
    // ... existing modal JSX ...
  );
}
