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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

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
    let result: string = ''
    try {
      result = await validateDbConnection(connectionString)

      if (result === 'Valid connection') {
        setTestSuccess(true)
        setConnectionString({ connectionString })
        toast({
          title: 'Connection saved',
          description: 'Your connection string has been saved.',
        })
      } else {
        toast({
          title: 'Error validating connection string',
          description: result,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error validating connection string',
        description: result,
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
        </Form>
      </CardContent>
    </Card>
  )
}

export default ConnectionForm
