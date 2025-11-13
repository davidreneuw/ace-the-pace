import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useState, useMemo, useEffect } from 'react'
import { Search, Filter, ChevronDown, ChevronUp, X, Play } from 'lucide-react'
import { Id } from '../../../../convex/_generated/dataModel'

export const Route = createFileRoute('/dashboard/questions/bank')({
  component: QuestionBankPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      category: (search.category as string) || undefined,
    }
  },
})

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard'

function QuestionBankPage() {
  const searchParams = Route.useSearch()
  const navigate = Route.useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Set<Id<'categories'>>>(
    new Set(),
  )
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all')
  const [expandedQuestion, setExpandedQuestion] = useState<Id<'questions'> | null>(null)

  // Queries
  const questions = useQuery(api.questions.listAll)
  const categories = useQuery(api.categories.list)

  const questionsLoading = questions === undefined
  const categoriesLoading = categories === undefined

  // Get the category from URL param if present
  const urlCategory = useMemo(() => {
    if (!searchParams.category || !categories) return null
    return categories.find((c) => c.slug === searchParams.category)
  }, [searchParams.category, categories])

  // Sync URL category param with selected categories
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategories((prev) => {
        const newSet = new Set(prev)
        newSet.add(urlCategory._id)
        return newSet
      })
    }
  }, [urlCategory])

  // Clear category filter from URL
  const clearCategoryFilter = () => {
    navigate({ search: { category: undefined } })
    if (urlCategory) {
      setSelectedCategories((prev) => {
        const newSet = new Set(prev)
        newSet.delete(urlCategory._id)
        return newSet
      })
    }
  }

  // Filter questions
  const filteredQuestions = useMemo(() => {
    if (!questions) return []

    return questions.filter((q) => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesQuestion = q.questionText.toLowerCase().includes(query)
        const matchesExplanation = q.explanation.toLowerCase().includes(query)
        if (!matchesQuestion && !matchesExplanation) return false
      }

      // Category filter
      if (selectedCategories.size > 0) {
        const hasMatchingCategory = q.categoryIds.some((id) =>
          selectedCategories.has(id),
        )
        if (!hasMatchingCategory) return false
      }

      // Difficulty filter
      if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) {
        return false
      }

      return true
    })
  }, [questions, searchQuery, selectedCategories, difficultyFilter])

  // Toggle category selection
  const toggleCategory = (categoryId: Id<'categories'>) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  // Get category names for a question
  const getCategoryNames = (categoryIds: Id<'categories'>[]) => {
    if (!categories) return []
    return categoryIds
      .map((id) => categories.find((c) => c._id === id))
      .filter((c) => c !== undefined)
      .map((c) => c!.name)
  }

  // Difficulty badge colors
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel - Filters */}
      <div className="w-80 border-r border-border flex flex-col overflow-hidden bg-card">
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Filters</h2>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Difficulty
            </label>
            <div className="flex gap-2">
              {(['all', 'easy', 'medium', 'hard'] as DifficultyFilter[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    difficultyFilter === diff
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto p-4">
          <label className="block text-sm font-medium text-foreground mb-3">
            Categories
          </label>
          {categoriesLoading && (
            <div className="text-sm text-muted-foreground">Loading...</div>
          )}
          {!categoriesLoading && categories?.length === 0 && (
            <div className="text-sm text-muted-foreground">No categories available</div>
          )}
          <div className="space-y-2">
            {categories?.map((category) => (
              <label
                key={category._id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.has(category._id)}
                  onChange={() => toggleCategory(category._id)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                />
                <div className="flex items-center gap-2 flex-1">
                  {category.color && (
                    <div
                      className="w-3 h-3 rounded-full border border-border flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                  <span className="text-sm text-foreground">{category.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Filter summary */}
        <div className="p-4 border-t border-border flex-shrink-0 bg-muted/50">
          <div className="text-sm text-muted-foreground">
            Showing {filteredQuestions.length} of {questions?.length || 0} questions
          </div>
          {(selectedCategories.size > 0 ||
            difficultyFilter !== 'all' ||
            searchQuery.trim() ||
            urlCategory) && (
            <button
              onClick={() => {
                setSelectedCategories(new Set())
                setDifficultyFilter('all')
                setSearchQuery('')
                if (urlCategory) {
                  navigate({ search: { category: undefined } })
                }
              }}
              className="text-sm text-primary hover:underline mt-2 cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Right Panel - Question List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Question Bank</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Browse and search through all available questions
              </p>
            </div>
            {urlCategory && (
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-lg border border-primary/20">
                <span className="text-sm font-medium">
                  Filtered by: {urlCategory.name}
                </span>
                <button
                  onClick={clearCategoryFilter}
                  className="hover:bg-primary/20 rounded p-0.5 transition-colors cursor-pointer"
                  aria-label="Clear category filter"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {questionsLoading && (
            <div className="text-center py-12 text-muted-foreground">
              Loading questions...
            </div>
          )}
          {!questionsLoading && filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg font-medium text-foreground mb-2">
                No questions found
              </p>
              <p className="text-sm text-muted-foreground">
                {questions?.length === 0
                  ? 'No questions have been added yet.'
                  : 'Try adjusting your filters or search query.'}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {filteredQuestions.map((question) => {
              const isExpanded = expandedQuestion === question._id
              const categoryNames = getCategoryNames(question.categoryIds)

              return (
                <div
                  key={question._id}
                  className="bg-card border border-border rounded-lg overflow-hidden"
                >
                  {/* Question Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() =>
                      setExpandedQuestion(isExpanded ? null : question._id)
                    }
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <p className="text-foreground font-medium line-clamp-2">
                          {question.questionText}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown size={20} className="text-muted-foreground flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Difficulty badge */}
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded border ${getDifficultyColor(question.difficulty)}`}
                      >
                        {question.difficulty.charAt(0).toUpperCase() +
                          question.difficulty.slice(1)}
                      </span>

                      {/* Categories */}
                      {categoryNames.map((name, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary border border-primary/20"
                        >
                          {name}
                        </span>
                      ))}

                      {/* Status */}
                      {!question.isActive && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-muted text-muted-foreground border border-border">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-border p-4 bg-muted/30">
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-foreground mb-2">
                          Full Question
                        </h4>
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {question.questionText}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">
                          Explanation
                        </h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {question.explanation}
                        </p>
                      </div>

                      {/* Media indicators */}
                      {(question.imageStorageId ||
                        question.audioStorageId ||
                        question.videoStorageId) && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <h4 className="text-sm font-semibold text-foreground mb-2">
                            Attached Media
                          </h4>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            {question.imageStorageId && (
                              <span className="px-2 py-1 bg-background rounded border border-border">
                                Image
                              </span>
                            )}
                            {question.audioStorageId && (
                              <span className="px-2 py-1 bg-background rounded border border-border">
                                Audio
                              </span>
                            )}
                            {question.videoStorageId && (
                              <span className="px-2 py-1 bg-background rounded border border-border">
                                Video
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Practice Button */}
                      <div className="mt-4 pt-4 border-t border-border">
                        <Link
                          to="/dashboard/questions/answer/$questionId"
                          params={{ questionId: question._id }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium cursor-pointer"
                        >
                          <Play size={18} />
                          Practice This Question
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
