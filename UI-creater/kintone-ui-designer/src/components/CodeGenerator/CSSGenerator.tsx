import type { Component } from '../../types/component.types';

export class CSSGenerator {
  generateCSS(components: Component[]): string {
    const css = `/* 生成されるCSSの例 */
.kui-modal {
  --kui-modal-bg: #ffffff;
  --kui-modal-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  
  position: fixed;
  background: var(--kui-modal-bg);
  box-shadow: var(--kui-modal-shadow);
  border-radius: 8px;
  z-index: 10000;
  animation: kui-fade-in 0.3s ease-out;
}

.kui-button {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.kui-button--primary {
  background-color: #3498db;
  color: white;
}

.kui-button--primary:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
}

@keyframes kui-fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

${components.map(component => this.generateComponentCSS(component)).join('\n')}`;

    return css;
  }

  private generateComponentCSS(component: Component): string {
    switch (component.type) {
      case 'modal':
        return this.generateModalCSS(component);
      case 'button':
        return this.generateButtonCSS(component);
      default:
        return `/* ${component.name} のスタイル */`;
    }
  }

  private generateModalCSS(component: Component): string {
    return `
/* Modal: ${component.id} */
#${component.id} {
  width: ${component.props.width || 600}px;
  height: ${component.props.height || 400}px;
}`;
  }

  private generateButtonCSS(component: Component): string {
    const sizeStyles = {
      small: 'padding: 4px 8px; font-size: 12px;',
      medium: 'padding: 8px 16px; font-size: 14px;',
      large: 'padding: 12px 24px; font-size: 16px;'
    };

    return `
/* Button: ${component.id} */
#${component.id} {
  ${sizeStyles[component.props.size as keyof typeof sizeStyles] || sizeStyles.medium}
}`;
  }
}