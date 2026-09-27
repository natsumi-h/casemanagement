// WebViewer の静的アセット (core / ui) を public/lib/webviewer にコピーする
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const src = resolve('node_modules/@pdftron/webviewer/public')
const dest = resolve('public/lib/webviewer')

if (!existsSync(src)) {
  console.error('@pdftron/webviewer が見つかりません。npm install を実行してください。')
  process.exit(1)
}
mkdirSync(dest, { recursive: true })
cpSync(src, dest, { recursive: true })
console.log('WebViewer assets copied to public/lib/webviewer')
