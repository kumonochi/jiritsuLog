export interface Component {
  id: string;
  type: string;
  name: string;
  props: Record<string, any>;
  position: { x: number; y: number };
  size: { width: number; height: number };
  children?: Component[];
}

export interface ComponentTemplate {
  name: string;
  icon: string;
  defaultProps: Record<string, any>;
}

export interface ComponentPalette {
  modal: ComponentTemplate;
  button: ComponentTemplate;
  form: ComponentTemplate;
  layout: ComponentTemplate;
}

export const componentTemplates: ComponentPalette = {
  modal: {
    name: 'モーダル',
    icon: 'Modal',
    defaultProps: {
      width: 600,
      height: 400,
      title: '新規モーダル',
      showCloseButton: true,
      overlay: true,
      animation: 'fade'
    }
  },
  button: {
    name: 'ボタン',
    icon: 'Button',
    defaultProps: {
      text: 'ボタン',
      variant: 'primary',
      size: 'medium'
    }
  },
  form: {
    name: 'フォーム',
    icon: 'Form',
    defaultProps: {
      fields: []
    }
  },
  layout: {
    name: 'レイアウト',
    icon: 'Layout',
    defaultProps: {
      padding: 16,
      background: '#ffffff'
    }
  }
};

// フォーム要素のテンプレート
export const formElementTemplates = {
  input: {
    name: 'テキスト入力',
    icon: 'Input',
    defaultProps: {
      placeholder: 'テキストを入力してください',
      value: '',
      label: 'テキスト入力',
      required: false,
      disabled: false
    }
  },
  select: {
    name: 'ドロップダウン',
    icon: 'Select',
    defaultProps: {
      label: 'ドロップダウン',
      options: ['オプション1', 'オプション2', 'オプション3'],
      value: '',
      required: false,
      disabled: false
    }
  },
  checkbox: {
    name: 'チェックボックス',
    icon: 'Checkbox',
    defaultProps: {
      label: 'チェックボックス',
      checked: false,
      disabled: false
    }
  },
  radio: {
    name: 'ラジオボタン',
    icon: 'Radio',
    defaultProps: {
      label: 'ラジオボタン',
      options: ['選択肢1', '選択肢2', '選択肢3'],
      value: '',
      disabled: false
    }
  },
  textarea: {
    name: 'テキストエリア',
    icon: 'Textarea',
    defaultProps: {
      placeholder: '複数行のテキストを入力してください',
      value: '',
      label: 'テキストエリア',
      rows: 4,
      required: false,
      disabled: false
    }
  }
};