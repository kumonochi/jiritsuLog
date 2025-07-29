import { DndContext, type DragEndEvent, type DragOverEvent } from '@dnd-kit/core';
import { useEditorStore } from './store/editorStore';
import { componentTemplates, formElementTemplates } from './types/component.types';
import { ComponentPalette } from './components/Editor/ComponentPalette';
import { Canvas } from './components/Editor/Canvas';
import { PropertyPanel } from './components/Editor/PropertyPanel';
import { CodeExporter } from './components/CodeGenerator/CodeExporter';

function App() {
  const { addComponent, updateComponent } = useEditorStore();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    
    if (!over) return;

    // パレットからキャンバスへのドロップ（新規コンポーネント作成）
    if (over.id === 'canvas') {
      let template = null;
      let componentType = active.id as string;

      // UIコンポーネントかフォーム要素かを判定
      if (active.id in componentTemplates) {
        template = componentTemplates[active.id as keyof typeof componentTemplates];
      } else if (active.id in formElementTemplates) {
        template = formElementTemplates[active.id as keyof typeof formElementTemplates];
      }

      if (template) {
        // ランダムな位置に配置（重複を避けるため）
        const randomX = Math.floor(Math.random() * 400) + 50;
        const randomY = Math.floor(Math.random() * 300) + 50;
        
        const newComponent = {
          id: `${active.id}_${Date.now()}`,
          type: componentType,
          name: template.name,
          props: { ...template.defaultProps },
          position: { x: randomX, y: randomY },
          size: { 
            width: (template.defaultProps as any).width || 200, 
            height: (template.defaultProps as any).height || (componentType.includes('textarea') ? 120 : 40)
          }
        };
        addComponent(newComponent);
      }
    }
    
    // 既存コンポーネントの移動
    else if (active.data.current?.type === 'component' && over.id === 'canvas') {
      const component = active.data.current.component;
      updateComponent(component.id, {
        position: {
          x: component.position.x + (delta.x || 0),
          y: component.position.y + (delta.y || 0)
        }
      });
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // ドラッグ中の視覚的フィードバック用
  };

  return (
    <div className="app h-screen flex overflow-hidden">
      <DndContext onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
        {/* ヘッダー */}
        <header className="fixed top-0 left-0 right-0 glass-panel z-50 h-16 border-b border-white/20">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Kintone UI Designer
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <button className="kui-button kui-button--secondary text-sm hover-lift">
                  ✨ 新規
                </button>
                <button className="kui-button kui-button--secondary text-sm hover-lift">
                  💾 保存
                </button>
                <CodeExporter />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white/20 rounded-xl p-2">
                <button className="p-2 hover:bg-white/20 rounded-lg transition-all" title="元に戻す">
                  ↶
                </button>
                <button className="p-2 hover:bg-white/20 rounded-lg transition-all" title="やり直し">
                  ↷
                </button>
                <div className="border-l border-white/30 mx-2 h-6"></div>
                <button className="p-2 hover:bg-white/20 rounded-lg transition-all" title="ズームアウト">
                  🔍-
                </button>
                <span className="text-sm px-2 font-medium text-white">100%</span>
                <button className="p-2 hover:bg-white/20 rounded-lg transition-all" title="ズームイン">
                  🔍+
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <div className="flex flex-1 pt-16 h-full">
          {/* コンポーネントパレット */}
          <div className="w-80 glass-panel m-4 mr-2 rounded-2xl overflow-hidden">
            <ComponentPalette />
          </div>

          {/* キャンバスエリア */}
          <div className="flex-1 p-4 overflow-hidden">
            <div className="h-full">
              <Canvas className="w-full h-full" />
            </div>
          </div>

          {/* プロパティパネル */}
          <div className="w-80 glass-panel m-4 ml-2 rounded-2xl overflow-hidden">
            <PropertyPanel />
          </div>
        </div>
      </DndContext>
    </div>
  );
}

export default App;