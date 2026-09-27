# ケース管理デモ（React + Supabase + Apryse WebViewer）

## セットアップ

1. Supabase プロジェクトを作成し、**SQL Editor** で `supabase/schema.sql` を実行
   （テーブル・enum・デモ用 RLS ポリシー・Storage バケット `agreements`・シードデータを作成）
2. `.env.example` を `.env` にコピーし、Supabase の **Project URL** と **anon key** を設定
   （Settings > API）。Apryse のライセンスキーは任意（未設定時はトライアル動作）
3. 起動
   ```sh
   npm install   # postinstall で WebViewer のアセットを public/lib/webviewer にコピー
   npm run dev
   ```
4. http://localhost:5173 を開き、以下のメールアドレスでログイン
   - `admin@example.com`（管理者：ユーザー画面も表示）
   - `tanaka@example.com` / `sato@example.com`（一般ユーザー）

## 画面

| パス | 内容 |
| --- | --- |
| `/login` | メールアドレスのみの簡易ログイン（users テーブルと照合。デモ用） |
| `/templates` | テンプレート一覧（編集・削除） |
| `/templates/create`, `/templates/:id` | WebViewer の DOCX エディタ（保存はデモのため省略） |
| `/users` | ユーザー一覧（管理者のみ） |
| `/agreements` | ログインユーザーが作成者または署名者の契約書一覧 |
| `/agreements/:id` | 契約書ビューア。署名者本人のみ署名可能 |

## 契約書の生成と署名

- テンプレート `public/files/gyomu-keiyakusho.docx` の `{{date}}`（YYYY年MM月DD日）、`{{lastname}}`、`{{firstname}}`、`{{address}}` に値を差し込んで表示
- `[customersignature]` の位置に署名フィールドを配置
- 署名者が「署名を完了する」を押すと、フラット化した PDF を Storage に保存し、ステータスを `signed` に更新

## 補足

- idea.md の `createdUser_id` は Postgres の慣例に合わせて `created_user_id` としています
- 認証は Supabase Auth を使わない簡易方式、RLS も全許可のデモ設定です。本番利用はしないでください
