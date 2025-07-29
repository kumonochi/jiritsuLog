import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Component } from '../../types/component.types';
import { useEditorStore } from '../../store/editorStore';

interface DraggableComponentProps {
  component: Component;
}

export const DraggableComponent: React.FC<DraggableComponentProps> = ({ component }) => {
  const { selectedComponentId, selectComponent, updateComponent } = useEditorStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({ 
    id: component.id,
    data: { type: 'component', component }
  });

  const isSelected = selectedComponentId === component.id;

  // ドラッグ中の位置計算
  const dragStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1000,
  } : {};

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectComponent(component.id);
  };

  const renderComponent = () => {
    switch (component.type) {
      case 'modal':
        return (
          <div
            className="kui-modal-preview"
            style={{
              width: component.props.width || 600,
              height: component.props.height || 400,
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              position: 'relative'
            }}
          >
            <div className="modal-header" style={{ padding: '16px', borderBottom: '1px solid #eee' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>{component.props.title || 'モーダル'}</h3>
              {component.props.showCloseButton && (
                <button className="close-btn" style={{ position: 'absolute', right: '16px', top: '16px' }}>×</button>
              )}
            </div>
            <div className="modal-content" style={{ padding: '16px' }}>
              {component.props.content || 'モーダルの内容'}
            </div>
          </div>
        );
        
      case 'button':
        return (
          <button
            className={`kui-button kui-button--${component.props.variant || 'primary'}`}
            style={{
              fontSize: component.props.size === 'large' ? '16px' : component.props.size === 'small' ? '12px' : '14px',
              padding: component.props.size === 'large' ? '12px 24px' : component.props.size === 'small' ? '4px 8px' : '8px 16px'
            }}
          >
            {component.props.text || 'ボタン'}
          </button>
        );

      case 'input':
        return (
          <div className="form-field">
            {component.props.label && (
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {component.props.label}
                {component.props.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <input
              type="text"
              value={component.props.value || ''}
              placeholder={component.props.placeholder}
              disabled={component.props.disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              onChange={(e) => updateComponent(component.id, {
                props: { ...component.props, value: e.target.value }
              })}
            />
          </div>
        );

      case 'select':
        return (
          <div className="form-field">
            {component.props.label && (
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {component.props.label}
                {component.props.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <select
              value={component.props.value || ''}
              disabled={component.props.disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              onChange={(e) => updateComponent(component.id, {
                props: { ...component.props, value: e.target.value }
              })}
            >
              <option value="">選択してください</option>
              {(component.props.options || []).map((option: string, index: number) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'checkbox':
        return (
          <div className="form-field">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={component.props.checked || false}
                disabled={component.props.disabled}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 disabled:cursor-not-allowed"
                onChange={(e) => updateComponent(component.id, {
                  props: { ...component.props, checked: e.target.checked }
                })}
              />
              <span className="text-sm font-medium text-gray-700">
                {component.props.label}
              </span>
            </label>
          </div>
        );

      case 'radio':
        return (
          <div className="form-field">
            {component.props.label && (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {component.props.label}
              </label>
            )}
            <div className="space-y-2">
              {(component.props.options || []).map((option: string, index: number) => (
                <label key={index} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={component.id}
                    value={option}
                    checked={component.props.value === option}
                    disabled={component.props.disabled}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 focus:ring-2 disabled:cursor-not-allowed"
                    onChange={(e) => updateComponent(component.id, {
                      props: { ...component.props, value: e.target.value }
                    })}
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'textarea':
        return (
          <div className="form-field">
            {component.props.label && (
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {component.props.label}
                {component.props.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <textarea
              value={component.props.value || ''}
              placeholder={component.props.placeholder}
              rows={component.props.rows || 4}
              disabled={component.props.disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
              onChange={(e) => updateComponent(component.id, {
                props: { ...component.props, value: e.target.value }
              })}
            />
          </div>
        );
        
      default:
        return (
          <div className="unknown-component bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <div className="text-gray-500 font-medium">{component.name}</div>
            <div className="text-xs text-gray-400 mt-1">未対応のコンポーネント</div>
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'absolute',
        left: component.position.x,
        top: component.position.y,
        ...dragStyle,
        cursor: transform ? 'grabbing' : 'grab',
        opacity: transform ? 0.8 : 1,
      }}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`draggable-component ${isSelected ? 'selected' : ''} ${transform ? 'dragging' : ''}`}
    >
      {renderComponent()}
      
      {isSelected && (
        <div className="selection-outline">
          <div className="resize-handle top-left"></div>
          <div className="resize-handle top-right"></div>
          <div className="resize-handle bottom-left"></div>
          <div className="resize-handle bottom-right"></div>
        </div>
      )}
    </div>
  );
};