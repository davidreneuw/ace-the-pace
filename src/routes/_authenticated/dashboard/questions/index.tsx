import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Filter,
  Play,
  Search,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'

export const Route = createFileRoute('/_authenticated/dashboard/questions/')({
  component: QuestionBankPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      category: (search.category as string) || undefined,
    }
  },
})

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard'

const ITEMS_PER_PAGE = 20

function QuestionBankPage() {
  const searchParams = Route.useSearch()
  const navigate = Route.useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<
    Set<Id<'categories'>>
  >(new Set())
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>('all')
  const [expandedQuestion, setExpandedQuestion] =
    useState<Id<'questions'> | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategories, difficultyFilter])

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  // Pagination calculations
  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex)

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
  const getCategoryNames = (categoryIds: Array<Id<'categories'>>) => {
    if (!categories) return []
    return categoryIds
      .map((id) => categories.find((c) => c._id === id))
      .filter((c) => c !== undefined)
      .map((c) => c.name)
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
    <div className="p-6 space-y-6 h-full overflow-y-auto [scrollbar-gutter:stable]">
      {/* Header - like dashboard */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Question Bank
          </h1>
          <p className="text-muted-foreground">
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

      {/* Search bar and pagination - sticky */}
      <div className="sticky -top-6 z-10 bg-background pt-4 -mx-6 px-6">
        <div className="space-y-2 pb-4 border-b border-border">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className={`w-full pl-10 pr-10 py-2.5 border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                searchQuery.trim() ? 'border-primary' : 'border-border'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Pagination */}
          {filteredQuestions.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredQuestions.length)} of{' '}
                {filteredQuestions.length} questions
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      // Show first page, last page, current page, and pages around current
                      const showPage =
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)

                      if (!showPage) {
                        // Show ellipsis
                        if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span
                              key={page}
                              className="px-2 text-muted-foreground"
                            >
                              ...
                            </span>
                          )
                        }
                        return null
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                            currentPage === page
                              ? 'bg-primary text-primary-foreground font-medium'
                              : 'border border-border hover:bg-muted'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    },
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content with sticky filter sidebar */}
      <div className="flex gap-6">
        {/* Questions list - main area */}
        <div className="flex-1 min-w-0">
          {questionsLoading && (
            <div className="text-center py-12 text-muted-foreground">
              Loading questions...
            </div>
          )}
          {!questionsLoading && paginatedQuestions.length === 0 && (
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
            {paginatedQuestions.map((question) => {
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
                        <ChevronUp
                          size={20}
                          className="text-muted-foreground flex-shrink-0"
                        />
                      ) : (
                        <ChevronDown
                          size={20}
                          className="text-muted-foreground flex-shrink-0"
                        />
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

        {/* Filters - sticky floating card on right */}
        <div className="w-80 flex-shrink-0">
          <div className="sticky top-30 bg-card border border-border rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Filters</h2>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Difficulty
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  ['all', 'easy', 'medium', 'hard'] as Array<DifficultyFilter>
                ).map((diff) => (
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

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Categories
              </label>
              {categoriesLoading && (
                <div className="text-sm text-muted-foreground">Loading...</div>
              )}
              {!categoriesLoading && categories?.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No categories available
                </div>
              )}
              <div className="space-y-2 max-h-64 overflow-y-auto">
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
                      <span className="text-sm text-foreground">
                        {category.name}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter summary */}
            <div className="pt-4 border-border">
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
                  className="text-sm text-primary hover:underline cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
