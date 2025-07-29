import { create } from 'zustand';
import type { Component } from '../types/component.types';

interface EditorState {
  components: Component[];
  selectedComponentId: string | null;
  canvasSize: { width: number; height: number };
  zoom: number;
  gridEnabled: boolean;
  
  // Actions
  addComponent: (component: Component) => void;
  updateComponent: (id: string, updates: Partial<Component>) => void;
  deleteComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  duplicateComponent: (id: string) => void;
  reorderComponents: (newOrder: string[]) => void;
  
  // History
  history: HistoryState[];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
}

interface HistoryState {
  components: Component[];
  selectedComponentId: string | null;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  components: [],
  selectedComponentId: null,
  canvasSize: { width: 800, height: 600 },
  zoom: 1,
  gridEnabled: true,
  history: [],
  historyIndex: -1,

  addComponent: (component: Component) => {
    set((state) => ({
      components: [...state.components, component],
      selectedComponentId: component.id
    }));
  },

  updateComponent: (id: string, updates: Partial<Component>) => {
    set((state) => ({
      components: state.components.map(comp =>
        comp.id === id ? { ...comp, ...updates } : comp
      )
    }));
  },

  deleteComponent: (id: string) => {
    set((state) => ({
      components: state.components.filter(comp => comp.id !== id),
      selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId
    }));
  },

  selectComponent: (id: string | null) => {
    set({ selectedComponentId: id });
  },

  duplicateComponent: (id: string) => {
    const state = get();
    const component = state.components.find(comp => comp.id === id);
    if (component) {
      const duplicated: Component = {
        ...component,
        id: `${component.id}_copy_${Date.now()}`,
        position: {
          x: component.position.x + 20,
          y: component.position.y + 20
        }
      };
      state.addComponent(duplicated);
    }
  },

  reorderComponents: (newOrder: string[]) => {
    set((state) => {
      const reordered = newOrder.map(id => 
        state.components.find(comp => comp.id === id)!
      ).filter(Boolean);
      return { components: reordered };
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const prevState = state.history[state.historyIndex - 1];
      set({
        components: prevState.components,
        selectedComponentId: prevState.selectedComponentId,
        historyIndex: state.historyIndex - 1
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const nextState = state.history[state.historyIndex + 1];
      set({
        components: nextState.components,
        selectedComponentId: nextState.selectedComponentId,
        historyIndex: state.historyIndex + 1
      });
    }
  }
}));