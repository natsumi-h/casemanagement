# 概要

    * https://www.youtube.com/watch?v=xSE4b3r7wQc
    * https://github.com/ApryseSDK/webviewer-samples/tree/main/webviewer-react
    * 上記のYoutubeのようなCase Managementのアプリケーション（デモ用）をReactとSupabaseとApryseWebViewerで作成したいです。
    * 日本語のUIにしてください
    * CSSについては特に指定はありません。ライブラリを使ってもらってもOKです。
    * ヘッダー右にログインユーザーのメールアドレスを表示、左側のサイドメニューバーは常時表示。
    * 業務契約書は下記を使用する
      * /Users/natsumi.hori@apryse.com/Desktop/casemanagement-app/業務契約書.docx
      * dateの部分はYYYY年MM月DD日で表示
      * customersignatureの部分に署名フィールドを適用する
    * WebviewerのUIも日本語にしておく
    * Supabaseのログイン情報が必要な場合はそのように教えてください
    * あくまでデモ用途なのでローカルホストで簡単に表示ができるようであればOK

# フロントアプリのPage

    * Templates
      * 作成されたテンプレートの一覧　（各行にアクションボタン（削除、編集）を表示する）
      * 本来であればユーザーやチームに紐づくテンプレのみ表示する必要があるがデモのため省略
      * 作成ボタンで新規作成。ウェブビューアーでdocx editorが開く（保存処理はデモのため省略）
      * 編集ボタンで該当のテンプレートを開くdocx editorが開く（保存処理はデモのため省略）
    * templates/:id
    * * templates/create
    * users
      * ユーザー一覧（各業アクションボタン表示）
      * 作成、保存、削除処理はデモのため省略
      * アドミンユーザー以外はこのページは見れない
    * agreements
      * 署名者（user）、作成者、テンプレート、ステータス、作成日が表示されるリスト（アクションは閲覧、削除）
      * ログインユーザーが作成者、もしくは署名者のもののみリストに現れる
      * 作成、削除はデモのため省略
      * 閲覧ボタン押下でPDF viewerのUIへ
      * ログインユーザがuserと一致する場合のみ署名ができる
    * agreements/:id
    * Logout(ボタンのみ)
    * login（メールアドレスでログインできる簡単なフォームでOK）


# DB構成（Supabase）

## Tables

- agreements
  - title
  - status (enum: awaiting_signature / signed )
  - user_id
  - template_id
  - file
  - createdUser_id
- templates
  - title
  - file
- users
  - email
  - firstname
  - lastname
  - address
  - role (enum: admin / user)
