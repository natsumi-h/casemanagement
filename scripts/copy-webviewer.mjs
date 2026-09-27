// WebViewer の静的アセット (core / ui) を public/lib/webviewer にコピーし、
// 不自然な UI 翻訳を scripts/webviewer-translation-overrides.json の内容で上書きする
//
// 翻訳のカスタマイズに関するドキュメント:
// - 言語設定・翻訳ファイル: https://docs.apryse.com/web/ui-customization/localization/languages-and-internationalization.md
// - 言語切り替えサンプル: https://docs.apryse.com/web/samples/internationalization
// - UI API リファレンス (setTranslations など): https://sdk.apryse.com/api/web/UI.html
// - setTranslations 追加時の変更履歴: https://docs.apryse.com/documentation/web/changelog/v8-3-0
// なお UI.setTranslations は非同期に反映されるため Ribbon 等のラベルが更新されないことがあり、
// ここでは翻訳ファイル自体を書き換えている。
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = resolve('node_modules/@pdftron/webviewer/public')
const dest = resolve('public/lib/webviewer')
const overridesPath = resolve('scripts/webviewer-translation-overrides.json')

if (!existsSync(src)) {
  console.error('@pdftron/webviewer が見つかりません。npm install を実行してください。')
  process.exit(1)
}
mkdirSync(dest, { recursive: true })
cpSync(src, dest, { recursive: true })
console.log('WebViewer assets copied to public/lib/webviewer')

// キーは translation-{lang}.json 内のパスをドット区切りで指定する
const overrides = JSON.parse(readFileSync(overridesPath, 'utf8'))
for (const [lang, entries] of Object.entries(overrides)) {
  const file = resolve(dest, `ui/i18n/translation-${lang}.json`)
  const translation = JSON.parse(readFileSync(file, 'utf8'))
  for (const [key, value] of Object.entries(entries)) {
    const path = key.split('.')
    const last = path.pop()
    let node = translation
    for (const segment of path) node = node[segment] ??= {}
    if (!(last in node)) console.warn(`[${lang}] 未知の翻訳キー: ${key}`)
    node[last] = value
  }
  writeFileSync(file, JSON.stringify(translation, null, 2))
  console.log(`Applied ${Object.keys(entries).length} translation overrides to translation-${lang}.json`)
}
