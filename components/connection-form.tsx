'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { CircleCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { validateDbConnection } from '@/actions/validate-db-connection'

const FormSchema = z.object({
  connectionString: z.string().min(1, {
    message: 'Connection string is required.',
  }),
})

export function ConnectionForm({
  setConnectionString,
}: {
  setConnectionString: React.Dispatch<
    React.SetStateAction<{
      connectionString: string
    }>
  >
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [testSuccess, setTestSuccess] = useState(false)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      connectionString: '',
    },
  })

  async function onSubmit({ connectionString }: z.infer<typeof FormSchema>) {
    setIsLoading(true)
    try {
      const bindedValidateDbConnection = validateDbConnection.bind(
        null,
        connectionString
      )

      const result = await bindedValidateDbConnection()

      if (result === 'Valid connection') {
        setTestSuccess(true)
        toast({
          title: 'Connection successful',
          description: 'Your database connection has been validated.',
        })
        setConnectionString({ connectionString })
      } else {
        toast({
          title: 'Connection failed',
          description: result,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.log(error)
      toast({
        title: 'Error',
        description: 'There was an error trying to connect to the database',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveConnection = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const connectionString = form.getValues('connectionString')
    if (connectionString) {
      setConnectionString({ connectionString })
      toast({
        title: 'Connection saved',
        description: 'Your connection string has been saved.',
      })
    } else {
      toast({
        title: 'Error',
        description: 'Please enter a connection string before saving.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="connectionString"
          render={({ field }) => (
            <FormItem className="space-y-2 w-full">
              <FormLabel>Connection String</FormLabel>
              <FormControl>
                <Input
                  className="w-full"
                  placeholder="Enter your connection string"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <Button type="submit" variant="secondary" disabled={isLoading}>
            Test Connection
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={handleSaveConnection}
          >
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
    </Form>
  )
}

export default ConnectionForm
