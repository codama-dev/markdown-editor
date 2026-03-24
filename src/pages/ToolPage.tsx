import {
  Bold,
  Code,
  Copy,
  Download,
  FileText,
  Heading,
  Italic,
  Link,
  List,
} from 'lucide-react'
import { marked } from 'marked'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ShareModal, isShareDismissed } from '@/components/ShareModal'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/pages/PageHeader'

marked.setOptions({
  gfm: true,
  breaks: true,
})

const SAMPLE_MARKDOWN = `# Welcome to the Markdown Editor

This is a **free online Markdown editor** with real-time preview. It supports [GitHub Flavored Markdown](https://github.github.com/gfm/) (GFM).

## Features

- **Bold** and *italic* text
- [Links](https://codama.dev) and images
- Code blocks with syntax highlighting
- Tables, checklists, and more

### Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

### Table

| Feature | Supported |
|---------|-----------|
| Bold | Yes |
| Italic | Yes |
| Tables | Yes |
| Code blocks | Yes |
| Checklists | Yes |

### Checklist

- [x] Write Markdown
- [x] Preview in real-time
- [ ] Export to HTML
- [ ] Share with friends

### Blockquote

> Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.

---

Made with love by [Codama](https://codama.dev)
`

function getWordCount(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

function getLineCount(text: string): number {
  if (!text) return 0
  return text.split('\n').length
}

export function ToolPage() {
  const { t } = useTranslation()
  const [markdown, setMarkdown] = useState('')
  const [htmlOutput, setHtmlOutput] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const result = marked.parse(markdown)
    if (typeof result === 'string') {
      setHtmlOutput(result)
    } else {
      result.then(setHtmlOutput)
    }
  }, [markdown])

  const maybeShowShare = useCallback(() => {
    if (!hasInteracted && !isShareDismissed()) {
      setHasInteracted(true)
      setTimeout(() => setShareOpen(true), 800)
    }
  }, [hasInteracted])

  const insertAtCursor = useCallback(
    (before: string, after: string, placeholder: string) => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = markdown.substring(start, end)
      const insert = selectedText || placeholder

      const newValue =
        markdown.substring(0, start) + before + insert + after + markdown.substring(end)
      setMarkdown(newValue)

      requestAnimationFrame(() => {
        textarea.focus()
        const cursorStart = start + before.length
        const cursorEnd = cursorStart + insert.length
        textarea.setSelectionRange(cursorStart, cursorEnd)
      })
    },
    [markdown]
  )

  const handleBold = () => insertAtCursor('**', '**', 'bold text')
  const handleItalic = () => insertAtCursor('*', '*', 'italic text')
  const handleHeading = () => insertAtCursor('## ', '', 'Heading')
  const handleLink = () => insertAtCursor('[', '](url)', 'link text')
  const handleCode = () => insertAtCursor('`', '`', 'code')
  const handleList = () => insertAtCursor('- ', '', 'list item')

  const handleLoadSample = () => {
    setMarkdown(SAMPLE_MARKDOWN)
  }

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(htmlOutput)
      toast.success(t('tool.copiedToClipboard'))
      maybeShowShare()
    } catch {
      toast.error(t('tool.copyFailed'))
    }
  }

  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    a.click()
    URL.revokeObjectURL(url)
    maybeShowShare()
  }

  const handleDownloadHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Markdown Export</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; color: #1a1a1a; }
pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; }
code { background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
pre code { background: none; padding: 0; }
blockquote { border-left: 4px solid #ddd; margin: 1em 0; padding: 0.5em 1em; color: #555; }
table { border-collapse: collapse; width: 100%; margin: 1em 0; }
th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
th { background: #f5f5f5; font-weight: 600; }
img { max-width: 100%; }
hr { border: none; border-top: 1px solid #ddd; margin: 2em 0; }
</style>
</head>
<body>
${htmlOutput}
</body>
</html>`
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.html'
    a.click()
    URL.revokeObjectURL(url)
    maybeShowShare()
  }

  const wordCount = getWordCount(markdown)
  const charCount = markdown.length
  const lineCount = getLineCount(markdown)

  return (
    <div className="space-y-6">
      <PageHeader />

      <div className="mx-auto max-w-7xl px-4">
        {/* Toolbar */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
            <Button variant="ghost" size="sm" onClick={handleBold} title={t('tool.bold')}>
              <Bold className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleItalic} title={t('tool.italic')}>
              <Italic className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleHeading} title={t('tool.heading')}>
              <Heading className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLink} title={t('tool.link')}>
              <Link className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCode} title={t('tool.code')}>
              <Code className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleList} title={t('tool.list')}>
              <List className="size-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={handleLoadSample}>
              <FileText className="mr-1 size-4" />
              {t('tool.loadSample')}
            </Button>
          </div>

          <div className="flex flex-1 items-center justify-end gap-1">
            <Button variant="outline" size="sm" onClick={handleCopyHtml}>
              <Copy className="mr-1 size-4" />
              {t('tool.copyHtml')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadMd}>
              <Download className="mr-1 size-4" />
              {t('tool.downloadMd')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadHtml}>
              <Download className="mr-1 size-4" />
              {t('tool.downloadHtml')}
            </Button>
          </div>
        </div>

        {/* Editor + Preview split view */}
        <div className="grid min-h-[500px] gap-4 md:grid-cols-2">
          {/* Editor pane */}
          <div className="flex flex-col rounded-xl border bg-card shadow-sm">
            <div className="border-b px-4 py-2">
              <span className="font-semibold text-muted-foreground text-sm">{t('tool.editor')}</span>
            </div>
            <textarea
              ref={textareaRef}
              dir="ltr"
              value={markdown}
              onChange={e => setMarkdown(e.target.value)}
              placeholder={t('tool.placeholder')}
              className="flex-1 resize-none bg-transparent p-4 font-mono text-foreground text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
              spellCheck={false}
            />
          </div>

          {/* Preview pane */}
          <div className="flex flex-col rounded-xl border bg-card shadow-sm">
            <div className="border-b px-4 py-2">
              <span className="font-semibold text-muted-foreground text-sm">{t('tool.preview')}</span>
            </div>
            <div
              dir="ltr"
              className="markdown-preview flex-1 overflow-auto p-4 text-sm"
              dangerouslySetInnerHTML={{ __html: htmlOutput }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-4 text-muted-foreground text-sm">
          <span>
            {t('tool.words')}: {wordCount}
          </span>
          <span>
            {t('tool.characters')}: {charCount}
          </span>
          <span>
            {t('tool.lines')}: {lineCount}
          </span>
        </div>
      </div>

      <ShareModal open={shareOpen} onOpenChange={setShareOpen} showDismissOption />
    </div>
  )
}
