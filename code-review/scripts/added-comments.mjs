#!/usr/bin/env node
// Lists every comment line a diff adds, as `file:line: text`, for the comments axis to judge.
// Usage: added-comments.mjs [-C <repo>] <base> [--trees] – compares `<base>...HEAD`, or the two snapshots with `--trees`;
// pass `HEAD` as the base to cover uncommitted changes instead, untracked files included.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

let repo = '.'
let compareTrees = false
const positionals = []
const argv = process.argv.slice(2)
for (let index = 0; index < argv.length; index++) {
  if (argv[index] === '-C')
    repo = argv[++index]
  else if (argv[index] === '--trees')
    compareTrees = true
  else
    positionals.push(argv[index])
}
const [base] = positionals
if (!base || !repo || positionals.length > 1) {
  console.error('Usage: added-comments.mjs [-C <repo>] <base> [--trees]')
  process.exit(1)
}

// A block opener marked `atLineStart` opens only as the first text on its line (Python docstrings).
const slashBlock = ['/*', '*/']
const htmlBlock = ['<!--', '-->']
const syntaxes = [
  [/\.(?:[cm]?[jt]sx?|go|rs|java|kts?|swift|c|h|cc|cpp|hpp|cs|dart|scala|scss|sass|less)$/, { lineComment: /\/\//y, blocks: [slashBlock] }],
  [/\.css$/, { blocks: [slashBlock] }],
  [/\.(?:vue|svelte)$/, { lineComment: /\/\//y, blocks: [slashBlock, htmlBlock] }],
  [/\.html?$/, { blocks: [htmlBlock] }],
  [/\.twig$/, { blocks: [['{#', '#}'], htmlBlock] }],
  // `#[` opens a PHP attribute, not a comment.
  [/\.php$/, { lineComment: /\/\/|#(?!\[)/y, blocks: [slashBlock, htmlBlock] }],
  [/\.py$/, { lineComment: /#/y, blocks: [['"""', '"""', 'atLineStart'], ['\'\'\'', '\'\'\'', 'atLineStart']] }],
  [/\.(?:sh|bash|zsh|rb|ya?ml|toml|conf)$/, { lineComment: /#/y, blocks: [] }],
  [/\.ini$/, { lineComment: /[#;]/y, blocks: [] }],
]

function git(...args) {
  try {
    return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] })
  }
  catch (error) {
    console.error(String(error.stderr || error.message).trim().split('\n')[0])
    process.exit(1)
  }
}

repo = git('rev-parse', '--show-toplevel').trim()

// Explicit prefixes and unquoted paths keep `+++ b/<path>` stable under any diff config.
const range = base === 'HEAD' ? ['HEAD'] : compareTrees ? [base, 'HEAD'] : [`${base}...HEAD`]
const diff = git('-c', 'core.quotePath=false', 'diff', '-U0', '--no-color', '--no-ext-diff', '--no-textconv', '--src-prefix=a/', '--dst-prefix=b/', ...range, '--')

// Each hunk is a run of added lines; block-comment state never carries across hunks.
const hunks = []
let currentFile = null
let isInFileHeader = false
for (const rawLine of diff.split('\n')) {
  if (rawLine.startsWith('diff --git ')) {
    currentFile = null
    isInFileHeader = true
  }
  else if (isInFileHeader && rawLine.startsWith('+++ ')) {
    // Git appends a tab to paths containing a space, and still quotes paths with control characters.
    const path = rawLine.slice(4).replace(/\t$/, '').replace(/^"(.*)"$/, (_, quoted) => quoted.replace(/\\(.)/g, '$1'))
    currentFile = path === '/dev/null' ? null : path.slice(2)
  }
  else if (rawLine.startsWith('@@ ')) {
    isInFileHeader = false
    hunks.push({ file: currentFile, firstLineNumber: Number(rawLine.match(/\+(\d+)/)[1]), lines: [] })
  }
  else if (!isInFileHeader && rawLine.startsWith('+') && hunks.length) {
    hunks.at(-1).lines.push(rawLine.slice(1))
  }
}

if (base === 'HEAD') {
  for (const file of git('ls-files', '--others', '--exclude-standard', '-z').split('\0')) {
    if (!file || !findSyntax(file))
      continue
    let text
    try {
      text = readFileSync(join(repo, file), 'utf8')
    }
    catch {
      continue
    }
    if (!text.includes('\0'))
      hunks.push({ file, firstLineNumber: 1, lines: text.replace(/\n$/, '').split('\n') })
  }
}

for (const { file, firstLineNumber, lines } of hunks) {
  const syntax = file && findSyntax(file)
  if (!syntax)
    continue
  let openCloser = null
  lines.forEach((content, offset) => {
    const lineNumber = firstLineNumber + offset
    const trimmedContent = content.trim()
    // A hunk can start inside a block comment opened in unchanged lines; its ` * …` lines still count.
    const isBlockContinuation = !openCloser && syntax.blocks.includes(slashBlock) && trimmedContent.startsWith('*')
    const scan = scanLine(content, syntax, openCloser, lineNumber)
    openCloser = scan.openCloser
    if (trimmedContent && (scan.hasComment || isBlockContinuation))
      console.log(`${file}:${lineNumber}: ${trimmedContent}`)
  })
}

function findSyntax(file) {
  return syntaxes.find(([extension]) => extension.test(file))?.[1]
}

// Walks one line, skipping string literals, and reports whether any of it is a comment
// plus the closer of a block comment still open at its end.
function scanLine(content, syntax, openCloser, lineNumber) {
  let hasComment = Boolean(openCloser)
  const firstTextIndex = content.search(/\S/)
  let index = 0
  while (index < content.length) {
    if (openCloser) {
      const closerIndex = content.indexOf(openCloser, index)
      if (closerIndex === -1)
        return { hasComment, openCloser }
      index = closerIndex + openCloser.length
      openCloser = null
      continue
    }

    const block = syntax.blocks.find(([opener, , position]) => content.startsWith(opener, index) && (position !== 'atLineStart' || index === firstTextIndex))
    if (block) {
      hasComment = true
      openCloser = block[1]
      index += block[0].length
      continue
    }

    // A line comment starts the line or follows whitespace, which keeps `a//b` and `${#array}` out; `#!` on line 1 is a shebang.
    if (syntax.lineComment && (index === 0 || /\s/.test(content[index - 1])) && !(lineNumber === 1 && content.startsWith('#!'))) {
      syntax.lineComment.lastIndex = index
      if (syntax.lineComment.test(content))
        return { hasComment: true, openCloser: null }
    }

    const character = content[index]
    if (character === '\\') {
      index += 2
      continue
    }
    // An unmatched quote is an apostrophe or a Rust lifetime, not a string.
    if ('\'"`'.includes(character)) {
      const closingIndex = findClosingQuote(content, index)
      if (closingIndex !== -1) {
        index = closingIndex + 1
        continue
      }
    }
    index++
  }
  return { hasComment, openCloser }
}

function findClosingQuote(content, openingIndex) {
  for (let index = openingIndex + 1; index < content.length; index++) {
    if (content[index] === '\\')
      index++
    else if (content[index] === content[openingIndex])
      return index
  }
  return -1
}
