import { create } from 'zustand';
import type { ComponentTemplate } from '../types/component.types';

interface ComponentState {
  templates: ComponentTemplate[];
  customComponents: ComponentTemplate[];
  recentlyUsed: string[];
  
  saveAsTemplate: (component: ComponentTemplate, name: string) => void;
  loadTemplate: (templateId: string) => ComponentTemplate | undefined;
}

export const useComponentStore = create<ComponentState>((set, get) => ({
  templates: [],
  customComponents: [],
  recentlyUsed: [],

  saveAsTemplate: (component: ComponentTemplate, name: string) => {
    set((state) => ({
      customComponents: [...state.customComponents, { ...component, name }]
    }));
  },

  loadTemplate: (templateId: string) => {
    const state = get();
    return state.templates.find(t => t.name === templateId) ||
           state.customComponents.find(t => t.name === templateId);
  }
}));