import { supabase } from './supabase'
import { Post } from './types'

export const supabaseApi = {
  // Obtener todos los posts
  async getPosts(): Promise<{ data: Post[] }> {
    if (!supabase) return { data: [] }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Mapear datos de Supabase a nuestro tipo Post
    const posts: Post[] = (data || []).map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.author || 'Anónimo',
      createdAt: post.created_at,
      likes: post.likes || 0,
      tags: post.tags || []
    }))

    return { data: posts }
  },

  // Crear nuevo post
  async createPost(postData: Omit<Post, 'id' | 'createdAt' | 'likes'>): Promise<{ data: Post }> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data, error } = await supabase
      .from('posts')
      .insert([{
        title: postData.title,
        content: postData.content,
        author: postData.author,
        tags: postData.tags
      }])
      .select()
      .single()

    if (error) throw error

    const post: Post = {
      id: data.id,
      title: data.title,
      content: data.content,
      author: data.author,
      createdAt: data.created_at,
      likes: data.likes,
      tags: data.tags
    }

    return { data: post }
  },

  // Actualizar post
  async updatePost(id: number, postData: Partial<Pick<Post, 'title' | 'content' | 'tags'>>): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured')

    const { error } = await supabase
      .from('posts')
      .update({
        title: postData.title,
        content: postData.content,
        tags: postData.tags,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error
  },

  // Eliminar post
  async deletePost(id: number): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured')

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}