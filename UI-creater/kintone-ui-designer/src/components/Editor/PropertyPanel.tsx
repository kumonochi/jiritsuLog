import React from 'react';
import { useEditorStore } from '../../store/editorStore';

export const PropertyPanel: React.FC = () => {
  const { components, selectedComponentId, updateComponent } = useEditorStore();
  
  const selectedComponent = components.find(c => c.id === selectedComponentId);

  if (!selectedComponent) {
    return (
      <div className="property-panel h-full p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">⚙️</span>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            プロパティ
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl text-gray-400">🎯</span>
          </div>
          <p className="text-gray-500 font-medium">コンポーネントを選択してください</p>
          <p className="text-gray-400 text-sm mt-2">キャンバスのコンポーネントをクリック</p>
        </div>
      </div>
    );
  }

  const handlePropertyChange = (key: string, value: any) => {
    updateComponent(selectedComponent.id, {
      props: { ...selectedComponent.props, [key]: value }
    });
  };

  const renderPropertyInput = (key: string, value: any, type: string = 'text') => {
    switch (type) {
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handlePropertyChange(key, e.target.checked)}
            className="rounded"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handlePropertyChange(key, Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handlePropertyChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {key === 'variant' && (
              <>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="danger">Danger</option>
                <option value="success">Success</option>
              </>
            )}
            {key === 'size' && (
              <>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </>
            )}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handlePropertyChange(key, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      case 'array':
        return (
          <div>
            <textarea
              value={Array.isArray(value) ? value.join('\n') : ''}
              onChange={(e) => handlePropertyChange(key, e.target.value.split('\n').filter(v => v.trim()))}
              rows={4}
              placeholder="各行に1つのオプションを入力してください"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">改行で区切って入力してください</p>
          </div>
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handlePropertyChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  const getPropertyConfig = (type: string) => {
    switch (type) {
      case 'modal':
        return [
          { key: 'title', label: 'タイトル', type: 'text' },
          { key: 'width', label: '幅', type: 'number' },
          { key: 'height', label: '高さ', type: 'number' },
          { key: 'showCloseButton', label: '閉じるボタン', type: 'boolean' },
          { key: 'overlay', label: 'オーバーレイ', type: 'boolean' },
          { key: 'content', label: 'コンテンツ', type: 'textarea' }
        ];
      case 'button':
        return [
          { key: 'text', label: 'テキスト', type: 'text' },
          { key: 'variant', label: 'スタイル', type: 'select' },
          { key: 'size', label: 'サイズ', type: 'select' }
        ];
      case 'input':
        return [
          { key: 'label', label: 'ラベル', type: 'text' },
          { key: 'placeholder', label: 'プレースホルダー', type: 'text' },
          { key: 'value', label: 'デフォルト値', type: 'text' },
          { key: 'required', label: '必須', type: 'boolean' },
          { key: 'disabled', label: '無効', type: 'boolean' }
        ];
      case 'select':
        return [
          { key: 'label', label: 'ラベル', type: 'text' },
          { key: 'options', label: 'オプション', type: 'array' },
          { key: 'value', label: 'デフォルト値', type: 'text' },
          { key: 'required', label: '必須', type: 'boolean' },
          { key: 'disabled', label: '無効', type: 'boolean' }
        ];
      case 'checkbox':
        return [
          { key: 'label', label: 'ラベル', type: 'text' },
          { key: 'checked', label: 'チェック済み', type: 'boolean' },
          { key: 'disabled', label: '無効', type: 'boolean' }
        ];
      case 'radio':
        return [
          { key: 'label', label: 'ラベル', type: 'text' },
          { key: 'options', label: 'オプション', type: 'array' },
          { key: 'value', label: 'デフォルト値', type: 'text' },
          { key: 'disabled', label: '無効', type: 'boolean' }
        ];
      case 'textarea':
        return [
          { key: 'label', label: 'ラベル', type: 'text' },
          { key: 'placeholder', label: 'プレースホルダー', type: 'text' },
          { key: 'value', label: 'デフォルト値', type: 'textarea' },
          { key: 'rows', label: '行数', type: 'number' },
          { key: 'required', label: '必須', type: 'boolean' },
          { key: 'disabled', label: '無効', type: 'boolean' }
        ];
      default:
        return [];
    }
  };

  const propertyConfig = getPropertyConfig(selectedComponent.type);

  return (
    <div className="property-panel h-full p-6 overflow-y-auto">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm">⚙️</span>
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          プロパティ
        </h3>
      </div>
      
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">
              {selectedComponent.type === 'modal' && '🪟'}
              {selectedComponent.type === 'button' && '🔘'}
              {selectedComponent.type === 'form' && '📝'}
            </span>
          </div>
          <div>
            <div className="font-semibold text-blue-800">{selectedComponent.name}</div>
            <div className="text-xs text-blue-600 font-mono">ID: {selectedComponent.id}</div>
          </div>
        </div>
      </div>

      {/* 基本プロパティ */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">基本設定</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">X座標</label>
          <input
            type="number"
            value={selectedComponent.position.x}
            onChange={(e) => updateComponent(selectedComponent.id, {
              position: { ...selectedComponent.position, x: Number(e.target.value) }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Y座標</label>
          <input
            type="number"
            value={selectedComponent.position.y}
            onChange={(e) => updateComponent(selectedComponent.id, {
              position: { ...selectedComponent.position, y: Number(e.target.value) }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* コンポーネント固有のプロパティ */}
      {propertyConfig.length > 0 && (
        <div className="mt-6 space-y-4">
          <h4 className="font-medium text-gray-700">コンポーネント設定</h4>
          
          {propertyConfig.map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              {renderPropertyInput(key, selectedComponent.props[key], type)}
            </div>
          ))}
        </div>
      )}

      {/* アクション */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-700 mb-3">アクション</h4>
        <div className="space-y-2">
          <button
            onClick={() => {
              const store = useEditorStore.getState();
              store.duplicateComponent(selectedComponent.id);
            }}
            className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            複製
          </button>
          <button
            onClick={() => {
              const store = useEditorStore.getState();
              store.deleteComponent(selectedComponent.id);
            }}
            className="w-full px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
};