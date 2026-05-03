'use client'
import { useState, useEffect, ChangeEvent } from 'react'
import { Post } from '@/lib/types'
import { FaSave, FaTimes, FaSpinner } from 'react-icons/fa'
import TagInput from './TagInput'

interface EditPostModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (id: number, title: string, content: string, tags: string[]) => Promise<void>
  post: Post | null
}

export default function EditPostModal({ isOpen, onClose, onSave, post }: EditPostModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (post && isOpen) {
      setTitle(post.title)
      setContent(post.content)
      setTags(post.tags || []) // Cargar tags existentes o array vacío
    }
  }, [post, isOpen])

  const handleSave = async () => {
    if (!post || !title.trim() || !content.trim()) return
    
    setIsSaving(true)
    try {
      await onSave(post.id, title, content, tags)
      onClose()
    } catch (error) {
      console.error(error)
      alert('Error al guardar los cambios.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)
  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)

  if (!isOpen || !post) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all">
      <div className="bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-700 overflow-hidden transform transition-all scale-100">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-900/50">
          <h2 className="text-xl font-bold text-white">Editar Nota</h2>
          <button type="button" onClick={onClose} title="Cerrar modal" className="text-gray-400 hover:text-white transition-colors">
            <FaTimes size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label htmlFor="edit-title" className="block text-sm text-gray-400 mb-1">Título</label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              title="Título del post"
              placeholder="Ingresa el título del post"
              className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 border border-gray-600 focus:border-blue-500 outline-none text-lg font-semibold"
            />
          </div>
          <div>
            <label htmlFor="edit-content" className="block text-sm text-gray-400 mb-1">Contenido (Markdown)</label>
            <textarea
              id="edit-content"
              value={content}
              onChange={handleContentChange}
              rows={8}
              title="Contenido del post"
              placeholder="Escribe el contenido de tu post aquí..."
              className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 border border-gray-600 focus:border-blue-500 outline-none resize-none leading-relaxed font-mono text-sm"
            ></textarea>
          </div>
          
          {/* Input de Tags Reutilizable */}
          <TagInput tags={tags} setTags={setTags} />
        </div>

        <div className="p-6 border-t border-gray-700 bg-gray-900/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-gray-300 hover:bg-gray-700 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || !title.trim() || !content.trim()}
            className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
