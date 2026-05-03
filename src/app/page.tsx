'use client'

export const dynamic = 'force-dynamic'

import { supabaseApi as api } from '@/lib/supabase-api'
import { Post } from '@/lib/types'
import CreatePostForm from '@/components/CreatePostForm'
import PostCard from '@/components/PostCard'
import Header from '@/components/Header'
import EditPostModal from '@/components/EditPostModal'
import { useState, useEffect, useRef, useMemo } from 'react'
import { FaSpinner, FaCode, FaPen, FaSearch, FaClock, FaStar } from 'react-icons/fa'
import { Toaster, toast } from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'

// --- CONFIGURACIÓN NOTA DE BIENVENIDA PRO ---
const WELCOME_POST: Post = {
  id: -1,
  title: "Bienvenido a Dev Notes 🚀",
  content: `– Guarda aquí tus mejores snippets y soluciones.

Esta aplicación está diseñada para desarrolladores que necesitan velocidad y claridad. Aquí tienes un resumen de lo que puedes hacer:

### ⚡️ Flujo de Trabajo "Pro"

- 🧠 **Organiza** por stacks usando etiquetas.
- 🎨 **Visualiza** con resaltado de sintaxis automático.
- 📋 **Copia** snippets con un solo clic.


### 🖥️ Ejemplos Full-Stack :

Una muestra de cómo se ven tus tecnologías favoritas.

#### ⚛️ Frontend (React/TypeScript)

\`\`\`typescript
interface UserCardProps {
  username: string;
  role: 'admin' | 'dev';
}

export const UserCard = ({ username, role }: UserCardProps) => {
  return (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
      <h2 className="text-blue-400 font-bold">@{username}</h2>
      <span className="text-xs text-gray-500 uppercase">{role}</span>
    </div>
  );
};
\`\`\`

#### 🐍 Backend (Python/FastAPI)

\`\`\`python
from fastapi import FastAPI, Depends

app = FastAPI()

@app.get("/api/v1/health")
async def health_check():
    """Verifica el estado del sistema 🚀"""
    return {
        "status": "ok",
        "uptime": "99.9%",
        "db_connection": True
    }
\`\`\`

#### 🗄️ Datos & DevOps (SQL & Bash)

\`\`\`sql
-- Consulta de usuarios activos últimos 30 días
SELECT id, email, last_login 
FROM users 
WHERE is_active = true 
AND last_login > NOW() - INTERVAL '30 days'
ORDER BY last_login DESC;
\`\`\`

\`\`\`bash
# Desplegar en producción
git pull origin main
npm install
npm run build
pm2 restart devnotes-app
echo "✅ Despliegue completado con éxito!"
\`\`\`


### ✅ Próximos Pasos

1.  Crea tu primer nota o anotación.
2.  ¡Guarda tus ideas y  disfruta programando!
`,
  author: "System Bot 🤖",
  createdAt: new Date().toISOString(),
  likes: 999,
  tags: ["✨ Start Here", "📚 Docs", "💡 Pro Tips"]
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadPosts() }, [])

  const loadPosts = async () => {
    try {
      const response = await api.getPosts()
      setPosts(response.data)
    } catch { toast.error('Error cargando datos') } 
    finally { setLoading(false) }
  }

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev])
    toast.success('Nota creada')
  }

  const handleDeletePost = async (id: number) => {
    const prevPosts = [...posts]
    setPosts(prev => prev.filter(p => p.id !== id))
    try {
      await api.deletePost(id)
      toast.success('Nota eliminada')
    } catch {
      setPosts(prevPosts)
      toast.error('Error al eliminar')
    }
  }

  const handleEditClick = (post: Post) => {
    setEditingPost(post)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async (id: number, title: string, content: string, tags: string[]) => {
    try {
      await api.updatePost(id, { title, content, tags })
      setPosts(prev => prev.map(post => post.id === id ? { ...post, title, content, tags } : post))
      toast.success('Nota actualizada')
      setIsEditModalOpen(false); setEditingPost(null)
    } catch { toast.error('Error al guardar'); throw new Error() }
  }

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const input = formRef.current.querySelector('input') as HTMLInputElement
      if (input) input.focus()
    }
  }

  const insights = useMemo(() => {
    if (posts.length === 0) {
      return {
        totalSnippets: 0,
        topTag: {
          name: 'Sin tags',
          count: 0
        },
        latestSnippet: {
          title: 'No snippets',
          timeAgo: '',
          primaryTag: ''
        }
      }
    }

    const tagCount = new Map<string, number>();
    posts.forEach(post => {
      post.tags?.forEach(tag => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    });
    
    const topTagEntry = Array.from(tagCount.entries()).sort((a, b) => b[1] - a[1])[0] || ['Sin tags', 0];
    const topTag = {
      name: topTagEntry[0],
      count: topTagEntry[1]
    };

    const latestPost = [...posts].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    
    const now = new Date();
    const postDate = new Date(latestPost.createdAt);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    let timeAgo = '';
    if (diffMins < 60) {
      timeAgo = `${diffMins}m`;
    } else if (diffHours < 24) {
      timeAgo = `${diffHours}h`;
    } else {
      timeAgo = `${diffDays}d`;
    }

    const latestPrimaryTag = latestPost.tags?.[0] || 'Sin tag';

    return {
      totalSnippets: posts.length,
      topTag,
      latestSnippet: {
        title: latestPost.title,
        timeAgo,
        primaryTag: latestPrimaryTag
      }
    };
  }, [posts]);

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  )

  // Lógica para decidir qué mostrar
  const showWelcomeCard = !loading && posts.length === 0 && !searchTerm;

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <FaSpinner className="animate-spin text-4xl text-blue-500" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pb-20">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#374151', color: '#fff' } }}/>
      
      <EditPostModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={editingPost}
        onSave={handleSaveEdit}
      />

      <Header onSearch={setSearchTerm} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* INSIGHTS BAR - Métricas para desarrolladores */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* TAG POPULAR - Muestra el tag más usado globalmente */}
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                <FaStar size={16} />
              </div>
              <div className="text-sm font-medium text-gray-300">Tag Popular</div>
            </div>
            <div className="mb-1">
              <div className="text-lg font-bold text-white truncate" title={insights.topTag.name}>
                {insights.topTag.name}
              </div>
              <div className="text-xs text-gray-400">
                {insights.topTag.count} {insights.topTag.count === 1 ? 'uso' : 'usos'}
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1">Más utilizado en total</div>
          </div>

          {/* ÚLTIMO SNIPPET - Muestra info del snippet más reciente */}
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                <FaClock size={16} />
              </div>
              <div className="text-sm font-medium text-gray-300">Último Snippet</div>
            </div>
            <div className="mb-2">
              <div className="text-sm font-semibold text-white truncate" title={insights.latestSnippet.title}>
                {insights.latestSnippet.title}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                  {insights.latestSnippet.primaryTag}
                </span>
                <span className="text-xs text-gray-400">{insights.latestSnippet.timeAgo}</span>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1">Recién agregado</div>
          </div>

          {/* TOTAL SNIPPETS */}
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                <FaCode size={16} />
              </div>
              <div className="text-sm font-medium text-gray-300">Total Snippets</div>
            </div>
            <div className="text-2xl font-bold text-white">{insights.totalSnippets}</div>
            <div className="text-xs text-gray-400 mt-1">Fragmentos de código</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside ref={formRef} className="lg:col-span-1">
            <div className="sticky top-24">
              <CreatePostForm onPostCreated={handlePostCreated} />
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold border-l-4 border-blue-500 pl-3 tracking-tight">
                {searchTerm ? `🔍 Resultados: ${filteredPosts.length}` : '🚀 Mis Notas'}
              </h2>
            </div>

            {/* ESTADO: LISTA VACÍA CON BUSQUEDA */}
            {filteredPosts.length === 0 && searchTerm && (
               <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-3xl bg-gray-800/50">
                 <FaSearch size={40} className="mx-auto text-gray-600 mb-4"/>
                 <p className="text-gray-400 font-medium">No encontramos nada para &ldquo;{searchTerm}&rdquo;</p>
                 <p className="text-gray-500 text-sm mt-2">Prueba con otra palabra clave.</p>
               </div>
            )}

            <motion.div layout className="columns-1 md:columns-2 gap-6 space-y-6">
              <AnimatePresence mode='popLayout'>
                {/* ESTADO: BIENVENIDA (Solo si no hay posts y no hay busqueda) */}
                {showWelcomeCard && (
                  <PostCard 
                    key="welcome"
                    post={WELCOME_POST}
                    onDelete={() => {}} 
                    onEdit={() => {}}   
                    isDemo={true}       
                  />
                )}

                {/* LISTA DE NOTAS REALES */}
                {filteredPosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onDelete={handleDeletePost}
                    onEdit={handleEditClick}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </main>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={scrollToForm}
        className="fixed bottom-6 right-6 lg:hidden bg-linear-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl z-50 flex items-center justify-center ring-2 ring-blue-500/50"
      >
        <FaPen size={24} />
      </motion.button>
    </div>
  )
}