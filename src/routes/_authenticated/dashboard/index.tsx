import { createFileRoute } from '@tanstack/react-router'
import {
  Calendar,
  CheckCircle,
  Clock,
  Flame,
  Target,
  TrendingUp,
} from 'lucide-react'

export const Route = createFileRoute('/_authenticated/dashboard/')({
  component: DashboardOverview,
})

// Demo data
const stats = [
  {
    name: 'Questions Answered',
    value: '247',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    name: 'Success Rate',
    value: '78%',
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    name: 'Current Streak',
    value: '5 days',
    icon: Flame,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    name: 'Time Spent',
    value: '12.5 hrs',
    icon: Clock,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
]

const categories = [
  { name: 'Cardiology', correct: 42, total: 50, percentage: 85 },
  { name: 'Emergency Medicine', correct: 36, total: 50, percentage: 72 },
  { name: 'Internal Medicine', correct: 40, total: 50, percentage: 80 },
  { name: 'Pediatrics', correct: 30, total: 40, percentage: 75 },
  { name: 'Surgery', correct: 28, total: 35, percentage: 80 },
]

const recentActivity = [
  {
    date: '2025-11-11',
    questions: 25,
    correct: 20,
    percentage: 80,
    category: 'Cardiology',
  },
  {
    date: '2025-11-10',
    questions: 30,
    correct: 24,
    percentage: 80,
    category: 'Emergency Medicine',
  },
  {
    date: '2025-11-09',
    questions: 20,
    correct: 14,
    percentage: 70,
    category: 'Internal Medicine',
  },
  {
    date: '2025-11-08',
    questions: 15,
    correct: 12,
    percentage: 80,
    category: 'Pediatrics',
  },
  {
    date: '2025-11-07',
    questions: 18,
    correct: 13,
    percentage: 72,
    category: 'Surgery',
  },
]

function DashboardOverview() {
  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress and performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                <stat.icon size={24} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Two column layout for category breakdown and recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-primary" size={24} />
            <h2 className="text-xl font-semibold text-foreground">
              Performance by Category
            </h2>
          </div>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {category.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {category.correct}/{category.total} ({category.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="text-primary" size={24} />
            <h2 className="text-xl font-semibold text-foreground">
              Recent Activity
            </h2>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {activity.category}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {activity.correct}/{activity.questions}
                  </p>
                  <p
                    className={`text-xs ${
                      activity.percentage >= 80
                        ? 'text-green-600'
                        : activity.percentage >= 70
                          ? 'text-orange-600'
                          : 'text-red-600'
                    }`}
                  >
                    {activity.percentage}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
