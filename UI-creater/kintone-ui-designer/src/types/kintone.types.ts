export interface KintoneEventHandler {
  eventType: string;
  handler: string;
}

export const kintoneEvents = {
  record: {
    create: ['app.record.create.show', 'app.record.create.submit'],
    edit: ['app.record.edit.show', 'app.record.edit.submit'],
    detail: ['app.record.detail.show'],
    index: ['app.record.index.show']
  },
  mobile: {
    // モバイル用イベント
  }
};

export const fieldTypes = [
  'SINGLE_LINE_TEXT',
  'MULTI_LINE_TEXT', 
  'NUMBER',
  'CALC',
  'RADIO_BUTTON',
  'CHECK_BOX',
  'MULTI_SELECT',
  'DROP_DOWN',
  'DATE',
  'DATETIME',
  'ATTACHMENT',
  'LINK',
  'USER_SELECT'
];

export const insertPositions = [
  'HeaderMenuSpace',
  'HeaderSpace',
  'RecordSpace'
];