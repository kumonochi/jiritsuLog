import type { Component } from '../../types/component.types';

export class JavaScriptGenerator {
  generateCode(components: Component[]): string {
    const code = `(function() {
  'use strict';

  // kintone イベントハンドラー
  kintone.events.on(['app.record.detail.show'], function(event) {
    // UIコンポーネント初期化
    const uiComponents = new KintoneUIComponents();

    ${components.map(component => this.generateComponentCode(component)).join('\n\n    ')}

    return event;
  });

  // ヘルパークラス
  class KintoneUIComponents {
    ${components.map(component => this.generateComponentMethod(component)).join('\n\n    ')}
  }
})();`;

    return code;
  }

  private generateComponentCode(component: Component): string {
    switch (component.type) {
      case 'modal':
        return this.generateModalCode(component);
      case 'button':
        return this.generateButtonCode(component);
      default:
        return `// ${component.name} - 未対応のコンポーネントタイプ`;
    }
  }

  private generateModalCode(component: Component): string {
    return `// モーダルの作成
    const modal${component.id} = uiComponents.createModal({
      id: '${component.id}',
      title: '${component.props.title || 'データ確認'}',
      width: ${component.props.width || 600},
      height: ${component.props.height || 400},
      content: \`${component.props.content || '<div>...</div>'}\`,
      buttons: [
        { text: '確認', action: 'confirm', style: 'primary' },
        { text: 'キャンセル', action: 'cancel', style: 'secondary' }
      ]
    });`;
  }

  private generateButtonCode(component: Component): string {
    return `// ボタンの追加
    const button${component.id} = uiComponents.createButton({
      id: '${component.id}',
      text: '${component.props.text || 'モーダルを開く'}',
      style: '${component.props.variant || 'primary'}',
      size: '${component.props.size || 'medium'}',
      onClick: () => modal1.show()
    });

    // DOM に追加
    kintone.app.record.getHeaderMenuSpaceElement().appendChild(button${component.id}.element);`;
  }

  private generateComponentMethod(component: Component): string {
    switch (component.type) {
      case 'modal':
        return `createModal(config) { /* 実装 */ }`;
      case 'button':
        return `createButton(config) { /* 実装 */ }`;
      default:
        return `// ${component.type}の作成メソッド`;
    }
  }
}