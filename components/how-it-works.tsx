import { ArrowRight, Database, MessageSquare, PieChart } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function HowItWorks() {
  const steps = [
    {
      title: 'User Input',
      description: 'User asks a question about their data in natural language',
      icon: <MessageSquare className="h-6 w-6" />,
    },
    {
      title: 'AI Processing',
      description:
        'AI interprets the question and generates appropriate database queries',
      icon: <ArrowRight className="h-6 w-6" />,
    },
    {
      title: 'Database Query',
      description: 'The system executes the generated queries on your database',
      icon: <Database className="h-6 w-6" />,
    },
    {
      title: 'Results Analysis',
      description: 'AI analyzes the query results and generates insights',
      icon: <PieChart className="h-6 w-6" />,
    },
  ]

  return (
    <div className="py-12 px-4 md:px-6 lg:px-8 mt-10">
      <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <Card key={index} className="flex flex-col items-center text-center">
            <CardHeader>
              <div className="p-3 bg-primary-foreground rounded-full mb-4 flex items-center justify-center max-w-min mx-auto">
                {step.icon}
              </div>
              <CardTitle>{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
