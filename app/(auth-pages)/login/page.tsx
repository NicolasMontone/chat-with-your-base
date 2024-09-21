import Link from 'next/link'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { SubmitButton } from '@/components/submit-button'
import { z } from 'zod'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  email: z.string().email(),
})

export default function Login({
  searchParams,
}: {
  searchParams: { message: string; errorMessage: string }
}) {
  const login = async (formData: FormData) => {
    'use server'

    const formSafeParsed = formSchema.safeParse({
      email: formData.get('email') as string,
    })
    if (!formSafeParsed.success) {
      return redirect('/login?errorMessage=Invalid email')
    }

    const origin = headers().get('origin')
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOtp({
      email: formSafeParsed.data.email,
      options: {
        emailRedirectTo: `${origin}/api/auth/callback`,
      },
    })

    if (error) {
      return redirect('/login?errorMessage=Could not authenticate user')
    }

    return redirect('/login?message=Check email to continue sign in process')
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mt-30">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{' '}
        Back
      </Link>

      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* TODO: google login */}
            {/* <Button>Login with google</Button>

            <div className="border-black border-b-2" /> */}
            <form className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>

              <SubmitButton formAction={login} pendingText="Signing In...">
                Login
              </SubmitButton>
              {(searchParams?.message || searchParams?.errorMessage) && (
                <p
                  className={`mt-4 p-1 text-center ${
                    searchParams.errorMessage ? 'text-red-500' : ''
                  }`}
                >
                  {searchParams.message || searchParams.errorMessage}
                </p>
              )}
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
