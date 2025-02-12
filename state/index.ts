import { Message } from 'ai'
import { create } from 'zustand'
import { getChats } from '../actions/get-chats'
import { useToast } from '../hooks/use-toast'

type AppState = {
  chat:
    | {
        id: string
        name: string
        messages: Message[]
      }
    | null
    | undefined
  chats: {
    id: string
    name: string
    created_at: string
  }[]
  setChats: (chats: AppState['chats']) => void
  setChat: (chat: AppState['chat']) => void
  updateChats: () => Promise<void>
}

export const useAppState = create<AppState>((set) => ({
  chat: undefined,
  chats: [],
  setChats: (chats) => set({ chats }),
  setChat: (chat) => set({ chat }),

  updateChats: async () => {
    const { toast } = useToast()
    const { data, error } = await getChats()
    if (error) {
      toast({
        title: 'Error fetching chats',
        description: error,
        variant: 'destructive',
      })
    }

    if (!data) {
      return
    }

    set({ chats: data })
  },
}))
