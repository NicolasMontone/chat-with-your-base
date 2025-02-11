import { Message } from 'ai'
import { create } from 'zustand'
import { getChatById } from '../actions/get-chat-by-id'
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
  setChat: (chat: AppState['chat']) => void
  setChatById: (id: string) => Promise<void>
}

export const useAppState = create<AppState>((set) => ({
  chat: undefined,
  setChat: (chat) => set({ chat }),
  setChatById: async (id) => {
    const { toast } = useToast()
    const formData = new FormData()
    formData.append('id', id)
    const { data, error } = await getChatById(formData)
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      })
    }

    if (!data) {
      return
    }

    const mappedChat = {
      id: data.id,
      name: data.name,
      messages: JSON.parse((data.messages as string) || '[]') as Message[],
    }

    set({ chat: mappedChat })
  },
}))
