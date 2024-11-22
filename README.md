# Chat with your database

The AI that really knows your postgres DB

## How to use

1. Clone the repository

2. Create a `.env.local` file with the following environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-api-key
```

3. Install dependencies

```bash
pnpm install
```

4. Run the development server

```bash
pnpm run dev
```

### It let's you:

#### Get statistics about your database

![Get statistics about your database](/stats.png)

#### Ask it to generate SQL

![Ask it to generate SQL](/sql.png)

#### Run SQL

![Run SQL](/run-sql.png)

### This project uses:
- [Supabase](https://supabase.com/) for the database and auth
- [Next.js](https://nextjs.org/) for the framework
- [Vercel](https://vercel.com/) for the deployment
- [OpenAI](https://openai.com/) for the AI
- [Geist](https://vercel.com/font) for the Font
- [Tailwind](https://tailwindcss.com/) for the CSS
- [Shadcn](https://ui.shadcn.com/) for the UI
- [Aceternity](https://aceternity.com/) for the UI
