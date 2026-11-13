#!/usr/bin/env node
// Lists the numbers, a bare 0, 1, or 2 aside, and the backticked identifiers a change removed from the Markdown
// pages under a docs directory that no tracked or untracked Markdown page there still contains. A changelog,
// `GLOSSARY.md`, an ADR under `adr/`, `AGENTS.md`, `CLAUDE.md`, and a dot-named file or directory are no pages: a fact
// that survives only there is gone.
// Usage: vanished-facts.mjs [--per-dir] [--added] <range> [<docs-dir>] – `<range>` as `git diff` takes it.
// `<docs-dir>` defaults to `docs`. With `--per-dir`, each top-level directory of `<docs-dir>` is its own corpus, so a
// fact that survives only in another directory still counts as gone; files directly under `<docs-dir>` are checked
// against all of it.
// With `--added`, it lists the facts the change added that no page contained at the base of `<range>`, and names the
// commit for a fact the history had already removed once.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'

// A number outside a word, path, or flag, taken with every version segment, a prerelease tag, or an optional unit.
const numberPattern = /(?<![\w`/.-])\d+(?:[.,]\d+)*(?:-[\dA-Za-z]+(?:\.[\dA-Za-z]+)*)?(?: ?(?:ms|milliseconds|seconds|second|px|MB|KB|bytes|characters|chars|%|retries|texts|items))?(?![\w/-]|[.,]\d)/g
const identifierPattern = /`([^`]+)`/g
const trivialNumbers = new Set(['0', '1', '2'])
const maxFactLength = 40
// A quoted error message is the added fact worth seeing, and it is longer than an identifier.
const maxAddedFactLength = 100
const markdownPathspecs = ['*.md', '*.mdx']
const rootGroup = ''
const changelogFileNames = ['changelog.md', 'changelog.mdx']
const nonPageFileNames = ['GLOSSARY.md', 'GLOSSARY-MAP.md', 'AGENTS.md', 'CLAUDE.md']
const adrDirectoryNames = ['adr', 'adrs']
// What `isPage` rejects.
const nonPagePathspecs = [
  ...changelogFileNames.map(name => `:(exclude,icase,glob)**/${name}`),
  ...nonPageFileNames.map(name => `:(exclude,glob)**/${name}`),
  ...adrDirectoryNames.map(name => `:(exclude,icase,glob)**/${name}/**`),
  ':(exclude,glob)**/.*',
  ':(exclude,glob)**/.*/**',
]

let isPerDirectory = false
let isAdded = false
const positionals = []
for (const argument of process.argv.slice(2)) {
  if (argument === '--per-dir')
    isPerDirectory = true
  else if (argument === '--added')
    isAdded = true
  else
    positionals.push(argument)
}
const [range, docsDirectoryArgument = 'docs'] = positionals
if (!range || positionals.length > 2) {
  console.error('Usage: vanished-facts.mjs [--per-dir] [--added] <range> [<docs-dir>]')
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
const baseRevision = isAdded ? resolveBaseRevision() : ''
const pages = isAdded ? readPagesAt(baseRevision) : readPages()

// `git diff` leaves untracked files out, so a page written since the base is added as a diff of its own.
const untrackedDiff = isAdded && !range.includes('..')
  ? listMarkdownFiles('--others')
      .map(path => [`diff --git a/${docsPrefix}${path} b/${docsPrefix}${path}`, `+++ b/${docsPrefix}${path}`, '@@', ...readFileSync(join(docsDirectory, path), 'utf8').split('\n').map(line => `+${line}`)].join('\n'))
      .join('\n')
  : ''
const changedFacts = collectChangedFacts(`${diff}\n${untrackedDiff}`)

for (const [group, facts] of changedFacts) {
  const corpus = pages
    .filter(page => group === rootGroup || page.path.startsWith(`${group}/`))
    .map(page => page.content)
    .join('\n')
  const listedFacts = [...facts].filter(([fact]) => !isPresent(fact, corpus))
  const label = !isPerDirectory ? docsDirectoryArgument : group === rootGroup ? '(root)' : group.replace(/^\d+\./, '')
  console.log(`== ${label}: ${listedFacts.length} facts ${isAdded ? 'new to' : 'no longer in'} the documentation`)
  const width = Math.max(maxFactLength, ...listedFacts.map(([fact]) => fact.length))
  for (const [fact, files] of listedFacts.sort(([a], [b]) => a.localeCompare(b))) {
    const removal = isAdded ? earlierRemoval(fact, group) : ''
    console.log(`   ${fact.padEnd(width)} (${[...files].sort().join(', ')})${removal && ` – removed before in ${removal}`}`)
  }
}

function readPages() {
  return listMarkdownFiles('--cached', '--others')
    .filter(path => isPage(path) && existsSync(join(docsDirectory, path)))
    .map(path => ({ path, content: readFileSync(join(docsDirectory, path), 'utf8') }))
}

function listMarkdownFiles(...flags) {
  return git(['ls-files', ...flags, '--exclude-standard', '-z', '--', ...markdownPathspecs]).split('\0').filter(Boolean)
}

function readPagesAt(revision) {
  return git(['ls-tree', '-r', '-z', '--name-only', revision, '--', '.'])
    .split('\0')
    .filter(path => path && /\.mdx?$/.test(path) && isPage(path))
    .map(path => ({ path, content: git(['show', `${revision}:./${path}`]) }))
}

// Resolves the revision `git diff` compares from: the merge base for `A...B`.
function resolveBaseRevision() {
  const [left, right] = range.split(/\.{2,3}/)
  return range.includes('...') ? git(['merge-base', left || 'HEAD', right || 'HEAD']).trim() : left || 'HEAD'
}

// Finds the newest commit at or before the base whose diff of the corpus holds the fact: the base lacks the fact, so
// that commit removed it. The number pattern is `isPresent`'s, as an extended regular expression.
function earlierRemoval(fact, group) {
  const pathspecs = group === rootGroup ? markdownPathspecs : markdownPathspecs.map(pathspec => `${group}/${pathspec}`)
  const pattern = /^\d/.test(fact)
    ? `(^|[^[:alnum:]_/.-])${escapeRegExp(fact)}([^[:alnum:]_/.,-]|[.,]([^0-9]|$)|$)`
    : escapeRegExp(fact)
  return git(['log', '-1', '--format=%h', `-G${pattern}`, baseRevision, '--', ...pathspecs, ...nonPagePathspecs]).trim()
}

function collectChangedFacts(diffText) {
  const factsByGroup = new Map()
  const sign = isAdded ? '+' : '-'
  const fileHeader = isAdded ? '+++ b/' : '--- a/'
  const maxLength = isAdded ? maxAddedFactLength : maxFactLength
  let currentFile = ''
  let isInFileHeader = false

  for (const line of diffText.split('\n')) {
    if (line.startsWith('diff --git ')) {
      isInFileHeader = true
      currentFile = ''
      continue
    }
    if (isInFileHeader) {
      // The sign's side names the file a fact came from, also for a renamed file; the other side stands in where the
      // sign's side is `/dev/null`, for a page the change added or deleted. Git ends a path that contains a space with
      // a tab.
      if (line.startsWith('--- a/') || line.startsWith('+++ b/')) {
        if (line.startsWith(fileHeader) || !currentFile)
          currentFile = line.slice(fileHeader.length + docsPrefix.length).replace(/\t$/, '')
      }
      else if (line.startsWith('@@')) {
        isInFileHeader = false
      }
      continue
    }
    if (!/^[+-]/.test(line) || !currentFile || !isPage(currentFile))
      continue

    const pathSegments = currentFile.split('/')
    const group = isPerDirectory && pathSegments.length > 1 ? pathSegments[0] : rootGroup
    // A group the change touched prints its header even when it has no fact to list.
    const filesByFact = factsByGroup.get(group) ?? new Map()
    factsByGroup.set(group, filesByFact)
    if (!line.startsWith(sign))
      continue

    const text = line.slice(1)
    const facts = [
      ...(text.match(numberPattern) ?? []),
      ...[...text.matchAll(identifierPattern)].map(match => match[1]),
    ].filter(fact => fact.length <= maxLength && !trivialNumbers.has(fact))
    for (const fact of facts) {
      const files = filesByFact.get(fact) ?? new Set()
      files.add(pathSegments.at(-1))
      filesByFact.set(fact, files)
    }
  }

  return factsByGroup
}

function isPage(path) {
  const segments = path.split('/')
  const fileName = segments.at(-1)
  return !changelogFileNames.includes(fileName.toLowerCase())
    && !nonPageFileNames.includes(fileName)
    && !segments.some(segment => segment.startsWith('.'))
    && !segments.slice(0, -1).some(segment => adrDirectoryNames.includes(segment.toLowerCase()))
}

function isPresent(fact, corpus) {
  return /^\d/.test(fact)
    ? new RegExp(`(?<![\\w/.-])${escapeRegExp(fact)}(?![\\w/-]|[.,]\\d)`).test(corpus)
    : corpus.includes(fact)
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
