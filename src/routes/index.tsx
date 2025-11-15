import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuth } from '@workos-inc/authkit-react'
import {
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  GraduationCap,
  Target,
  TrendingUp,
} from 'lucide-react'
import { z } from 'zod'
import Header from '@/components/Header'

// Validate search params
const homeSearchSchema = z.object({
  returnTo: z.string().optional(),
})

export const Route = createFileRoute('/')({
  validateSearch: homeSearchSchema,
  beforeLoad: ({ context, search }) => {
    // If already authenticated and there's a returnTo, redirect immediately
    if (context.auth.user && search.returnTo) {
      throw redirect({ to: search.returnTo as any })
    }
  },
  component: App,
})

function App() {
  const { signIn } = useAuth()
  const search = Route.useSearch()
  const features = [
    {
      icon: <BookOpen className="w-12 h-12 text-primary" />,
      title: 'Extensive Question Bank',
      description:
        'Access hundreds of practice questions covering all topics tested on the PACE exam, regularly updated to reflect current exam content.',
    },
    {
      icon: <Brain className="w-12 h-12 text-primary" />,
      title: 'Detailed Explanations',
      description:
        'Every question includes comprehensive explanations to help you understand the reasoning behind correct and incorrect answers.',
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-primary" />,
      title: 'Track Your Progress',
      description:
        'Monitor your performance over time with detailed analytics and identify areas that need more focus.',
    },
    {
      icon: <Target className="w-12 h-12 text-primary" />,
      title: 'Exam-Like Experience',
      description:
        'Practice in an environment that simulates the actual PACE exam format, helping you build confidence and familiarity.',
    },
    {
      icon: <CheckCircle className="w-12 h-12 text-primary" />,
      title: 'Topic-Based Practice',
      description:
        'Focus on specific medical topics or systems to strengthen weak areas and reinforce your knowledge systematically.',
    },
    {
      icon: <Clock className="w-12 h-12 text-primary" />,
      title: 'Updated Content',
      description:
        'Content is continuously reviewed and updated by medical professionals to ensure accuracy and relevance to the current exam.',
    },
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <section className="relative py-20 px-6 text-center overflow-hidden bg-gradient-to-b from-primary/5 to-background">
          <div className="relative max-w-5xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <GraduationCap className="w-16 h-16 md:w-20 md:h-20 text-primary" />
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
              Ace the <span className="text-primary">PACE</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4 font-medium">
              Master the Physician Assistant Certification Exam
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10">
              Comprehensive practice questions and study resources designed
              specifically for the Canadian PACE exam. Build confidence, track
              your progress, and achieve your certification goals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  // Use returnTo from query params, or default to /dashboard
                  const returnTo = search.returnTo || '/dashboard'
                  signIn({ state: { returnTo } })
                }}
                className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors shadow-lg cursor-pointer"
              >
                Start Practicing
              </button>

              <button className="px-8 py-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold rounded-lg transition-colors cursor-pointer">
                Learn More
              </button>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform provides comprehensive tools and resources to help
              you prepare effectively for the PACE exam.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
