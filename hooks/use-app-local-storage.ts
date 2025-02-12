import { useLocalStorage } from 'usehooks-ts'

export function useAppLocalStorage() {
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
