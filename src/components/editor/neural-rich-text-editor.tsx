"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { useCallback, useEffect, useState } from 'react'
import { NeuralButton } from '@/components/ui/neural-button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Save,
  Type,
  FileText
} from 'lucide-react'

interface NeuralRichTextEditorProps {
  content?: string
  onChange?: (content: string) => void
  onSave?: (content: string) => void
  placeholder?: string
  autoSave?: boolean
  autoSaveDelay?: number
  className?: string
}

export function NeuralRichTextEditor({
  content = '',
  onChange,
  onSave,
  placeholder = 'Start writing your module content...',
  autoSave = true,
  autoSaveDelay = 2000,
  className = '',
}: NeuralRichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [characterCount, setCharacterCount] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // We'll use our custom heading extension
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg shadow-neural my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-neural-primary hover:text-neural-deep underline transition-colors',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-6 neural-editor-content',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const text = editor.getText()
      
      setWordCount(text.split(/\s+/).filter(word => word.length > 0).length)
      setCharacterCount(text.length)
      
      onChange?.(html)

      // Auto-save functionality
      if (autoSave && onSave) {
        clearTimeout(window.autoSaveTimeout)
        window.autoSaveTimeout = setTimeout(() => {
          handleSave(html)
        }, autoSaveDelay)
      }
    },
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

  const handleSave = useCallback(async (contentToSave?: string) => {
    if (!editor || !onSave) return

    const html = contentToSave || editor.getHTML()
    setIsSaving(true)

    try {
      await onSave(html)
      toast.success('Content saved successfully!')
    } catch (error) {
      toast.error('Failed to save content')
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }, [editor, onSave])

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const addLink = useCallback(() => {
    const url = window.prompt('Enter link URL:')
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }, [editor])

  if (!isMounted || !editor) {
    return (
      <Card className="cognitive-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gradient-to-r from-neural-light/30 to-neural-primary/30 rounded w-3/4"></div>
            <div className="h-4 bg-gradient-to-r from-neural-primary/30 to-neural-light/30 rounded w-1/2"></div>
            <div className="h-32 bg-gradient-to-br from-neural-light/20 to-cognition-teal/20 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`cognitive-card ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-border/50 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <NeuralButton
              variant={editor.isActive('bold') ? 'neural' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </NeuralButton>
            <NeuralButton
              variant={editor.isActive('italic') ? 'neural' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </NeuralButton>
            <NeuralButton
              variant={editor.isActive('strike') ? 'neural' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="h-4 w-4" />
            </NeuralButton>
            <NeuralButton
              variant={editor.isActive('code') ? 'neural' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
            >
              <Code className="h-4 w-4" />
            </NeuralButton>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Headings */}
          <div className="flex items-center gap-1">
            <NeuralButton
              variant={editor.isActive('heading', { level: 1 }) ? 'neural' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              <Heading1 className="h-4 w-4" />
            </NeuralButton>
            <NeuralButton
              variant={editor.isActive('heading', { level: 2 }) ? 'neural' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 className="h-4 w-4" />
            </NeuralButton>
            <NeuralButton
              variant={editor.isActive('heading', { level: 3 }) ? 'neural' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              <Heading3 className="h-4 w-4" />
            </NeuralButton>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Lists */}
          <div className="flex items-center gap-1">
            <NeuralButton
              variant={editor.isActive('bulletList') ? 'neural' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </NeuralButton>
            <NeuralButton
              variant={editor.isActive('orderedList') ? 'neural' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </NeuralButton>
            <NeuralButton
              variant={editor.isActive('blockquote') ? 'neural' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="h-4 w-4" />
            </NeuralButton>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Alignment */}
          <div className="flex items-center gap-1">
            <NeuralButton
              variant={editor.isActive({ textAlign: 'left' }) ? 'neural' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
              <AlignLeft className="h-4 w-4" />
            </NeuralButton>
            <NeuralButton
              variant={editor.isActive({ textAlign: 'center' }) ? 'neural' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
              <AlignCenter className="h-4 w-4" />
            </NeuralButton>
            <NeuralButton
              variant={editor.isActive({ textAlign: 'right' }) ? 'neural' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
              <AlignRight className="h-4 w-4" />
            </NeuralButton>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Media */}
          <div className="flex items-center gap-1">
            <NeuralButton
              variant="ghost"
              size="sm"
              onClick={addLink}
            >
              <LinkIcon className="h-4 w-4" />
            </NeuralButton>
            <NeuralButton
              variant="ghost"
              size="sm"
              onClick={addImage}
            >
              <ImageIcon className="h-4 w-4" />
            </NeuralButton>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* History */}
          <div className="flex items-center gap-1">
            <NeuralButton
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo className="h-4 w-4" />
            </NeuralButton>
            <NeuralButton
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="h-4 w-4" />
            </NeuralButton>
          </div>

          {/* Save Button */}
          {onSave && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <NeuralButton
                variant="synaptic"
                size="sm"
                onClick={() => handleSave()}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </NeuralButton>
            </>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <CardContent className="p-0">
        <div className="relative">
          <EditorContent 
            editor={editor} 
            className="neural-editor-wrapper"
          />
          {editor.isEmpty && (
            <div className="absolute top-6 left-6 text-muted-foreground pointer-events-none">
              {placeholder}
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer Stats */}
      <div className="border-t border-border/50 px-4 py-2 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Type className="h-3 w-3" />
            <span>{wordCount} words</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>{characterCount} characters</span>
          </div>
        </div>
        
        {autoSave && (
          <div className="text-xs text-neural-primary">
            Auto-save enabled
          </div>
        )}
      </div>
    </Card>
  )
}
