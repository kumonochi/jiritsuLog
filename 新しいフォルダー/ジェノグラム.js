(() => {
    'use strict';

    // スタイル定義
    const CSS = `
        .jenogram-popup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 800px;
            height: 500px;
            background: #1e1e1e;
            border: 1px solid #404040;
            border-radius: 0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }
        .jenogram-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid #404040;
            background: #2d2d2d;
            color: #e0e0e0;
            border-radius: 0;
        }
        .jenogram-header-left {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .jenogram-undo-redo {
            display: flex;
            gap: 4px;
        }
        .jenogram-undo-btn, .jenogram-redo-btn {
            background: #404040;
            color: #e0e0e0;
            border: 1px solid #606060;
            width: 32px;
            height: 32px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }
        .jenogram-undo-btn:hover, .jenogram-redo-btn:hover {
            background: #505050;
            border-color: #707070;
        }
        .jenogram-undo-btn:disabled, .jenogram-redo-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .jenogram-title {
            font-size: 14px;
            font-weight: 400;
            color: #e0e0e0;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .jenogram-close {
            background: #404040;
            color: #e0e0e0;
            border: 1px solid #606060;
            padding: 6px 12px;
            border-radius: 0;
            cursor: pointer;
            font-size: 12px;
            font-weight: 400;
            transition: all 0.2s ease;
            font-family: inherit;
        }
        .jenogram-close:hover {
            background: #505050;
            border-color: #707070;
        }
        .jenogram-content {
            flex: 1;
            position: relative;
            overflow: hidden;
        }
        .jenogram-canvas {
            position: absolute;
            top: 0;
            left: 0;
            cursor: crosshair;
            background: white;
        }
        .jenogram-controls {
            position: absolute;
            bottom: 15px;
            right: 15px;
            display: flex;
            gap: 10px;
        }
        .jenogram-help-link {
            position: absolute;
            bottom: 15px;
            left: 15px;
            color: #007bff;
            text-decoration: underline;
            cursor: pointer;
            font-size: 12px;
            font-family: inherit;
        }
        .jenogram-help-link:hover {
            color: #0056b3;
        }
        .jenogram-help-popup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 500px;
            max-height: 400px;
            background: #2d2d2d;
            border: 1px solid #606060;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            z-index: 10004;
            color: #e0e0e0;
            font-family: inherit;
            overflow-y: auto;
        }
        .jenogram-help-header {
            padding: 16px;
            border-bottom: 1px solid #404040;
            background: #3a3a3a;
            border-radius: 8px 8px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .jenogram-help-content {
            padding: 20px;
            line-height: 1.6;
        }
        .jenogram-help-content h3 {
            color: #007bff;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        .jenogram-help-content p {
            margin: 10px 0;
        }
        .jenogram-btn {
            background: #404040;
            color: #e0e0e0;
            border: 1px solid #606060;
            padding: 8px 16px;
            border-radius: 0;
            cursor: pointer;
            font-size: 12px;
            font-weight: 400;
            transition: all 0.2s ease;
            font-family: inherit;
            margin-left: 8px;
        }
        .jenogram-btn:hover {
            background: #505050;
            border-color: #707070;
        }
        .jenogram-context-menu {
            position: fixed;
            background: #3a3a3a;
            border: 1px solid #606060;
            border-radius: 4px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
            padding: 4px 0;
            z-index: 99999;
            min-width: 180px;
            font-family: inherit;
            opacity: 1;
            visibility: visible;
        }
        .jenogram-menu-item {
            padding: 8px 16px;
            cursor: pointer;
            font-size: 12px;
            color: #e0e0e0;
            transition: all 0.1s ease;
            font-weight: 400;
        }
        .jenogram-menu-item:hover {
            background: #505050;
            color: #ffffff;
        }
        .jenogram-menu-separator {
            height: 1px;
            background: #e0e0e0;
            margin: 5px 0;
        }
        .jenogram-input-dialog {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #3a3a3a;
            border: 1px solid #606060;
            border-radius: 0;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            z-index: 10002;
            color: #e0e0e0;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }
        .jenogram-input {
            padding: 8px;
            border: 1px solid #606060;
            border-radius: 0;
            margin: 10px 0;
            width: 200px;
            background: #2a2a2a;
            color: #e0e0e0;
            font-family: inherit;
        }
        .jenogram-dialog-buttons {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 15px;
        }
        .jenogram-btn-secondary {
            background: #404040;
            color: #e0e0e0;
            border: 1px solid #606060;
            padding: 8px 16px;
            border-radius: 0;
            cursor: pointer;
            font-family: inherit;
            margin-right: 8px;
        }
        .jenogram-btn-secondary:hover {
            background: #505050;
            border-color: #707070;
        }
        .jenogram-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            backdrop-filter: blur(2px);
        }
        .jenogram-success-popup {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #28a745;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
            z-index: 10003;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            font-weight: 500;
            animation: jenogramSlideDown 0.3s ease-out;
            opacity: 0.95;
            min-width: 250px;
            text-align: center;
        }
        @keyframes jenogramSlideDown {
            from {
                transform: translateX(-50%) translateY(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(-50%) translateY(0);
                opacity: 0.95;
            }
        }
        @keyframes jenogramSlideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 0.95;
            }
        }
    `;

    // スタイルシートを追加
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    // ジェノグラム要素クラス
    class JenogramElement {
        constructor(type, x, y, data = {}) {
            this.id = Date.now() + Math.random();
            this.type = type; // 'person', 'line', 'circle'
            this.x = x;
            this.y = y;
            this.data = data;
            this.selected = false;
        }
    }

    // ジェノグラムエディタクラス
    class JenogramEditor {
        constructor() {
            this.elements = [];
            this.selectedElements = [];
            this.draggedElement = null;
            this.isDrawing = false;
            this.mode = 'select'; // 'select', 'person', 'line', 'circle'
            this.contextMenu = null;
            this.canvas = null;
            this.ctx = null;
            this.gridSize = 25; // 半マス移動に変更
            this.snapDistance = 10;
            this.isDragging = false;
            this.dragThreshold = 1; // 闾値を低くして反応性を向上
            this.lineEndpointSize = 8;
            this.selectedLineEndpoint = null;
            this.selectedCurvePoint = null;
            this.previewElement = null;
            this.previewElements = [];
            this.previewOffset = { x: 0, y: 0 };
            this.isPreviewMode = false;
            this.isResizingCircle = false;
            this.resizeHandle = null;
            this.isSelecting = false;
            this.selectionStart = null;
            this.selectionEnd = null;
            this.isObjectSelecting = false;
            this.objectSelectionStart = null;
            this.objectSelectionEnd = null;
            this.isDrawingCurve = false;
            this.curvePoints = [];
            this.currentCurve = null;
            this.groups = [];
            this.nextGroupId = 1;
            this.undoStack = [];
            this.redoStack = [];
        }

        showSuccessPopup(message) {
            // 既存のポップアップを削除
            const existingPopup = document.querySelector('.jenogram-success-popup');
            if (existingPopup) {
                existingPopup.remove();
            }
            
            // 新しいポップアップを作成
            const popup = document.createElement('div');
            popup.className = 'jenogram-success-popup';
            popup.textContent = message;
            
            document.body.appendChild(popup);
            
            // 3秒後に自動的に削除
            setTimeout(() => {
                if (popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                }
            }, 3000);
        }

        init(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.setupEventListeners();
            this.loadData();
            this.draw();
        }

        setupEventListeners() {
            this.canvas.addEventListener('click', this.handleClick.bind(this));
            this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
            this.canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this));
            this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
            this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
            this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
            
            // キーボードショートカット
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    this.undo();
                } else if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
                    e.preventDefault();
                    this.redo();
                } else if (e.key === 'Delete' && this.selectedElements.length > 0) {
                    e.preventDefault();
                    this.deleteSelectedElements();
                }
            });
            
            // ドキュメント全体でのクリックでメニューを閉じる
            document.addEventListener('click', (e) => {
                const menus = document.querySelectorAll('.jenogram-context-menu');
                let shouldHide = true;
                
                // exportボタンかメニュー内のクリックの場合は非表示にしない
                if (e.target.id === 'exportBtn' || e.target.closest('#exportBtn')) {
                    shouldHide = false;
                }
                
                menus.forEach(menu => {
                    if (menu.contains(e.target)) {
                        shouldHide = false;
                    }
                });
                
                if (shouldHide && menus.length > 0) {
                    console.log('DEBUG: グローバルクリックでコンテキストメニューを非表示');
                    this.hideContextMenu();
                }
            });
        }

        handleClick(e) {
            this.hideContextMenu();
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 曲線描画モードの処理
            if (this.isDrawingCurve) {
                this.addCurvePoint(x, y);
                return;
            }
            
            const element = this.getElementAt(x, y);
            if (element) {
                this.selectElement(element, e.ctrlKey);
            } else {
                if (!e.ctrlKey) {
                    this.clearSelection();
                }
            }
            this.draw();
        }

        handleDoubleClick(e) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const element = this.getElementAt(x, y);
            if (element && element.type === 'person') {
                this.editPersonText(element);
            } else if (element && element.type === 'text') {
                this.editText(element);
            }
        }

        handleContextMenu(e) {
            e.preventDefault();
            
            // 曲線描画モード中の右クリックで終了
            if (this.isDrawingCurve) {
                this.finishCurveDrawing();
                return;
            }
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const element = this.getElementAt(x, y);
            this.showContextMenu(e.clientX, e.clientY, element, x, y);
        }

        handleMouseDown(e) {
            if (e.button !== 0 || this.isSelecting) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.isDragging = false;
            this.mouseDownX = x;
            this.mouseDownY = y;
            
            // 囲み曲線の点チェック
            const curvePoint = this.getCurvePointAt(x, y);
            if (curvePoint) {
                this.selectedCurvePoint = curvePoint;
                return;
            }
            
            // 線の端点チェック
            const lineEndpoint = this.getLineEndpointAt(x, y);
            if (lineEndpoint) {
                this.selectedLineEndpoint = lineEndpoint;
                return;
            }
            
            const element = this.getElementAt(x, y);
            if (element) {
                if (element.type === 'circle' && element.selected) {
                    const resizeHandle = this.getCircleResizeHandle(element, x, y);
                    if (resizeHandle) {
                        this.isResizingCircle = true;
                        this.resizeHandle = element;
                        this.resizeMode = resizeHandle;
                        return;
                    }
                }
                
                if (this.selectedElements.includes(element)) {
                    this.draggedElement = element;
                    this.dragStartX = x;
                    this.dragStartY = y;
                    
                    // プレビュー用のオフセットを計算
                    this.previewOffset.x = x - element.x;
                    this.previewOffset.y = y - element.y;
                } else {
                    // 選択されていない要素の上でも範囲選択を開始
                    this.isObjectSelecting = true;
                    this.objectSelectionStart = { x: x, y: y };
                    this.objectSelectionEnd = { x: x, y: y };
                }
            } else {
                // 何もない場所でのクリック - 範囲選択を開始
                this.isObjectSelecting = true;
                this.objectSelectionStart = { x: x, y: y };
                this.objectSelectionEnd = { x: x, y: y };
            }
        }

        handleMouseMove(e) {
            if (this.isSelecting) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // オブジェクト範囲選択の処理
            if (this.isObjectSelecting && this.objectSelectionStart) {
                this.objectSelectionEnd = { x: x, y: y };
                this.draw();
                return;
            }
            
            this.updateCursor(x, y);
            
            // ドラッグ開始判定を早める
            if (!this.isDragging && this.mouseDownX !== undefined && this.mouseDownY !== undefined) {
                const distance = Math.sqrt((x - this.mouseDownX) ** 2 + (y - this.mouseDownY) ** 2);
                if (distance > this.dragThreshold) {
                    this.isDragging = true;
                }
            }
            
            // 曲線の点編集
            if (this.selectedCurvePoint) {
                this.updateCurvePoint(x, y);
                return;
            }
            
            // ライン端点編集
            if (this.selectedLineEndpoint) {
                this.updateLineEndpoint(e, x, y);
                return;
            }
            
            // 円のリサイズ
            if (this.isResizingCircle && this.resizeHandle) {
                this.updateCircleResize(x, y);
                return;
            }
            
            // 要素の移動
            if (this.draggedElement && this.isDragging) {
                this.updateElementPosition(e, x, y);
            }
        }

        updateLineEndpoint(e, x, y) {
            const { line, endpoint } = this.selectedLineEndpoint;
            
            // プレビューモードでの線端点編集
            this.isPreviewMode = true;
            
            // プレビュー線を作成
            this.previewElement = {
                type: 'line',
                x: line.x,
                y: line.y,
                data: Object.assign({}, line.data),
                isPreview: true
            };
            
            // プレビュー位置を計算
            let previewX = e.shiftKey ? x : this.snap(x);
            let previewY = e.shiftKey ? y : this.snap(y);
            
            if (endpoint === 'start') {
                this.previewElement.x = previewX;
                this.previewElement.y = previewY;
            } else {
                this.previewElement.data.endX = previewX;
                this.previewElement.data.endY = previewY;
            }
            
            this.draw();
        }

        updateCurvePoint(x, y) {
            const { curve, pointIndex } = this.selectedCurvePoint;
            
            // 曲線の点を更新
            const snappedX = this.snap(x);
            const snappedY = this.snap(y);
            
            curve.data.points[pointIndex].x = snappedX;
            curve.data.points[pointIndex].y = snappedY;
            
            this.draw();
        }

        updateCircleResize(x, y) {
            // プレビューモードでの円リサイズ
            this.isPreviewMode = true;
            
            // プレビュー円を作成
            this.previewElement = {
                type: 'circle',
                x: this.resizeHandle.x,
                y: this.resizeHandle.y,
                data: Object.assign({}, this.resizeHandle.data),
                isPreview: true
            };
            
            // 新しいサイズを計算
            const newSize = this.resizeCircle(this.resizeHandle, x, y, this.resizeMode);
            
            switch (this.resizeMode) {
                case 'radius':
                    this.previewElement.data.radius = newSize;
                    break;
                case 'width':
                    this.previewElement.data.width = newSize;
                    break;
                case 'height':
                    this.previewElement.data.height = newSize;
                    break;
            }
            
            this.draw();
        }

        updateElementPosition(e, x, y) {
            // プレビューモードでの操作
            if (this.draggedElement) {
                this.isPreviewMode = true;
                
                // プレビュー位置を計算
                let previewX = x - this.previewOffset.x;
                let previewY = y - this.previewOffset.y;
                
                // スナップ機能
                if (!e.shiftKey) {
                    if (this.draggedElement.type === 'text') {
                        previewX = this.snapText(previewX);
                        previewY = this.snapText(previewY);
                    } else {
                        previewX = this.snap(previewX);
                        previewY = this.snap(previewY);
                    }
                }
                
                // 移動量を計算
                const dx = previewX - this.draggedElement.x;
                const dy = previewY - this.draggedElement.y;
                
                // グループ化されたオブジェクトの場合、グループ全体のプレビューを作成
                if (this.draggedElement.groupId) {
                    const group = this.groups.find(g => g.id === this.draggedElement.groupId);
                    if (group) {
                        this.previewElements = [];
                        group.elements.forEach(element => {
                            const previewElement = {
                                type: element.type,
                                x: element.x + dx,
                                y: element.y + dy,
                                data: Object.assign({}, element.data),
                                isPreview: true
                            };
                            
                            // 線の場合、終点も調整
                            if (element.type === 'line') {
                                previewElement.data.endX = element.data.endX + dx;
                                previewElement.data.endY = element.data.endY + dy;
                            }
                            
                            // 曲線の場合、全ての点を調整
                            if (element.type === 'curve') {
                                previewElement.data.points = element.data.points.map(point => ({
                                    x: point.x + dx,
                                    y: point.y + dy
                                }));
                            }
                            
                            this.previewElements.push(previewElement);
                        });
                    }
                } else {
                    // 単一要素の場合、従来通り
                    this.previewElement = {
                        type: this.draggedElement.type,
                        x: previewX,
                        y: previewY,
                        data: Object.assign({}, this.draggedElement.data),
                        isPreview: true
                    };
                    
                    // 線の場合、終点も調整
                    if (this.draggedElement.type === 'line') {
                        this.previewElement.data.endX = this.draggedElement.data.endX + dx;
                        this.previewElement.data.endY = this.draggedElement.data.endY + dy;
                    }
                    
                    // 曲線の場合、全ての点を調整
                    if (this.draggedElement.type === 'curve') {
                        this.previewElement.data.points = this.draggedElement.data.points.map(point => ({
                            x: point.x + dx,
                            y: point.y + dy
                        }));
                    }
                }
                
                this.draw();
            }
        }


        handleMouseUp(e) {
            if (this.isSelecting) return;
            
            // オブジェクト範囲選択の終了処理
            if (this.isObjectSelecting && this.objectSelectionStart && this.objectSelectionEnd) {
                this.selectElementsInRegion();
                this.isObjectSelecting = false;
                this.objectSelectionStart = null;
                this.objectSelectionEnd = null;
                this.draw();
                return;
            }
            
            // プレビューモードでのドロップ処理
            if (this.isPreviewMode && this.draggedElement) {
                // グループプレビューの場合
                if (this.previewElements && this.previewElements.length > 0) {
                    this.previewElements.forEach((previewElement, index) => {
                        const originalElement = this.selectedElements[index];
                        if (originalElement) {
                            const dx = previewElement.x - originalElement.x;
                            const dy = previewElement.y - originalElement.y;
                            
                            originalElement.x = previewElement.x;
                            originalElement.y = previewElement.y;
                            
                            if (originalElement.type === 'line') {
                                originalElement.data.endX += dx;
                                originalElement.data.endY += dy;
                            } else if (originalElement.type === 'curve') {
                                originalElement.data.points = originalElement.data.points.map(point => ({
                                    x: point.x + dx,
                                    y: point.y + dy
                                }));
                            }
                        }
                    });
                }
                // 単一要素プレビューの場合
                else if (this.previewElement) {
                    this.selectedElements.forEach(element => {
                        if (element === this.draggedElement) {
                            const dx = this.previewElement.x - element.x;
                            const dy = this.previewElement.y - element.y;
                            
                            element.x = this.previewElement.x;
                            element.y = this.previewElement.y;
                            
                            if (element.type === 'line') {
                                element.data.endX += dx;
                                element.data.endY += dy;
                            } else if (element.type === 'curve') {
                                element.data.points = element.data.points.map(point => ({
                                    x: point.x + dx,
                                    y: point.y + dy
                                }));
                            }
                        }
                    });
                }
            }
            
            // 線端点編集のドロップ処理
            if (this.selectedLineEndpoint && this.previewElement) {
                const { line, endpoint } = this.selectedLineEndpoint;
                if (endpoint === 'start') {
                    line.x = this.previewElement.x;
                    line.y = this.previewElement.y;
                } else {
                    line.data.endX = this.previewElement.data.endX;
                    line.data.endY = this.previewElement.data.endY;
                }
            }
            
            // 円のリサイズのドロップ処理
            if (this.isResizingCircle && this.resizeHandle && this.previewElement) {
                if (this.resizeMode === 'radius') {
                    this.resizeHandle.data.radius = this.previewElement.data.radius;
                } else if (this.resizeMode === 'width') {
                    this.resizeHandle.data.width = this.previewElement.data.width;
                } else if (this.resizeMode === 'height') {
                    this.resizeHandle.data.height = this.previewElement.data.height;
                }
            }
            
            // 状態をリセット
            this.draggedElement = null;
            this.isResizingCircle = false;
            this.resizeHandle = null;
            this.selectedLineEndpoint = null;
            this.selectedCurvePoint = null;
            this.isDragging = false;
            this.isPreviewMode = false;
            this.previewElement = null;
            this.previewElements = [];
            this.mouseDownX = undefined;
            this.mouseDownY = undefined;
            
            // 最終リドロー
            this.draw();
        }

        snap(value) {
            return Math.round(value / this.gridSize) * this.gridSize;
        }

        snapText(value) {
            // テキスト用: 0.25マス移動 (gridSize / 4)
            const textGridSize = this.gridSize / 4;
            return Math.round(value / textGridSize) * textGridSize;
        }

        serializeElements() {
            return this.elements.map(element => ({
                id: element.id,
                type: element.type,
                x: element.x,
                y: element.y,
                data: element.data,
                selected: false // 選択状態は保存しない
            }));
        }

        deserializeElements(data) {
            return data.map(elementData => {
                const element = new JenogramElement(elementData.type, elementData.x, elementData.y, elementData.data);
                element.id = elementData.id;
                return element;
            });
        }

        // localStorage機能を削除

        pointToLineDistance(px, py, x1, y1, x2, y2) {
            const A = px - x1;
            const B = py - y1;
            const C = x2 - x1;
            const D = y2 - y1;
            
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            let param = -1;
            if (lenSq !== 0) {
                param = dot / lenSq;
            }
            
            let xx, yy;
            if (param < 0) {
                xx = x1;
                yy = y1;
            } else if (param > 1) {
                xx = x2;
                yy = y2;
            } else {
                xx = x1 + param * C;
                yy = y1 + param * D;
            }
            
            const dx = px - xx;
            const dy = py - yy;
            return Math.sqrt(dx * dx + dy * dy);
        }

        getLineEndpointAt(x, y) {
            for (let element of this.elements) {
                if (element.type === 'line') {
                    // 開始点のチェック
                    const startDist = Math.sqrt((x - element.x) ** 2 + (y - element.y) ** 2);
                    if (startDist <= this.lineEndpointSize) {
                        return { line: element, endpoint: 'start' };
                    }
                    
                    // 終点のチェック
                    const endDist = Math.sqrt((x - element.data.endX) ** 2 + (y - element.data.endY) ** 2);
                    if (endDist <= this.lineEndpointSize) {
                        return { line: element, endpoint: 'end' };
                    }
                }
            }
            return null;
        }

        getCurvePointAt(x, y) {
            for (let element of this.elements) {
                if (element.type === 'curve' && element.selected) {
                    const points = element.data.points || [];
                    for (let i = 0; i < points.length; i++) {
                        const point = points[i];
                        const dist = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
                        if (dist <= 8) { // クリック判定範囲
                            return { curve: element, pointIndex: i };
                        }
                    }
                }
            }
            return null;
        }

        getCircleResizeHandle(circle, x, y) {
            const dx = x - circle.x;
            const dy = y - circle.y;
            
            if (circle.data.type === 'ellipse') {
                const width = circle.data.width || 120;
                const height = circle.data.height || 80;
                
                // 横方向のハンドル（判定範囲を拡大）
                if (Math.abs(dx - width/2) <= 15 && Math.abs(dy) <= 15) {
                    return 'width';
                }
                // 縦方向のハンドル（判定範囲を拡大）
                if (Math.abs(dy - height/2) <= 15 && Math.abs(dx) <= 15) {
                    return 'height';
                }
            } else {
                const radius = circle.data.radius || 80;
                const distance = Math.sqrt(dx * dx + dy * dy);
                // 半径の判定範囲を拡大し、大きな円でも安定動作
                if (Math.abs(distance - radius) <= Math.max(15, radius * 0.1)) {
                    return 'radius';
                }
            }
            return null;
        }

        resizeCircle(circle, x, y, mode) {
            const dx = x - circle.x;
            const dy = y - circle.y;
            
            switch (mode) {
                case 'radius':
                    const newRadius = Math.sqrt(dx * dx + dy * dy);
                    return Math.max(15, Math.min(300, newRadius)); // 最小15、最大300で制限
                case 'width':
                    const newWidth = Math.abs(dx) * 2;
                    return Math.max(20, Math.min(400, newWidth)); // 最小20、最大400で制限
                case 'height':
                    const newHeight = Math.abs(dy) * 2;
                    return Math.max(20, Math.min(300, newHeight)); // 最小20、最大300で制限
            }
        }

        updateCursor(x, y) {
            const curvePoint = this.getCurvePointAt(x, y);
            if (curvePoint) {
                this.canvas.style.cursor = 'crosshair';
                return;
            }
            
            const lineEndpoint = this.getLineEndpointAt(x, y);
            if (lineEndpoint) {
                this.canvas.style.cursor = 'crosshair';
                return;
            }
            
            const element = this.getElementAt(x, y);
            if (element) {
                if (element.type === 'circle' && element.selected) {
                    const resizeHandle = this.getCircleResizeHandle(element, x, y);
                    if (resizeHandle) {
                        switch (resizeHandle) {
                            case 'width':
                                this.canvas.style.cursor = 'ew-resize';
                                break;
                            case 'height':
                                this.canvas.style.cursor = 'ns-resize';
                                break;
                            case 'radius':
                                this.canvas.style.cursor = 'nw-resize';
                                break;
                        }
                        return;
                    }
                }
                this.canvas.style.cursor = 'move';
            } else {
                this.canvas.style.cursor = 'default';
            }
        }

        getElementAt(x, y) {
            for (let i = this.elements.length - 1; i >= 0; i--) {
                const element = this.elements[i];
                if (this.isPointInElement(x, y, element)) {
                    return element;
                }
            }
            return null;
        }

        isPointInElement(x, y, element) {
            switch (element.type) {
                case 'person':
                    const size = 50; // サイズを大きく
                    return x >= element.x - size/2 && x <= element.x + size/2 &&
                           y >= element.y - size/2 && y <= element.y + size/2;
                case 'line':
                    // 線の当たり判定を改善
                    const startX = element.x;
                    const startY = element.y;
                    const endX = element.data.endX;
                    const endY = element.data.endY;
                    const distance = this.pointToLineDistance(x, y, startX, startY, endX, endY);
                    return distance <= 8;
                case 'circle':
                    const dx = x - element.x;
                    const dy = y - element.y;
                    const tolerance = 8; // クリック判定の幅
                    
                    if (element.data.type === 'ellipse') {
                        const width = element.data.width || 120;
                        const height = element.data.height || 80;
                        const rx = width / 2;
                        const ry = height / 2;
                        
                        // 楕円の枠との距離を計算
                        const normalizedDistance = Math.sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry));
                        return Math.abs(normalizedDistance - 1) <= tolerance / Math.min(rx, ry);
                    } else {
                        const radius = element.data.radius || 80;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        // 円の枠との距離をチェック（内側と外側の両方を許容）
                        return Math.abs(distance - radius) <= tolerance;
                    }
                case 'curve':
                    // 曲線の当たり判定 - 各線分との距離をチェック
                    const points = element.data.points || [];
                    if (points.length < 2) return false;
                    
                    for (let i = 0; i < points.length - 1; i++) {
                        const dist = this.pointToLineDistance(x, y, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
                        if (dist <= 8) return true;
                    }
                    
                    // 閉じた曲線の場合、最後の点と最初の点を結ぶ線分もチェック
                    if (element.data.closed && points.length >= 3) {
                        const lastPoint = points[points.length - 1];
                        const firstPoint = points[0];
                        const dist = this.pointToLineDistance(x, y, lastPoint.x, lastPoint.y, firstPoint.x, firstPoint.y);
                        if (dist <= 8) return true;
                    }
                    return false;
                case 'text':
                    // テキストの当たり判定 - 概算のバウンディングボックス
                    const fontSize = element.data.fontSize || 14;
                    const content = element.data.content || '';
                    const width = content.length * fontSize * 0.6; // 概算の文字幅
                    const height = fontSize + 4;
                    return x >= element.x - width/2 && x <= element.x + width/2 &&
                           y >= element.y - height/2 && y <= element.y + height/2;
                default:
                    return false;
            }
        }

        selectElement(element, addToSelection = false) {
            if (!addToSelection) {
                this.clearSelection();
            }
            
            // グループ化されたオブジェクトの場合、グループ全体を選択
            if (element.groupId) {
                const group = this.groups.find(g => g.id === element.groupId);
                if (group) {
                    group.elements.forEach(groupElement => {
                        if (!this.selectedElements.includes(groupElement)) {
                            this.selectedElements.push(groupElement);
                            groupElement.selected = true;
                        }
                    });
                    return;
                }
            }
            
            if (!this.selectedElements.includes(element)) {
                this.selectedElements.push(element);
                element.selected = true;
            }
        }

        selectElementsInRegion() {
            if (!this.objectSelectionStart || !this.objectSelectionEnd) return;
            
            const minX = Math.min(this.objectSelectionStart.x, this.objectSelectionEnd.x);
            const maxX = Math.max(this.objectSelectionStart.x, this.objectSelectionEnd.x);
            const minY = Math.min(this.objectSelectionStart.y, this.objectSelectionEnd.y);
            const maxY = Math.max(this.objectSelectionStart.y, this.objectSelectionEnd.y);
            
            // 小さすぎる選択範囲は無効
            if (maxX - minX < 10 || maxY - minY < 10) {
                return;
            }
            
            this.clearSelection();
            
            const selectedGroups = new Set();
            
            this.elements.forEach(element => {
                if (this.isElementInRegion(element, minX, minY, maxX, maxY)) {
                    // グループ化された要素の場合、グループ全体を選択
                    if (element.groupId && !selectedGroups.has(element.groupId)) {
                        selectedGroups.add(element.groupId);
                        const group = this.groups.find(g => g.id === element.groupId);
                        if (group) {
                            group.elements.forEach(groupElement => {
                                if (!this.selectedElements.includes(groupElement)) {
                                    this.selectedElements.push(groupElement);
                                    groupElement.selected = true;
                                }
                            });
                        }
                    } else if (!element.groupId) {
                        // グループ化されていない要素は単独で選択
                        if (!this.selectedElements.includes(element)) {
                            this.selectedElements.push(element);
                            element.selected = true;
                        }
                    }
                }
            });
        }

        isElementInRegion(element, minX, minY, maxX, maxY) {
            switch (element.type) {
                case 'person':
                    const size = 50;
                    return element.x - size/2 < maxX && element.x + size/2 > minX &&
                           element.y - size/2 < maxY && element.y + size/2 > minY;
                case 'line':
                    return (element.x >= minX && element.x <= maxX && element.y >= minY && element.y <= maxY) ||
                           (element.data.endX >= minX && element.data.endX <= maxX && element.data.endY >= minY && element.data.endY <= maxY);
                case 'circle':
                    const radius = element.data.radius || 80;
                    const width = element.data.width || 120;
                    const height = element.data.height || 80;
                    
                    if (element.data.type === 'ellipse') {
                        return element.x - width/2 < maxX && element.x + width/2 > minX &&
                               element.y - height/2 < maxY && element.y + height/2 > minY;
                    } else {
                        return element.x - radius < maxX && element.x + radius > minX &&
                               element.y - radius < maxY && element.y + radius > minY;
                    }
                case 'curve':
                    const points = element.data.points || [];
                    return points.some(point => 
                        point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
                    );
                case 'text':
                    return element.x >= minX && element.x <= maxX && element.y >= minY && element.y <= maxY;
                default:
                    return false;
            }
        }

        clearSelection() {
            this.selectedElements.forEach(element => {
                element.selected = false;
            });
            this.selectedElements = [];
        }

        createGroup() {
            if (this.selectedElements.length < 2) {
                alert('グループ化するには2つ以上のオブジェクトを選択してください');
                return;
            }

            const groupId = this.nextGroupId++;
            const group = {
                id: groupId,
                elements: [...this.selectedElements]
            };

            // 選択された要素をグループに追加
            this.selectedElements.forEach(element => {
                element.groupId = groupId;
            });

            this.groups.push(group);
            this.draw();
        }

        deleteGroup(groupId) {
            const group = this.groups.find(g => g.id === groupId);
            if (!group) return;

            this.saveStateForUndo();

            // グループ内の全要素を削除
            group.elements.forEach(element => {
                const index = this.elements.indexOf(element);
                if (index > -1) {
                    this.elements.splice(index, 1);
                    this.selectedElements = this.selectedElements.filter(e => e !== element);
                }
            });

            // グループを削除
            this.groups = this.groups.filter(g => g.id !== groupId);
            this.draw();
        }

        ungroupElements(groupId) {
            const group = this.groups.find(g => g.id === groupId);
            if (!group) return;

            // 要素からグループIDを削除
            group.elements.forEach(element => {
                delete element.groupId;
            });

            // グループを削除
            this.groups = this.groups.filter(g => g.id !== groupId);
            this.draw();
        }

        deleteSelectedElements() {
            [...this.selectedElements].forEach(element => {
                this.deleteElement(element);
            });
            this.clearSelection();
            this.draw();
        }

        showContextMenu(clientX, clientY, element, canvasX, canvasY) {
            this.hideContextMenu();
            
            const menu = document.createElement('div');
            menu.className = 'jenogram-context-menu';
            menu.style.left = clientX + 'px';
            menu.style.top = clientY + 'px';
            
            // 複数選択時のメニュー
            if (this.selectedElements.length > 1) {
                this.addMenuItem(menu, '選択要素を削除', () => {
                    this.deleteSelectedElements();
                    this.hideContextMenu();
                });
                
                // 選択された要素がすべて同じグループに属している場合はグループ化解除を表示
                const firstGroupId = this.selectedElements[0].groupId;
                const allSameGroup = firstGroupId && this.selectedElements.every(elem => elem.groupId === firstGroupId);
                
                if (allSameGroup) {
                    this.addMenuItem(menu, 'グループ化を解除', () => {
                        this.ungroupElements(firstGroupId);
                        this.hideContextMenu();
                    });
                } else {
                    this.addMenuItem(menu, 'グループ化', () => {
                        this.createGroup();
                        this.hideContextMenu();
                    });
                }
            }
            // グループ化された要素のメニュー
            else if (element && element.groupId) {
                this.addMenuItem(menu, 'グループを削除', () => {
                    this.deleteGroup(element.groupId);
                    this.hideContextMenu();
                });
                this.addMenuItem(menu, 'グループ化を解除', () => {
                    this.ungroupElements(element.groupId);
                    this.hideContextMenu();
                });
            }
            // 単一要素のメニュー
            else if (element && element.type === 'person') {
                // 人物記号のメニュー
                this.addMenuItem(menu, '対象者に指定', () => {
                    element.data.isTarget = !element.data.isTarget;
                    this.hideContextMenu();
                    this.draw();
                });
                this.addMenuItem(menu, '死亡者に指定', () => {
                    element.data.isDead = !element.data.isDead;
                    this.hideContextMenu();
                    this.draw();
                });
                this.addMenuSeparator(menu);
                this.addMenuItem(menu, '削除', () => {
                    this.deleteElement(element);
                    this.hideContextMenu();
                    this.draw();
                });
            } else if (element && element.type === 'line') {
                // 線のメニュー
                const isDashed = element.data.dashed || false;
                const isWavy = element.data.wavy || false;
                
                if (!isDashed && !isWavy) {
                    this.addMenuItem(menu, '点線にする', () => {
                        this.saveStateForUndo();
                        element.data.dashed = true;
                        element.data.wavy = false;
                        this.hideContextMenu();
                        this.draw();
                    });
                    this.addMenuItem(menu, '波線にする', () => {
                        this.saveStateForUndo();
                        element.data.wavy = true;
                        element.data.dashed = false;
                        this.hideContextMenu();
                        this.draw();
                    });
                } else if (isDashed) {
                    this.addMenuItem(menu, '実線にする', () => {
                        this.saveStateForUndo();
                        element.data.dashed = false;
                        this.hideContextMenu();
                        this.draw();
                    });
                    this.addMenuItem(menu, '波線にする', () => {
                        this.saveStateForUndo();
                        element.data.wavy = true;
                        element.data.dashed = false;
                        this.hideContextMenu();
                        this.draw();
                    });
                } else if (isWavy) {
                    this.addMenuItem(menu, '実線にする', () => {
                        this.saveStateForUndo();
                        element.data.wavy = false;
                        this.hideContextMenu();
                        this.draw();
                    });
                    this.addMenuItem(menu, '点線にする', () => {
                        this.saveStateForUndo();
                        element.data.dashed = true;
                        element.data.wavy = false;
                        this.hideContextMenu();
                        this.draw();
                    });
                }
                
                this.addMenuSeparator(menu);
                this.addMenuItem(menu, '削除', () => {
                    this.deleteElement(element);
                    this.hideContextMenu();
                    this.draw();
                });
            } else if (element && element.type === 'circle') {
                // 円のメニュー
                const isDashed = element.data.dashed || false;
                this.addMenuItem(menu, isDashed ? '実線にする' : '点線にする', () => {
                    element.data.dashed = !isDashed;
                    this.hideContextMenu();
                    this.draw();
                });
                this.addMenuSeparator(menu);
                this.addMenuItem(menu, '削除', () => {
                    this.deleteElement(element);
                    this.hideContextMenu();
                    this.draw();
                });
            } else if (element && element.type === 'curve') {
                // 曲線のメニュー
                const isDashed = element.data.dashed || false;
                this.addMenuItem(menu, isDashed ? '実線にする' : '点線にする', () => {
                    this.saveStateForUndo();
                    element.data.dashed = !isDashed;
                    this.hideContextMenu();
                    this.draw();
                });
                this.addMenuSeparator(menu);
                this.addMenuItem(menu, '削除', () => {
                    this.deleteElement(element);
                    this.hideContextMenu();
                    this.draw();
                });
            } else if (element && element.type === 'text') {
                // テキストのメニュー
                this.addMenuItem(menu, 'フォントの変更', () => {
                    this.changeTextFont(element);
                    this.hideContextMenu();
                });
                this.addMenuItem(menu, 'フォントサイズの変更', () => {
                    this.changeTextSize(element);
                    this.hideContextMenu();
                });
                this.addMenuItem(menu, element.data.showBorder ? '外枠を非表示' : '外枠の表示', () => {
                    this.saveStateForUndo();
                    element.data.showBorder = !element.data.showBorder;
                    this.hideContextMenu();
                    this.draw();
                });
                this.addMenuItem(menu, '回転', () => {
                    this.rotateText(element);
                    this.hideContextMenu();
                });
                this.addMenuSeparator(menu);
                this.addMenuItem(menu, '削除', () => {
                    this.deleteElement(element);
                    this.hideContextMenu();
                    this.draw();
                });
            } else {
                // 空の場所のメニュー
                this.addMenuItem(menu, '人物記号の追加', () => {
                    this.showPersonSubmenu(menu, canvasX, canvasY);
                });
                this.addMenuItem(menu, '関係線の追加', () => {
                    this.showLineSubmenu(menu, canvasX, canvasY);
                });
                this.addMenuItem(menu, '居住円の追加', () => {
                    this.showCircleSubmenu(menu, canvasX, canvasY);
                });
                this.addMenuItem(menu, 'テキストの追加', () => {
                    this.addText(canvasX, canvasY);
                    this.hideContextMenu();
                });
            }
            
            document.body.appendChild(menu);
            this.contextMenu = menu;
            
            // メニュー外クリックで閉じるはグローバルリスナーで処理
        }

        addMenuItem(menu, text, onclick) {
            const item = document.createElement('div');
            item.className = 'jenogram-menu-item';
            item.textContent = text;
            item.onclick = onclick;
            menu.appendChild(item);
        }

        addMenuSeparator(menu) {
            const separator = document.createElement('div');
            separator.className = 'jenogram-menu-separator';
            menu.appendChild(separator);
        }

        showPersonSubmenu(parentMenu, x, y) {
            const submenu = document.createElement('div');
            submenu.className = 'jenogram-context-menu';
            const rect = parentMenu.getBoundingClientRect();
            submenu.style.left = (rect.right) + 'px';
            submenu.style.top = rect.top + 'px';
            
            this.addMenuItem(submenu, '男性 □', () => {
                this.addPerson(x, y, 'male');
                this.hideContextMenu();
            });
            this.addMenuItem(submenu, '女性 ○', () => {
                this.addPerson(x, y, 'female');
                this.hideContextMenu();
            });
            this.addMenuItem(submenu, '性別不明 △', () => {
                this.addPerson(x, y, 'unknown');
                this.hideContextMenu();
            });
            
            document.body.appendChild(submenu);
            this.contextMenu = submenu;
        }

        showLineSubmenu(parentMenu, x, y) {
            const submenu = document.createElement('div');
            submenu.className = 'jenogram-context-menu';
            const rect = parentMenu.getBoundingClientRect();
            submenu.style.left = (rect.right) + 'px';
            submenu.style.top = rect.top + 'px';
            
            this.addMenuItem(submenu, '実線', () => {
                this.addLine(x, y, 'solid');
                this.hideContextMenu();
            });
            this.addMenuItem(submenu, '二重線', () => {
                this.addLine(x, y, 'double');
                this.hideContextMenu();
            });
            this.addMenuItem(submenu, '点線', () => {
                this.addLine(x, y, 'dotted');
                this.hideContextMenu();
            });
            this.addMenuItem(submenu, '波線', () => {
                this.addLine(x, y, 'wave');
                this.hideContextMenu();
            });
            this.addMenuItem(submenu, '離婚線 //', () => {
                this.addLine(x, y, 'divorce');
                this.hideContextMenu();
            });
            
            document.body.appendChild(submenu);
            this.contextMenu = submenu;
        }

        showCircleSubmenu(parentMenu, x, y) {
            const submenu = document.createElement('div');
            submenu.className = 'jenogram-context-menu';
            const rect = parentMenu.getBoundingClientRect();
            submenu.style.left = (rect.right) + 'px';
            submenu.style.top = rect.top + 'px';
            
            this.addMenuItem(submenu, '丸円', () => {
                this.addCircle(x, y, 'circle');
                this.hideContextMenu();
            });
            this.addMenuItem(submenu, '楕円', () => {
                this.addCircle(x, y, 'ellipse');
                this.hideContextMenu();
            });
            this.addMenuItem(submenu, '囲み曲線', () => {
                this.startCurveDrawing();
                this.hideContextMenu();
            });
            
            document.body.appendChild(submenu);
            this.contextMenu = submenu;
        }

        hideContextMenu() {
            console.log('DEBUG: hideContextMenu呼び出し');
            const menus = document.querySelectorAll('.jenogram-context-menu');
            console.log('DEBUG: 削除対象のメニュー数:', menus.length);
            menus.forEach((menu, index) => {
                console.log('DEBUG: メニュー', index, 'を削除:', menu);
                if (menu.parentNode) {
                    menu.parentNode.removeChild(menu);
                } else {
                    menu.remove();
                }
            });
            this.contextMenu = null;
        }

        addPerson(x, y, gender) {
            this.saveStateForUndo();
            const person = new JenogramElement('person', this.snap(x), this.snap(y), {
                gender: gender,
                text: '',
                isTarget: false,
                isDead: false
            });
            this.elements.push(person);
            this.draw();
        }

        addLine(x, y, lineType) {
            this.saveStateForUndo();
            const line = new JenogramElement('line', this.snap(x), this.snap(y), {
                type: lineType,
                endX: this.snap(x + 120), // 線のデフォルト長さを大きく
                endY: this.snap(y)
            });
            this.elements.push(line);
            this.draw();
        }

        addCircle(x, y, circleType) {
            this.saveStateForUndo();
            const circle = new JenogramElement('circle', this.snap(x), this.snap(y), {
                type: circleType,
                radius: 80, // デフォルトサイズを大きく
                width: circleType === 'ellipse' ? 120 : 80,
                height: circleType === 'ellipse' ? 80 : 80
            });
            this.elements.push(circle);
            this.draw();
        }

        addText(x, y) {
            this.saveStateForUndo();
            const text = new JenogramElement('text', this.snapText(x), this.snapText(y), {
                content: 'テキスト',
                fontSize: 14,
                fontFamily: 'Arial, sans-serif',
                color: '#000000',
                showBorder: false,
                rotation: 0
            });
            this.elements.push(text);
            this.draw();
            
            // 作成後すぐに編集モードに
            setTimeout(() => {
                this.editText(text);
            }, 100);
        }

        startCurveDrawing() {
            this.saveStateForUndo();
            this.isDrawingCurve = true;
            this.curvePoints = [];
            this.currentCurve = null;
            this.canvas.style.cursor = 'crosshair';
            this.showSuccessPopup('曲線を描画するには、クリックして点を追加してください。右クリックで終了します。');
        }

        addCurvePoint(x, y) {
            if (this.isDrawingCurve) {
                const point = { x: this.snap(x), y: this.snap(y) };
                
                // 最初の点の場合、曲線を初期化
                if (!this.currentCurve) {
                    this.currentCurve = new JenogramElement('curve', this.snap(x), this.snap(y), {
                        points: [point],
                        closed: false
                    });
                    this.curvePoints = [point];
                } else {
                    // 2点目以降の場合、点を追加
                    this.curvePoints.push(point);
                    this.currentCurve.data.points = [...this.curvePoints];
                }
                
                this.draw();
            }
        }

        finishCurveDrawing() {
            if (this.isDrawingCurve && this.currentCurve && this.curvePoints.length >= 3) {
                // 曲線を閉じる
                this.currentCurve.data.closed = true;
                this.elements.push(this.currentCurve);
            }
            this.isDrawingCurve = false;
            this.curvePoints = [];
            this.currentCurve = null;
            this.canvas.style.cursor = 'default';
            this.draw();
        }

        saveStateForUndo() {
            // 現在の状態をdeep copyして保存
            const state = JSON.parse(JSON.stringify(this.elements));
            this.undoStack.push(state);
            
            // スタックサイズを制限（50回まで）
            if (this.undoStack.length > 50) {
                this.undoStack.shift();
            }
            
            // redo スタックをクリア
            this.redoStack = [];
        }

        undo() {
            if (this.undoStack.length === 0) return;
            
            // 現在の状態をredoスタックに保存
            const currentState = JSON.parse(JSON.stringify(this.elements));
            this.redoStack.push(currentState);
            
            // 前の状態を復元
            const previousState = this.undoStack.pop();
            this.elements = previousState.map(elem => {
                const element = new JenogramElement(elem.type, elem.x, elem.y, elem.data);
                element.id = elem.id;
                element.selected = false; // 選択状態はクリア
                return element;
            });
            
            this.selectedElements = [];
            this.draw();
        }

        redo() {
            if (this.redoStack.length === 0) return;
            
            // 現在の状態をundoスタックに保存
            const currentState = JSON.parse(JSON.stringify(this.elements));
            this.undoStack.push(currentState);
            
            // 次の状態を復元
            const nextState = this.redoStack.pop();
            this.elements = nextState.map(elem => {
                const element = new JenogramElement(elem.type, elem.x, elem.y, elem.data);
                element.id = elem.id;
                element.selected = false; // 選択状態はクリア
                return element;
            });
            
            this.selectedElements = [];
            this.draw();
        }

        editText(text) {
            const dialog = document.createElement('div');
            dialog.className = 'jenogram-input-dialog';
            dialog.innerHTML = `
                <div>テキストを入力してください:</div>
                <input type="text" class="jenogram-input" value="${text.data.content || ''}" id="textContent">
                <div class="jenogram-dialog-buttons">
                    <button class="jenogram-btn-secondary" onclick="document.querySelector('.jenogram-input-dialog').remove()">キャンセル</button>
                    <button class="jenogram-btn-secondary" id="saveTextBtn">保存</button>
                </div>
            `;
            
            document.body.appendChild(dialog);
            
            dialog.querySelector('#saveTextBtn').onclick = () => {
                this.saveStateForUndo();
                const newContent = dialog.querySelector('#textContent').value;
                text.data.content = newContent;
                this.draw();
                dialog.remove();
            };
            
            // Enter キーで保存
            dialog.querySelector('#textContent').addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    dialog.querySelector('#saveTextBtn').click();
                }
            });
            
            // フォーカスを当てる
            dialog.querySelector('#textContent').focus();
            dialog.querySelector('#textContent').select();
        }

        changeTextFont(text) {
            const dialog = document.createElement('div');
            dialog.className = 'jenogram-input-dialog';
            dialog.innerHTML = `
                <div>フォントファミリーを選択してください:</div>
                <select class="jenogram-input" id="fontSelect">
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                    <option value="'Courier New', monospace">Courier New</option>
                    <option value="'Helvetica', sans-serif">Helvetica</option>
                    <option value="'Georgia', serif">Georgia</option>
                </select>
                <div class="jenogram-dialog-buttons">
                    <button class="jenogram-btn-secondary" onclick="document.querySelector('.jenogram-input-dialog').remove()">キャンセル</button>
                    <button class="jenogram-btn-secondary" id="saveFontBtn">保存</button>
                </div>
            `;
            
            document.body.appendChild(dialog);
            
            // 現在のフォントを選択
            dialog.querySelector('#fontSelect').value = text.data.fontFamily || 'Arial, sans-serif';
            
            dialog.querySelector('#saveFontBtn').onclick = () => {
                this.saveStateForUndo();
                text.data.fontFamily = dialog.querySelector('#fontSelect').value;
                this.draw();
                dialog.remove();
            };
        }

        changeTextSize(text) {
            const dialog = document.createElement('div');
            dialog.className = 'jenogram-input-dialog';
            dialog.innerHTML = `
                <div>フォントサイズを入力してください:</div>
                <input type="number" class="jenogram-input" value="${text.data.fontSize || 14}" min="8" max="72" id="fontSize">
                <div class="jenogram-dialog-buttons">
                    <button class="jenogram-btn-secondary" onclick="document.querySelector('.jenogram-input-dialog').remove()">キャンセル</button>
                    <button class="jenogram-btn-secondary" id="saveSizeBtn">保存</button>
                </div>
            `;
            
            document.body.appendChild(dialog);
            
            dialog.querySelector('#saveSizeBtn').onclick = () => {
                this.saveStateForUndo();
                const newSize = parseInt(dialog.querySelector('#fontSize').value);
                text.data.fontSize = Math.max(8, Math.min(72, newSize));
                this.draw();
                dialog.remove();
            };
            
            // Enter キーで保存
            dialog.querySelector('#fontSize').addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    dialog.querySelector('#saveSizeBtn').click();
                }
            });
        }

        rotateText(text) {
            const dialog = document.createElement('div');
            dialog.className = 'jenogram-input-dialog';
            dialog.innerHTML = `
                <div>回転角度を入力してください（度）:</div>
                <input type="number" class="jenogram-input" value="${text.data.rotation || 0}" min="-360" max="360" step="15" id="rotation">
                <div class="jenogram-dialog-buttons">
                    <button class="jenogram-btn-secondary" onclick="document.querySelector('.jenogram-input-dialog').remove()">キャンセル</button>
                    <button class="jenogram-btn-secondary" id="saveRotationBtn">保存</button>
                </div>
            `;
            
            document.body.appendChild(dialog);
            
            dialog.querySelector('#saveRotationBtn').onclick = () => {
                this.saveStateForUndo();
                const newRotation = parseFloat(dialog.querySelector('#rotation').value);
                text.data.rotation = newRotation % 360;
                this.draw();
                dialog.remove();
            };
            
            // Enter キーで保存
            dialog.querySelector('#rotation').addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    dialog.querySelector('#saveRotationBtn').click();
                }
            });
        }


        editPersonText(person) {
            const dialog = document.createElement('div');
            dialog.className = 'jenogram-input-dialog';
            dialog.innerHTML = `
                <div>数値を入力してください:</div>
                <input type="text" class="jenogram-input" value="${person.data.text || ''}" id="personText">
                <div class="jenogram-dialog-buttons">
                    <button class="jenogram-btn-secondary" onclick="this.closest('.jenogram-input-dialog').remove()">キャンセル</button>
                    <button class="jenogram-btn" onclick="window.jenogramEditor.savePersonText('${person.id}', document.getElementById('personText').value)">OK</button>
                </div>
            `;
            document.body.appendChild(dialog);
        }

        savePersonText(personId, text) {
            const person = this.elements.find(e => e.id == personId);
            if (person) {
                person.data.text = text;
                this.draw();
            }
            document.querySelector('.jenogram-input-dialog').remove();
        }

        deleteElement(element) {
            this.saveStateForUndo();
            const index = this.elements.indexOf(element);
            if (index > -1) {
                this.elements.splice(index, 1);
                this.selectedElements = this.selectedElements.filter(e => e !== element);
            }
        }

        draw() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawGrid();
            
            // 通常の要素を描画
            this.elements.forEach(element => {
                // ドラッグ中の要素は半透明で描画
                if (this.isPreviewMode && this.selectedElements.includes(element)) {
                    this.ctx.globalAlpha = 0.3;
                    this.drawElement(element);
                    this.ctx.globalAlpha = 1.0;
                } else {
                    this.drawElement(element);
                }
            });
            
            // プレビュー要素を描画
            if (this.isPreviewMode) {
                this.ctx.globalAlpha = 0.8;
                
                // グループプレビューの場合
                if (this.previewElements && this.previewElements.length > 0) {
                    this.previewElements.forEach(previewElement => {
                        this.drawElement(previewElement);
                    });
                }
                // 単一要素プレビューの場合
                else if (this.previewElement) {
                    this.drawElement(this.previewElement);
                }
                
                this.ctx.globalAlpha = 1.0;
            }
            
            // 進行中の曲線を描画
            if (this.isDrawingCurve && this.currentCurve) {
                this.ctx.globalAlpha = 0.7;
                this.drawCurve(this.currentCurve);
                this.ctx.globalAlpha = 1.0;
            }
            
            // オブジェクト範囲選択の矩形を描画
            if (this.isObjectSelecting && this.objectSelectionStart && this.objectSelectionEnd) {
                this.ctx.save();
                this.ctx.strokeStyle = '#007bff';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 5]);
                this.ctx.fillStyle = 'rgba(0, 123, 255, 0.1)';
                
                const x = Math.min(this.objectSelectionStart.x, this.objectSelectionEnd.x);
                const y = Math.min(this.objectSelectionStart.y, this.objectSelectionEnd.y);
                const width = Math.abs(this.objectSelectionEnd.x - this.objectSelectionStart.x);
                const height = Math.abs(this.objectSelectionEnd.y - this.objectSelectionStart.y);
                
                this.ctx.fillRect(x, y, width, height);
                this.ctx.strokeRect(x, y, width, height);
                this.ctx.restore();
            }
        }

        drawGrid() {
            this.ctx.strokeStyle = '#e0e0e0';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([2, 2]);
            
            for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.canvas.height);
                this.ctx.stroke();
            }
            
            for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvas.width, y);
                this.ctx.stroke();
            }
            
            this.ctx.setLineDash([]);
        }

        drawElement(element) {
            this.ctx.save();
            
            if (element.selected) {
                this.ctx.strokeStyle = '#007bff';
                this.ctx.lineWidth = 3;
            } else {
                this.ctx.strokeStyle = '#333';
                this.ctx.lineWidth = 2;
            }
            
            switch (element.type) {
                case 'person':
                    this.drawPerson(element);
                    break;
                case 'line':
                    this.drawLine(element);
                    break;
                case 'circle':
                    this.drawCircle(element);
                    break;
                case 'curve':
                    this.drawCurve(element);
                    break;
                case 'text':
                    this.drawText(element);
                    break;
            }
            
            this.ctx.restore();
        }

        drawPerson(person) {
            const size = 50;
            const x = person.x;
            const y = person.y;
            
            this.ctx.fillStyle = 'transparent'; // 塗りつぶしを無しに
            this.ctx.lineWidth = person.selected ? 4 : 3;
            this.ctx.strokeStyle = person.selected ? '#007bff' : '#333';
            
            switch (person.data.gender) {
                case 'male':
                    // 塗りつぶしは行わない
                    this.ctx.strokeRect(x - size/2, y - size/2, size, size);
                    if (person.data.isTarget) {
                        this.ctx.strokeRect(x - size/2 + 5, y - size/2 + 5, size - 10, size - 10);
                    }
                    break;
                case 'female':
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, size/2, 0, 2 * Math.PI);
                    // 塗りつぶしは行わない
                    this.ctx.stroke();
                    if (person.data.isTarget) {
                        this.ctx.beginPath();
                        this.ctx.arc(x, y, size/2 - 5, 0, 2 * Math.PI);
                        this.ctx.stroke();
                    }
                    break;
                case 'unknown':
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y - size/2);
                    this.ctx.lineTo(x - size/2, y + size/2);
                    this.ctx.lineTo(x + size/2, y + size/2);
                    this.ctx.closePath();
                    // 塗りつぶしは行わない
                    this.ctx.stroke();
                    if (person.data.isTarget) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(x, y - size/2 + 5);
                        this.ctx.lineTo(x - size/2 + 5, y + size/2 - 5);
                        this.ctx.lineTo(x + size/2 - 5, y + size/2 - 5);
                        this.ctx.closePath();
                        this.ctx.stroke();
                    }
                    break;
            }
            
            // 死亡者の×マークを表示
            if (person.data.isDead) {
                this.ctx.strokeStyle = '#000000'; // 黒色に変更
                this.ctx.lineWidth = 3;
                const crossSize = size * 0.6;
                this.ctx.beginPath();
                this.ctx.moveTo(x - crossSize/2, y - crossSize/2);
                this.ctx.lineTo(x + crossSize/2, y + crossSize/2);
                this.ctx.moveTo(x + crossSize/2, y - crossSize/2);
                this.ctx.lineTo(x - crossSize/2, y + crossSize/2);
                this.ctx.stroke();
                this.ctx.strokeStyle = person.selected ? '#007bff' : '#333';
            }
            
            // テキストを描画
            if (person.data.text) {
                this.ctx.fillStyle = '#333';
                this.ctx.font = 'bold 16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(person.data.text, x, y);
            }
        }

        drawLine(line) {
            const startX = line.x;
            const startY = line.y;
            const endX = line.data.endX;
            const endY = line.data.endY;
            
            this.ctx.lineWidth = line.selected ? 4 : 3;
            this.ctx.strokeStyle = line.selected ? '#007bff' : '#333';
            this.ctx.beginPath();
            
            // 新しい線種プロパティを優先
            if (line.data.dashed) {
                this.ctx.setLineDash([8, 8]);
                this.ctx.moveTo(startX, startY);
                this.ctx.lineTo(endX, endY);
            } else if (line.data.wavy) {
                this.ctx.setLineDash([]);
                const segments = 15;
                const amplitude = 8;
                for (let i = 0; i <= segments; i++) {
                    const t = i / segments;
                    const x = startX + (endX - startX) * t;
                    const y = startY + (endY - startY) * t + Math.sin(t * Math.PI * 6) * amplitude;
                    if (i === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
            } else {
                // 従来のtypeプロパティでの処理
                switch (line.data.type) {
                case 'solid':
                    this.ctx.setLineDash([]);
                    this.ctx.moveTo(startX, startY);
                    this.ctx.lineTo(endX, endY);
                    break;
                case 'double':
                    this.ctx.setLineDash([]);
                    this.ctx.moveTo(startX, startY - 3);
                    this.ctx.lineTo(endX, endY - 3);
                    this.ctx.moveTo(startX, startY + 3);
                    this.ctx.lineTo(endX, endY + 3);
                    break;
                case 'dotted':
                    this.ctx.setLineDash([8, 8]);
                    this.ctx.moveTo(startX, startY);
                    this.ctx.lineTo(endX, endY);
                    break;
                case 'wave':
                    this.ctx.setLineDash([]);
                    const segments = 15;
                    const amplitude = 12;
                    for (let i = 0; i <= segments; i++) {
                        const t = i / segments;
                        const x = startX + (endX - startX) * t;
                        const y = startY + (endY - startY) * t + Math.sin(t * Math.PI * 6) * amplitude;
                        if (i === 0) {
                            this.ctx.moveTo(x, y);
                        } else {
                            this.ctx.lineTo(x, y);
                        }
                    }
                    break;
                case 'divorce':
                    this.ctx.setLineDash([]);
                    this.ctx.moveTo(startX - 15, startY - 15);
                    this.ctx.lineTo(startX + 15, startY + 15);
                    this.ctx.moveTo(startX - 8, startY - 15);
                    this.ctx.lineTo(startX + 22, startY + 15);
                    break;
                default:
                    // デフォルトは実線
                    this.ctx.setLineDash([]);
                    this.ctx.moveTo(startX, startY);
                    this.ctx.lineTo(endX, endY);
                    break;
                }
            }
            
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // 線の端点を表示
            if (line.selected) {
                this.ctx.fillStyle = '#007bff';
                this.ctx.fillRect(startX - 4, startY - 4, 8, 8);
                this.ctx.fillRect(endX - 4, endY - 4, 8, 8);
            }
        }

        drawCircle(circle) {
            const x = circle.x;
            const y = circle.y;
            
            // 枠線のみの表示に変更
            this.ctx.fillStyle = 'transparent';
            this.ctx.lineWidth = circle.selected ? 3 : 2;
            this.ctx.strokeStyle = circle.selected ? '#007bff' : '#666';
            
            // 点線設定
            if (circle.data.dashed) {
                this.ctx.setLineDash([5, 5]);
            } else {
                this.ctx.setLineDash([]);
            }
            
            if (circle.data.type === 'ellipse') {
                const width = circle.data.width || 120;
                const height = circle.data.height || 80;
                
                this.ctx.save();
                this.ctx.translate(x, y);
                this.ctx.scale(width / height, 1);
                this.ctx.beginPath();
                this.ctx.arc(0, 0, height / 2, 0, 2 * Math.PI);
                this.ctx.restore();
                
                // 楕円のリサイズハンドル
                if (circle.selected) {
                    this.ctx.fillStyle = '#007bff';
                    // 横方向ハンドル
                    this.ctx.fillRect(x + width/2 - 4, y - 4, 8, 8);
                    // 縦方向ハンドル
                    this.ctx.fillRect(x - 4, y + height/2 - 4, 8, 8);
                }
            } else {
                this.ctx.beginPath();
                this.ctx.arc(x, y, circle.data.radius || 80, 0, 2 * Math.PI);
                
                // 丸円のリサイズハンドル
                if (circle.selected) {
                    const radius = circle.data.radius || 80;
                    this.ctx.fillStyle = '#007bff';
                    this.ctx.fillRect(x + radius - 4, y - 4, 8, 8);
                }
            }
            
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        drawCurve(curve) {
            const points = curve.data.points || [];
            if (points.length < 2) return;
            
            this.ctx.strokeStyle = curve.selected ? '#007bff' : '#666';
            this.ctx.lineWidth = curve.selected ? 3 : 2;
            
            // 点線設定
            if (curve.data.dashed) {
                this.ctx.setLineDash([5, 5]);
            } else {
                this.ctx.setLineDash([]);
            }
            
            // 曲線を滑らかに描画するためにベジェ曲線を使用
            this.ctx.beginPath();
            this.ctx.moveTo(points[0].x, points[0].y);
            
            if (points.length === 2) {
                // 2点の場合は直線
                this.ctx.lineTo(points[1].x, points[1].y);
            } else {
                // 3点以上の場合はベジェ曲線で滑らかに描画
                for (let i = 1; i < points.length - 1; i++) {
                    const xc = (points[i].x + points[i + 1].x) / 2;
                    const yc = (points[i].y + points[i + 1].y) / 2;
                    this.ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
                }
                // 最後の点
                const lastPoint = points[points.length - 1];
                this.ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, lastPoint.x, lastPoint.y);
            }
            
            // 閉じた曲線の場合
            if (curve.data.closed && points.length >= 3) {
                this.ctx.closePath();
            }
            
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // 編集用の点を表示
            if (curve.selected) {
                this.ctx.fillStyle = '#007bff';
                points.forEach(point => {
                    this.ctx.fillRect(point.x - 3, point.y - 3, 6, 6);
                });
            }
        }

        drawText(text) {
            const x = text.x;
            const y = text.y;
            const content = text.data.content || '';
            const fontSize = text.data.fontSize || 14;
            const fontFamily = text.data.fontFamily || 'Arial, sans-serif';
            const color = text.data.color || '#000000';
            const showBorder = text.data.showBorder || false;
            const rotation = text.data.rotation || 0;
            
            this.ctx.save();
            
            // 回転を適用
            if (rotation !== 0) {
                this.ctx.translate(x, y);
                this.ctx.rotate(rotation * Math.PI / 180);
                this.ctx.translate(-x, -y);
            }
            
            this.ctx.font = `${fontSize}px ${fontFamily}`;
            this.ctx.fillStyle = color;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // テキストを描画
            this.ctx.fillText(content, x, y);
            
            // 外枠の表示
            if (showBorder) {
                const metrics = this.ctx.measureText(content);
                const width = metrics.width;
                const height = fontSize;
                
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x - width/2 - 2, y - height/2 - 2, width + 4, height + 4);
            }
            
            // 選択状態の表示
            if (text.selected) {
                const metrics = this.ctx.measureText(content);
                const width = metrics.width;
                const height = fontSize;
                
                this.ctx.strokeStyle = '#007bff';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x - width/2 - 4, y - height/2 - 4, width + 8, height + 8);
            }
            
            this.ctx.restore();
        }

        exportToPng(autoSelect = true) {
            console.log('DEBUG: exportToPng呼び出し開始, autoSelect:', autoSelect);
            
            try {
                if (autoSelect) {
                    console.log('DEBUG: 自動範囲選択モード');
                    const bounds = this.getElementsBounds();
                    console.log('DEBUG: 要素の境界:', bounds);
                    
                    if (bounds) {
                        const width = bounds.maxX - bounds.minX;
                        const height = bounds.maxY - bounds.minY;
                        console.log('DEBUG: 出力範囲 - x:', bounds.minX, 'y:', bounds.minY, 'width:', width, 'height:', height);
                        this.exportRegionToPng(bounds.minX, bounds.minY, width, height);
                    } else {
                        console.log('DEBUG: 出力する要素がありません');
                        alert('出力する要素がありません');
                    }
                } else {
                    console.log('DEBUG: 手動範囲選択モード');
                    this.startManualSelection();
                }
            } catch (error) {
                console.error('DEBUG: exportToPngでエラーが発生:', error);
                alert('画像出力でエラーが発生しました: ' + error.message);
            }
        }

        startManualSelection() {
            this.isSelecting = true;
            this.canvas.style.cursor = 'crosshair';
            this.showSuccessPopup('ドラッグして出力範囲を選択してください');
            
            // 選択用のイベントリスナーを追加
            this.canvas.addEventListener('mousedown', this.handleSelectionStart.bind(this));
        }

        handleSelectionStart(e) {
            if (!this.isSelecting) return;
            
            const rect = this.canvas.getBoundingClientRect();
            this.selectionStart = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            
            this.canvas.addEventListener('mousemove', this.handleSelectionMove.bind(this));
            this.canvas.addEventListener('mouseup', this.handleSelectionEnd.bind(this));
        }

        handleSelectionMove(e) {
            if (!this.isSelecting || !this.selectionStart) return;
            
            const rect = this.canvas.getBoundingClientRect();
            this.selectionEnd = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            
            this.drawWithSelection();
        }

        handleSelectionEnd(e) {
            if (!this.isSelecting || !this.selectionStart) return;
            
            const rect = this.canvas.getBoundingClientRect();
            this.selectionEnd = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            
            // 選択範囲を計算
            const x = Math.min(this.selectionStart.x, this.selectionEnd.x);
            const y = Math.min(this.selectionStart.y, this.selectionEnd.y);
            const width = Math.abs(this.selectionEnd.x - this.selectionStart.x);
            const height = Math.abs(this.selectionEnd.y - this.selectionStart.y);
            
            if (width > 10 && height > 10) { // 最小サイズチェック
                this.exportRegionToPng(x, y, width, height);
            } else {
                alert('選択範囲が小さすぎます');
            }
            
            // 選択モードを終了
            this.endManualSelection();
        }

        endManualSelection() {
            this.isSelecting = false;
            this.selectionStart = null;
            this.selectionEnd = null;
            this.canvas.style.cursor = 'default';
            
            // イベントリスナーを削除
            this.canvas.removeEventListener('mousedown', this.handleSelectionStart);
            this.canvas.removeEventListener('mousemove', this.handleSelectionMove);
            this.canvas.removeEventListener('mouseup', this.handleSelectionEnd);
            
            this.draw(); // 通常の描画に戻す
        }

        drawWithSelection() {
            this.draw(); // 通常の描画
            
            // 選択範囲を描画
            if (this.selectionStart && this.selectionEnd) {
                this.ctx.save();
                this.ctx.strokeStyle = '#007bff';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 5]);
                
                const x = Math.min(this.selectionStart.x, this.selectionEnd.x);
                const y = Math.min(this.selectionStart.y, this.selectionEnd.y);
                const width = Math.abs(this.selectionEnd.x - this.selectionStart.x);
                const height = Math.abs(this.selectionEnd.y - this.selectionStart.y);
                
                this.ctx.strokeRect(x, y, width, height);
                this.ctx.restore();
            }
        }

        getElementsBounds() {
            if (this.elements.length === 0) return null;
            
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            
            this.elements.forEach(element => {
                let margin = 30; // デフォルトマージン
                
                switch (element.type) {
                    case 'person':
                        margin = 35; // 人物記号用マージン
                        minX = Math.min(minX, element.x - margin);
                        minY = Math.min(minY, element.y - margin);
                        maxX = Math.max(maxX, element.x + margin);
                        maxY = Math.max(maxY, element.y + margin);
                        break;
                    case 'line':
                        margin = 15; // 線用マージン
                        minX = Math.min(minX, element.x - margin, element.data.endX - margin);
                        minY = Math.min(minY, element.y - margin, element.data.endY - margin);
                        maxX = Math.max(maxX, element.x + margin, element.data.endX + margin);
                        maxY = Math.max(maxY, element.y + margin, element.data.endY + margin);
                        break;
                    case 'circle':
                        const radius = element.data.radius || 80;
                        const width = element.data.width || radius;
                        const height = element.data.height || radius;
                        margin = 20; // 円用マージン
                        minX = Math.min(minX, element.x - Math.max(radius, width/2) - margin);
                        minY = Math.min(minY, element.y - Math.max(radius, height/2) - margin);
                        maxX = Math.max(maxX, element.x + Math.max(radius, width/2) + margin);
                        maxY = Math.max(maxY, element.y + Math.max(radius, height/2) + margin);
                        break;
                }
            });
            
            return { minX, minY, maxX, maxY };
        }

        exportRegionToPng(x, y, width, height) {
            console.log('DEBUG: exportRegionToPng呼び出し開始');
            console.log('DEBUG: 出力パラメータ - x:', x, 'y:', y, 'width:', width, 'height:', height);
            
            try {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = width;
                tempCanvas.height = height;
                const tempCtx = tempCanvas.getContext('2d');
                
                console.log('DEBUG: 一時キャンバス作成完了 - サイズ:', width, 'x', height);
                
                // 白い背景で塗りつぶし
                tempCtx.fillStyle = 'white';
                tempCtx.fillRect(0, 0, width, height);
                
                console.log('DEBUG: 白い背景塗りつぶし完了');
                
                // グリッド線と選択範囲の点線なしで要素のみを描画
                this.drawElementsOnly(tempCtx, x, y, width, height);
                
                console.log('DEBUG: 要素のみの描画完了');
                
                // PNG形式でダウンロード
                tempCanvas.toBlob(blob => {
                    console.log('DEBUG: Blob作成完了, サイズ:', blob ? blob.size : 'null');
                    
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `jenogram_${new Date().getTime()}.png`;
                        document.body.appendChild(a);
                        
                        console.log('DEBUG: ダウンロードリンク作成完了、クリック実行');
                        a.click();
                        
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                        console.log('DEBUG: ダウンロード処理完了');
                        
                        // 成功メッセージを表示
                        this.showSuccessPopup('画像を出力しました');
                    } else {
                        console.error('DEBUG: Blob作成に失敗');
                        alert('画像の作成に失敗しました');
                    }
                }, 'image/png', 1.0);
                
            } catch (error) {
                console.error('DEBUG: exportRegionToPngでエラーが発生:', error);
                alert('画像出力処理でエラーが発生しました: ' + error.message);
            }
        }

        drawElementsOnly(ctx, offsetX, offsetY, width, height) {
            // 指定された範囲内の要素のみを描画（グリッド線や選択範囲の点線なし）
            ctx.save();
            
            // 描画範囲をクリップ
            ctx.beginPath();
            ctx.rect(0, 0, width, height);
            ctx.clip();
            
            // オフセットを適用
            ctx.translate(-offsetX, -offsetY);
            
            // 要素のみを描画
            this.elements.forEach(element => {
                this.drawElementToContext(ctx, element);
            });
            
            ctx.restore();
        }

        drawElementToContext(ctx, element) {
            // 指定されたコンテキストに要素を描画（this.ctxの代わりにctxを使用）
            ctx.save();
            
            if (element.selected) {
                ctx.strokeStyle = '#007bff';
                ctx.lineWidth = 3;
            } else {
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
            }
            
            switch (element.type) {
                case 'person':
                    this.drawPersonToContext(ctx, element);
                    break;
                case 'line':
                    this.drawLineToContext(ctx, element);
                    break;
                case 'circle':
                    this.drawCircleToContext(ctx, element);
                    break;
                case 'curve':
                    this.drawCurveToContext(ctx, element);
                    break;
                case 'text':
                    this.drawTextToContext(ctx, element);
                    break;
            }
            
            ctx.restore();
        }

        drawPersonToContext(ctx, person) {
            const size = 50;
            const x = person.x;
            const y = person.y;
            
            ctx.fillStyle = 'transparent';
            ctx.lineWidth = person.selected ? 4 : 3;
            ctx.strokeStyle = person.selected ? '#007bff' : '#333';
            
            switch (person.data.gender) {
                case 'male':
                    ctx.strokeRect(x - size/2, y - size/2, size, size);
                    if (person.data.isTarget) {
                        ctx.strokeRect(x - size/2 + 5, y - size/2 + 5, size - 10, size - 10);
                    }
                    break;
                case 'female':
                    ctx.beginPath();
                    ctx.arc(x, y, size/2, 0, 2 * Math.PI);
                    ctx.stroke();
                    if (person.data.isTarget) {
                        ctx.beginPath();
                        ctx.arc(x, y, size/2 - 5, 0, 2 * Math.PI);
                        ctx.stroke();
                    }
                    break;
                case 'unknown':
                    ctx.beginPath();
                    ctx.moveTo(x, y - size/2);
                    ctx.lineTo(x - size/2, y + size/2);
                    ctx.lineTo(x + size/2, y + size/2);
                    ctx.closePath();
                    ctx.stroke();
                    if (person.data.isTarget) {
                        ctx.beginPath();
                        ctx.moveTo(x, y - size/2 + 5);
                        ctx.lineTo(x - size/2 + 5, y + size/2 - 5);
                        ctx.lineTo(x + size/2 - 5, y + size/2 - 5);
                        ctx.closePath();
                        ctx.stroke();
                    }
                    break;
            }
            
            // 死亡者の×マーク
            if (person.data.isDead) {
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 3;
                const crossSize = size * 0.6;
                ctx.beginPath();
                ctx.moveTo(x - crossSize/2, y - crossSize/2);
                ctx.lineTo(x + crossSize/2, y + crossSize/2);
                ctx.moveTo(x + crossSize/2, y - crossSize/2);
                ctx.lineTo(x - crossSize/2, y + crossSize/2);
                ctx.stroke();
                ctx.strokeStyle = person.selected ? '#007bff' : '#333';
            }
            
            // テキストを描画
            if (person.data.text) {
                ctx.fillStyle = '#333';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(person.data.text, x, y);
            }
        }

        drawLineToContext(ctx, line) {
            const startX = line.x;
            const startY = line.y;
            const endX = line.data.endX;
            const endY = line.data.endY;
            
            ctx.lineWidth = line.selected ? 4 : 3;
            ctx.strokeStyle = line.selected ? '#007bff' : '#333';
            ctx.beginPath();
            
            switch (line.data.type) {
                case 'solid':
                    ctx.setLineDash([]);
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    break;
                case 'double':
                    ctx.setLineDash([]);
                    ctx.moveTo(startX, startY - 3);
                    ctx.lineTo(endX, endY - 3);
                    ctx.moveTo(startX, startY + 3);
                    ctx.lineTo(endX, endY + 3);
                    break;
                case 'dotted':
                    ctx.setLineDash([8, 8]);
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    break;
                case 'wave':
                    ctx.setLineDash([]);
                    const segments = 15;
                    const amplitude = 12;
                    for (let i = 0; i <= segments; i++) {
                        const t = i / segments;
                        const wx = startX + (endX - startX) * t;
                        const wy = startY + (endY - startY) * t + Math.sin(t * Math.PI * 6) * amplitude;
                        if (i === 0) {
                            ctx.moveTo(wx, wy);
                        } else {
                            ctx.lineTo(wx, wy);
                        }
                    }
                    break;
                case 'divorce':
                    ctx.setLineDash([]);
                    ctx.moveTo(startX - 15, startY - 15);
                    ctx.lineTo(startX + 15, startY + 15);
                    ctx.moveTo(startX - 8, startY - 15);
                    ctx.lineTo(startX + 22, startY + 15);
                    break;
            }
            
            ctx.stroke();
            ctx.setLineDash([]);
        }

        drawCircleToContext(ctx, circle) {
            const x = circle.x;
            const y = circle.y;
            
            ctx.fillStyle = 'transparent';
            ctx.lineWidth = circle.selected ? 3 : 2;
            ctx.strokeStyle = circle.selected ? '#007bff' : '#666';
            
            // 点線設定
            if (circle.data.dashed) {
                ctx.setLineDash([5, 5]);
            } else {
                ctx.setLineDash([]);
            }
            
            if (circle.data.type === 'ellipse') {
                const width = circle.data.width || 120;
                const height = circle.data.height || 80;
                
                ctx.save();
                ctx.translate(x, y);
                ctx.scale(width / height, 1);
                ctx.beginPath();
                ctx.arc(0, 0, height / 2, 0, 2 * Math.PI);
                ctx.restore();
            } else {
                ctx.beginPath();
                ctx.arc(x, y, circle.data.radius || 80, 0, 2 * Math.PI);
            }
            
            ctx.stroke();
            ctx.setLineDash([]);
        }

        drawCurveToContext(ctx, curve) {
            const points = curve.data.points || [];
            if (points.length < 2) return;
            
            ctx.strokeStyle = curve.selected ? '#007bff' : '#666';
            ctx.lineWidth = curve.selected ? 3 : 2;
            
            // 点線設定
            if (curve.data.dashed) {
                ctx.setLineDash([5, 5]);
            } else {
                ctx.setLineDash([]);
            }
            
            // 曲線を滑らかに描画するためにベジェ曲線を使用
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            
            if (points.length === 2) {
                // 2点の場合は直線
                ctx.lineTo(points[1].x, points[1].y);
            } else {
                // 3点以上の場合はベジェ曲線で滑らかに描画
                for (let i = 1; i < points.length - 1; i++) {
                    const xc = (points[i].x + points[i + 1].x) / 2;
                    const yc = (points[i].y + points[i + 1].y) / 2;
                    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
                }
                // 最後の点
                const lastPoint = points[points.length - 1];
                ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, lastPoint.x, lastPoint.y);
            }
            
            // 閉じた曲線の場合
            if (curve.data.closed && points.length >= 3) {
                ctx.closePath();
            }
            
            ctx.stroke();
            ctx.setLineDash([]);
        }

        drawTextToContext(ctx, text) {
            const x = text.x;
            const y = text.y;
            const content = text.data.content || '';
            const fontSize = text.data.fontSize || 14;
            const fontFamily = text.data.fontFamily || 'Arial, sans-serif';
            const color = text.data.color || '#000000';
            const showBorder = text.data.showBorder || false;
            const rotation = text.data.rotation || 0;
            
            ctx.save();
            
            // 回転を適用
            if (rotation !== 0) {
                ctx.translate(x, y);
                ctx.rotate(rotation * Math.PI / 180);
                ctx.translate(-x, -y);
            }
            
            ctx.font = `${fontSize}px ${fontFamily}`;
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // テキストを描画
            ctx.fillText(content, x, y);
            
            // 外枠の表示
            if (showBorder) {
                const metrics = ctx.measureText(content);
                const width = metrics.width;
                const height = fontSize;
                
                ctx.strokeStyle = color;
                ctx.lineWidth = 1;
                ctx.strokeRect(x - width/2 - 2, y - height/2 - 2, width + 4, height + 4);
            }
            
            ctx.restore();
        }

        saveData() {
            try {
                // データの整合性チェック
                if (!this.elements || !Array.isArray(this.elements)) {
                    throw new Error('保存するデータが無効です');
                }
                
                // データのシリアライゼーション
                const serializedData = this.serializeElements();
                const dataString = JSON.stringify(serializedData);
                
                // データサイズチェック（kintoneの制限を考慮）
                if (dataString.length > 50000) {
                    throw new Error('データサイズが大きすぎます。要素を減らしてください。');
                }
                
                // kintoneレコードへの保存
                const record = kintone.app.record.get();
                if (!record || !record.record) {
                    throw new Error('kintoneレコードへのアクセスに失敗しました');
                }
                
                // フィールドの初期化と正しい形式での保存
                if (!record.record.inner_jenogram) {
                    record.record.inner_jenogram = { type: 'MULTI_LINE_TEXT', value: '' };
                }
                
                // 文字列として直接保存（[object Object]を回避）
                record.record.inner_jenogram.value = dataString;
                kintone.app.record.set(record);
                
                console.log('データ保存が完了しました:', serializedData.length + '個の要素');
                this.showSuccessPopup('データを保存しました');
                return true;
                
            } catch (error) {
                console.error('データ保存エラー:', error);
                alert('データの保存に失敗しました: ' + error.message);
                return false;
            }
        }

        loadData() {
            try {
                const record = kintone.app.record.get();
                
                // kintoneフィールドからのデータ読み込み
                let dataString = null;
                if (record && record.record && record.record.inner_jenogram && 
                    record.record.inner_jenogram.value) {
                    dataString = record.record.inner_jenogram.value;
                }
                
                if (dataString && dataString.trim() !== '') {
                    const data = JSON.parse(dataString);
                    
                    // データの整合性チェック
                    if (!Array.isArray(data)) {
                        throw new Error('無効なデータ形式です');
                    }
                    
                    // データのデシリアライゼーション
                    this.elements = this.deserializeElements(data);
                    
                    console.log('データの読み込みが完了しました (' + this.elements.length + '個の要素)');
                } else {
                    // データがない場合は空の配列で初期化
                    this.elements = [];
                    console.log('新規データで初期化しました');
                }
                
            } catch (error) {
                console.error('データ読み込みエラー:', error);
                
                // エラー時は空の配列で初期化
                this.elements = [];
                alert('データの読み込みに失敗しました。新規で始めます。');
            }
        }
    }

    // サムネイル描画関数
    function renderJenogramThumbnail(container, dataString, isEditable) {
        try {
            const data = JSON.parse(dataString);
            
            // 200x200のキャンバスを作成
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            canvas.style.border = '1px solid #ddd';
            canvas.style.borderRadius = '4px';
            canvas.style.cursor = isEditable ? 'pointer' : 'zoom-in';
            
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 200, 200);
            
            if (data && data.length > 0) {
                // 要素の範囲を計算
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                data.forEach(element => {
                    minX = Math.min(minX, element.x - 25);
                    minY = Math.min(minY, element.y - 25);
                    maxX = Math.max(maxX, element.x + 25);
                    maxY = Math.max(maxY, element.y + 25);
                    if (element.type === 'line') {
                        minX = Math.min(minX, element.data.endX - 25);
                        minY = Math.min(minY, element.data.endY - 25);
                        maxX = Math.max(maxX, element.data.endX + 25);
                        maxY = Math.max(maxY, element.data.endY + 25);
                    }
                });
                
                // スケールを計算
                const rangeX = maxX - minX;
                const rangeY = maxY - minY;
                const scale = Math.min(160 / rangeX, 160 / rangeY, 1);
                
                // 中央寄せのオフセットを計算
                const offsetX = 100 - (minX + rangeX / 2) * scale;
                const offsetY = 100 - (minY + rangeY / 2) * scale;
                
                // 要素を描画
                ctx.save();
                ctx.scale(scale, scale);
                ctx.translate(offsetX / scale, offsetY / scale);
                
                data.forEach(elementData => {
                    drawThumbnailElement(ctx, elementData);
                });
                
                ctx.restore();
            }
            
            // コンテナに追加
            container.innerHTML = '';
            const wrapper = document.createElement('div');
            wrapper.style.textAlign = 'center';
            wrapper.style.padding = '10px';
            
            const label = document.createElement('div');
            label.style.marginBottom = '10px';
            label.style.fontSize = '14px';
            label.style.color = '#666';
            label.textContent = isEditable ? 'クリックして編集' : 'クリックして拡大表示';
            
            wrapper.appendChild(label);
            wrapper.appendChild(canvas);
            container.appendChild(wrapper);
            
            // クリックイベント
            canvas.onclick = () => {
                if (isEditable) {
                    showJenogramEditor();
                } else {
                    showJenogramImage(dataString);
                }
            };
            
        } catch (error) {
            console.error('サムネイル描画エラー:', error);
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">サムネイル描画エラー</div>';
        }
    }
    
    // サムネイル用要素描画（簡略版）
    function drawThumbnailElement(ctx, elementData) {
        ctx.strokeStyle = '#333';
        ctx.fillStyle = 'transparent';
        ctx.lineWidth = 1;
        
        switch (elementData.type) {
            case 'person':
                const size = 20;
                const x = elementData.x;
                const y = elementData.y;
                
                switch (elementData.data.gender) {
                    case 'male':
                        ctx.strokeRect(x - size/2, y - size/2, size, size);
                        break;
                    case 'female':
                        ctx.beginPath();
                        ctx.arc(x, y, size/2, 0, 2 * Math.PI);
                        ctx.stroke();
                        break;
                    case 'unknown':
                        ctx.beginPath();
                        ctx.moveTo(x, y - size/2);
                        ctx.lineTo(x - size/2, y + size/2);
                        ctx.lineTo(x + size/2, y + size/2);
                        ctx.closePath();
                        ctx.stroke();
                        break;
                }
                
                // 死亡者の×マーク
                if (elementData.data.isDead) {
                    ctx.strokeStyle = '#000000';
                    const crossSize = size * 0.6;
                    ctx.beginPath();
                    ctx.moveTo(x - crossSize/2, y - crossSize/2);
                    ctx.lineTo(x + crossSize/2, y + crossSize/2);
                    ctx.moveTo(x + crossSize/2, y - crossSize/2);
                    ctx.lineTo(x - crossSize/2, y + crossSize/2);
                    ctx.stroke();
                    ctx.strokeStyle = '#333';
                }
                break;
                
            case 'line':
                ctx.beginPath();
                ctx.moveTo(elementData.x, elementData.y);
                ctx.lineTo(elementData.data.endX, elementData.data.endY);
                ctx.stroke();
                break;
                
            case 'circle':
                ctx.beginPath();
                ctx.arc(elementData.x, elementData.y, elementData.data.radius || 30, 0, 2 * Math.PI);
                ctx.stroke();
                break;
        }
    }
    
    // 詳細表示用高精度描画関数
    function drawDetailElement(ctx, elementData, scale) {
        ctx.strokeStyle = '#333';
        ctx.fillStyle = 'transparent';
        ctx.lineWidth = Math.max(1, 2 * scale); // スケールに応じた線の太さ
        
        switch (elementData.type) {
            case 'person':
                const size = 50; // 編集画面と同じサイズ
                const x = elementData.x;
                const y = elementData.y;
                
                switch (elementData.data.gender) {
                    case 'male':
                        ctx.strokeRect(x - size/2, y - size/2, size, size);
                        break;
                    case 'female':
                        ctx.beginPath();
                        ctx.arc(x, y, size/2, 0, 2 * Math.PI);
                        ctx.stroke();
                        break;
                    case 'unknown':
                        ctx.beginPath();
                        ctx.moveTo(x, y - size/2);
                        ctx.lineTo(x - size/2, y + size/2);
                        ctx.lineTo(x + size/2, y + size/2);
                        ctx.closePath();
                        ctx.stroke();
                        break;
                }
                
                // 対象者指定の二重線
                if (elementData.data.isTarget) {
                    if (elementData.data.gender === 'female') {
                        ctx.beginPath();
                        ctx.arc(x, y, size/2 - 5, 0, 2 * Math.PI);
                        ctx.stroke();
                    } else if (elementData.data.gender === 'male') {
                        ctx.strokeRect(x - size/2 + 5, y - size/2 + 5, size - 10, size - 10);
                    } else if (elementData.data.gender === 'unknown') {
                        ctx.beginPath();
                        ctx.moveTo(x, y - size/2 + 5);
                        ctx.lineTo(x - size/2 + 5, y + size/2 - 5);
                        ctx.lineTo(x + size/2 - 5, y + size/2 - 5);
                        ctx.closePath();
                        ctx.stroke();
                    }
                }
                
                // 死亡者の×マーク
                if (elementData.data.isDead) {
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = Math.max(2, 3 * scale);
                    const crossSize = size * 0.6;
                    ctx.beginPath();
                    ctx.moveTo(x - crossSize/2, y - crossSize/2);
                    ctx.lineTo(x + crossSize/2, y + crossSize/2);
                    ctx.moveTo(x + crossSize/2, y - crossSize/2);
                    ctx.lineTo(x - crossSize/2, y + crossSize/2);
                    ctx.stroke();
                    ctx.strokeStyle = '#333';
                    ctx.lineWidth = Math.max(1, 2 * scale);
                }
                
                // 数値表示
                if (elementData.data.text) {
                    ctx.fillStyle = '#333';
                    ctx.font = `bold ${Math.max(12, 16 * scale)}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(elementData.data.text, x, y);
                    ctx.fillStyle = 'transparent';
                }
                break;
                
            case 'line':
                const startX = elementData.x;
                const startY = elementData.y;
                const endX = elementData.data.endX;
                const endY = elementData.data.endY;
                
                ctx.lineWidth = Math.max(2, 3 * scale);
                ctx.beginPath();
                
                switch (elementData.data.type) {
                    case 'solid':
                        ctx.setLineDash([]);
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(endX, endY);
                        break;
                    case 'double':
                        ctx.setLineDash([]);
                        const offset = Math.max(2, 3 * scale);
                        ctx.moveTo(startX, startY - offset);
                        ctx.lineTo(endX, endY - offset);
                        ctx.moveTo(startX, startY + offset);
                        ctx.lineTo(endX, endY + offset);
                        break;
                    case 'dotted':
                        const dashSize = Math.max(4, 8 * scale);
                        ctx.setLineDash([dashSize, dashSize]);
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(endX, endY);
                        break;
                    case 'wave':
                        ctx.setLineDash([]);
                        const segments = 15;
                        const amplitude = Math.max(6, 12 * scale);
                        for (let i = 0; i <= segments; i++) {
                            const t = i / segments;
                            const wx = startX + (endX - startX) * t;
                            const wy = startY + (endY - startY) * t + Math.sin(t * Math.PI * 6) * amplitude;
                            if (i === 0) {
                                ctx.moveTo(wx, wy);
                            } else {
                                ctx.lineTo(wx, wy);
                            }
                        }
                        break;
                    case 'divorce':
                        ctx.setLineDash([]);
                        const divOffset = Math.max(8, 15 * scale);
                        ctx.moveTo(startX - divOffset, startY - divOffset);
                        ctx.lineTo(startX + divOffset, startY + divOffset);
                        ctx.moveTo(startX - divOffset/2, startY - divOffset);
                        ctx.lineTo(startX + divOffset * 1.5, startY + divOffset);
                        break;
                }
                
                ctx.stroke();
                ctx.setLineDash([]);
                break;
                
            case 'circle':
                const radius = elementData.data.radius || 80;
                
                // 点線設定
                if (elementData.data.dashed) {
                    ctx.setLineDash([Math.max(3, 5 * scale), Math.max(3, 5 * scale)]);
                } else {
                    ctx.setLineDash([]);
                }
                
                ctx.beginPath();
                
                if (elementData.data.type === 'ellipse') {
                    const width = elementData.data.width || 120;
                    const height = elementData.data.height || 80;
                    
                    ctx.save();
                    ctx.translate(elementData.x, elementData.y);
                    ctx.scale(width / height, 1);
                    ctx.arc(0, 0, height / 2, 0, 2 * Math.PI);
                    ctx.restore();
                } else {
                    ctx.arc(elementData.x, elementData.y, radius, 0, 2 * Math.PI);
                }
                
                ctx.stroke();
                ctx.setLineDash([]);
                break;
                
            case 'curve':
                const points = elementData.data.points || [];
                if (points.length < 2) break;
                
                ctx.strokeStyle = '#666';
                ctx.lineWidth = Math.max(1, 2 * scale);
                
                // 点線設定
                if (elementData.data.dashed) {
                    ctx.setLineDash([Math.max(3, 5 * scale), Math.max(3, 5 * scale)]);
                } else {
                    ctx.setLineDash([]);
                }
                
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                
                if (points.length === 2) {
                    ctx.lineTo(points[1].x, points[1].y);
                } else {
                    for (let i = 1; i < points.length - 1; i++) {
                        const xc = (points[i].x + points[i + 1].x) / 2;
                        const yc = (points[i].y + points[i + 1].y) / 2;
                        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
                    }
                    const lastPoint = points[points.length - 1];
                    ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, lastPoint.x, lastPoint.y);
                }
                
                if (elementData.data.closed && points.length >= 3) {
                    ctx.closePath();
                }
                
                ctx.stroke();
                ctx.setLineDash([]);
                break;
                
            case 'text':
                const content = elementData.data.content || '';
                const fontSize = Math.max(8, (elementData.data.fontSize || 14) * scale);
                const fontFamily = elementData.data.fontFamily || 'Arial, sans-serif';
                const color = elementData.data.color || '#000000';
                const showBorder = elementData.data.showBorder || false;
                const rotation = elementData.data.rotation || 0;
                
                ctx.save();
                
                // 回転を適用
                if (rotation !== 0) {
                    ctx.translate(elementData.x, elementData.y);
                    ctx.rotate(rotation * Math.PI / 180);
                    ctx.translate(-elementData.x, -elementData.y);
                }
                
                ctx.font = `${fontSize}px ${fontFamily}`;
                ctx.fillStyle = color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // テキストを描画
                ctx.fillText(content, elementData.x, elementData.y);
                
                // 外枠の表示
                if (showBorder) {
                    const metrics = ctx.measureText(content);
                    const width = metrics.width;
                    const height = fontSize;
                    
                    ctx.strokeStyle = color;
                    ctx.lineWidth = Math.max(0.5, 1 * scale);
                    ctx.strokeRect(elementData.x - width/2 - 2, elementData.y - height/2 - 2, width + 4, height + 4);
                }
                
                ctx.restore();
                break;
        }
    }
    
    // 詳細画面用の正確なイメージ描画関数
    function renderJenogramDetail(container, dataString, isEditable) {
        try {
            const data = JSON.parse(dataString);
            
            // フィールド枠に合わせたキャンバスを作成
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            canvas.style.border = '1px solid #ddd';
            canvas.style.borderRadius = '4px';
            canvas.style.maxWidth = '100%';
            canvas.style.height = 'auto';
            canvas.style.cursor = isEditable ? 'pointer' : 'default';
            
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 200, 200);
            
            if (data && data.length > 0) {
                // 要素の範囲を正確に計算
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                
                data.forEach(element => {
                    let elementMinX, elementMinY, elementMaxX, elementMaxY;
                    
                    switch (element.type) {
                        case 'person':
                            const personSize = 25; // 人物記号の半径
                            elementMinX = element.x - personSize;
                            elementMinY = element.y - personSize;
                            elementMaxX = element.x + personSize;
                            elementMaxY = element.y + personSize;
                            break;
                        case 'line':
                            const lineMargin = 5;
                            elementMinX = Math.min(element.x, element.data.endX) - lineMargin;
                            elementMinY = Math.min(element.y, element.data.endY) - lineMargin;
                            elementMaxX = Math.max(element.x, element.data.endX) + lineMargin;
                            elementMaxY = Math.max(element.y, element.data.endY) + lineMargin;
                            break;
                        case 'circle':
                            if (element.data.type === 'ellipse') {
                                const width = element.data.width || 120;
                                const height = element.data.height || 80;
                                elementMinX = element.x - width / 2;
                                elementMinY = element.y - height / 2;
                                elementMaxX = element.x + width / 2;
                                elementMaxY = element.y + height / 2;
                            } else {
                                const radius = element.data.radius || 80;
                                elementMinX = element.x - radius;
                                elementMinY = element.y - radius;
                                elementMaxX = element.x + radius;
                                elementMaxY = element.y + radius;
                            }
                            break;
                        case 'curve':
                            const points = element.data.points || [];
                            if (points.length > 0) {
                                elementMinX = Math.min(...points.map(p => p.x)) - 10;
                                elementMinY = Math.min(...points.map(p => p.y)) - 10;
                                elementMaxX = Math.max(...points.map(p => p.x)) + 10;
                                elementMaxY = Math.max(...points.map(p => p.y)) + 10;
                            } else {
                                elementMinX = elementMaxX = element.x;
                                elementMinY = elementMaxY = element.y;
                            }
                            break;
                        case 'text':
                            const fontSize = element.data.fontSize || 14;
                            const content = element.data.content || '';
                            const textWidth = content.length * fontSize * 0.6;
                            const textHeight = fontSize + 4;
                            elementMinX = element.x - textWidth / 2 - 5;
                            elementMinY = element.y - textHeight / 2 - 5;
                            elementMaxX = element.x + textWidth / 2 + 5;
                            elementMaxY = element.y + textHeight / 2 + 5;
                            break;
                        default:
                            elementMinX = elementMaxX = element.x;
                            elementMinY = elementMaxY = element.y;
                    }
                    
                    minX = Math.min(minX, elementMinX);
                    minY = Math.min(minY, elementMinY);
                    maxX = Math.max(maxX, elementMaxX);
                    maxY = Math.max(maxY, elementMaxY);
                });
                
                // 余白を追加
                const padding = 15;
                minX -= padding;
                minY -= padding;
                maxX += padding;
                maxY += padding;
                
                // スケールを計算（見切れないように余裕をもって）
                const rangeX = maxX - minX;
                const rangeY = maxY - minY;
                const availableWidth = 180; // 表示可能幅
                const availableHeight = 180; // 表示可能高さ
                const scale = Math.min(availableWidth / rangeX, availableHeight / rangeY, 1.0);
                
                // 中央寄せのオフセットを計算
                const scaledWidth = rangeX * scale;
                const scaledHeight = rangeY * scale;
                const offsetX = 100 - (minX + rangeX / 2) * scale;
                const offsetY = 100 - (minY + rangeY / 2) * scale;
                
                // 要素を描画
                ctx.save();
                ctx.scale(scale, scale);
                ctx.translate(offsetX / scale, offsetY / scale);
                
                data.forEach(elementData => {
                    drawDetailElement(ctx, elementData, scale);
                });
                
                ctx.restore();
            }
            
            // コンテナに追加
            container.innerHTML = '';
            const wrapper = document.createElement('div');
            wrapper.style.textAlign = 'center';
            wrapper.style.padding = '10px';
            
            const label = document.createElement('div');
            label.style.marginBottom = '10px';
            label.style.fontSize = '14px';
            label.style.color = '#666';
            label.textContent = isEditable ? 'クリックして編集' : 'ジェノグラム';
            
            wrapper.appendChild(label);
            wrapper.appendChild(canvas);
            container.appendChild(wrapper);
            
            // クリックイベント
            if (isEditable) {
                canvas.onclick = () => {
                    showJenogramEditor();
                };
            } else {
                // 詳細画面でのクリック時はポップアップ拡大表示
                canvas.onclick = () => {
                    showJenogramPopup(dataString);
                };
                canvas.style.cursor = 'zoom-in';
            }
            
        } catch (error) {
            console.error('詳細イメージ描画エラー:', error);
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">イメージ描画エラー</div>';
        }
    }
    
    // 詳細画面用イメージ表示
    function showJenogramImage(dataString) {
        try {
            const overlay = document.createElement('div');
            overlay.className = 'jenogram-overlay';
            
            const popup = document.createElement('div');
            popup.style.position = 'fixed';
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            popup.style.background = 'white';
            popup.style.border = '1px solid #ddd';
            popup.style.borderRadius = '8px';
            popup.style.padding = '20px';
            popup.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
            popup.style.zIndex = '10000';
            popup.style.maxWidth = '90%';
            popup.style.maxHeight = '90%';
            popup.style.overflow = 'auto';
            
            const header = document.createElement('div');
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
            header.style.marginBottom = '20px';
            header.innerHTML = '<h3 style="margin: 0;">ジェノグラム</h3><button style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">閉じる</button>';
            
            const canvas = document.createElement('canvas');
            canvas.width = 600;
            canvas.height = 400;
            canvas.style.border = '1px solid #ddd';
            canvas.style.background = 'white';
            
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 600, 400);
            
            // データを描画
            const data = JSON.parse(dataString);
            if (data && data.length > 0) {
                // 高精度描画（編集画面と同等の品質）
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                data.forEach(element => {
                    const margin = element.type === 'person' ? 30 : (element.type === 'circle' ? element.data.radius + 10 : 15);
                    minX = Math.min(minX, element.x - margin);
                    minY = Math.min(minY, element.y - margin);
                    maxX = Math.max(maxX, element.x + margin);
                    maxY = Math.max(maxY, element.y + margin);
                    if (element.type === 'line') {
                        minX = Math.min(minX, element.data.endX - 15);
                        minY = Math.min(minY, element.data.endY - 15);
                        maxX = Math.max(maxX, element.data.endX + 15);
                        maxY = Math.max(maxY, element.data.endY + 15);
                    }
                });
                
                const rangeX = maxX - minX;
                const rangeY = maxY - minY;
                const scale = Math.min(550 / rangeX, 350 / rangeY, 1.5); // 最大スケールを下げて精度向上
                const offsetX = 300 - (minX + rangeX / 2) * scale;
                const offsetY = 200 - (minY + rangeY / 2) * scale;
                
                ctx.save();
                ctx.scale(scale, scale);
                ctx.translate(offsetX / scale, offsetY / scale);
                
                data.forEach(elementData => {
                    drawDetailElement(ctx, elementData, scale); // 高精度描画関数を使用
                });
                
                ctx.restore();
            }
            
            popup.appendChild(header);
            popup.appendChild(canvas);
            
            document.body.appendChild(overlay);
            document.body.appendChild(popup);
            
            // イベントリスナー
            const closeBtn = header.querySelector('button');
            const closePopup = () => {
                document.body.removeChild(overlay);
                document.body.removeChild(popup);
            };
            
            closeBtn.onclick = closePopup;
            overlay.onclick = closePopup;
            
        } catch (error) {
            console.error('イメージ表示エラー:', error);
            alert('イメージの表示に失敗しました。');
        }
    }
    
    // ポップアップ表示関数
    function showJenogramEditor() {
        const overlay = document.createElement('div');
        overlay.className = 'jenogram-overlay';
        
        const popup = document.createElement('div');
        popup.className = 'jenogram-popup';
        
        popup.innerHTML = `
            <div class="jenogram-header">
                <div class="jenogram-header-left">
                    <div class="jenogram-undo-redo">
                        <button class="jenogram-undo-btn" id="undoBtn" title="Undo">↶</button>
                        <button class="jenogram-redo-btn" id="redoBtn" title="Redo">↷</button>
                    </div>
                    <div class="jenogram-title">ジェノグラム エディタ</div>
                </div>
                <button class="jenogram-close">閉じる</button>
            </div>
            <div class="jenogram-content">
                <canvas class="jenogram-canvas" width="760" height="400"></canvas>
                <div class="jenogram-help-link" id="helpLink">取扱説明</div>
                <div class="jenogram-controls">
                    <button class="jenogram-btn" id="saveBtn">データ保存</button>
                    <button class="jenogram-btn" id="exportBtn">画像出力</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(popup);
        
        const canvas = popup.querySelector('.jenogram-canvas');
        console.log('DEBUG: キャンバス要素を取得:', canvas);
        
        const editor = new JenogramEditor();
        window.jenogramEditor = editor; // グローバルに設定（ダイアログから呼び出すため）
        
        console.log('DEBUG: エディタ初期化開始');
        editor.init(canvas);
        console.log('DEBUG: エディタ初期化完了');
        
        // イベントリスナー
        popup.querySelector('.jenogram-close').onclick = () => {
            document.body.removeChild(overlay);
            document.body.removeChild(popup);
            delete window.jenogramEditor;
        };
        
        popup.querySelector('#saveBtn').onclick = () => {
            editor.saveData();
        };
        
        popup.querySelector('#undoBtn').onclick = () => {
            editor.undo();
        };
        
        popup.querySelector('#redoBtn').onclick = () => {
            editor.redo();
        };
        
        popup.querySelector('#helpLink').onclick = () => {
            showHelpPopup();
        };
        
        function showHelpPopup() {
            // 既存のヘルプポップアップを削除
            const existingHelp = document.querySelector('.jenogram-help-popup');
            if (existingHelp) {
                existingHelp.remove();
            }
            
            const helpPopup = document.createElement('div');
            helpPopup.className = 'jenogram-help-popup';
            helpPopup.innerHTML = `
                <div class="jenogram-help-header">
                    <div style="font-size: 16px; font-weight: bold;">取扱説明</div>
                    <button class="jenogram-btn" onclick="this.closest('.jenogram-help-popup').remove()">閉じる</button>
                </div>
                <div class="jenogram-help-content">
                    <p>テストです</p>
                </div>
            `;
            
            document.body.appendChild(helpPopup);
        }
        
        popup.querySelector('#exportBtn').onclick = (e) => {
            console.log('DEBUG: 画像出力ボタンがクリックされました');
            
            // イベントの伝播を停止してグローバルクリックイベントを防ぐ
            e.stopPropagation();
            e.preventDefault();
            
            try {
                // 既存のメニューを削除
                const existingMenu = document.querySelector('.jenogram-context-menu');
                if (existingMenu) {
                    console.log('DEBUG: 既存のメニューを削除しました');
                    existingMenu.remove();
                }
                
                console.log('DEBUG: 新しいメニューを作成開始');
                const exportMenu = document.createElement('div');
                exportMenu.className = 'jenogram-context-menu';
                
                // ボタンの位置を基準にメニューを配置
                const btnRect = e.target.getBoundingClientRect();
                console.log('DEBUG: ボタンの位置:', btnRect);
                
                exportMenu.style.left = (btnRect.right + 10) + 'px';
                exportMenu.style.top = btnRect.top + 'px';
                exportMenu.style.position = 'fixed';
                exportMenu.style.zIndex = '99999';
                exportMenu.style.display = 'block';
                exportMenu.style.opacity = '1';
                exportMenu.style.visibility = 'visible';
                
                console.log('DEBUG: メニューのスタイル設定完了');
                
                const addMenuItem = (text, onclick) => {
                    console.log('DEBUG: メニュー項目を追加:', text);
                    const item = document.createElement('div');
                    item.className = 'jenogram-menu-item';
                    item.textContent = text;
                    item.onclick = (menuEvent) => {
                        console.log('DEBUG: メニュー項目がクリックされました:', text);
                        menuEvent.stopPropagation();
                        onclick();
                        exportMenu.remove();
                    };
                    exportMenu.appendChild(item);
                };
                
                addMenuItem('自動で範囲を選択し出力', () => {
                    console.log('DEBUG: 自動範囲選択出力を実行');
                    editor.exportToPng(true);
                });
                addMenuItem('自分で範囲を選択して出力', () => {
                    console.log('DEBUG: 手動範囲選択出力を実行');
                    editor.exportToPng(false);
                });
                
                console.log('DEBUG: メニューをDOMに追加');
                document.body.appendChild(exportMenu);
                
                console.log('DEBUG: メニューが正常に表示されました');
                console.log('DEBUG: メニュー要素:', exportMenu);
                console.log('DEBUG: メニューのスタイル:', window.getComputedStyle(exportMenu));
                
                // メニュー外クリックで閉じる（少し遅延させる）
                setTimeout(() => {
                    const closeMenu = (clickEvent) => {
                        console.log('DEBUG: クリックイベント発生、対象:', clickEvent.target);
                        if (!exportMenu.contains(clickEvent.target) && 
                            !e.target.contains(clickEvent.target) &&
                            clickEvent.target !== e.target) {
                            console.log('DEBUG: メニュー外クリックでメニューを閉じます');
                            exportMenu.remove();
                            document.removeEventListener('click', closeMenu);
                        } else {
                            console.log('DEBUG: メニュー内またはボタンクリックのためメニューを維持');
                        }
                    };
                    document.addEventListener('click', closeMenu, true); // キャプチャフェーズで処理
                }, 100); // 遅延を増やす
                
            } catch (error) {
                console.error('DEBUG: 画像出力メニュー表示でエラーが発生:', error);
                alert('メニュー表示でエラーが発生しました: ' + error.message);
            }
        };
        
        overlay.onclick = () => {
            document.body.removeChild(overlay);
            document.body.removeChild(popup);
            delete window.jenogramEditor;
        };
    }

    // ポップアップ拡大表示機能
    function showJenogramPopup(dataString) {
        try {
            // オーバーレイを作成
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            overlay.style.zIndex = '10000';
            
            // ポップアップコンテナを作成
            const popup = document.createElement('div');
            popup.style.position = 'fixed';
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            popup.style.backgroundColor = 'white';
            popup.style.borderRadius = '8px';
            popup.style.padding = '20px';
            popup.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
            popup.style.maxWidth = '90vw';
            popup.style.maxHeight = '90vh';
            popup.style.overflow = 'auto';
            
            // ヘッダーを作成
            const header = document.createElement('div');
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
            header.style.marginBottom = '20px';
            
            const title = document.createElement('h3');
            title.textContent = 'ジェノグラム（拡大表示）';
            title.style.margin = '0';
            
            const closeButton = document.createElement('button');
            closeButton.textContent = '×';
            closeButton.style.background = '#dc3545';
            closeButton.style.color = 'white';
            closeButton.style.border = 'none';
            closeButton.style.borderRadius = '50%';
            closeButton.style.width = '30px';
            closeButton.style.height = '30px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.fontSize = '16px';
            closeButton.style.fontWeight = 'bold';
            
            header.appendChild(title);
            header.appendChild(closeButton);
            
            // キャンバスを作成
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 600;
            canvas.style.border = '1px solid #ddd';
            canvas.style.backgroundColor = 'white';
            canvas.style.maxWidth = '100%';
            canvas.style.height = 'auto';
            
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 800, 600);
            
            // データを描画
            const data = JSON.parse(dataString);
            if (data && data.length > 0) {
                // 要素の範囲を計算
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                
                data.forEach(element => {
                    let elementMinX, elementMinY, elementMaxX, elementMaxY;
                    
                    switch (element.type) {
                        case 'person':
                            const personSize = 25;
                            elementMinX = element.x - personSize;
                            elementMinY = element.y - personSize;
                            elementMaxX = element.x + personSize;
                            elementMaxY = element.y + personSize;
                            break;
                        case 'line':
                            elementMinX = Math.min(element.x, element.data.endX);
                            elementMinY = Math.min(element.y, element.data.endY);
                            elementMaxX = Math.max(element.x, element.data.endX);
                            elementMaxY = Math.max(element.y, element.data.endY);
                            break;
                        case 'circle':
                            const radius = element.data.radius || 80;
                            elementMinX = element.x - radius;
                            elementMinY = element.y - radius;
                            elementMaxX = element.x + radius;
                            elementMaxY = element.y + radius;
                            break;
                        case 'curve':
                            const points = element.data.points || [];
                            if (points.length > 0) {
                                elementMinX = Math.min(...points.map(p => p.x));
                                elementMinY = Math.min(...points.map(p => p.y));
                                elementMaxX = Math.max(...points.map(p => p.x));
                                elementMaxY = Math.max(...points.map(p => p.y));
                            }
                            break;
                        case 'text':
                            elementMinX = element.x - 50;
                            elementMinY = element.y - 10;
                            elementMaxX = element.x + 50;
                            elementMaxY = element.y + 10;
                            break;
                        default:
                            return;
                    }
                    
                    minX = Math.min(minX, elementMinX);
                    minY = Math.min(minY, elementMinY);
                    maxX = Math.max(maxX, elementMaxX);
                    maxY = Math.max(maxY, elementMaxY);
                });
                
                // スケーリング計算
                const margin = 50;
                const contentWidth = maxX - minX;
                const contentHeight = maxY - minY;
                const scaleX = (800 - 2 * margin) / contentWidth;
                const scaleY = (600 - 2 * margin) / contentHeight;
                const scale = Math.min(scaleX, scaleY, 1);
                
                const offsetX = margin + (800 - 2 * margin - contentWidth * scale) / 2 - minX * scale;
                const offsetY = margin + (600 - 2 * margin - contentHeight * scale) / 2 - minY * scale;
                
                ctx.save();
                ctx.translate(offsetX, offsetY);
                ctx.scale(scale, scale);
                
                // 要素を描画
                data.forEach(element => {
                    drawElementToCanvas(ctx, element);
                });
                
                ctx.restore();
            }
            
            // 要素を組み立て
            popup.appendChild(header);
            popup.appendChild(canvas);
            overlay.appendChild(popup);
            document.body.appendChild(overlay);
            
            // 閉じるイベント
            const closePopup = () => {
                document.body.removeChild(overlay);
            };
            
            closeButton.onclick = closePopup;
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    closePopup();
                }
            };
            
            // ESCキーで閉じる
            const handleKeydown = (e) => {
                if (e.key === 'Escape') {
                    closePopup();
                    document.removeEventListener('keydown', handleKeydown);
                }
            };
            document.addEventListener('keydown', handleKeydown);
            
        } catch (error) {
            console.error('ポップアップ表示エラー:', error);
            alert('ポップアップ表示でエラーが発生しました');
        }
    }

    // 要素をキャンバスに描画する関数
    function drawElementToCanvas(ctx, element) {
        ctx.save();
        
        switch (element.type) {
            case 'person':
                const size = 25;
                const x = element.x;
                const y = element.y;
                
                ctx.strokeStyle = element.data && element.data.isTarget ? '#000000' : '#333';
                ctx.lineWidth = element.data && element.data.isTarget ? 3 : 2;
                
                if (element.data && element.data.gender === 'female') {
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, 2 * Math.PI);
                    ctx.stroke();
                    
                    // 対象者の場合は二重丸
                    if (element.data.isTarget) {
                        ctx.beginPath();
                        ctx.arc(x, y, size - 4, 0, 2 * Math.PI);
                        ctx.stroke();
                    }
                } else {
                    ctx.strokeRect(x - size, y - size, size * 2, size * 2);
                    
                    // 対象者の場合は二重四角
                    if (element.data && element.data.isTarget) {
                        ctx.strokeRect(x - size + 4, y - size + 4, (size - 4) * 2, (size - 4) * 2);
                    }
                }
                
                // 死亡者マーク
                if (element.data && element.data.isDead) {
                    ctx.beginPath();
                    ctx.moveTo(x - size, y - size);
                    ctx.lineTo(x + size, y + size);
                    ctx.moveTo(x + size, y - size);
                    ctx.lineTo(x - size, y + size);
                    ctx.stroke();
                }
                
                // テキスト表示
                if (element.data && element.data.text) {
                    ctx.fillStyle = '#000';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(element.data.text, x, y);
                }
                break;
                
            case 'line':
                ctx.strokeStyle = '#666';
                ctx.lineWidth = 2;
                
                // 点線設定
                if (element.data.dashed) {
                    ctx.setLineDash([5, 5]);
                } else if (element.data.wavy) {
                    ctx.setLineDash([10, 5]);
                } else {
                    ctx.setLineDash([]);
                }
                
                ctx.beginPath();
                ctx.moveTo(element.x, element.y);
                ctx.lineTo(element.data.endX, element.data.endY);
                ctx.stroke();
                ctx.setLineDash([]);
                break;
                
            case 'circle':
                ctx.strokeStyle = '#666';
                ctx.lineWidth = 2;
                
                // 点線設定
                if (element.data.dashed) {
                    ctx.setLineDash([5, 5]);
                } else {
                    ctx.setLineDash([]);
                }
                
                if (element.data.type === 'ellipse') {
                    const width = element.data.width || 120;
                    const height = element.data.height || 80;
                    ctx.beginPath();
                    ctx.ellipse(element.x, element.y, width/2, height/2, 0, 0, 2 * Math.PI);
                    ctx.stroke();
                } else {
                    const radius = element.data.radius || 80;
                    ctx.beginPath();
                    ctx.arc(element.x, element.y, radius, 0, 2 * Math.PI);
                    ctx.stroke();
                }
                ctx.setLineDash([]);
                break;
                
            case 'curve':
                const points = element.data.points || [];
                if (points.length >= 2) {
                    ctx.strokeStyle = '#666';
                    ctx.lineWidth = 2;
                    
                    // 点線設定
                    if (element.data.dashed) {
                        ctx.setLineDash([5, 5]);
                    } else {
                        ctx.setLineDash([]);
                    }
                    
                    ctx.beginPath();
                    ctx.moveTo(points[0].x, points[0].y);
                    
                    for (let i = 1; i < points.length - 1; i++) {
                        const xc = (points[i].x + points[i + 1].x) / 2;
                        const yc = (points[i].y + points[i + 1].y) / 2;
                        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
                    }
                    
                    if (points.length > 1) {
                        const lastPoint = points[points.length - 1];
                        ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, lastPoint.x, lastPoint.y);
                    }
                    
                    // 閉じた曲線の場合
                    if (element.data.closed && points.length >= 3) {
                        ctx.closePath();
                    }
                    
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
                break;
                
            case 'text':
                const content = element.data.content || '';
                const fontSize = element.data.fontSize || 14;
                ctx.font = `${fontSize}px Arial, sans-serif`;
                ctx.fillStyle = element.data.color || '#000000';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(content, element.x, element.y);
                break;
        }
        
        ctx.restore();
    }

    // レコード詳細画面でのイベント
    kintone.events.on(['app.record.detail.show'], (event) => {
        const spaceElement = kintone.app.record.getSpaceElement('intake_jenogram');
        if (spaceElement) {
            // データがあるかチェック
            const record = event.record;
            if (record.inner_jenogram && record.inner_jenogram.value && record.inner_jenogram.value.trim() !== '') {
                // データがある場合は正確なイメージを直接表示
                renderJenogramDetail(spaceElement, record.inner_jenogram.value, false); // 詳細画面は編集不可
            } else {
                // データがない場合はメッセージ表示
                spaceElement.innerHTML = '<div style="padding: 20px; border: 2px dashed #ddd; text-align: center; border-radius: 8px; background: #f9f9f9; color: #666;">ジェノグラムデータなし</div>';
            }
        }
        return event;
    });

    // レコード編集画面でのイベント
    kintone.events.on(['app.record.edit.show', 'app.record.create.show'], (event) => {
        const spaceElement = kintone.app.record.getSpaceElement('intake_jenogram');
        if (spaceElement) {
            // データがあるかチェック
            const record = event.record;
            if (record.inner_jenogram && record.inner_jenogram.value && record.inner_jenogram.value.trim() !== '') {
                // データがある場合は正確なイメージを表示（編集可能）
                renderJenogramDetail(spaceElement, record.inner_jenogram.value, true); // 編集画面は編集可能
            } else {
                // データがない場合は編集ボタン表示
                spaceElement.innerHTML = '<div style="padding: 20px; border: 2px dashed #ddd; text-align: center; cursor: pointer; border-radius: 8px; background: #f9f9f9;" onclick="showJenogramEditor()">クリックしてジェノグラムを編集</div>';
            }
            
            // クリック可能にするためのグローバル関数
            window.showJenogramEditor = showJenogramEditor;
        }
        return event;
    });

})();