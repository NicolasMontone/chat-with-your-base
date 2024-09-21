'use client'

import { useState } from 'react'
import { CircleCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { validateDbConnection } from '@/actions/validate-db-connection'
import { validateOpenaiKey } from '@/actions/validate-openai-key'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppState } from '@/hooks/use-app-state'

export function ConnectionForm({
  setConnectionString,
  isCli,
}: {
  setConnectionString: React.Dispatch<
    React.SetStateAction<{
      connectionString: string
      openaiApiKey: string
      model: string
    }>
  >
  isCli: boolean
}) {
  const { value } = useAppState()
  const [connectionString, setConnectionStringInput] = useState(
    value.connectionString
  )
  const [openaiApiKey, setOpenaiApiKey] = useState(value.openaiApiKey)
  const [model, setModel] = useState(value.model || 'gpt-4o-mini')
  const [isLoading, setIsLoading] = useState(false)
  const [testSuccess, setTestSuccess] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    if (!connectionString) {
      setErrors((prev) => ({
        ...prev,
        connectionString: 'Connection string is required.',
      }))
      setIsLoading(false)
      return
    }

    if (isCli) {
      if (!openaiApiKey) {
        setErrors((prev) => ({
          ...prev,
          openaiApiKey: 'OpenAI API Key is required in CLI mode.',
        }))
      }
      if (!model) {
        setErrors((prev) => ({
          ...prev,
          model: 'Model is required in CLI mode.',
        }))
      }
      if (!openaiApiKey || !model) {
        setIsLoading(false)
        return
      }
    }

    try {
      const response = await validateDbConnection(connectionString)

      if (response !== 'Valid connection') {
        throw new Error(response)
      }

      if (isCli) {
        const openaiResponse = await validateOpenaiKey(openaiApiKey)
        if (openaiResponse !== 'Valid API key') {
          throw new Error('Invalid OpenAI API key')
        }
      }

      setTestSuccess(true)
      setConnectionString({
        connectionString,
        openaiApiKey: openaiApiKey || '',
        model: model || '',
      })
      toast({
        title: 'Done!',
        description: 'Your connection details have been saved.',
      })
    } catch (error) {
      toast({
        title: 'Error validating connection',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add Connection String</CardTitle>
        <CardDescription>
          Enter the details for your database connection string.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2 w-full">
            <label htmlFor="connectionString">Connection String</label>
            <p className="text-sm text-gray-500">
              We don't store your connection string. It's saved in your browser,
              you can see the source code{' '}
              <a
                href="https://github.com/NicolasMontone/chat-with-your-base"
                target="_blank"
                className="text-primary underline"
              >
                Here
              </a>
            </p>
            <Input
              id="connectionString"
              className="w-full"
              placeholder="Enter your connection string"
              value={connectionString}
              onChange={(e) => setConnectionStringInput(e.target.value)}
            />
            {errors.connectionString && (
              <p className="text-red-500 text-sm">{errors.connectionString}</p>
            )}
          </div>
          {isCli && (
            <>
              <div className="space-y-2 w-full">
                <label htmlFor="openaiApiKey">OpenAI API Key</label>
                <Input
                  id="openaiApiKey"
                  className="w-full"
                  placeholder="Enter your OpenAI API key"
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                />
                {errors.openaiApiKey && (
                  <p className="text-red-500 text-sm">{errors.openaiApiKey}</p>
                )}
              </div>
              <div className="space-y-2 w-full">
                <label htmlFor="model">Model</label>
                <Select onValueChange={setModel} value={model}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="o1-preview">
                      O1 Preview {'(Recommended for complex queries)'}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.model && (
                  <p className="text-red-500 text-sm">{errors.model}</p>
                )}
              </div>
            </>
          )}

          <div className="flex gap-4 mt-4">
            <Button type="submit" disabled={isLoading}>
              Save Connection
            </Button>
          </div>
          {testSuccess && (
            <span className="text-green-500 flex items-center justify-center gap-2">
              <CircleCheck size={24} className="text-green-500" />
              Connection successful
            </span>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

export default ConnectionForm
