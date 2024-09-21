import { useLocalStorage } from 'usehooks-ts'

export function useAppState() {
  const [value, setValue] = useLocalStorage('__app-config__', {
    connectionString: '',
    openaiApiKey: '',
    model: 'gpt-4o-mini',
  })

  return {
    value,
    setValue,
  }
}
