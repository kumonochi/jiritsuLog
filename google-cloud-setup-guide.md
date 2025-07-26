# Google Cloud Console 設定手順

## 現在の問題
- OAuth2認証で403 Forbiddenエラーが発生
- 「アクセスをブロック: このアプリのリクエストは無効です」メッセージ
- Google Drive APIへのアクセス権限が正しく設定されていない

## 必要な設定手順

### 1. Google Cloud Consoleにアクセス
https://console.cloud.google.com/

### 2. プロジェクトの確認・作成
- 現在のプロジェクト: `jiritsu-log` または新規作成
- プロジェクトIDを確認してください

### 3. Google Drive API の有効化
1. 「APIとサービス」→「ライブラリ」
2. 「Google Drive API」を検索
3. 「有効にする」をクリック

### 4. OAuth 2.0 認証情報の設定
1. 「APIとサービス」→「認証情報」
2. 「認証情報を作成」→「OAuth 2.0 クライアントID」
3. アプリケーションの種類：「ウェブアプリケーション」
4. 名前：「じりつログ」
5. **承認済みの JavaScript 生成元**:
   - `https://kumonochi.github.io`
6. **承認済みのリダイレクト URI**:
   - `https://kumonochi.github.io/jiritsuLog/index.html`
   - `https://kumonochi.github.io/jiritsuLog/`

### 5. OAuth同意画面の設定
1. 「OAuth同意画面」タブ
2. ユーザータイプ：「外部」
3. 必須項目を入力：
   - アプリ名：「じりつログ」
   - ユーザーサポートメール：あなたのメールアドレス
   - 開発者の連絡先情報：あなたのメールアドレス
4. スコープの追加：
   - `https://www.googleapis.com/auth/drive.file`

### 6. テストユーザーの追加（必須）
1. OAuth同意画面の「テストユーザー」セクション
2. 「ユーザーを追加」
3. あなたのGoogleアカウント（fortune.telling18@gmail.com）を追加

### 7. 公開ステータス
- 開発段階では「テスト」のまま
- 他のユーザーも利用する場合は「本番環境にプッシュ」

## 現在のクライアントID
`47690741133-c4pbiefj90me73dflkla5q3ie67nbqdl.apps.googleusercontent.com`

このクライアントIDが正しく設定されているか確認してください。

## ❗ 重要：403エラーの解決方法

**現在発生中の問題:**
```
GET https://accounts.google.com/o/oauth2/iframerpc?... 403 (Forbidden)
auth2認証エラー: {type: 'tokenFailed', idpId: 'google', error: 'server_error'}
```

**必須対処法:**

### 1. OAuth同意画面でテストユーザー追加（最重要）
1. Google Cloud Console → 「APIとサービス」→「OAuth同意画面」
2. 画面下部の「テストユーザー」セクション
3. 「ユーザーを追加」ボタンをクリック
4. **`fortune.telling18@gmail.com`** を追加
5. 「保存」をクリック

### 2. アプリケーションの種類を確認
1. 「認証情報」タブ → OAuth 2.0 クライアントID
2. アプリケーションの種類：**「ウェブアプリケーション」**
3. 承認済みの JavaScript 生成元：`https://kumonochi.github.io`
4. 承認済みのリダイレクト URI：`https://kumonochi.github.io/jiritsuLog/index.html`

### 3. OAuth同意画面の公開ステータス
- ユーザータイプ：**「外部」**
- 公開ステータス：**「テスト」**（これで十分）

## 設定完了後の確認
1. アプリでGoogleログインを試行
2. OAuth認証画面で「許可」をクリック
3. 手動同期が正常に動作することを確認

## トラブルシューティング
- **403エラーが継続する場合**：OAuth同意画面のテストユーザーに `fortune.telling18@gmail.com` が追加されているか確認
- **リダイレクトURIエラー**：承認済みリダイレクトURIが `https://kumonochi.github.io/jiritsuLog/index.html` と完全一致しているか確認
- **スコープエラー**：Google Drive APIが有効化されているか確認

**⚠️ テストユーザー追加が最も重要です。これが設定されていないと403エラーが必ず発生します。**