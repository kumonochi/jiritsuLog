class JiritsuLogApp {
    constructor() {
        this.currentPage = 'main';
        this.records = this.loadRecords();
        this.settings = this.loadSettings();
        this.countdownTimer = null;
        this.stopwatchTimer = null;
        this.countdownTime = 0;
        this.stopwatchTime = 0;
        this.isCountdownRunning = false;
        this.isStopwatchRunning = false;
        this.lapTimes = [];
        
        // Google API関連
        this.isGoogleApiLoaded = false;
        this.isSignedIn = false;
        this.currentUser = null;
        this.accessToken = null; // アクセストークンを保存
        this.GOOGLE_CLIENT_ID = '47690741133-c4pbiefj90me73dflkla5q3ie67nbqdl.apps.googleusercontent.com'; // 後で設定が必要
        this.DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
        this.SCOPES = 'https://www.googleapis.com/auth/drive.file';
        
        this.init();
    }

    init() {
        // DOM読み込み完了を待ってから初期化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.completeInit();
            });
        } else {
            this.completeInit();
        }
    }
    
    completeInit() {
        console.log('=== アプリ初期化開始 ===');
        console.log('DOM ready state:', document.readyState);
        
        this.setupEventListeners();
        this.updateSessionNumber();
        this.setCurrentDateTime();
        this.loadUserSettings();
        this.registerServiceWorker();
        this.setupVoiceRecognition();
        
        // Google API初期化は少し遅延させる
        setTimeout(() => {
            // HTML要素の存在確認
            this.debugDOMElements();
            // Google API初期化（遅延実行）
            this.waitForGoogleApiAndInit();
            // 新しいメインGoogle連携も初期化
            this.initMainGoogleAuth();
        }, 100);
    }
    
    // メインGoogle認証セクションの初期化
    initMainGoogleAuth() {
        console.log('=== メインGoogle認証初期化開始 ===');
        
        // 保存されたユーザー情報を復元
        const savedUser = localStorage.getItem('googleUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.isSignedIn = true;
                console.log('保存されたGoogle認証情報を復元しました:', this.currentUser);
            } catch (error) {
                console.error('保存されたユーザー情報の復元に失敗:', error);
                localStorage.removeItem('googleUser');
            }
        }
        
        // 3秒後に初期化（DOM要素とGoogle APIの準備完了を待つ）
        setTimeout(() => {
            this.setupMainGoogleSignin();
            
            // ユーザー情報が既にある場合はUIを更新
            if (this.currentUser && this.isSignedIn) {
                setTimeout(() => {
                    this.updateMainUserInfo(this.currentUser);
                }, 1000);
            }
        }, 3000);
    }
    
    // メインGoogle連携ボタンのセットアップ
    setupMainGoogleSignin() {
        console.log('=== メインGoogle連携ボタンセットアップ ===');
        
        const mainButton = document.getElementById('main-google-signin-button');
        const manualButton = document.getElementById('manual-google-signin');
        
        if (!mainButton) {
            console.log('メインGoogle連携ボタン要素が見つかりません');
            return;
        }
        
        console.log('メインGoogle連携ボタン要素確認:', mainButton);
        
        // Google APIが利用可能かチェック
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            try {
                console.log('Google Identity Services利用可能 - メインボタンをレンダリング');
                
                // Google Identity Services初期化
                google.accounts.id.initialize({
                    client_id: this.GOOGLE_CLIENT_ID,
                    callback: this.handleMainCredentialResponse.bind(this),
                    auto_select: false,
                    cancel_on_tap_outside: true
                });
                
                // メインボタンをレンダリング
                google.accounts.id.renderButton(mainButton, {
                    theme: 'filled_white',
                    size: 'medium',
                    text: 'signin',
                    locale: 'ja',
                    width: '200'
                });
                
                console.log('✅ メインGoogleボタンのレンダリング完了');
                
            } catch (error) {
                console.error('メインGoogleボタンレンダリングエラー:', error);
                this.showManualButton();
            }
        } else {
            console.log('Google Identity Services未利用可能 - 手動ボタンを表示');
            this.showManualButton();
        }
        
        // 5秒後にフォールバック確認
        setTimeout(() => {
            if (mainButton.innerHTML.trim() === '' && manualButton) {
                console.log('メインボタンが空のため手動ボタンを表示');
                this.showManualButton();
            }
        }, 5000);
    }
    
    // 手動ボタンを表示
    showManualButton() {
        const manualButton = document.getElementById('manual-google-signin');
        if (manualButton) {
            manualButton.style.display = 'inline-block';
            console.log('手動Googleサインインボタンを表示しました');
        }
    }
    
    // メイン認証レスポンス処理
    handleMainCredentialResponse(response) {
        console.log('=== メイン認証レスポンス受信 ===');
        console.log('認証レスポンス:', response);
        
        try {
            // JWTトークンをデコード
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            console.log('ユーザー情報:', payload);
            
            // ユーザー情報を保存
            this.currentUser = {
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                sub: payload.sub
            };
            
            // UIを更新
            this.updateMainUserInfo(this.currentUser);
            
            // ログイン状態を保存
            this.isSignedIn = true;
            localStorage.setItem('googleUser', JSON.stringify(this.currentUser));
            
            this.showPopupNotification('✅ Googleアカウントでログインしました', 'success');
            
        } catch (error) {
            console.error('認証レスポンス処理エラー:', error);
            this.showPopupNotification('❌ ログイン処理でエラーが発生しました', 'error');
        }
    }
    
    // メインユーザー情報UIの更新
    updateMainUserInfo(user) {
        const signinSection = document.getElementById('main-google-signin-section');
        const userInfoSection = document.getElementById('main-google-user-info');
        const userPicture = document.getElementById('main-user-picture');
        const userName = document.getElementById('main-user-name');
        
        if (signinSection && userInfoSection && userPicture && userName) {
            // サインインセクションを非表示
            signinSection.style.display = 'none';
            
            // ユーザー情報を表示
            userInfoSection.style.display = 'block';
            userPicture.src = user.picture || '';
            userName.textContent = user.name || user.email || 'ユーザー';
            
            console.log('メインユーザー情報UIを更新しました');
        }
    }
    
    // 手動Googleサインイン処理
    handleManualGoogleSignin() {
        console.log('手動Googleサインインが実行されました');
        
        // 設定確認
        this.checkGoogleApiConfiguration();
        
        // OAuth2フローを開始
        this.requestAccessToken();
    }
    
    // Googleサインアウト処理
    handleGoogleSignout() {
        console.log('Googleサインアウト実行');
        
        // Google Identity Servicesサインアウト
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            google.accounts.id.disableAutoSelect();
        }
        
        // 状態をリセット
        this.isSignedIn = false;
        this.currentUser = null;
        this.accessToken = null;
        
        // ローカルストレージをクリア
        localStorage.removeItem('googleUser');
        localStorage.removeItem('googleAccessToken');
        
        // UIを更新
        const signinSection = document.getElementById('main-google-signin-section');
        const userInfoSection = document.getElementById('main-google-user-info');
        
        if (signinSection && userInfoSection) {
            signinSection.style.display = 'block';
            userInfoSection.style.display = 'none';
        }
        
        this.showPopupNotification('✅ ログアウトしました', 'success');
    }
    
    // デバッグ用DOM要素確認
    debugDOMElements() {
        console.log('=== DOM要素確認 ===');
        console.log('settings-page:', document.getElementById('settings-page'));
        console.log('google-auth-section:', document.querySelector('.google-auth-section'));
        console.log('google-signin-section:', document.getElementById('google-signin-section'));
        console.log('google-signin-button:', document.getElementById('google-signin-button'));
        console.log('google-user-info:', document.getElementById('google-user-info'));
        
        // 設定ページが表示されているかチェック
        const settingsPage = document.getElementById('settings-page');
        if (settingsPage) {
            console.log('設定ページのクラス:', settingsPage.className);
            console.log('設定ページの表示状態:', window.getComputedStyle(settingsPage).display);
        }
    }

    registerServiceWorker() {
        // file://プロトコルでのService Worker登録はサポートされていないため、
        // HTTPSまたはHTTPでのアクセス時のみ登録を試行する
        if ('serviceWorker' in navigator && location.protocol !== 'file:') {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        } else if (location.protocol === 'file:') {
            console.log('Service Workerはfile://プロトコルではサポートされていません。HTTPサーバーでアクセスしてください。');
        }
    }

    setupEventListeners() {
        // ナビゲーション
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.dataset.page;
                this.showPage(page);
            });
        });

        // モバイルメニューボタン
        document.getElementById('mobile-menu-btn').addEventListener('click', () => {
            this.toggleSidebar();
        });

        // オーバーレイタップでサイドバーを閉じる
        document.getElementById('sidebar-overlay').addEventListener('click', () => {
            this.closeSidebar();
        });

        // スライドジェスチャーの設定
        this.setupSwipeGestures();

        // 記録フォーム
        document.getElementById('record-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRecord();
        });

        document.getElementById('clear-form').addEventListener('click', () => {
            this.clearForm();
        });

        // タイマー
        this.setupTimerEventListeners();

        // タブ
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.showTab(e.target.dataset.tab);
            });
        });

        // 分析期間変更
        document.getElementById('analysis-period').addEventListener('change', () => {
            this.updateDateSelector();
            this.updateAnalysis();
        });

        document.getElementById('analysis-date').addEventListener('change', () => {
            this.updateAnalysis();
        });

        document.getElementById('analysis-month').addEventListener('change', () => {
            this.updateAnalysis();
        });

        document.getElementById('analysis-year').addEventListener('change', () => {
            this.updateAnalysis();
        });

        // 設定
        this.setupSettingsEventListeners();

        // 個別設定トグルボタン
        this.setupIndividualToggleButtons();

        // CSV出力
        document.getElementById('export-csv').addEventListener('click', () => {
            this.exportCSV();
        });
        
        document.getElementById('import-csv-btn').addEventListener('click', () => {
            document.getElementById('import-csv').click();
        });
        
        document.getElementById('import-csv').addEventListener('change', (e) => {
            this.importCSV(e);
        });
        
        // Google認証関連のイベントリスナー
        this.setupGoogleAuthListeners();
    }

    setupTimerEventListeners() {
        // タイマータイプ選択
        document.querySelectorAll('input[name="timer-type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.switchTimerType(e.target.value);
            });
        });

        // カウントダウン
        document.getElementById('countdown-start').addEventListener('click', () => {
            this.startCountdown();
        });

        document.getElementById('countdown-pause').addEventListener('click', () => {
            this.pauseCountdown();
        });

        document.getElementById('countdown-stop').addEventListener('click', () => {
            this.stopCountdown();
        });

        // ストップウォッチ
        document.getElementById('stopwatch-start').addEventListener('click', () => {
            this.startStopwatch();
        });

        document.getElementById('stopwatch-pause').addEventListener('click', () => {
            this.pauseStopwatch();
        });

        document.getElementById('stopwatch-stop').addEventListener('click', () => {
            this.stopStopwatch();
        });
    }

    setupIndividualToggleButtons() {
        // 記録書き始め時間の個別設定トグルボタン
        const startTimeToggle = document.getElementById('individual-starttime-btn');
        startTimeToggle.addEventListener('click', () => {
            this.toggleIndividualSetting('starttime');
        });

        // 実施時間の個別設定トグルボタン
        const durationToggle = document.getElementById('individual-duration-btn');
        durationToggle.addEventListener('click', () => {
            this.toggleIndividualSetting('duration');
        });

        // 実施内容の個別設定トグルボタン
        const contentToggle = document.getElementById('individual-content-btn');
        contentToggle.addEventListener('click', () => {
            this.toggleIndividualSetting('content');
        });

        // 個別設定ドロップダウンの初期化
        this.initializeIndividualDropdowns();
    }

    toggleIndividualSetting(settingType) {
        const toggleBtn = document.getElementById(`individual-${settingType}-btn`);
        const globalSection = document.getElementById(`global-${settingType}`);
        const individualSection = document.getElementById(`individual-${settingType}-settings`);
        
        const isActive = toggleBtn.classList.contains('active');
        
        if (isActive) {
            // 個別設定を無効にする
            toggleBtn.classList.remove('active');
            globalSection.classList.remove('hidden');
            individualSection.style.display = 'none';
            individualSection.classList.remove('active');
            
            // グローバル設定の required 属性を復元
            if (settingType === 'duration') {
                const globalDurationSelect = document.getElementById('duration');
                globalDurationSelect.setAttribute('required', 'required');
            }
        } else {
            // 個別設定を有効にする
            toggleBtn.classList.add('active');
            globalSection.classList.add('hidden');
            individualSection.style.display = 'block';
            individualSection.classList.add('active');
            
            // グローバル設定の required 属性を削除
            if (settingType === 'duration') {
                const globalDurationSelect = document.getElementById('duration');
                globalDurationSelect.removeAttribute('required');
            }
            
            // 個別設定の初期化
            if (settingType === 'duration') {
                this.populateIndividualDurationDropdowns();
            } else if (settingType === 'content') {
                this.initializeIndividualContentSettings();
            }
        }
    }

    initializeIndividualContentSettings() {
        // 個別設定ではデフォルトでチェックなし
        for (let i = 1; i <= 3; i++) {
            const checkboxes = document.querySelectorAll(`input[name="content-${i}"]`);
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }
    }

    initializeIndividualDropdowns() {
        // 初期化時に個別設定のドロップダウンを設定
        this.populateIndividualDurationDropdowns();
    }

    calculateAutoStartTimes() {
        const baseTime = document.getElementById('start-time').value;
        const duration = parseFloat(document.getElementById('duration').value);
        
        if (!baseTime || !duration) {
            return {
                round1: baseTime || '',
                round2: baseTime || '',
                round3: baseTime || ''
            };
        }
        
        const [hours, minutes] = baseTime.split(':').map(Number);
        let currentTime = new Date();
        currentTime.setHours(hours, minutes, 0, 0);
        
        const round1Time = this.formatTime(currentTime);
        
        // 2回目: 開始時間 + 実施時間 * 1
        currentTime.setMinutes(currentTime.getMinutes() + duration);
        const round2Time = this.formatTime(currentTime);
        
        // 3回目: 開始時間 + 実施時間 * 2
        currentTime.setMinutes(currentTime.getMinutes() + duration);
        const round3Time = this.formatTime(currentTime);
        
        return {
            round1: round1Time,
            round2: round2Time,
            round3: round3Time
        };
    }
    
    formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    populateIndividualDurationDropdowns() {
        const allDurations = this.settings.durationOrder || this.getDefaultDurationOrder();
        
        for (let i = 1; i <= 3; i++) {
            const select = document.getElementById(`duration-${i}`);
            if (select) {
                select.innerHTML = '';
                
                // 空欄オプションを先頭に追加
                const emptyOption = document.createElement('option');
                emptyOption.value = '';
                emptyOption.textContent = '選択してください';
                select.appendChild(emptyOption);
                
                allDurations.forEach(duration => {
                    const option = document.createElement('option');
                    option.value = duration.value;
                    option.textContent = duration.label;
                    select.appendChild(option);
                });
            }
        }
    }

    setupSettingsEventListeners() {
        // フォント変更
        document.getElementById('font-family').addEventListener('change', (e) => {
            this.changeFontFamily(e.target.value);
        });

        // 通知設定
        document.getElementById('enable-notifications').addEventListener('click', () => {
            this.enableNotifications();
        });

        // デフォルト実施内容
        document.querySelectorAll('input[name="default-content"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.saveDefaultContent();
            });
        });

        // 実施時間追加
        document.getElementById('add-duration').addEventListener('click', () => {
            this.addDurationOption();
        });

        // アコーディオン設定
        this.setupAccordions();
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            document.querySelectorAll('.voice-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const targetId = e.target.dataset.target;
                    this.startVoiceRecognition(targetId, btn);
                });
            });
        } else {
            // 音声認識が利用できない場合はボタンを非表示
            document.querySelectorAll('.voice-btn').forEach(btn => {
                btn.style.display = 'none';
            });
        }
    }

    async startVoiceRecognition(targetId, button) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            alert('お使いのブラウザは音声認識をサポートしていません。');
            return;
        }

        // マイクの許可と利用可能なデバイスの確認
        try {
            // 利用可能なマイクデバイスを取得
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputs = devices.filter(device => device.kind === 'audioinput');
            
            if (audioInputs.length === 0) {
                alert('使用できるマイクがありません。\n\nマイクが接続されているか確認してください。');
                return;
            }
            
            // 標準マイクを優先的に選択
            let selectedDeviceId = null;
            const defaultDevice = audioInputs.find(device => 
                device.deviceId === 'default' || 
                device.label.toLowerCase().includes('default') ||
                device.label.toLowerCase().includes('built-in') ||
                device.label.toLowerCase().includes('内蔵')
            );
            
            if (defaultDevice) {
                selectedDeviceId = defaultDevice.deviceId;
            } else {
                // デフォルトが見つからない場合は最初のデバイスを使用
                selectedDeviceId = audioInputs[0].deviceId;
            }
            
            // 選択されたマイクでストリームを取得
            const constraints = {
                audio: {
                    deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            // 許可が得られたらストリームを停止
            stream.getTracks().forEach(track => track.stop());
            
        } catch (error) {
            console.error('マイク許可エラー:', error);
            
            if (error.name === 'NotAllowedError') {
                const result = confirm(
                    'マイクの使用許可が必要です。\n\n' +
                    '1. ブラウザのアドレスバー左側のマイクアイコンをクリック\n' +
                    '2. 「マイクの使用を許可」を選択\n' +
                    '3. ページを再読み込みしてください\n\n' +
                    'ブラウザの設定ページを開きますか？'
                );
                if (result) {
                    if (navigator.userAgent.includes('Chrome')) {
                        window.open('chrome://settings/content/microphone', '_blank');
                    } else {
                        alert('ブラウザの設定からマイクの使用を許可してください。');
                    }
                }
            } else if (error.name === 'NotFoundError') {
                alert('使用できるマイクがありません。\n\nマイクが正しく接続されているか確認してください。');
            } else if (error.name === 'NotReadableError') {
                alert('マイクが他のアプリケーションで使用中です。\n\n他のアプリを閉じてから再度お試しください。');
            } else {
                alert('マイクにアクセスできませんでした。\n\nマイクが正しく接続されているか確認してください。');
            }
            return;
        }

        const recognition = new SpeechRecognition();
        
        recognition.lang = 'ja-JP';
        recognition.continuous = false;
        recognition.interimResults = false;

        button.classList.add('recording');
        button.disabled = true;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const textarea = document.getElementById(targetId);
            textarea.value += (textarea.value ? '\n' : '') + transcript;
        };

        recognition.onerror = (event) => {
            console.error('音声認識エラー:', event.error);
            let errorMessage = '音声認識に失敗しました。';
            
            switch(event.error) {
                case 'not-allowed':
                    errorMessage = 'マイクの使用が許可されていません。ブラウザの設定でマイクの使用を許可してください。';
                    break;
                case 'no-speech':
                    errorMessage = '音声が検出されませんでした。マイクに向かってはっきりと話してください。';
                    break;
                case 'network':
                    errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
                    break;
                case 'audio-capture':
                    errorMessage = 'マイクにアクセスできませんでした。\n\n・マイクが正しく接続されているか確認\n・他のアプリでマイクを使用していないか確認\n・ブラウザでマイクの使用が許可されているか確認';
                    break;
                case 'aborted':
                    errorMessage = '音声認識が中断されました。';
                    break;
                case 'language-not-supported':
                    errorMessage = '選択された言語はサポートされていません。';
                    break;
                default:
                    errorMessage = `音声認識エラー: ${event.error}\n\nマイクの接続と設定を確認してください。`;
            }
            
            alert(errorMessage);
        };

        recognition.onend = () => {
            button.classList.remove('recording');
            button.disabled = false;
        };

        try {
            recognition.start();
        } catch (error) {
            console.error('音声認識開始エラー:', error);
            alert('音声認識を開始できませんでした。ブラウザがサポートしていない可能性があります。');
            button.classList.remove('recording');
            button.disabled = false;
        }
    }

    showPage(pageId) {
        // すべてのページを非表示
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // ナビゲーションリンクの状態更新
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // 指定されたページを表示
        document.getElementById(`${pageId}-page`).classList.add('active');
        document.querySelector(`[data-page="${pageId}"]`).classList.add('active');

        // タイマーページから離れる時はラップタイムをリセット
        if (this.currentPage === 'timer' && pageId !== 'timer') {
            this.lapTimes = [];
            this.updateLapTimes();
        }

        this.currentPage = pageId;

        // ページ固有の初期化処理
        if (pageId === 'records') {
            this.displayRecords();
            this.updateAnalysis();
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const isOpen = sidebar.classList.contains('open');
        
        if (isOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }

    openSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let isTracking = false;

        const mainContent = document.getElementById('main-content');
        
        // タッチスタート
        mainContent.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isTracking = true;
        }, { passive: true });

        // タッチムーブ
        mainContent.addEventListener('touchmove', (e) => {
            if (!isTracking) return;

            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;

            const diffX = currentX - startX;
            const diffY = currentY - startY;

            // 縦方向のスクロールを優先
            if (Math.abs(diffY) > Math.abs(diffX)) {
                isTracking = false;
                return;
            }

            // 左端からのスライドかつ右方向のスライド
            if (startX < 50 && diffX > 50) {
                e.preventDefault();
            }
        }, { passive: false });

        // タッチエンド
        mainContent.addEventListener('touchend', (e) => {
            if (!isTracking) return;

            const diffX = currentX - startX;
            const diffY = currentY - startY;

            // スライドの閉値を満たしているかチェック
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 100) {
                if (startX < 50 && diffX > 0) {
                    // 左端から右方向のスライドでサイドバーを開く
                    this.openSidebar();
                }
            }

            isTracking = false;
        }, { passive: true });
    }

    updateSessionNumber() {
        const today = this.getAdjustedDate();
        const todayRecords = this.records.filter(record => record.date === today);
        const sessionNumber = todayRecords.length + 1;
        
        document.getElementById('session-number').textContent = `本日${sessionNumber}セット目`;
    }

    getAdjustedDate() {
        const now = new Date();
        const adjustedDate = new Date(now);
        
        // 3時前の場合は前日とする
        if (now.getHours() < 3) {
            adjustedDate.setDate(adjustedDate.getDate() - 1);
        }
        
        return adjustedDate.toISOString().split('T')[0];
    }

    setCurrentDateTime() {
        const now = new Date();
        const today = this.getAdjustedDate();
        const currentTime = now.toTimeString().slice(0, 5);

        document.getElementById('record-date').value = today;
        document.getElementById('start-time').value = currentTime;
        
        // デフォルト実施時間を設定
        const durationSelect = document.getElementById('duration');
        if (durationSelect && this.settings.defaultDuration) {
            durationSelect.value = this.settings.defaultDuration;
        }
    }

    saveRecord() {
        // 個別設定の状態をチェック
        const individualStartTime = document.getElementById('individual-starttime-btn').classList.contains('active');
        const individualDuration = document.getElementById('individual-duration-btn').classList.contains('active');
        const individualContent = document.getElementById('individual-content-btn').classList.contains('active');
        
        // 個別設定が無効の場合、自動入力処理を実行
        if (!individualStartTime) {
            this.autoFillIndividualStartTimes();
        }
        if (!individualDuration) {
            this.autoFillIndividualDurations();
        }
        if (!individualContent) {
            this.autoFillIndividualContent();
        }

        // 個別設定時に開始時間が未入力の回の実施時間と実施内容を空欄にする
        if (individualStartTime) {
            this.clearEmptyRounds();
        }
        
        // 開始時間の個別設定バリデーション（1回目のみ必須）
        if (individualStartTime) {
            const firstTimeInput = document.getElementById('start-time-1');
            if (!firstTimeInput.value) {
                this.showPopupNotification('1回目の記録開始時間を入力してください', 'warning');
                return;
            }
        }
        
        // 実施時間のバリデーション
        if (individualDuration) {
            // 個別設定時のバリデーション（開始時間が入力されている回のみチェック）
            for (let i = 1; i <= 3; i++) {
                const startTimeInput = document.getElementById(`start-time-${i}`);
                const durationSelect = document.getElementById(`duration-${i}`);
                // 開始時間が入力されている場合のみ実施時間を必須とする
                if (startTimeInput.value && !durationSelect.value) {
                    this.showPopupNotification(`${i}回目の実施時間を選択してください`, 'warning');
                    return;
                }
            }
        } else {
            // グローバル設定時のバリデーション
            const globalDuration = document.getElementById('duration').value;
            if (!globalDuration) {
                this.showPopupNotification('実施時間を選択してください', 'warning');
                return;
            }
        }
        
        // 実施内容のバリデーション（開始時間が入力されている回のみチェック）
        if (individualContent) {
            // 個別設定時のバリデーション
            for (let i = 1; i <= 3; i++) {
                const startTimeInput = document.getElementById(`start-time-${i}`);
                const selectedRoundContent = Array.from(document.querySelectorAll(`input[name="content-${i}"]:checked`));
                // 開始時間が入力されている場合のみ実施内容を必須とする
                if (startTimeInput.value && selectedRoundContent.length === 0) {
                    this.showPopupNotification(`${i}回目の実施内容を選択してください`, 'warning');
                    return;
                }
            }
        } else {
            // グローバル設定時のバリデーション
            const selectedContent = Array.from(document.querySelectorAll('input[name="content"]:checked'));
            if (selectedContent.length === 0) {
                this.showPopupNotification('実施内容を選択してください', 'warning');
                return;
            }
        }

        // グローバル実施内容を取得（グローバル設定時のみ）
        const selectedContent = individualContent ? [] : Array.from(document.querySelectorAll('input[name="content"]:checked'));

        // 記録開始時間の処理
        let startTimeData;
        if (individualStartTime) {
            startTimeData = {
                round1: document.getElementById('start-time-1').value,
                round2: document.getElementById('start-time-2').value,
                round3: document.getElementById('start-time-3').value
            };
        } else {
            // 自動計算されたデータを取得
            startTimeData = {
                round1: document.getElementById('start-time-1').value,
                round2: document.getElementById('start-time-2').value,
                round3: document.getElementById('start-time-3').value
            };
        }

        // 実施時間の処理
        let durationData;
        if (individualDuration) {
            durationData = {
                round1: document.getElementById('duration-1').value,
                round2: document.getElementById('duration-2').value,
                round3: document.getElementById('duration-3').value
            };
        } else {
            // 自動設定されたデータを取得
            durationData = {
                round1: document.getElementById('duration-1').value,
                round2: document.getElementById('duration-2').value,
                round3: document.getElementById('duration-3').value
            };
        }

        // 実施内容の処理
        let contentData;
        if (individualContent) {
            contentData = {
                round1: Array.from(document.querySelectorAll('input[name="content-1"]:checked')).map(cb => cb.value),
                round2: Array.from(document.querySelectorAll('input[name="content-2"]:checked')).map(cb => cb.value),
                round3: Array.from(document.querySelectorAll('input[name="content-3"]:checked')).map(cb => cb.value)
            };
        } else {
            // 自動設定されたデータを取得
            contentData = {
                round1: Array.from(document.querySelectorAll('input[name="content-1"]:checked')).map(cb => cb.value),
                round2: Array.from(document.querySelectorAll('input[name="content-2"]:checked')).map(cb => cb.value),
                round3: Array.from(document.querySelectorAll('input[name="content-3"]:checked')).map(cb => cb.value)
            };
        }

        const record = {
            id: Date.now(),
            date: document.getElementById('record-date').value,
            startTime: startTimeData,
            duration: durationData,
            content: contentData,
            records: {
                round1: document.getElementById('record-1').value,
                round2: document.getElementById('record-2').value,
                round3: document.getElementById('record-3').value
            },
            sessionNumber: this.getCurrentSessionNumber(),
            timestamp: new Date().toISOString(),
            individualSettings: {
                startTime: individualStartTime,
                duration: individualDuration,
                content: individualContent
            }
        };

        this.records.push(record);
        this.saveRecords();
        
        this.showPopupNotification('記録を保存しました！', 'success');
        this.clearForm();
        this.updateSessionNumber();
    }

    autoFillIndividualStartTimes() {
        const autoTimes = this.calculateAutoStartTimes();
        
        // 個別設定の入力欄にデータを設定
        document.getElementById('start-time-1').value = autoTimes.round1;
        document.getElementById('start-time-2').value = autoTimes.round2;
        document.getElementById('start-time-3').value = autoTimes.round3;
    }

    autoFillIndividualDurations() {
        const globalDuration = document.getElementById('duration').value;
        
        // 個別設定の入力欄にデータを設定
        document.getElementById('duration-1').value = globalDuration;
        document.getElementById('duration-2').value = globalDuration;
        document.getElementById('duration-3').value = globalDuration;
    }

    autoFillIndividualContent() {
        const selectedContent = Array.from(document.querySelectorAll('input[name="content"]:checked')).map(cb => cb.value);
        
        // 全ての個別設定のチェックボックスをリセット
        for (let i = 1; i <= 3; i++) {
            document.querySelectorAll(`input[name="content-${i}"]`).forEach(checkbox => {
                checkbox.checked = selectedContent.includes(checkbox.value);
            });
        }
    }

    clearEmptyRounds() {
        for (let i = 1; i <= 3; i++) {
            const startTimeInput = document.getElementById(`start-time-${i}`);
            const durationSelect = document.getElementById(`duration-${i}`);
            const contentCheckboxes = document.querySelectorAll(`input[name="content-${i}"]`);
            
            // 開始時間が空の場合、その回の実施時間と実施内容を空欄にする
            if (!startTimeInput.value) {
                // 実施時間を空欄に
                if (durationSelect) {
                    durationSelect.value = '';
                }
                
                // 実施内容のチェックボックスをすべて外す
                contentCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
            }
        }
    }

    getCurrentSessionNumber() {
        const date = document.getElementById('record-date').value;
        const dateRecords = this.records.filter(record => record.date === date);
        return dateRecords.length + 1;
    }

    clearForm() {
        document.getElementById('record-form').reset();
        this.setCurrentDateTime();
        this.loadDefaultContent();
        this.updateSessionNumber();
        
        // 個別設定をリセット
        this.resetIndividualSettings();
    }

    resetIndividualSettings() {
        // トグルボタンをリセット
        document.getElementById('individual-starttime-btn').classList.remove('active');
        document.getElementById('individual-duration-btn').classList.remove('active');
        document.getElementById('individual-content-btn').classList.remove('active');
        
        // 表示状態をリセット
        document.getElementById('global-starttime').classList.remove('hidden');
        document.getElementById('global-duration').classList.remove('hidden');
        document.getElementById('global-content').classList.remove('hidden');
        document.getElementById('individual-starttime-settings').style.display = 'none';
        document.getElementById('individual-duration-settings').style.display = 'none';
        document.getElementById('individual-content-settings').style.display = 'none';
        document.getElementById('individual-starttime-settings').classList.remove('active');
        document.getElementById('individual-duration-settings').classList.remove('active');
        document.getElementById('individual-content-settings').classList.remove('active');
    }

    loadDefaultContent() {
        const defaultContent = this.settings.defaultContent || [];
        document.querySelectorAll('input[name="content"]').forEach(checkbox => {
            checkbox.checked = defaultContent.includes(checkbox.value);
        });
    }

    // データ保存・読み込み
    saveRecords() {
        localStorage.setItem('jiritsulog_records', JSON.stringify(this.records));
    }

    loadRecords() {
        const stored = localStorage.getItem('jiritsulog_records');
        return stored ? JSON.parse(stored) : [];
    }

    saveSettings() {
        localStorage.setItem('jiritsulog_settings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const stored = localStorage.getItem('jiritsulog_settings');
        return stored ? JSON.parse(stored) : {
            fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif",
            defaultContent: [],
            customDurations: [],
            defaultDuration: '2', // デフォルトは2分
            notifications: {
                daily: false,
                dailyTime: '09:00',
                weekly: {}
            }
        };
    }

    loadUserSettings() {
        // フォント設定を適用
        document.body.style.fontFamily = this.settings.fontFamily;
        document.getElementById('font-family').value = this.settings.fontFamily;

        // デフォルト実施内容を適用
        document.querySelectorAll('input[name="default-content"]').forEach(checkbox => {
            checkbox.checked = this.settings.defaultContent.includes(checkbox.value);
        });

        this.loadDefaultContent();
        this.loadDurationSettings();
    }

    setupAccordions() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const target = header.dataset.target;
                const content = document.getElementById(target);
                const icon = header.querySelector('.accordion-icon');
                
                if (content.classList.contains('open')) {
                    content.classList.remove('open');
                    icon.textContent = '▼';
                } else {
                    content.classList.add('open');
                    icon.textContent = '▲';
                }
            });
        });
    }

    // タイマー機能
    switchTimerType(type) {
        document.querySelectorAll('.timer-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${type}-section`).classList.add('active');
    }

    startCountdown() {
        if (!this.isCountdownRunning) {
            const minutes = parseInt(document.getElementById('countdown-minutes').value) || 0;
            const seconds = parseInt(document.getElementById('countdown-seconds').value) || 0;
            this.countdownTime = minutes * 60 + seconds;
        }

        this.isCountdownRunning = true;
        document.getElementById('countdown-start').disabled = true;
        document.getElementById('countdown-pause').disabled = false;

        this.countdownTimer = setInterval(() => {
            if (this.countdownTime <= 0) {
                this.countdownFinished();
                return;
            }

            this.countdownTime--;
            this.updateCountdownDisplay();
        }, 1000);
    }

    pauseCountdown() {
        this.isCountdownRunning = false;
        clearInterval(this.countdownTimer);
        document.getElementById('countdown-start').disabled = false;
        document.getElementById('countdown-pause').disabled = true;
    }

    stopCountdown() {
        this.isCountdownRunning = false;
        clearInterval(this.countdownTimer);
        this.countdownTime = 0;
        this.updateCountdownDisplay();
        document.getElementById('countdown-start').disabled = false;
        document.getElementById('countdown-pause').disabled = true;
    }

    countdownFinished() {
        this.stopCountdown();
        this.playAlarmSound();
        this.showPopupNotification('時間になりました！', 'success');
    }

    updateCountdownDisplay() {
        const minutes = Math.floor(this.countdownTime / 60);
        const seconds = this.countdownTime % 60;
        document.getElementById('countdown-display').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    playAlarmSound() {
        // 簡単なビープ音を生成
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
    }

    startStopwatch() {
        this.isStopwatchRunning = true;
        document.getElementById('stopwatch-start').disabled = true;
        document.getElementById('stopwatch-pause').disabled = false;

        this.stopwatchTimer = setInterval(() => {
            this.stopwatchTime++;
            this.updateStopwatchDisplay();
        }, 1000);
    }

    pauseStopwatch() {
        this.isStopwatchRunning = false;
        clearInterval(this.stopwatchTimer);
        document.getElementById('stopwatch-start').disabled = false;
        document.getElementById('stopwatch-pause').disabled = true;
    }

    stopStopwatch() {
        this.isStopwatchRunning = false;
        clearInterval(this.stopwatchTimer);
        
        // ラップタイムを記録
        if (this.stopwatchTime > 0) {
            this.lapTimes.push(this.stopwatchTime);
            if (this.lapTimes.length > 3) {
                this.lapTimes = this.lapTimes.slice(-3);
            }
            this.updateLapTimes();
        }

        this.stopwatchTime = 0;
        this.updateStopwatchDisplay();
        document.getElementById('stopwatch-start').disabled = false;
        document.getElementById('stopwatch-pause').disabled = true;
    }

    updateStopwatchDisplay() {
        const hours = Math.floor(this.stopwatchTime / 3600);
        const minutes = Math.floor((this.stopwatchTime % 3600) / 60);
        const seconds = this.stopwatchTime % 60;
        
        document.getElementById('stopwatch-display').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateLapTimes() {
        const lapList = document.getElementById('lap-list');
        lapList.innerHTML = '';
        
        this.lapTimes.forEach((time, index) => {
            const li = document.createElement('li');
            const hours = Math.floor(time / 3600);
            const minutes = Math.floor((time % 3600) / 60);
            const seconds = time % 60;
            
            li.textContent = `${index + 1}回目: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            lapList.appendChild(li);
        });
    }

    // タブ機能
    showTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');

        if (tabId === 'analysis') {
            this.updateAnalysis();
        }
    }

    // 記録表示
    displayRecords() {
        const container = document.getElementById('records-container');
        container.innerHTML = '';

        if (this.records.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">まだ記録がありません</p>';
            return;
        }

        // 日付順、セット数順でソート
        const sortedRecords = this.records.sort((a, b) => {
            if (a.date !== b.date) {
                return new Date(b.date) - new Date(a.date);
            }
            return b.sessionNumber - a.sessionNumber;
        });

        sortedRecords.forEach(record => {
            const recordElement = this.createRecordElement(record);
            container.appendChild(recordElement);
        });
    }

    createRecordElement(record) {
        const div = document.createElement('div');
        div.className = 'record-item';
        
        // 実施内容の表示を新しい形式に対応（常に灰色枠で表示）
        let contentItems = '未選択';
        if (record.content && typeof record.content === 'object' && record.content.round1) {
            // 新しい形式（常に個別表示形式で表示）
            contentItems = `
                <div class="individual-display">
                    <div>1回目　${record.content.round1.join(', ') || '-'}</div>
                    <div>2回目　${record.content.round2.join(', ') || '-'}</div>
                    <div>3回目　${record.content.round3.join(', ') || '-'}</div>
                </div>
            `;
        } else if (Array.isArray(record.content)) {
            // 古い形式（互換性のため、灰色枠で表示）
            const content = record.content.join(', ') || '未選択';
            contentItems = `
                <div class="individual-display">
                    <div>1回目　${content}</div>
                    <div>2回目　${content}</div>
                    <div>3回目　${content}</div>
                </div>
            `;
        }
        
        div.innerHTML = `
            <div class="record-header">
                <span class="record-date">${record.date}</span>
                <span class="record-session">${record.sessionNumber}セット目</span>
                <div class="record-actions">
                    <button class="edit-btn" onclick="app.editRecord('${record.id}')">編集</button>
                    <button class="delete-btn" onclick="app.deleteRecord('${record.id}')">削除</button>
                </div>
            </div>
            <div class="record-details">
                <div class="record-detail">
                    <strong>開始時間:</strong> ${this.formatStartTimeDisplay(record)}
                </div>
                <div class="record-detail">
                    <strong>実施時間:</strong> ${this.formatDurationDisplay(record)}
                </div>
                <div class="record-detail">
                    <strong>実施内容:</strong> ${contentItems}
                </div>
            </div>
            <div class="record-notes">
                ${record.records.round1 ? `<div><strong>1回目:</strong> ${record.records.round1}</div>` : ''}
                ${record.records.round2 ? `<div><strong>2回目:</strong> ${record.records.round2}</div>` : ''}
                ${record.records.round3 ? `<div><strong>3回目:</strong> ${record.records.round3}</div>` : ''}
            </div>
        `;

        return div;
    }

    getDurationLabel(value) {
        const allDurations = this.settings.durationOrder || this.getDefaultDurationOrder();
        const duration = allDurations.find(d => d.value === value.toString());
        return duration ? duration.label : `${value}分`;
    }

    formatStartTimeDisplay(record) {
        // 新しいデータ形式の場合
        if (typeof record.startTime === 'object' && record.startTime.round1) {
            return `
                <div class="individual-display">
                    <div>1回目　${record.startTime.round1 || '-'}</div>
                    <div>2回目　${record.startTime.round2 || '-'}</div>
                    <div>3回目　${record.startTime.round3 || '-'}</div>
                </div>
            `;
        }
        
        // 古いデータ形式の場合も常に3回分表示
        const timeValue = record.startTime || '-';
        return `
            <div class="individual-display">
                <div>1回目　${timeValue}</div>
                <div>2回目　${timeValue}</div>
                <div>3回目　${timeValue}</div>
            </div>
        `;
    }

    formatDurationDisplay(record) {
        // 新しいデータ形式の場合
        if (typeof record.duration === 'object' && record.duration.round1) {
            return `
                <div class="individual-display">
                    <div>1回目　${record.duration.round1 ? this.getDurationLabel(record.duration.round1) : '-'}</div>
                    <div>2回目　${record.duration.round2 ? this.getDurationLabel(record.duration.round2) : '-'}</div>
                    <div>3回目　${record.duration.round3 ? this.getDurationLabel(record.duration.round3) : '-'}</div>
                </div>
            `;
        }
        
        // 古いデータ形式の場合も常に3回分表示
        const durationLabel = this.getDurationLabel(record.duration);
        return `
            <div class="individual-display">
                <div>1回目　${durationLabel}</div>
                <div>2回目　${durationLabel}</div>
                <div>3回目　${durationLabel}</div>
            </div>
        `;
    }

    // 分析機能
    updateAnalysis() {
        const filteredRecords = this.getFilteredRecords();
        this.updateStatistics(filteredRecords);
        this.updateTimeChart(filteredRecords);
    }

    updateDateSelector() {
        const period = document.getElementById('analysis-period').value;
        const dateSelector = document.getElementById('date-selector');
        const dateInput = document.getElementById('analysis-date');
        const monthInput = document.getElementById('analysis-month');
        const yearInput = document.getElementById('analysis-year');

        // すべてを非表示
        dateInput.style.display = 'none';
        monthInput.style.display = 'none';
        yearInput.style.display = 'none';

        if (period === 'all') {
            dateSelector.style.display = 'none';
        } else {
            dateSelector.style.display = 'block';
            
            if (period === 'day') {
                dateInput.style.display = 'block';
                if (!dateInput.value) {
                    dateInput.value = new Date().toISOString().split('T')[0];
                }
            } else if (period === 'month') {
                monthInput.style.display = 'block';
                if (!monthInput.value) {
                    const now = new Date();
                    monthInput.value = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
                }
            } else if (period === 'year') {
                yearInput.style.display = 'block';
                if (!yearInput.value) {
                    yearInput.value = new Date().getFullYear();
                }
            }
        }
    }

    getFilteredRecords() {
        const period = document.getElementById('analysis-period').value;
        
        if (period === 'all') {
            return this.records;
        }
        
        const dateInput = document.getElementById('analysis-date').value;
        const monthInput = document.getElementById('analysis-month').value;
        const yearInput = document.getElementById('analysis-year').value;
        
        return this.records.filter(record => {
            const recordDate = new Date(record.date);
            
            if (period === 'day' && dateInput) {
                return record.date === dateInput;
            } else if (period === 'month' && monthInput) {
                const [year, month] = monthInput.split('-');
                return recordDate.getFullYear() == year && (recordDate.getMonth() + 1) == month;
            } else if (period === 'year' && yearInput) {
                return recordDate.getFullYear() == yearInput;
            }
            
            return true;
        });
    }

    updateStatistics(records = this.records) {
        const tbody = document.querySelector('#stats-table tbody');
        tbody.innerHTML = '';

        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" style="text-align: center;">データがありません</td></tr>';
            return;
        }

        // 継続率と連続率の計算
        const continuationRate = this.calculateContinuationRate(records);
        const consecutiveRate = this.calculateConsecutiveRate(records);

        // 実施時間の計算：1つのデータにつき実施時間は（1回目+2回目+3回目）/3
        const durations = records.map(r => {
            if (typeof r.duration === 'object') {
                const values = [r.duration.round1, r.duration.round2, r.duration.round3]
                    .filter(v => v).map(v => parseFloat(v));
                return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            }
            return parseFloat(r.duration);
        });
        
        // 全記録の個別時間を取得（最長・最短実施時間用）
        const allIndividualDurations = [];
        records.forEach(r => {
            if (typeof r.duration === 'object') {
                const values = [r.duration.round1, r.duration.round2, r.duration.round3]
                    .filter(v => v).map(v => parseFloat(v));
                allIndividualDurations.push(...values);
            } else {
                // 古い形式の場合は同じ値を3回追加（各ラウンドで同じ時間と仮定）
                const duration = parseFloat(r.duration);
                allIndividualDurations.push(duration, duration, duration);
            }
        });
        
        const avgDuration = (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1);
        const maxDuration = allIndividualDurations.length > 0 ? Math.max(...allIndividualDurations).toFixed(1) : '0.0';
        const minDuration = allIndividualDurations.length > 0 ? Math.min(...allIndividualDurations).toFixed(1) : '0.0';

        const roundCounts = records.map(r => {
            let count = 0;
            if (r.records.round1) count++;
            if (r.records.round2) count++;
            if (r.records.round3) count++;
            return count;
        });
        const avgRounds = (roundCounts.reduce((a, b) => a + b, 0) / roundCounts.length).toFixed(1);

        const stats = [
            ['継続率', `${continuationRate}%`],
            ['連続率', `${consecutiveRate}日連続`],
            ['総記録数', `${records.length}回`],
            ['平均実施時間', `${avgDuration}分`],
            ['最長実施時間', `${maxDuration}分`],
            ['最短実施時間', `${minDuration}分`],
            ['1セットあたり平均回数', `${avgRounds}回`]
        ];

        stats.forEach(([label, value]) => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = label;
            row.insertCell(1).textContent = value;
        });
    }

    calculateContinuationRate(records) {
        if (records.length === 0) return '0.0';
        
        const period = document.getElementById('analysis-period').value;
        
        // 日付を重複を除いて取得
        const uniqueDates = [...new Set(records.map(r => r.date))].sort();
        const practicedDays = uniqueDates.length;
        
        let totalDays;
        
        if (period === 'all') {
            // 初回記録から今日まで
            if (this.records.length === 0) return '0.0';
            const allUniqueDates = [...new Set(this.records.map(r => r.date))].sort();
            const firstDate = new Date(allUniqueDates[0]);
            const today = new Date();
            totalDays = Math.ceil((today - firstDate) / (1000 * 60 * 60 * 24)) + 1;
        } else if (period === 'day') {
            // 日ごとの場合は100%または0%
            return practicedDays > 0 ? '100.0' : '0.0';
        } else if (period === 'month') {
            // 選択された月の日数
            const monthInput = document.getElementById('analysis-month').value;
            if (!monthInput) return '0.0';
            const [year, month] = monthInput.split('-').map(Number);
            totalDays = new Date(year, month, 0).getDate();
        } else if (period === 'year') {
            // 選択された年の日数
            const yearInput = document.getElementById('analysis-year').value;
            if (!yearInput) return '0.0';
            const year = parseInt(yearInput);
            totalDays = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 366 : 365;
        } else {
            totalDays = practicedDays;
        }
        
        const rate = (practicedDays / totalDays * 100).toFixed(1);
        return rate;
    }

    calculateConsecutiveRate(records) {
        if (records.length === 0) return '0';
        
        // 日付を重複を除いて取得し、ソート
        const uniqueDates = [...new Set(records.map(r => r.date))].sort();
        
        if (uniqueDates.length === 0) return '0';
        
        // 今日の日付を取得
        const today = new Date().toISOString().split('T')[0];
        
        // 今日から逆順に連続日数を数える
        let consecutiveDays = 0;
        let currentDate = new Date(today);
        
        while (true) {
            const dateString = currentDate.toISOString().split('T')[0];
            
            if (uniqueDates.includes(dateString)) {
                consecutiveDays++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        return consecutiveDays.toString();
    }

    updateTimeChart(records = this.records) {
        // 1時間ごとの時間帯分析
        const canvas = document.getElementById('time-chart');
        const ctx = canvas.getContext('2d');
        
        // キャンバスをクリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (records.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('データがありません', canvas.width / 2, canvas.height / 2);
            return;
        }

        // 1時間ごとの記録数を集計（1回目の時間を基準に使用）
        const hourCounts = new Array(24).fill(0);
        records.forEach(record => {
            let timeToUse = '';
            if (typeof record.startTime === 'object') {
                // 新しい形式：1回目の時間を使用
                timeToUse = record.startTime.round1 || '';
            } else {
                // 古い形式：そのまま使用
                timeToUse = record.startTime || '';
            }
            
            if (timeToUse && timeToUse.includes(':')) {
                const hour = parseInt(timeToUse.split(':')[0]);
                if (hour >= 0 && hour < 24) {
                    hourCounts[hour]++;
                }
            }
        });

        // チャート描画領域の設定
        const leftMargin = 40;  // 縦軸ラベル用の余白
        const bottomMargin = 40; // 横軸ラベル用の余白
        const chartWidth = canvas.width - leftMargin;
        const chartHeight = canvas.height - bottomMargin;
        
        const maxCount = Math.max(...hourCounts);
        const barWidth = chartWidth / 24;
        const barMaxHeight = chartHeight - 20;

        // 縦軸の目盛りと線を描画
        if (maxCount > 0) {
            const ySteps = Math.min(5, maxCount); // 最大5段階の目盛り
            const stepValue = Math.ceil(maxCount / ySteps);
            
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 1;
            ctx.font = '10px Arial';
            ctx.fillStyle = '#666';
            ctx.textAlign = 'right';
            
            for (let i = 0; i <= ySteps; i++) {
                const value = i * stepValue;
                if (value > maxCount) break;
                
                const y = chartHeight - (value / maxCount) * barMaxHeight;
                
                // 横線（縦軸目盛り線）を描画
                ctx.beginPath();
                ctx.moveTo(leftMargin, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
                
                // 縦軸ラベルを描画
                ctx.fillText(value.toString(), leftMargin - 5, y + 3);
            }
        }
        
        // 縦軸線を描画
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(leftMargin, 0);
        ctx.lineTo(leftMargin, chartHeight);
        ctx.stroke();

        // 棒グラフを描画
        ctx.fillStyle = '#2980B9';
        hourCounts.forEach((count, hour) => {
            const barHeight = maxCount > 0 ? (count / maxCount) * barMaxHeight : 0;
            const x = leftMargin + hour * barWidth;
            const y = chartHeight - barHeight;
            
            ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
            
            // 時間ラベル（1時台、2時台という表記）
            if (hour % 4 === 0) {
                ctx.fillStyle = '#333';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`${hour}時台`, x + barWidth / 2, canvas.height - 5);
                ctx.fillStyle = '#2980B9';
            }
        });
    }

    // CSV出力機能
    exportCSV() {
        if (this.records.length === 0) {
            this.showPopupNotification('出力するデータがありません', 'warning');
            return;
        }

        const headers = ['日付', 'セット数', '開始時間', '実施時間', '実施内容', '1回目記録', '2回目記録', '3回目記録'];
        const csvContent = [
            headers.join(','),
            ...this.records.map(record => {
                // 開始時間の処理
                let startTimeStr = '';
                if (typeof record.startTime === 'object') {
                    startTimeStr = `1回目:${record.startTime.round1 || ''};2回目:${record.startTime.round2 || ''};3回目:${record.startTime.round3 || ''}`;
                } else {
                    startTimeStr = record.startTime || '';
                }

                // 実施時間の処理
                let durationStr = '';
                if (typeof record.duration === 'object') {
                    durationStr = `1回目:${record.duration.round1 || ''};2回目:${record.duration.round2 || ''};3回目:${record.duration.round3 || ''}`;
                } else {
                    durationStr = record.duration || '';
                }

                // 実施内容の処理
                let contentStr = '';
                if (record.content && typeof record.content === 'object' && record.content.round1) {
                    contentStr = `1回目:${record.content.round1.join(',') || ''};2回目:${record.content.round2.join(',') || ''};3回目:${record.content.round3.join(',') || ''}`;
                } else if (Array.isArray(record.content)) {
                    contentStr = record.content.join(',');
                } else {
                    contentStr = '';
                }

                return [
                    record.date,
                    record.sessionNumber,
                    `"${startTimeStr}"`,
                    `"${durationStr}"`,
                    `"${contentStr}"`,
                    `"${(record.records.round1 || '').replace(/"/g, '""')}"`,
                    `"${(record.records.round2 || '').replace(/"/g, '""')}"`,
                    `"${(record.records.round3 || '').replace(/"/g, '""')}"`
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `jiritsulog_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // CSVインポート機能
    importCSV(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n');
                
                // ヘッダー行をスキップ
                const dataLines = lines.slice(1).filter(line => line.trim());
                
                let importedCount = 0;
                const importedRecords = [];
                
                dataLines.forEach(line => {
                    const columns = line.split(',').map(col => col.replace(/"/g, '').trim());
                    
                    if (columns.length >= 8) {
                        const record = {
                            id: Date.now() + Math.random(), // 重複を避けるためランダム要素追加
                            date: columns[0],
                            startTime: {
                                round1: columns[1] || '',
                                round2: columns[2] || '',
                                round3: columns[3] || ''
                            },
                            duration: {
                                round1: columns[4] || '',
                                round2: columns[5] || '',
                                round3: columns[6] || ''
                            },
                            content: {
                                round1: columns[7] ? columns[7].split(';') : [],
                                round2: columns[8] ? columns[8].split(';') : [],
                                round3: columns[9] ? columns[9].split(';') : []
                            },
                            records: {
                                round1: columns[10] || '',
                                round2: columns[11] || '',
                                round3: columns[12] || ''
                            },
                            sessionNumber: parseInt(columns[13]) || 1,
                            timestamp: columns[14] || new Date().toISOString(),
                            individualSettings: {
                                startTime: columns[15] === 'true',
                                duration: columns[16] === 'true',
                                content: columns[17] === 'true'
                            }
                        };
                        
                        importedRecords.push(record);
                        importedCount++;
                    }
                });
                
                if (importedCount > 0) {
                    // 既存のデータに追加（重複チェック）
                    const existingDates = new Set(this.records.map(r => r.date));
                    const newRecords = importedRecords.filter(r => !existingDates.has(r.date));
                    
                    this.records.push(...newRecords);
                    this.saveRecords();
                    this.displayRecords();
                    this.updateStats();
                    
                    this.showPopupNotification(`${newRecords.length}件のデータをインポートしました`, 'success');
                } else {
                    this.showPopupNotification('インポート可能なデータが見つかりませんでした', 'warning');
                }
                
            } catch (error) {
                console.error('CSV import error:', error);
                this.showPopupNotification('CSVファイルの読み込みに失敗しました', 'warning');
            }
        };
        
        reader.readAsText(file, 'UTF-8');
        event.target.value = ''; // ファイル選択をリセット
    }

    // 設定機能
    changeFontFamily(fontFamily) {
        this.settings.fontFamily = fontFamily;
        document.body.style.fontFamily = fontFamily;
        this.saveSettings();
    }

    saveDefaultContent() {
        this.settings.defaultContent = Array.from(
            document.querySelectorAll('input[name="default-content"]:checked')
        ).map(cb => cb.value);
        this.saveSettings();
    }

    async enableNotifications() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.setupNotifications();
                this.showPopupNotification('プッシュ通知が有効になりました！', 'success');
            } else {
                this.showPopupNotification('プッシュ通知の許可が必要です', 'warning');
            }
        } else {
            this.showPopupNotification('このブラウザはプッシュ通知をサポートしていません', 'warning');
        }
    }

    setupNotifications() {
        // 既存のタイマーをクリア
        if (this.notificationTimers) {
            this.notificationTimers.forEach(timer => clearTimeout(timer));
        }
        this.notificationTimers = [];

        // 毎日通知の設定
        if (document.getElementById('daily-notification').checked) {
            this.setupDailyNotifications();
        }

        // 曜日別通知の設定
        this.setupWeeklyNotifications();
        
        console.log('通知設定が完了しました');
    }

    setupDailyNotifications() {
        const session1Time = document.getElementById('daily-session1-time').value;
        const session2Time = document.getElementById('daily-session2-time').value;
        const session3Time = document.getElementById('daily-session3-time').value;

        this.scheduleNotification(session1Time, '1セット目の自律訓練の時間です');
        this.scheduleNotification(session2Time, '2セット目の自律訓練の時間です');
        this.scheduleNotification(session3Time, '3セット目の自律訓練の時間です');
    }

    setupWeeklyNotifications() {
        const today = new Date().getDay();
        const dayCheckboxes = document.querySelectorAll('input[name="day-notification"]:checked');
        
        dayCheckboxes.forEach(checkbox => {
            const dayOfWeek = parseInt(checkbox.value);
            const session1Input = document.querySelector(`input[name="day-session1"][data-day="${dayOfWeek}"]`);
            const session2Input = document.querySelector(`input[name="day-session2"][data-day="${dayOfWeek}"]`);
            const session3Input = document.querySelector(`input[name="day-session3"][data-day="${dayOfWeek}"]`);

            if (dayOfWeek === today) {
                // 今日の場合は即座にスケジュール
                this.scheduleNotification(session1Input.value, '1セット目の自律訓練の時間です');
                this.scheduleNotification(session2Input.value, '2セット目の自律訓練の時間です');
                this.scheduleNotification(session3Input.value, '3セット目の自律訓練の時間です');
            }
        });
    }

    scheduleNotification(timeString, message) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const now = new Date();
        const notificationTime = new Date();
        
        notificationTime.setHours(hours, minutes, 0, 0);
        
        // 今日の時間が過ぎていたら明日に設定
        if (notificationTime <= now) {
            notificationTime.setDate(notificationTime.getDate() + 1);
        }
        
        const delay = notificationTime.getTime() - now.getTime();
        
        const timer = setTimeout(() => {
            this.showNotification(message);
            // 次の日の同じ時間にも設定（24時間後）
            setTimeout(() => {
                this.scheduleNotification(timeString, message);
            }, 24 * 60 * 60 * 1000);
        }, delay);
        
        this.notificationTimers.push(timer);
    }

    showNotification(message) {
        if (Notification.permission === 'granted') {
            const notification = new Notification('じりつログ', {
                body: message,
                icon: './アイコン.png',
                badge: './アイコン.png',
                vibrate: [200, 100, 200, 100, 200],
                tag: 'jiritsu-reminder',
                requireInteraction: true,
                actions: [
                    {
                        action: 'open',
                        title: '記録する'
                    },
                    {
                        action: 'close',
                        title: '後で'
                    }
                ]
            });

            notification.onclick = () => {
                window.focus();
                this.showPage('main');
                notification.close();
            };

            // 10秒後に自動で閉じる
            setTimeout(() => {
                notification.close();
            }, 10000);
        }
    }

    // 実施時間設定機能
    loadDurationSettings() {
        const container = document.getElementById('duration-settings');
        container.innerHTML = '';
        
        const defaultDurations = [
            { value: '0.5', label: '30秒' },
            { value: '1', label: '1分' },
            { value: '1.5', label: '1分30秒' },
            { value: '2', label: '2分' },
            { value: '2.5', label: '2分30秒' },
            { value: '3', label: '3分' },
            { value: '3.5', label: '3分30秒' },
            { value: '4', label: '4分' },
            { value: '4.5', label: '4分30秒' },
            { value: '5', label: '5分' },
            { value: '5.5', label: '5分30秒' },
            { value: '6', label: '6分' },
            { value: '6.5', label: '6分30秒' },
            { value: '7', label: '7分' },
            { value: '7.5', label: '7分30秒' },
            { value: '8', label: '8分' },
            { value: '8.5', label: '8分30秒' },
            { value: '9', label: '9分' },
            { value: '9.5', label: '9分30秒' },
            { value: '10', label: '10分' }
        ];
        
        // カスタム時間の順序を保持
        let allDurations;
        if (this.settings.durationOrder && this.settings.durationOrder.length > 0) {
            allDurations = this.settings.durationOrder;
        } else {
            allDurations = [...defaultDurations, ...(this.settings.customDurations || [])];
            // 値でソート
            allDurations.sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
        }
        
        allDurations.forEach((duration, index) => {
            const item = document.createElement('div');
            item.className = 'duration-item';
            item.draggable = true;
            item.dataset.index = index;
            
            const isCustom = !defaultDurations.some(d => d.value === duration.value);
            
            const isDefault = this.settings.defaultDuration === duration.value;
            
            item.innerHTML = `
                <span class="drag-handle">☰</span>
                <input type="radio" name="defaultDuration" value="${duration.value}" 
                       ${isDefault ? 'checked' : ''} 
                       onclick="app.toggleDefaultDuration('${duration.value}', this)" 
                       class="default-duration-radio">
                <span class="duration-label">${duration.label}</span>
                <div class="duration-actions">
                    ${isCustom ? `<button class="remove-btn" onclick="app.removeDurationOption('${duration.value}')">削除</button>` : ''}
                </div>
            `;
            
            // 簡単なドラッグアンドドロップイベント
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', index.toString());
                item.classList.add('dragging');
                
                // コンテナのスクロールを一時的に無効化
                const container = document.getElementById('duration-settings');
                container.style.overflow = 'hidden';
            });
            
            item.addEventListener('dragend', (e) => {
                item.classList.remove('dragging');
                
                // スクロールを復元
                const container = document.getElementById('duration-settings');
                container.style.overflow = 'auto';
                
                // ビジュアルフィードバックをクリア
                document.querySelectorAll('.duration-item').forEach(el => {
                    el.style.borderTop = '';
                    el.style.borderBottom = '';
                    el.style.backgroundColor = '';
                });
            });
            
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                // シンプルなビジュアルフィードバック
                item.style.backgroundColor = '#E8F4F8';
            });
            
            item.addEventListener('dragleave', (e) => {
                // アイテムから完全に離れた時のみクリア
                const rect = item.getBoundingClientRect();
                if (e.clientX < rect.left || e.clientX > rect.right || 
                    e.clientY < rect.top || e.clientY > rect.bottom) {
                    item.style.backgroundColor = '';
                }
            });
            
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.style.backgroundColor = '';
                
                try {
                    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                    const targetIndex = parseInt(item.dataset.index);
                    
                    if (!isNaN(draggedIndex) && !isNaN(targetIndex) && draggedIndex !== targetIndex) {
                        this.reorderDurations(draggedIndex, targetIndex);
                    }
                } catch (error) {
                    console.error('ドラッグアンドドロップエラー:', error);
                }
            });
            
            // モバイル版タッチイベント（簡略化）
            this.setupSimpleMobileDragAndDrop(item, index);
            
            container.appendChild(item);
        });
        
        this.updateDurationDropdown();
    }
    
    setupSimpleMobileDragAndDrop(item, index) {
        let longPressTimer = null;
        let isDragging = false;
        let startY = 0;
        let startX = 0;
        let threshold = 10; // ピクセル単位での移動閾値
        
        const startTouch = (e) => {
            // マルチタッチを無視
            if (e.touches && e.touches.length > 1) return;
            
            const touch = e.touches ? e.touches[0] : e;
            startY = touch.clientY;
            startX = touch.clientX;
            
            // 長押し検出
            longPressTimer = setTimeout(() => {
                if (!isDragging) {
                    isDragging = true;
                    item.classList.add('mobile-dragging');
                    // 振動フィードバック（対応デバイスのみ）
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                }
            }, 300); // 300msで長押し判定
        };
        
        const cancelTouch = () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            
            if (isDragging) {
                item.classList.remove('mobile-dragging');
                isDragging = false;
                
                // ホバーエフェクトをクリア
                document.querySelectorAll('.duration-item').forEach(el => {
                    if (el !== item) {
                        el.style.backgroundColor = '';
                        el.style.borderColor = '';
                    }
                });
            }
        };
        
        const moveTouch = (e) => {
            if (!isDragging) {
                // ドラッグ開始前に一定距離移動したらキャンセル
                const touch = e.touches ? e.touches[0] : e;
                const deltaY = Math.abs(touch.clientY - startY);
                const deltaX = Math.abs(touch.clientX - startX);
                
                if (deltaY > threshold || deltaX > threshold) {
                    cancelTouch();
                }
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            const touch = e.touches ? e.touches[0] : e;
            
            // 現在のタッチ位置の要素を取得
            const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
            const targetItem = elements.find(el => 
                el.classList.contains('duration-item') && el !== item
            );
            
            // 全てのアイテムからハイライトを削除
            document.querySelectorAll('.duration-item').forEach(el => {
                if (el !== item) {
                    el.style.backgroundColor = '';
                    el.style.borderColor = '';
                }
            });
            
            // ターゲットアイテムをハイライト
            if (targetItem) {
                targetItem.style.backgroundColor = '#E8F4F8';
                targetItem.style.borderColor = '#2980B9';
            }
        };
        
        const endTouch = (e) => {
            if (!isDragging) {
                cancelTouch();
                return;
            }
            
            const touch = e.changedTouches ? e.changedTouches[0] : e;
            const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
            const targetItem = elements.find(el => 
                el.classList.contains('duration-item') && el !== item
            );
            
            if (targetItem) {
                const targetIndex = parseInt(targetItem.dataset.index);
                if (!isNaN(targetIndex) && index !== targetIndex) {
                    this.reorderDurations(index, targetIndex);
                    // 成功時の振動フィードバック
                    if (navigator.vibrate) {
                        navigator.vibrate(100);
                    }
                }
            }
            
            cancelTouch();
        };
        
        // ドラッグハンドルにのみイベントを追加
        const dragHandle = item.querySelector('.drag-handle');
        if (dragHandle) {
            dragHandle.addEventListener('touchstart', startTouch, { passive: false });
            dragHandle.addEventListener('touchmove', moveTouch, { passive: false });
            dragHandle.addEventListener('touchend', endTouch, { passive: false });
            dragHandle.addEventListener('touchcancel', cancelTouch, { passive: false });
        }
    }
    
    setupMobileDragAndDrop(item, index) {
        let longPressTimer = null;
        let isDragging = false;
        let startY = 0;
        let scrollContainer = null;
        
        const startLongPress = (e) => {
            if (e.touches && e.touches.length > 1) return;
            
            const touch = e.touches ? e.touches[0] : e;
            startY = touch.clientY;
            scrollContainer = document.getElementById('duration-settings');
            
            longPressTimer = setTimeout(() => {
                if (!isDragging) {
                    isDragging = true;
                    item.classList.add('mobile-dragging');
                    item.style.position = 'fixed';
                    item.style.left = '20px';
                    item.style.right = '20px';
                    item.style.top = touch.clientY - item.offsetHeight / 2 + 'px';
                    item.style.zIndex = '1001';
                    
                    // スクロール禁止
                    document.body.style.overflow = 'hidden';
                    if (scrollContainer) {
                        scrollContainer.style.overflow = 'hidden';
                    }
                }
            }, 500); // 500ms長押し
        };
        
        const cancelLongPress = () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        };
        
        const handleMove = (e) => {
            if (!isDragging) {
                const touch = e.touches ? e.touches[0] : e;
                const deltaY = Math.abs(touch.clientY - startY);
                if (deltaY > 10) {
                    cancelLongPress();
                }
                return;
            }
            
            e.preventDefault();
            const touch = e.touches ? e.touches[0] : e;
            item.style.top = touch.clientY - item.offsetHeight / 2 + 'px';
            
            // ホバーターゲットを探す
            const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
            const targetItem = elements.find(el => 
                el.classList.contains('duration-item') && el !== item
            );
            
            // ホバーエフェクト
            document.querySelectorAll('.duration-item').forEach(el => {
                el.style.backgroundColor = '';
            });
            
            if (targetItem) {
                targetItem.style.backgroundColor = '#E8F4F8';
            }
        };
        
        const endDrag = (e) => {
            cancelLongPress();
            
            if (!isDragging) return;
            
            const touch = e.changedTouches ? e.changedTouches[0] : e;
            const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
            const targetItem = elements.find(el => 
                el.classList.contains('duration-item') && el !== item
            );
            
            // スタイルをリセット
            item.classList.remove('mobile-dragging');
            item.style.position = '';
            item.style.left = '';
            item.style.right = '';
            item.style.top = '';
            item.style.zIndex = '';
            
            document.body.style.overflow = '';
            if (scrollContainer) {
                scrollContainer.style.overflow = '';
            }
            
            document.querySelectorAll('.duration-item').forEach(el => {
                el.style.backgroundColor = '';
            });
            
            // ドロップ処理
            if (targetItem) {
                const targetIndex = parseInt(targetItem.dataset.index);
                if (index !== targetIndex) {
                    this.reorderDurations(index, targetIndex);
                }
            }
            
            isDragging = false;
        };
        
        // タッチイベント
        item.addEventListener('touchstart', startLongPress, { passive: false });
        item.addEventListener('touchmove', handleMove, { passive: false });
        item.addEventListener('touchend', endDrag, { passive: false });
        item.addEventListener('touchcancel', endDrag, { passive: false });
        
        // マウスイベント（PCでのテスト用）
        item.addEventListener('mousedown', startLongPress);
        item.addEventListener('mousemove', handleMove);
        item.addEventListener('mouseup', endDrag);
        item.addEventListener('mouseleave', cancelLongPress);
    }
    
    reorderDurations(fromIndex, toIndex) {
        let durations = this.settings.durationOrder || this.getDefaultDurationOrder();
        
        const item = durations.splice(fromIndex, 1)[0];
        durations.splice(toIndex, 0, item);
        
        this.settings.durationOrder = durations;
        this.saveSettings();
        this.loadDurationSettings();
    }
    
    getDefaultDurationOrder() {
        const defaultDurations = [
            { value: '0.5', label: '30秒' },
            { value: '1', label: '1分' },
            { value: '1.5', label: '1分30秒' },
            { value: '2', label: '2分' },
            { value: '2.5', label: '2分30秒' },
            { value: '3', label: '3分' },
            { value: '3.5', label: '3分30秒' },
            { value: '4', label: '4分' },
            { value: '4.5', label: '4分30秒' },
            { value: '5', label: '5分' },
            { value: '5.5', label: '5分30秒' },
            { value: '6', label: '6分' },
            { value: '6.5', label: '6分30秒' },
            { value: '7', label: '7分' },
            { value: '7.5', label: '7分30秒' },
            { value: '8', label: '8分' },
            { value: '8.5', label: '8分30秒' },
            { value: '9', label: '9分' },
            { value: '9.5', label: '9分30秒' },
            { value: '10', label: '10分' }
        ];
        
        return [...defaultDurations, ...(this.settings.customDurations || [])];
    }
    
    addDurationOption() {
        const minutes = parseInt(document.getElementById('new-duration-minutes').value) || 0;
        const seconds = parseInt(document.getElementById('new-duration-seconds').value) || 0;
        
        if (minutes === 0 && seconds === 0) {
            this.showPopupNotification('時間を入力してください', 'warning');
            return;
        }
        
        const totalMinutes = minutes + (seconds / 60);
        const label = minutes > 0 && seconds > 0 ? `${minutes}分${seconds}秒` : 
                     minutes > 0 ? `${minutes}分` : `${seconds}秒`;
        
        const newDuration = {
            value: totalMinutes.toString(),
            label: label
        };
        
        if (!this.settings.customDurations) {
            this.settings.customDurations = [];
        }
        
        // 重複チェック
        const allDurations = this.settings.durationOrder || this.getDefaultDurationOrder();
        const exists = allDurations.some(d => d.value === newDuration.value);
        if (exists) {
            this.showPopupNotification('その時間は既に追加されています', 'warning');
            return;
        }
        
        this.settings.customDurations.push(newDuration);
        
        // 順序を更新
        if (!this.settings.durationOrder) {
            this.settings.durationOrder = this.getDefaultDurationOrder();
        }
        this.settings.durationOrder.push(newDuration);
        
        this.saveSettings();
        this.loadDurationSettings();
        
        // 入力フィールドをクリア
        document.getElementById('new-duration-minutes').value = '';
        document.getElementById('new-duration-seconds').value = '';
    }
    
    removeDurationOption(value) {
        this.settings.customDurations = this.settings.customDurations.filter(d => d.value !== value);
        
        // 順序からも削除
        if (this.settings.durationOrder) {
            this.settings.durationOrder = this.settings.durationOrder.filter(d => d.value !== value);
        }
        
        // 削除される項目がデフォルトに設定されている場合、デフォルトを2分にリセット
        if (this.settings.defaultDuration === value) {
            this.settings.defaultDuration = '2';
        }
        
        this.saveSettings();
        this.loadDurationSettings();
    }
    
    setDefaultDuration(value) {
        this.settings.defaultDuration = value;
        this.saveSettings();
        this.updateDurationDropdown();
    }
    
    toggleDefaultDuration(value, radioElement) {
        if (this.settings.defaultDuration === value) {
            // 既に選択されている場合は解除
            this.settings.defaultDuration = '';
            radioElement.checked = false;
        } else {
            // 新しく選択
            this.settings.defaultDuration = value;
        }
        this.saveSettings();
        this.updateDurationDropdown();
    }
    
    updateDurationDropdown() {
        const select = document.getElementById('duration');
        const currentValue = select.value;
        select.innerHTML = '';
        
        // 空欄オプションを先頭に追加
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '選択してください';
        select.appendChild(emptyOption);
        
        // 設定された順序を使用
        const allDurations = this.settings.durationOrder || this.getDefaultDurationOrder();
        
        allDurations.forEach(duration => {
            const option = document.createElement('option');
            option.value = duration.value;
            option.textContent = duration.label;
            select.appendChild(option);
        });
        
        // 前の値を復元、なければデフォルト値を設定
        if (currentValue) {
            select.value = currentValue;
        } else if (this.settings.defaultDuration) {
            select.value = this.settings.defaultDuration;
        }
        
        // 個別設定のドロップダウンも更新
        this.populateIndividualDurationDropdowns();
    }

    // 記録編集・削除機能
    editRecord(recordId) {
        const record = this.records.find(r => r.id == recordId);
        if (!record) return;

        // 編集フォームを表示
        const editForm = this.createEditForm(record);
        
        // 正しい要素を検索
        const recordElements = document.querySelectorAll('.record-item');
        let targetElement = null;
        
        recordElements.forEach(element => {
            const editBtn = element.querySelector('.edit-btn');
            if (editBtn && editBtn.getAttribute('onclick').includes(recordId)) {
                targetElement = element;
            }
        });
        
        if (targetElement) {
            targetElement.innerHTML = editForm;
            
            // 編集フォーム内のトグルボタンにイベントリスナーを追加
            this.setupEditFormToggleButtons(recordId);
        }
    }
    
    setupEditFormToggleButtons(recordId) {
        // 開始時間トグル
        const startTimeToggle = document.querySelector('.edit-individual-starttime-btn');
        if (startTimeToggle) {
            startTimeToggle.addEventListener('click', () => {
                this.toggleEditSetting('starttime', recordId);
            });
        }
        
        // 実施時間トグル
        const durationToggle = document.querySelector('.edit-individual-duration-btn');
        if (durationToggle) {
            durationToggle.addEventListener('click', () => {
                this.toggleEditSetting('duration', recordId);
            });
        }
        
        // 実施内容トグル
        const contentToggle = document.querySelector('.edit-individual-content-btn');
        if (contentToggle) {
            contentToggle.addEventListener('click', () => {
                this.toggleEditSetting('content', recordId);
            });
        }
    }
    
    toggleEditSetting(settingType, recordId) {
        const toggleBtn = document.querySelector(`.edit-individual-${settingType}-btn`);
        const globalSection = toggleBtn.closest('.form-group').querySelector('.global-setting');
        const individualSection = toggleBtn.closest('.form-group').querySelector('.individual-settings');
        
        const isActive = toggleBtn.classList.contains('active');
        
        if (isActive) {
            // 個別設定を無効にする
            toggleBtn.classList.remove('active');
            globalSection.classList.remove('hidden');
            individualSection.style.display = 'none';
            individualSection.classList.remove('active');
        } else {
            // 個別設定を有効にする
            toggleBtn.classList.add('active');
            globalSection.classList.add('hidden');
            individualSection.style.display = 'block';
            individualSection.classList.add('active');
        }
    }

    createEditForm(record) {
        const contentOptions = ['重感', '温感', '心臓', '呼吸', '腹部', '額部'];
        
        // 個別設定の状態を確認
        const hasIndividualStartTime = record.individualSettings && record.individualSettings.startTime;
        const hasIndividualDuration = record.individualSettings && record.individualSettings.duration;
        const hasIndividualContent = record.individualSettings && record.individualSettings.content;
        
        // 実施内容の取得（新しい形式と古い形式に対応）
        let selectedContent = [];
        let individualContentHtml = '';
        
        if (record.content && typeof record.content === 'object' && record.content.round1) {
            // 新しい形式：個別設定がある場合
            if (hasIndividualContent) {
                // 個別設定の場合、各ラウンドごとのチェックボックスを生成
                for (let i = 1; i <= 3; i++) {
                    const roundContent = record.content[`round${i}`] || [];
                    const roundCheckboxes = contentOptions.map(option => {
                        const checked = roundContent.includes(option) ? 'checked' : '';
                        return `<label><input type="checkbox" name="edit-content-${i}" value="${option}" ${checked}> ${option}</label>`;
                    }).join('');
                    individualContentHtml += `
                        <div class="round-content">
                            <strong>${i}回目:</strong>
                            <div class="checkbox-group">${roundCheckboxes}</div>
                        </div>
                    `;
                }
            } else {
                // 個別設定ではない場合、1回目の内容を使用
                selectedContent = record.content.round1 || [];
            }
        } else if (Array.isArray(record.content)) {
            // 古い形式
            selectedContent = record.content;
        }
        
        const globalContentCheckboxes = contentOptions.map(option => {
            const checked = selectedContent.includes(option) ? 'checked' : '';
            return `<label><input type="checkbox" name="edit-content" value="${option}" ${checked}> ${option}</label>`;
        }).join('');

        // 開始時間の取得
        let startTimeHtml = '';
        if (hasIndividualStartTime && typeof record.startTime === 'object') {
            startTimeHtml = `
                <div class="individual-settings active" style="display: block;">
                    <div class="time-inputs">
                        <div>1回目: <input type="time" id="edit-starttime-1-${record.id}" value="${record.startTime.round1 || ''}"></div>
                        <div>2回目: <input type="time" id="edit-starttime-2-${record.id}" value="${record.startTime.round2 || ''}"></div>
                        <div>3回目: <input type="time" id="edit-starttime-3-${record.id}" value="${record.startTime.round3 || ''}"></div>
                    </div>
                </div>
                <div class="global-setting ${hasIndividualStartTime ? 'hidden' : ''}">
                    <input type="time" id="edit-starttime-${record.id}" value="${record.startTime.round1 || ''}">
                </div>
            `;
        } else {
            const startTimeValue = typeof record.startTime === 'object' ? record.startTime.round1 || '' : record.startTime || '';
            startTimeHtml = `
                <div class="individual-settings" style="display: none;">
                    <div class="time-inputs">
                        <div>1回目: <input type="time" id="edit-starttime-1-${record.id}" value="${startTimeValue}"></div>
                        <div>2回目: <input type="time" id="edit-starttime-2-${record.id}" value="${startTimeValue}"></div>
                        <div>3回目: <input type="time" id="edit-starttime-3-${record.id}" value="${startTimeValue}"></div>
                    </div>
                </div>
                <div class="global-setting">
                    <input type="time" id="edit-starttime-${record.id}" value="${startTimeValue}">
                </div>
            `;
        }

        // 実施時間の取得
        let durationHtml = '';
        if (hasIndividualDuration && typeof record.duration === 'object') {
            durationHtml = `
                <div class="individual-settings active" style="display: block;">
                    <div class="duration-selects">
                        <div>1回目: <select id="edit-duration-1-${record.id}">${this.getDurationOptions(record.duration.round1)}</select></div>
                        <div>2回目: <select id="edit-duration-2-${record.id}">${this.getDurationOptions(record.duration.round2)}</select></div>
                        <div>3回目: <select id="edit-duration-3-${record.id}">${this.getDurationOptions(record.duration.round3)}</select></div>
                    </div>
                </div>
                <div class="global-setting ${hasIndividualDuration ? 'hidden' : ''}">
                    <select id="edit-duration-${record.id}">${this.getDurationOptions(record.duration.round1)}</select>
                </div>
            `;
        } else {
            const durationValue = typeof record.duration === 'object' ? record.duration.round1 || '' : record.duration || '';
            durationHtml = `
                <div class="individual-settings" style="display: none;">
                    <div class="duration-selects">
                        <div>1回目: <select id="edit-duration-1-${record.id}">${this.getDurationOptions(durationValue)}</select></div>
                        <div>2回目: <select id="edit-duration-2-${record.id}">${this.getDurationOptions(durationValue)}</select></div>
                        <div>3回目: <select id="edit-duration-3-${record.id}">${this.getDurationOptions(durationValue)}</select></div>
                    </div>
                </div>
                <div class="global-setting">
                    <select id="edit-duration-${record.id}">${this.getDurationOptions(durationValue)}</select>
                </div>
            `;
        }

        // 実施内容のHTML
        let contentHtml = '';
        if (hasIndividualContent) {
            contentHtml = `
                <div class="individual-settings active" style="display: block;">
                    ${individualContentHtml}
                </div>
                <div class="global-setting ${hasIndividualContent ? 'hidden' : ''}">
                    <div class="checkbox-group">${globalContentCheckboxes}</div>
                </div>
            `;
        } else {
            const defaultIndividualContentHtml = [];
            for (let i = 1; i <= 3; i++) {
                const roundCheckboxes = contentOptions.map(option => {
                    const checked = selectedContent.includes(option) ? 'checked' : '';
                    return `<label><input type="checkbox" name="edit-content-${i}" value="${option}" ${checked}> ${option}</label>`;
                }).join('');
                defaultIndividualContentHtml.push(`
                    <div class="round-content">
                        <strong>${i}回目:</strong>
                        <div class="checkbox-group">${roundCheckboxes}</div>
                    </div>
                `);
            }
            
            contentHtml = `
                <div class="individual-settings" style="display: none;">
                    ${defaultIndividualContentHtml.join('')}
                </div>
                <div class="global-setting">
                    <div class="checkbox-group">${globalContentCheckboxes}</div>
                </div>
            `;
        }

        return `
            <div class="edit-form">
                <div class="edit-header">
                    <h4>記録を編集</h4>
                </div>
                <div class="edit-body">
                    <div class="form-group">
                        <label>日付:</label>
                        <input type="date" id="edit-date-${record.id}" value="${record.date}">
                    </div>
                    <div class="form-group">
                        <label>記録を書き始めた時間: <button type="button" class="edit-individual-starttime-btn ${hasIndividualStartTime ? 'active' : ''}">個別設定</button></label>
                        ${startTimeHtml}
                    </div>
                    <div class="form-group">
                        <label>実施時間: <button type="button" class="edit-individual-duration-btn ${hasIndividualDuration ? 'active' : ''}">個別設定</button></label>
                        ${durationHtml}
                    </div>
                    <div class="form-group">
                        <label>実施内容: <button type="button" class="edit-individual-content-btn ${hasIndividualContent ? 'active' : ''}">個別設定</button></label>
                        ${contentHtml}
                    </div>
                    <div class="form-group">
                        <label>1回目記録:</label>
                        <textarea id="edit-round1-${record.id}" rows="2">${record.records.round1 || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>2回目記録:</label>
                        <textarea id="edit-round2-${record.id}" rows="2">${record.records.round2 || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>3回目記録:</label>
                        <textarea id="edit-round3-${record.id}" rows="2">${record.records.round3 || ''}</textarea>
                    </div>
                </div>
                <div class="edit-actions">
                    <button class="save-btn" onclick="app.saveEditedRecord('${record.id}')">保存</button>
                    <button class="cancel-btn" onclick="app.cancelEdit()">キャンセル</button>
                </div>
            </div>
        `;
    }

    getDurationOptions(selectedValue) {
        const defaultDurations = [
            { value: '0.5', label: '30秒' },
            { value: '1', label: '1分' },
            { value: '1.5', label: '1分30秒' },
            { value: '2', label: '2分' },
            { value: '2.5', label: '2分30秒' },
            { value: '3', label: '3分' },
            { value: '3.5', label: '3分30秒' },
            { value: '4', label: '4分' },
            { value: '4.5', label: '4分30秒' },
            { value: '5', label: '5分' },
            { value: '5.5', label: '5分30秒' },
            { value: '6', label: '6分' },
            { value: '6.5', label: '6分30秒' },
            { value: '7', label: '7分' },
            { value: '7.5', label: '7分30秒' },
            { value: '8', label: '8分' },
            { value: '8.5', label: '8分30秒' },
            { value: '9', label: '9分' },
            { value: '9.5', label: '9分30秒' },
            { value: '10', label: '10分' }
        ];

        const allDurations = [...defaultDurations, ...(this.settings.customDurations || [])];
        allDurations.sort((a, b) => parseFloat(a.value) - parseFloat(b.value));

        // 空欄オプションを先頭に追加
        let options = '<option value="">選択してください</option>';
        options += allDurations.map(duration => {
            const selected = duration.value === selectedValue ? 'selected' : '';
            return `<option value="${duration.value}" ${selected}>${duration.label}</option>`;
        }).join('');

        return options;
    }

    saveEditedRecord(recordId) {
        const record = this.records.find(r => r.id == recordId);
        if (!record) return;

        // 個別設定の状態を取得
        const individualStartTime = document.querySelector('.edit-individual-starttime-btn').classList.contains('active');
        const individualDuration = document.querySelector('.edit-individual-duration-btn').classList.contains('active');
        const individualContent = document.querySelector('.edit-individual-content-btn').classList.contains('active');

        // 日付を更新
        record.date = document.getElementById(`edit-date-${recordId}`).value;
        
        // 開始時間を更新
        if (individualStartTime) {
            record.startTime = {
                round1: document.getElementById(`edit-starttime-1-${recordId}`).value,
                round2: document.getElementById(`edit-starttime-2-${recordId}`).value,
                round3: document.getElementById(`edit-starttime-3-${recordId}`).value
            };
        } else {
            const globalStartTime = document.getElementById(`edit-starttime-${recordId}`).value;
            record.startTime = {
                round1: globalStartTime,
                round2: globalStartTime,
                round3: globalStartTime
            };
        }
        
        // 実施時間を更新
        if (individualDuration) {
            record.duration = {
                round1: document.getElementById(`edit-duration-1-${recordId}`).value,
                round2: document.getElementById(`edit-duration-2-${recordId}`).value,
                round3: document.getElementById(`edit-duration-3-${recordId}`).value
            };
        } else {
            const globalDuration = document.getElementById(`edit-duration-${recordId}`).value;
            record.duration = {
                round1: globalDuration,
                round2: globalDuration,
                round3: globalDuration
            };
        }
        
        // 実施内容を更新
        if (individualContent) {
            record.content = {
                round1: Array.from(document.querySelectorAll(`input[name="edit-content-1"]:checked`)).map(cb => cb.value),
                round2: Array.from(document.querySelectorAll(`input[name="edit-content-2"]:checked`)).map(cb => cb.value),
                round3: Array.from(document.querySelectorAll(`input[name="edit-content-3"]:checked`)).map(cb => cb.value)
            };
        } else {
            const globalContent = Array.from(document.querySelectorAll(`input[name="edit-content"]:checked`)).map(cb => cb.value);
            record.content = {
                round1: globalContent,
                round2: globalContent,
                round3: globalContent
            };
        }
        
        // 記録内容を取得
        record.records = {
            round1: document.getElementById(`edit-round1-${recordId}`).value,
            round2: document.getElementById(`edit-round2-${recordId}`).value,
            round3: document.getElementById(`edit-round3-${recordId}`).value
        };

        // 個別設定の情報を更新
        record.individualSettings = {
            startTime: individualStartTime,
            duration: individualDuration,
            content: individualContent
        };

        this.saveRecords();
        this.displayRecords();
        this.showPopupNotification('記録を更新しました！', 'success');
    }

    cancelEdit() {
        this.displayRecords();
    }

    deleteRecord(recordId) {
        if (confirm('この記録を削除しますか？')) {
            this.records = this.records.filter(r => r.id != recordId);
            this.saveRecords();
            this.displayRecords();
            this.showPopupNotification('記録を削除しました', 'success');
        }
    }

    showPopupNotification(message, type = 'info') {
        // 既存のポップアップがあれば削除
        const existingPopup = document.querySelector('.popup-notification');
        if (existingPopup) {
            existingPopup.remove();
        }

        // 新しいポップアップを作成
        const popup = document.createElement('div');
        popup.className = `popup-notification ${type}`;
        popup.textContent = message;

        // bodyに追加
        document.body.appendChild(popup);

        // アニメーション開始
        setTimeout(() => {
            popup.classList.add('show');
        }, 10);

        // 3秒後に削除
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                if (popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                }
            }, 400);
        }, 3000);
    }
    
    // Google API待機と初期化（改善版）
    waitForGoogleApiAndInit() {
        console.log('=== Google API待機開始 ===');
        let attempts = 0;
        const maxAttempts = 30; // 15秒待機
        
        const checkAndInit = () => {
            attempts++;
            console.log(`Google API確認中 (${attempts}/${maxAttempts})`);
            
            const gapiReady = typeof gapi !== 'undefined';
            const googleReady = typeof google !== 'undefined' && google.accounts && google.accounts.id;
            
            console.log('gapi利用可能:', gapiReady);
            console.log('google.accounts利用可能:', googleReady);
            
            if (gapiReady && googleReady) {
                console.log('✅ すべてのGoogle APIが利用可能です');
                this.initGoogleApi();
            } else if (attempts < maxAttempts) {
                setTimeout(checkAndInit, 500);
            } else {
                console.warn('⚠️ Google API読み込みタイムアウト - フォールバック機能を有効化');
                this.initGoogleSignIn(); // フォールバック機能のみ実行
            }
        };
        
        // 1秒後に開始（DOM要素が準備完了するのを待つ）
        setTimeout(checkAndInit, 1000);
    }
    
    // Google API 初期化
    async initGoogleApi() {
        try {
            // デバッグ情報を表示
            console.log('=== Google API初期化開始 ===');
            console.log('Client ID:', this.GOOGLE_CLIENT_ID);
            console.log('現在のURL:', window.location.href);
            console.log('gapi利用可能:', typeof gapi !== 'undefined');
            console.log('google利用可能:', typeof google !== 'undefined');
            
            await new Promise((resolve) => {
                if (typeof gapi !== 'undefined') {
                    gapi.load('client', resolve);
                } else {
                    // Google APIが読み込まれるまで待機
                    const checkGapi = setInterval(() => {
                        if (typeof gapi !== 'undefined') {
                            clearInterval(checkGapi);
                            gapi.load('client', resolve);
                        }
                    }, 100);
                    
                    // 10秒後にタイムアウト
                    setTimeout(() => {
                        clearInterval(checkGapi);
                        console.error('Google API読み込みタイムアウト');
                        this.showFallbackSignInButton();
                        resolve();
                    }, 10000);
                }
            });

            if (typeof gapi !== 'undefined') {
                await gapi.client.init({
                    discoveryDocs: [this.DISCOVERY_DOC],
                });
                
                // OAuth 2.0も初期化
                try {
                    await gapi.load('auth2', () => {
                        gapi.auth2.init({
                            client_id: this.GOOGLE_CLIENT_ID,
                            scope: this.SCOPES
                        });
                    });
                    console.log('OAuth 2.0初期化完了');
                } catch (authError) {
                    console.warn('OAuth 2.0初期化に失敗:', authError);
                }
                
                this.isGoogleApiLoaded = true;
                console.log('Google API初期化完了');
            }
            
            this.initGoogleSignIn();
        } catch (error) {
            console.error('Google API初期化エラー:', error);
            this.showFallbackSignInButton();
        }
    }
    
    // Google サインイン初期化
    initGoogleSignIn() {
        console.log('=== Google サインイン初期化開始 ===');
        
        // DOM要素の存在確認（より詳細な確認）
        const checkElement = () => {
            const buttonElement = document.getElementById('google-signin-button');
            const settingsPage = document.getElementById('settings-page');
            const googleAuthSection = document.querySelector('.google-auth-section');
            
            console.log('設定ページ:', settingsPage);
            console.log('Google認証セクション:', googleAuthSection);
            console.log('google-signin-button要素:', buttonElement);
            console.log('要素の親:', buttonElement?.parentElement);
            console.log('要素のスタイル:', buttonElement ? window.getComputedStyle(buttonElement).display : 'なし');
            
            return buttonElement;
        };
        
        // すぐにボタンレンダリングを試行（APIが既に利用可能な場合）
        this.tryRenderGoogleButton();
        
        // 3秒後にフォールバックボタンも表示（保険）
        setTimeout(() => {
            const buttonElement = document.getElementById('google-signin-button');
            if (buttonElement) {
                this.addFallbackButton(buttonElement);
                if (buttonElement.innerHTML.trim() === '') {
                    console.log('3秒経過後もボタンが空なので強制表示');
                    this.showFallbackSignInButton();
                }
            }
        }, 3000);
    }
    
    // Googleボタンレンダリングを試行
    tryRenderGoogleButton() {
        console.log('=== Googleボタンレンダリング試行 ===');
        
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            if (this.GOOGLE_CLIENT_ID && this.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID') {
                try {
                    console.log('Google Identity Services初期化中...');
                    
                    // Google Identity Services初期化
                    google.accounts.id.initialize({
                        client_id: this.GOOGLE_CLIENT_ID,
                        callback: this.handleCredentialResponse.bind(this),
                        auto_select: false,
                        cancel_on_tap_outside: true
                    });
                    
                    // DOM要素確認とボタンレンダリング
                    const renderButton = () => {
                        const buttonElement = document.getElementById('google-signin-button');
                        if (buttonElement && buttonElement.offsetParent !== null) {
                            console.log('Googleサインインボタンをレンダリング中...');
                            
                            // 既存のコンテンツをクリア
                            buttonElement.innerHTML = '';
                            
                            // ボタンをレンダリング
                            google.accounts.id.renderButton(buttonElement, {
                                theme: 'outline',
                                size: 'large',
                                text: 'signin_with',
                                locale: 'ja',
                                width: '280'
                            });
                            
                            console.log('✅ Googleサインインボタンのレンダリングが完了しました');
                            return true;
                        } else {
                            console.log('google-signin-button要素が見つからないか非表示です');
                            return false;
                        }
                    };
                    
                    // すぐに試行
                    if (!renderButton()) {
                        // 要素が見つからない場合は少し待ってから再試行
                        console.log('要素の準備完了を待機中...');
                        setTimeout(() => {
                            if (!renderButton()) {
                                console.log('要素待機後も失敗 - フォールバック表示準備');
                            }
                        }, 1000);
                    }
                    
                } catch (error) {
                    console.error('Googleボタンレンダリングエラー:', error);
                }
            } else {
                console.error('Client IDが正しく設定されていません');
            }
        } else {
            console.log('Google Identity Services APIがまだ利用できません');
        }
    }
    
    // 追加のフォールバックボタンを表示（メインボタンと併用）
    addFallbackButton(parentElement) {
        console.log('=== 追加フォールバックボタン表示 ===');
        
        if (!parentElement) {
            parentElement = document.getElementById('google-signin-button');
        }
        
        if (parentElement && !parentElement.querySelector('.google-signin-fallback-alt')) {
            const fallbackDiv = document.createElement('div');
            fallbackDiv.className = 'google-signin-fallback-alt';
            fallbackDiv.style.marginTop = '10px';
            fallbackDiv.innerHTML = `
                <button class="google-signin-fallback" onclick="app.handleFallbackLogin()" style="
                    background: #fff;
                    border: 1px solid #dadce0;
                    border-radius: 4px;
                    color: #3c4043;
                    cursor: pointer;
                    font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
                    font-size: 14px;
                    height: 40px;
                    letter-spacing: 0.25px;
                    outline: none;
                    overflow: hidden;
                    padding: 0 12px;
                    position: relative;
                    text-align: center;
                    transition: background-color .218s,border-color .218s,box-shadow .218s;
                    vertical-align: middle;
                    white-space: nowrap;
                    width: 100%;
                    max-width: 300px;
                ">
                    <span style="display: inline-flex; align-items: center;">
                        <svg width="18" height="18" viewBox="0 0 24 24" style="margin-right: 8px;">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Googleでログイン（代替）
                    </span>
                </button>
                <p style="font-size: 11px; color: #888; margin-top: 8px; text-align: center;">
                    メインボタンが表示されない場合はこちらをお試しください
                </p>
            `;
            
            parentElement.appendChild(fallbackDiv);
            console.log('追加フォールバックボタンを表示しました');
        }
    }
    
    // フォールバック用のサインインボタンを表示
    showFallbackSignInButton() {
        console.log('=== フォールバックボタン表示開始 ===');
        
        // DOM要素の存在を待つ
        const waitForElement = (attempts = 0) => {
            console.log(`DOM要素待機中... (試行 ${attempts + 1})`);
            const buttonElement = document.getElementById('google-signin-button');
            console.log('buttonElement:', buttonElement);
            
            if (buttonElement) {
                buttonElement.innerHTML = `
                    <button class="google-signin-fallback" onclick="app.handleFallbackLogin()">
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" width="18" height="18" onerror="this.style.display='none'">
                        Googleでログイン
                    </button>
                    <p style="font-size: 12px; color: #666; margin-top: 5px;">
                        デバッグ: Google API読み込み問題によりフォールバックボタンを表示
                    </p>
                `;
                console.log('フォールバックボタンを表示しました');
            } else {
                // 要素がまだ存在しない場合は再試行
                if (attempts < 50) {  // 最大5秒待機
                    setTimeout(() => waitForElement(attempts + 1), 100);
                } else {
                    console.error('google-signin-button要素が見つかりません（タイムアウト）');
                    // 全体のDOM構造をチェック
                    console.log('全体のDOM構造チェック:');
                    console.log('設定ページ:', document.getElementById('settings-page'));
                    console.log('アカウント連携セクション:', document.querySelector('.google-auth-section'));
                }
            }
        };
        
        waitForElement();
    }
    
    // フォールバックログイン処理
    handleFallbackLogin() {
        console.log('フォールバックログインボタンがクリックされました');
        
        // 設定状況をチェック
        this.checkGoogleApiConfiguration();
        
        // 手動でOAuth2フローを開始
        this.requestAccessToken();
    }
    
    // Google API設定状況をチェック
    checkGoogleApiConfiguration() {
        console.log('=== Google API設定確認 ===');
        console.log('Client ID:', this.GOOGLE_CLIENT_ID);
        console.log('現在のURL:', window.location.href);
        console.log('現在のOrigin:', window.location.origin);
        console.log('Google API (gapi):', typeof gapi !== 'undefined' ? '読み込み済み' : '未読み込み');
        console.log('Google Identity Services:', typeof google !== 'undefined' && google.accounts ? '読み込み済み' : '未読み込み');
        
        // 設定チェック結果を表示
        const issues = [];
        
        if (!this.GOOGLE_CLIENT_ID || this.GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
            issues.push('❌ Client IDが設定されていません');
        } else {
            console.log('✅ Client IDが設定されています');
        }
        
        if (typeof google === 'undefined' || !google.accounts) {
            issues.push('❌ Google Identity Services APIが読み込まれていません');
        } else {
            console.log('✅ Google Identity Services APIが読み込まれています');
        }
        
        if (typeof gapi === 'undefined') {
            issues.push('❌ Google API JavaScript クライアントが読み込まれていません');
        } else {
            console.log('✅ Google API JavaScript クライアントが読み込まれています');
        }
        
        const currentOrigin = window.location.origin;
        const allowedOrigins = ['https://kumonochi.github.io', 'http://localhost', 'https://localhost', 'http://127.0.0.1', 'file://'];
        const isAllowedOrigin = allowedOrigins.some(origin => currentOrigin.startsWith(origin));
        
        if (!isAllowedOrigin) {
            issues.push(`❌ JavaScript Origins設定: ${currentOrigin} が許可されていません`);
        } else {
            console.log('✅ JavaScript Origins設定が正しいです');
        }
        
        if (issues.length > 0) {
            console.warn('Google API設定の問題:');
            issues.forEach(issue => console.warn(issue));
            
            const message = '⚠️ Google連携の設定に問題があります:\n' + issues.join('\n') + 
                '\n\n📋 必要な設定:\n' +
                '1. Google Cloud Consoleで以下のAPIを有効化:\n' +
                '   • Google Drive API\n' +
                '   • Google Identity Services\n' +
                '   • People API\n' +
                '2. OAuth 2.0認証情報の設定:\n' +
                '   • JavaScript Origins: ' + currentOrigin + '\n' +
                '   • リダイレクトURI: ' + currentOrigin + '/\n' +
                '3. APIキーの制限設定';
            
            this.showPopupNotification(message, 'warning');
        } else {
            console.log('✅ Google API設定は正常です');
        }
    }
    
    // Google API警告表示
    showGoogleApiWarning() {
        this.showPopupNotification('Google APIの読み込みに問題があります。ページを再読み込みしてください。', 'warning');
    }
    
    // Google認証レスポンス処理
    async handleCredentialResponse(response) {
        try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            
            this.currentUser = {
                id: payload.sub,
                name: payload.name,
                email: payload.email,
                picture: payload.picture
            };
            
            this.isSignedIn = true;
            this.updateAuthUI();
            this.showPopupNotification('Googleアカウントでログインしました', 'success');
            
            // OAuth 2.0のアクセストークンを取得するために追加の認証が必要
            await this.requestAccessToken();
            
        } catch (error) {
            console.error('認証エラー:', error);
            this.showPopupNotification('ログインに失敗しました', 'warning');
        }
    }
    
    // OAuth 2.0アクセストークンを取得
    async requestAccessToken() {
        try {
            // 最初に従来のgapi.auth2を試行
            if (typeof gapi !== 'undefined' && gapi.auth2) {
                const authInstance = gapi.auth2.getAuthInstance();
                if (authInstance) {
                    try {
                        // 既にサインインしている場合
                        const authUser = authInstance.currentUser.get();
                        if (authUser && authUser.isSignedIn()) {
                            const authResponse = authUser.getAuthResponse();
                            if (authResponse && authResponse.access_token) {
                                this.accessToken = authResponse.access_token;
                                console.log('既存のアクセストークン取得成功');
                                await this.syncDataWithGoogle();
                                return;
                            }
                        }
                        
                        // サインインしていない場合は新規サインイン
                        const authUser2 = await authInstance.signIn({
                            scope: this.SCOPES
                        });
                        
                        if (authUser2) {
                            const authResponse = authUser2.getAuthResponse();
                            this.accessToken = authResponse.access_token;
                            console.log('新規サインインでアクセストークン取得成功');
                            await this.syncDataWithGoogle();
                            return;
                        }
                    } catch (auth2Error) {
                        console.warn('auth2認証に失敗:', auth2Error);
                    }
                }
            }
            
            // gapi.auth2が利用できない場合、直接OAuth 2.0フローを使用
            await this.initOAuth2Flow();
            
        } catch (error) {
            console.error('アクセストークン取得エラー:', error);
            this.showPopupNotification('Google Driveへのアクセス権限が必要です。認証画面で許可してください。', 'warning');
        }
    }
    
    // OAuth 2.0フローを初期化
    async initOAuth2Flow() {
        try {
            // Google OAuth 2.0エンドポイントを使用
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                `client_id=${this.GOOGLE_CLIENT_ID}&` +
                `redirect_uri=${encodeURIComponent(window.location.origin + window.location.pathname)}&` +
                `response_type=token&` +
                `scope=${encodeURIComponent(this.SCOPES)}&` +
                `include_granted_scopes=true&` +
                `state=sync_request`;
            
            // ポップアップでOAuth認証を行う
            const popup = window.open(authUrl, 'oauth', 'width=500,height=600');
            
            // URLハッシュを監視してアクセストークンを取得
            const checkForToken = () => {
                try {
                    if (popup.closed) {
                        clearInterval(checkInterval);
                        return;
                    }
                    
                    const hash = popup.location.hash;
                    if (hash && hash.includes('access_token=')) {
                        const params = new URLSearchParams(hash.substring(1));
                        this.accessToken = params.get('access_token');
                        popup.close();
                        clearInterval(checkInterval);
                        
                        if (this.accessToken) {
                            console.log('OAuth2アクセストークン取得成功');
                            this.syncDataWithGoogle();
                        }
                    }
                } catch (e) {
                    // クロスオリジンエラーは無視
                }
            };
            
            const checkInterval = setInterval(checkForToken, 1000);
            
            // 2分後にタイムアウト
            setTimeout(() => {
                clearInterval(checkInterval);
                if (!popup.closed) {
                    popup.close();
                }
            }, 120000);
            
        } catch (error) {
            console.error('OAuth2フロー初期化エラー:', error);
        }
    }
    
    // 認証UI更新
    updateAuthUI() {
        const signinSection = document.getElementById('google-signin-section');
        const userInfoSection = document.getElementById('google-user-info');
        
        if (this.isSignedIn && this.currentUser) {
            signinSection.style.display = 'none';
            userInfoSection.style.display = 'block';
            
            document.getElementById('user-name').textContent = this.currentUser.name;
            document.getElementById('user-email').textContent = this.currentUser.email;
            document.getElementById('user-picture').src = this.currentUser.picture;
        } else {
            signinSection.style.display = 'block';
            userInfoSection.style.display = 'none';
        }
    }
    
    // Google認証関連イベントリスナー設定
    setupGoogleAuthListeners() {
        // ログアウトボタン
        document.getElementById('google-signout').addEventListener('click', () => {
            this.signOut();
        });
        
        // 手動同期ボタン
        document.getElementById('manual-sync').addEventListener('click', async () => {
            if (!this.accessToken) {
                // アクセストークンがない場合は認証フローを開始
                await this.requestAccessToken();
            } else {
                // アクセストークンがある場合は直接同期
                this.syncDataWithGoogle();
            }
        });
    }
    
    // サインアウト
    signOut() {
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.disableAutoSelect();
        }
        
        // 従来のauth2からもサインアウト
        if (typeof gapi !== 'undefined' && gapi.auth2) {
            const authInstance = gapi.auth2.getAuthInstance();
            if (authInstance) {
                authInstance.signOut();
            }
        }
        
        this.isSignedIn = false;
        this.currentUser = null;
        this.accessToken = null; // アクセストークンもクリア
        this.updateAuthUI();
        this.showPopupNotification('ログアウトしました', 'info');
    }
    
    // Googleドライブとのデータ同期
    async syncDataWithGoogle() {
        if (!this.isSignedIn) {
            this.showPopupNotification('Googleアカウントにログインしてください', 'warning');
            return;
        }
        
        // アクセストークンがない場合は取得を試行
        if (!this.accessToken) {
            this.showPopupNotification('Google Driveへのアクセス権限が必要です', 'warning');
            await this.requestAccessToken();
            return;
        }
        
        try {
            const syncStatusElement = document.getElementById('sync-status');
            if (syncStatusElement) {
                syncStatusElement.textContent = '同期中...';
            }
            
            // データをJSONとして準備
            const dataToSync = {
                records: this.records,
                settings: this.settings,
                lastSync: new Date().toISOString()
            };
            
            const jsonData = JSON.stringify(dataToSync, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            
            // Google Driveにファイルを保存
            const metadata = {
                name: 'jiritsu_log_backup.json',
                parents: ['appDataFolder']
            };
            
            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
            form.append('file', blob);
            
            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: new Headers({
                    'Authorization': `Bearer ${this.accessToken}`
                }),
                body: form
            });
            
            if (response.ok) {
                if (syncStatusElement) {
                    syncStatusElement.textContent = '同期済み';
                }
                this.showPopupNotification('データをクラウドに保存しました', 'success');
            } else {
                const errorText = await response.text();
                console.error('同期レスポンスエラー:', errorText);
                
                // アクセストークンが無効な場合は再取得を試行
                if (response.status === 401) {
                    this.accessToken = null;
                    this.showPopupNotification('認証が期限切れです。再度認証してください', 'warning');
                    await this.requestAccessToken();
                } else {
                    throw new Error(`同期に失敗しました (${response.status})`);
                }
            }
            
        } catch (error) {
            console.error('同期エラー:', error);
            const syncStatusElement = document.getElementById('sync-status');
            if (syncStatusElement) {
                syncStatusElement.textContent = '同期エラー';
            }
            this.showPopupNotification('データの同期に失敗しました', 'warning');
        }
    }
    
    // 記録保存時の自動同期
    async saveRecordWithSync() {
        // 通常の保存処理
        this.saveRecords();
        
        // Google同期が有効の場合は自動同期
        if (this.isSignedIn) {
            await this.syncDataWithGoogle();
        }
    }
}

// グローバル変数でアプリインスタンスを保持
let app;

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    app = new JiritsuLogApp();
});

// ページ離脱時のデータ保存
window.addEventListener('beforeunload', () => {
    // 必要に応じて最終的なデータ保存処理
});