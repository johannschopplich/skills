#!/usr/bin/env node
// Lists the numbers, a bare 0, 1, or 2 aside, and the backticked identifiers a change removed from the Markdown
// pages under a docs directory that no tracked or untracked Markdown page there still contains. A changelog,
// `GLOSSARY.md`, an ADR under `adr/`, `AGENTS.md`, `CLAUDE.md`, and a dot-named file or directory are no pages: a fact
// that survives only there is gone.
// Usage: vanished-facts.mjs [--per-dir] <range> [<docs-dir>] – `<range>` as `git diff` takes it; a bare base compares
// against the working tree, which is what the pages are read from. `<docs-dir>` defaults to `docs`. With `--per-dir`,
// each top-level directory of `<docs-dir>` is its own corpus, so a fact that survives only in another directory still
// counts as gone; files directly under `<docs-dir>` are checked against all of it.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'

// A number outside a word, path, or flag, taken with every version segment, a prerelease tag, or an optional unit.
const numberPattern = /(?<![\w`/.-])\d+(?:[.,]\d+)*(?:-[\dA-Za-z]+(?:\.[\dA-Za-z]+)*)?(?: ?(?:ms|milliseconds|seconds|second|px|MB|KB|bytes|characters|chars|%|retries|texts|items))?(?![\w/-]|[.,]\d)/g
const identifierPattern = /`([^`]+)`/g
const trivialNumbers = new Set(['0', '1', '2'])
const maxFactLength = 40
const markdownPathspecs = ['*.md', '*.mdx']
const rootGroup = ''
const changelogPattern = /^changelog\.mdx?$/i
const nonPageFileNames = new Set(['GLOSSARY.md', 'GLOSSARY-MAP.md', 'AGENTS.md', 'CLAUDE.md'])
const adrDirectoryPattern = /^adrs?$/i

let isPerDirectory = false
const positionals = []
for (const argument of process.argv.slice(2)) {
  if (argument === '--per-dir')
    isPerDirectory = true
  else
    positionals.push(argument)
}
const [range, docsDirectoryArgument = 'docs'] = positionals
if (!range || positionals.length > 2) {
  console.error('Usage: vanished-facts.mjs [--per-dir] <range> [<docs-dir>]')
  process.exit(1)
}

const docsDirectory = resolve(docsDirectoryArgument)
if (!existsSync(docsDirectory) || !statSync(docsDirectory).isDirectory()) {
  console.error(`Not a directory: ${docsDirectoryArgument}`)
  process.exit(1)
}

const git = args => execFileSync('git', ['-c', 'core.quotePath=false', ...args], { cwd: docsDirectory, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
// Repository-relative path of the docs directory with a trailing slash, empty at the repository root.
const docsPrefix = git(['rev-parse', '--show-prefix']).trim()
const diff = git(['diff', '--no-ext-diff', '--no-color', '--no-relative', '--src-prefix=a/', '--dst-prefix=b/', '-U0', range, '--', ...markdownPathspecs])
const pages = readPages()

const removedFacts = collectRemovedFacts(diff)

for (const [group, facts] of removedFacts) {
  const corpus = pages
    .filter(page => group === rootGroup || page.path.startsWith(`${group}/`))
    .map(page => page.content)
    .join('\n')
  const vanishedFacts = [...facts].filter(([fact]) => !isPresent(fact, corpus))
  const label = !isPerDirectory ? docsDirectoryArgument : group === rootGroup ? '(root)' : group.replace(/^\d+\./, '')
  console.log(`== ${label}: ${vanishedFacts.length} facts no longer in the documentation`)
  for (const [fact, files] of vanishedFacts.sort(([a], [b]) => a.localeCompare(b)))
    console.log(`   ${fact.padEnd(maxFactLength)} (${[...files].sort().join(', ')})`)
}

function readPages() {
  return git(['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', ...markdownPathspecs])
    .split('\0')
    .filter(path => path && isPage(path) && existsSync(join(docsDirectory, path)))
    .map(path => ({ path, content: readFileSync(join(docsDirectory, path), 'utf8') }))
}

function collectRemovedFacts(diffText) {
  const factsByGroup = new Map()
  let currentFile = ''
  let isInFileHeader = false

  for (const line of diffText.split('\n')) {
    if (line.startsWith('diff --git ')) {
      isInFileHeader = true
      continue
    }
    if (isInFileHeader) {
      // The `---` side names the file a removed line came from, also for a deleted or renamed file. Git ends a path
      // that contains a space with a tab.
      if (line.startsWith('--- a/'))
        currentFile = line.slice('--- a/'.length + docsPrefix.length).replace(/\t$/, '')
      else if (line.startsWith('@@'))
        isInFileHeader = false
      continue
    }
    if (!line.startsWith('-') || !isPage(currentFile))
      continue

    const text = line.slice(1)
    const facts = [
      ...(text.match(numberPattern) ?? []),
      ...[...text.matchAll(identifierPattern)].map(match => match[1]),
    ].filter(fact => fact.length <= maxFactLength && !trivialNumbers.has(fact))

    const pathSegments = currentFile.split('/')
    const group = isPerDirectory && pathSegments.length > 1 ? pathSegments[0] : rootGroup
    for (const fact of facts) {
      const filesByFact = factsByGroup.get(group) ?? new Map()
      const files = filesByFact.get(fact) ?? new Set()
      files.add(pathSegments.at(-1))
      filesByFact.set(fact, files)
      factsByGroup.set(group, filesByFact)
    }
  }

  return factsByGroup
}

function isPage(path) {
  const segments = path.split('/')
  const fileName = segments.at(-1)
  return !changelogPattern.test(fileName)
    && !nonPageFileNames.has(fileName)
    && !segments.some(segment => segment.startsWith('.'))
    && !segments.slice(0, -1).some(segment => adrDirectoryPattern.test(segment))
}

function isPresent(fact, corpus) {
  return /^\d/.test(fact)
    ? new RegExp(`(?<![\\w/.-])${escapeRegExp(fact)}(?![\\w/-]|[.,]\\d)`).test(corpus)
    : corpus.includes(fact)
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
