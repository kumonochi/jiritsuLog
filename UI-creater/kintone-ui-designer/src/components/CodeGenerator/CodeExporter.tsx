import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { JavaScriptGenerator } from './JavaScriptGenerator';
import { CSSGenerator } from './CSSGenerator';

export const CodeExporter: React.FC = () => {
  const { components } = useEditorStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'js' | 'css'>('js');

  const jsGenerator = new JavaScriptGenerator();
  const cssGenerator = new CSSGenerator();

  const generatedJS = jsGenerator.generateCode(components);
  const generatedCSS = cssGenerator.generateCSS(components);

  const handleExport = () => {
    const jsBlob = new Blob([generatedJS], { type: 'text/javascript' });
    const cssBlob = new Blob([generatedCSS], { type: 'text/css' });
    
    const jsUrl = URL.createObjectURL(jsBlob);
    const cssUrl = URL.createObjectURL(cssBlob);
    
    // JSファイルのダウンロード
    const jsLink = document.createElement('a');
    jsLink.href = jsUrl;
    jsLink.download = 'kintone-custom.js';
    document.body.appendChild(jsLink);
    jsLink.click();
    document.body.removeChild(jsLink);
    
    // CSSファイルのダウンロード
    const cssLink = document.createElement('a');
    cssLink.href = cssUrl;
    cssLink.download = 'kintone-custom.css';
    document.body.appendChild(cssLink);
    cssLink.click();
    document.body.removeChild(cssLink);
    
    URL.revokeObjectURL(jsUrl);
    URL.revokeObjectURL(cssUrl);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="kui-button kui-button--primary text-sm"
      >
        エクスポート
      </button>
    );
  }

  return (
    <div className="kui-modal">
      <div className="bg-white rounded-lg shadow-xl w-4/5 h-4/5 max-w-4xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">コードエクスポート</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="flex h-full">
          {/* タブ */}
          <div className="w-48 border-r bg-gray-50">
            <div className="p-4">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('js')}
                  className={`w-full text-left px-3 py-2 rounded ${
                    activeTab === 'js' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  JavaScript
                </button>
                <button
                  onClick={() => setActiveTab('css')}
                  className={`w-full text-left px-3 py-2 rounded ${
                    activeTab === 'css' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  CSS
                </button>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleExport}
                  className="kui-button kui-button--primary w-full"
                >
                  ファイルダウンロード
                </button>
              </div>
            </div>
          </div>

          {/* コードプレビュー */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-medium">
                {activeTab === 'js' ? 'JavaScript コード' : 'CSS スタイル'}
              </h3>
              <button
                onClick={() => copyToClipboard(activeTab === 'js' ? generatedJS : generatedCSS)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                コピー
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-auto">
              <pre className="text-sm bg-gray-50 p-4 rounded border h-full overflow-auto">
                <code>
                  {activeTab === 'js' ? generatedJS : generatedCSS}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};