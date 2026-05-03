'use client'
import { useState, useRef } from 'react'
import { supabaseApi as api } from '@/lib/supabase-api'
import { Post } from '@/lib/types'
import { FaPaperPlane, FaSpinner, FaDatabase, FaPython, FaHtml5, FaTerminal } from 'react-icons/fa'
import { SiJavascript, SiCss3, SiTypescript } from 'react-icons/si'
import TagInput from './TagInput'

interface CreatePostFormProps {
  onPostCreated: (post: Post) => void
}

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    
    setLoading(true)
    try {
      const { data } = await api.createPost({ 
        title, content, author: 'Yo', tags: tags
      })
      onPostCreated(data)
      setTitle('')
      setContent('')
      setTags([])
    } catch (e) { 
      console.error(e) 
      alert('Error al guardar la nota. Verifica tu conexión o las credenciales de Supabase.')
    } 
    finally { setLoading(false) }
  }

  const insertCodeBlock = (lang: string) => {
    if (!textareaRef.current) return
    const el = textareaRef.current
    const start = el.selectionStart
    const end = el.selectionEnd
    const text = el.value
    
    const needsNewLine = start > 0 && text[start - 1] !== '\n'
    const prefix = needsNewLine ? '\n```' + lang + '\n' : '```' + lang + '\n'
    const suffix = '\n```\n'

    const newText = text.substring(0, start) + prefix + text.substring(start, end) + suffix + text.substring(end)
    
    el.value = newText
    setContent(newText)
    
    const cursorPosition = start + prefix.length
    el.focus()
    el.setSelectionRange(cursorPosition, cursorPosition)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.target as HTMLTextAreaElement;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const val = el.value;
      el.value = val.substring(0, start) + "  " + val.substring(end);
      el.selectionStart = el.selectionEnd = start + 2;
      setContent(el.value);
    }
  }

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden flex flex-col">
      
      {/* Header: Título */}
      <div className="bg-gray-900/50 p-4 border-b border-gray-700">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la nota..."
          aria-label="Título de la nota"
          className="w-full bg-transparent text-xl font-bold text-white placeholder-gray-500 outline-none"
        />
      </div>

      {/* Toolbar: SOLO LENGUAJES (Reordenado) */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-900/30 border-b border-gray-700/50 overflow-x-auto scrollbar-hide">
        
        {/* "Otro" va primero ahora */}
        <button type="button" onClick={() => insertCodeBlock('')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg transition-all text-xs font-mono shrink-0" title="Bloque Genérico">
          <FaTerminal size={12}/> Code
        </button>

        <div className="w-px h-4 bg-gray-700 mx-1 shrink-0"></div>
        
        <button type="button" onClick={() => insertCodeBlock('javascript')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-yellow-500/10 text-gray-400 hover:text-yellow-400 border border-gray-700 hover:border-yellow-500/50 rounded-lg transition-all text-xs font-mono group shrink-0">
          <SiJavascript size={14} className="group-hover:scale-110 transition-transform"/> JS
        </button>

        <button type="button" onClick={() => insertCodeBlock('typescript')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 border border-gray-700 hover:border-blue-500/50 rounded-lg transition-all text-xs font-mono group shrink-0">
          <SiTypescript size={14} className="group-hover:scale-110 transition-transform"/> TS
        </button>

        <button type="button" onClick={() => insertCodeBlock('python')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-blue-400/10 text-gray-400 hover:text-blue-300 border border-gray-700 hover:border-blue-400/50 rounded-lg transition-all text-xs font-mono group shrink-0">
          <FaPython size={14} className="group-hover:scale-110 transition-transform"/> PY
        </button>

        <button type="button" onClick={() => insertCodeBlock('sql')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-green-500/10 text-gray-400 hover:text-green-400 border border-gray-700 hover:border-green-500/50 rounded-lg transition-all text-xs font-mono group shrink-0">
          <FaDatabase size={14} className="group-hover:scale-110 transition-transform"/> SQL
        </button>

        <button type="button" onClick={() => insertCodeBlock('css')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-pink-500/10 text-gray-400 hover:text-pink-400 border border-gray-700 hover:border-pink-500/50 rounded-lg transition-all text-xs font-mono group shrink-0">
          <SiCss3 size={14} className="group-hover:scale-110 transition-transform"/> CSS
        </button>

        <button type="button" onClick={() => insertCodeBlock('html')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-orange-500/10 text-gray-400 hover:text-orange-400 border border-gray-700 hover:border-orange-500/50 rounded-lg transition-all text-xs font-mono group shrink-0">
          <FaHtml5 size={14} className="group-hover:scale-110 transition-transform"/> HTML
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-4">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={10}
          placeholder="Escribe tu nota aquí... (Soporta Markdown)"
          className="w-full bg-transparent text-gray-200 font-mono text-sm outline-none resize-none placeholder-gray-600 leading-relaxed"
          spellCheck={false}
        ></textarea>

        <div className="mt-2 mb-4">
          <TagInput tags={tags} setTags={setTags} />
        </div>

        <button 
          disabled={loading || !title.trim() || !content.trim()}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          {loading ? 'Guardando...' : 'Guardar Nota'}
        </button>
      </form>
    </div>
  )
}