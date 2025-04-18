import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { rolldownBuild } from '@sxzz/test-utils'
import { expect, test } from 'vitest'
import { dts } from '../src'

const dirname = path.dirname(fileURLToPath(import.meta.url))

test('basic', async () => {
  const { snapshot } = await rolldownBuild(
    path.resolve(dirname, 'fixtures/basic.ts'),
    [dts()],
  )
  expect(snapshot).toMatchSnapshot()
})

test('tsx', async () => {
  const { snapshot } = await rolldownBuild(
    path.resolve(dirname, 'fixtures/tsx.tsx'),
    [dts()],
  )
  expect(snapshot).toMatchSnapshot()
})

test('typescript compiler', async () => {
  const root = path.resolve(dirname, 'fixtures/tsc')
  const { snapshot } = await rolldownBuild(
    [path.resolve(root, 'entry1.ts'), path.resolve(root, 'entry2.ts')],
    [
      {
        name: 'virtual-module',
        resolveId(id) {
          if (id === '/vfs') return '/vfs.ts'
        },
        load(id) {
          if (id === '/vfs.ts') return `export const vfs = Math.random()`
        },
      },
      dts({
        emitDtsOnly: true,
        compilerOptions: {
          skipLibCheck: true,
          isolatedDeclarations: false,
        },
        isolatedDeclarations: false,
      }),
    ],
  )
  expect(snapshot.replaceAll(/\/\/#region.*/g, '')).toMatchSnapshot()
})

test('resolve dependencies', async () => {
  const { snapshot } = await rolldownBuild(
    path.resolve(dirname, 'fixtures/resolve-dep.ts'),
    [
      dts({
        resolve: ['magic-string-ast'],
        isolatedDeclarations: true,
        emitDtsOnly: true,
      }),
    ],
  )
  expect(snapshot).contain('declare class MagicString')
  expect(snapshot).contain('declare class MagicStringAST')
})

// Test alias mapping based on rolldown input option
test('input alias', async () => {
  const root = path.resolve(dirname, 'fixtures/alias')
  const { snapshot, chunks } = await rolldownBuild(
    null!,
    [
      dts({
        emitDtsOnly: false, // Generate both JS and DTS files
        compilerOptions: {},
        isolatedDeclarations: false,
      }),
    ],
    {
      cwd: root,
      // A mapping from output chunk names to input files. This mapping should
      // be used in both JS and DTS outputs.
      input: {
        output1: 'input1.ts',
        'output2/index': 'input2.ts',
      },
    },
  )
  const fileNames = chunks.map((chunk) => chunk.fileName).sort()

  // The JS output and DTS output should have the same structure
  expect(fileNames).toContain('output1.d.ts')
  expect(fileNames).toContain('output1.js')
  expect(fileNames).toContain('output2/index.d.ts')
  expect(fileNames).toContain('output2/index.js')

  expect(snapshot).toMatchSnapshot()
})

test('isolated declaration error', async () => {
  const error = await rolldownBuild(
    path.resolve(dirname, 'fixtures/isolated-decl-error.ts'),
    [
      dts({
        emitDtsOnly: true,
        isolatedDeclarations: true,
      }),
    ],
  ).catch((error: any) => error)
  expect(String(error)).toContain(
    `Function must have an explicit return type annotation with --isolatedDeclarations.`,
  )
  expect(String(error)).toContain(`export function fn() {`)
})

test('paths', async () => {
  const root = path.resolve(dirname, 'fixtures/paths')
  const { snapshot } = await rolldownBuild(
    path.resolve(root, 'index.ts'),
    [
      dts({
        isolatedDeclarations: true,
        emitDtsOnly: true,
      }),
    ],
    {
      resolve: {
        tsconfigFilename: path.resolve(root, 'tsconfig.json'),
      },
    },
  )
  expect(snapshot).toMatchSnapshot()
})
