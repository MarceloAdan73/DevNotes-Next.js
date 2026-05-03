'use client'

import { Post } from '@/lib/types'
import { useState } from 'react'
import { FaTrash, FaUser, FaEdit, FaRegClock, FaCopy, FaCheck } from 'react-icons/fa'
import ReactMarkdown from 'react-markdown'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

// Imports para Syntax Highlighting
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

// --- SUB-COMPONENTE: CodeBlock ---
// Maneja su propio estado de copiado para evitar re-renders innecesarios o IDs volátiles
const CodeBlock = ({ language, code }: { language: string, code: string }) => {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="rounded-lg overflow-hidden my-3 shadow-lg border border-gray-700 relative group/code">
      <div className="bg-[#1e1e1e] px-3 py-1.5 text-xs text-gray-500 flex justify-between items-center border-b border-gray-700">
        <span className="font-mono font-bold text-gray-400">{language}</span>
        
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] hover:bg-gray-700 px-2 py-0.5 rounded transition-colors text-gray-400 hover:text-white"
        >
            {isCopied ? (
              <><FaCheck className="text-green-400" /> Copiado</>
            ) : (
              <><FaCopy /> Copiar</>
            )}
        </button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.85rem' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

// --- COMPONENTE PRINCIPAL ---

interface PostCardProps {
  post: Post
  onDelete: (id: number) => void
  onEdit: (post: Post) => void
  isDemo?: boolean
}

export default function PostCard({ post, onDelete, onEdit, isDemo = false }: PostCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (isDemo) return
    setIsDeleting(true)
    await onDelete(post.id)
    setIsDeleting(false)
  }

  const dateFormatted = post.createdAt 
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: es })
    : 'recién'

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`break-inside-avoid mb-6 backdrop-blur-md rounded-2xl border shadow-xl transition-all flex flex-col group relative overflow-hidden
        ${isDemo ? 'bg-blue-900/20 border-blue-500/50' : 'bg-gray-800/80 border-gray-700/50 hover:shadow-2xl hover:border-blue-500/30'}
      `}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 opacity-70 ${isDemo ? 'bg-blue-500' : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'}`}></div>

      <div className="p-5">
        <div className="flex justify-between items-start gap-3 mb-3">
          <h3 className="text-lg font-bold text-gray-100 leading-tight">
            {isDemo && '👋 '}{post.title}
          </h3>
          
          {!isDemo && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 bg-gray-800 rounded-lg p-1 border border-gray-700 absolute right-4 top-4 shadow-lg z-10">
              <button onClick={() => onEdit(post)} className="text-gray-400 hover:text-blue-400 p-2 hover:bg-gray-700 rounded transition-colors"><FaEdit size={14} /></button>
              <button onClick={handleDelete} disabled={isDeleting} className="text-gray-400 hover:text-red-400 p-2 hover:bg-gray-700 rounded transition-colors">
                {isDeleting ? <span className="animate-spin">⌛</span> : <FaTrash size={14} />}
              </button>
            </div>
          )}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, i) => (
              <span key={i} className="text-[10px] font-mono font-medium px-2 py-0.5 rounded text-blue-300 bg-blue-500/10 border border-blue-500/20">#{tag}</span>
            ))}
          </div>
        )}

        <div className="text-gray-300 text-sm mb-4">
          <ReactMarkdown
            components={{
              p: ({children}) => <p className="mb-3 leading-relaxed last:mb-0">{children}</p>,
              a: ({href, children}) => <a href={href} target="_blank" className="text-blue-400 hover:underline">{children}</a>,
              code({node, inline, className, children, ...props}: any) {
                const match = /language-(\w+)/.exec(className || '')
                const codeString = String(children).replace(/\n$/, '')

                return !inline && match ? (
                  // Usamos el nuevo componente CodeBlock aquí
                  <CodeBlock language={match[1]} code={codeString} />
                ) : (
                  <code className="bg-gray-700/50 text-pink-300 px-1 py-0.5 rounded font-mono text-xs" {...props}>{children}</code>
                )
              }
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50 mt-auto">
          <div className="flex items-center gap-4 text-xs text-gray-500 font-mono w-full justify-between">
             <span className="flex items-center gap-1.5"><FaUser className="text-gray-600" /> {post.author}</span>
             <span className="flex items-center gap-1.5"><FaRegClock className="text-gray-600" /> {dateFormatted}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}