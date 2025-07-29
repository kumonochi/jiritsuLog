import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useEditorStore } from '../../store/editorStore';
import { DraggableComponent } from './DraggableComponent';

interface CanvasProps {
  className?: string;
}

export const Canvas: React.FC<CanvasProps> = ({ className = '' }) => {
  const { components, canvasSize, zoom, gridEnabled, selectComponent } = useEditorStore();
  
  const { setNodeRef } = useDroppable({
    id: 'canvas'
  });

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectComponent(null);
    }
  };

  return (
    <div className={`canvas-container ${className}`}>
      <div
        ref={setNodeRef}
        className={`canvas ${gridEnabled ? 'grid-enabled' : ''}`}
        style={{
          width: canvasSize.width * zoom,
          height: canvasSize.height * zoom,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left'
        }}
        onClick={handleCanvasClick}
      >
        {components.map((component) => (
          <DraggableComponent
            key={component.id}
            component={component}
          />
        ))}
        
        {/* グリッドはCSSで表示 */}
      </div>
    </div>
  );
};