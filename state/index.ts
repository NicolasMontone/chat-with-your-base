import { Message } from 'ai'
import { create } from 'zustand'
import { getChats } from '../actions/get-chats'

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

export const useAppState = create<AppState>((set, get) => ({
  chat: undefined,
  chats: [],
  setChats: (chats) => set({ chats }),
  setChat: (chat) => set({ chat }),
  updateChats: async () => {
    // await 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const { data, error } = await getChats()
    if (error) {
      return
    }

    if (!data) {
      return
    }

    set({ chats: data })
  },
}))
