# 3D リアルタイム格闘ゲーム

リアルタイムで戦う 3D の格闘ゲームです。

## 環境構築

- Node.js v18 のインストール
- `npm run setup`

## 開発

次のすべてのコマンドを同時に実行

- フロントエンド開発用サーバー起動（ポート:8000)
- バックエンド開発用サーバー起動 (ポート:5000)

## デバッグ

- フロントエンド：ブラウザの開発者用ツールを使う
- バックエンド：vscode のデバッガーを使う

## フォルダ構造

root/  
┠client : ブラウザ側の処理。主にシーン遷移と描画  
┗server : サーバー側の処理。主にゲーム内情報の処理

各ディレクトリの構造はそれぞれの README.md を参考にしてください。
