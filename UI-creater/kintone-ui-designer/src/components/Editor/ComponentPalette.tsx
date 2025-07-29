import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { componentTemplates, formElementTemplates } from '../../types/component.types';

interface DraggableItemProps {
  id: string;
  children: React.ReactNode;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      {children}
    </div>
  );
};

export const ComponentPalette: React.FC = () => {
  return (
    <div className="component-palette h-full p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm">🧩</span>
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          コンポーネント
        </h3>
      </div>
      
      <div className="space-y-2">
        {Object.entries(componentTemplates).map(([key, template]) => (
          <DraggableItem key={key} id={key}>
            <div className="palette-item p-4 cursor-move group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-white text-lg">
                    {key === 'modal' && '🪟'}
                    {key === 'button' && '🔘'}
                    {key === 'form' && '📝'}
                    {key === 'layout' && '📐'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                    {template.name}
                  </div>
                  <div className="text-sm text-gray-500 group-hover:text-purple-400 transition-colors">
                    {key === 'modal' && 'ダイアログ・ポップアップ'}
                    {key === 'button' && 'クリックアクション'}
                    {key === 'form' && 'データ入力'}
                    {key === 'layout' && 'レイアウト・コンテナ'}
                  </div>
                </div>
              </div>
            </div>
          </DraggableItem>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs">📋</span>
          </div>
          <h4 className="text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            フォーム要素
          </h4>
        </div>
        <div className="space-y-2">
          {Object.entries(formElementTemplates).map(([key, template]) => (
            <DraggableItem key={key} id={key}>
              <div className="palette-item p-3 cursor-move group">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-white text-sm">
                      {key === 'input' && '📝'}
                      {key === 'select' && '📋'}
                      {key === 'checkbox' && '☑️'}
                      {key === 'radio' && '🔘'}
                      {key === 'textarea' && '📄'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 group-hover:text-green-600 transition-colors text-sm">
                      {template.name}
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-green-400 transition-colors">
                      {key === 'input' && '単行テキスト'}
                      {key === 'select' && '選択リスト'}
                      {key === 'checkbox' && '複数選択'}
                      {key === 'radio' && '単一選択'}
                      {key === 'textarea' && '複数行テキスト'}
                    </div>
                  </div>
                </div>
              </div>
            </DraggableItem>
          ))}
        </div>
      </div>
    </div>
  );
};