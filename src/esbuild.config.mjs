import * as esbuild from 'esbuild'
import { glob } from 'glob'
import { basename, join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Находим все .ts файлы в корне src/
const entryPoints = await glob('*.ts', { cwd: __dirname })

const ctx = await esbuild.context({
  entryPoints: entryPoints.map(f => join(__dirname, f)),
  outdir: join(__dirname, 'dist'),
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  sourcemap: true,
  minify: false,
  
  // External модули - не включаются в бандл
  external: [
    'vscode',           // Предоставляется VSCode runtime
    '@roo-code/types',  // Runtime зависимость Roo-Code
  ],
  
  // Настройки для TypeScript
  loader: { '.ts': 'ts' },
  tsconfig: join(__dirname, 'tsconfig.json'),
  
  // Сохранить имена экспортов
  keepNames: true,
  
  // Banner для идентификации
  banner: {
    js: '// Built by esbuild for Roo-Code Custom Tools'
  }
})

// Watch режим или однократная сборка
if (process.argv.includes('--watch')) {
  await ctx.watch()
  console.log('👀 Watching for changes...')
} else {
  await ctx.rebuild()
  console.log(`✅ Built ${entryPoints.length} bundles to dist/`)
  ctx.dispose()
}
