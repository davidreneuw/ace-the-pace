import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { BookOpen, ChevronLeft, ChevronRight, Filter, FolderTree, Loader2, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../../convex/_generated/api'

export const Route = createFileRoute('/dashboard/categories/')({
  component: CategoriesPage,
})

const ITEMS_PER_PAGE = 20

type SortOption = 'name-asc' | 'name-desc' | 'questions-asc' | 'questions-desc'

function CategoriesPage() {
  const categories = useQuery(api.categories.listWithStats)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<SortOption>('name-asc')

  const isLoading = categories === undefined

  // Filter and sort categories
  const filteredCategories = useMemo(() => {
    if (!categories) return []

    let filtered = categories.filter((category) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesName = category.name.toLowerCase().includes(query)
        const matchesDescription = category.description?.toLowerCase().includes(query)
        return matchesName || matchesDescription
      }
      return true
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'questions-asc':
          return a.questionCount - b.questionCount
        case 'questions-desc':
          return b.questionCount - a.questionCount
        default:
          return 0
      }
    })

    return filtered
  }, [categories, searchQuery, sortBy])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy])

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  // Pagination calculations
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex)

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto [scrollbar-gutter:stable]">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Categories</h1>
        <p className="text-muted-foreground">
          Browse questions by medical topic
        </p>
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
              placeholder="Search categories..."
              className={`w-full pl-10 pr-10 py-2.5 border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${searchQuery.trim() ? 'border-primary' : 'border-border'
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
          {filteredCategories.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredCategories.length)} of{' '}
                {filteredCategories.length} categories
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)

                    if (!showPage) {
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="px-2 text-muted-foreground">
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
                        className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${currentPage === page
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'border border-border hover:bg-muted'
                          }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
        {/* Categories list - main area */}
        <div className="flex-1 min-w-0">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && paginatedCategories.length === 0 && (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <FolderTree className="mx-auto mb-4 text-muted-foreground" size={64} />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No Categories Found
              </h2>
              <p className="text-muted-foreground">
                {categories?.length === 0
                  ? 'Categories will appear here once they are created.'
                  : 'Try adjusting your search query.'}
              </p>
            </div>
          )}

          {/* Categories List */}
          {!isLoading && paginatedCategories.length > 0 && (
            <div className="space-y-4">
              {paginatedCategories.map((category) => (
                <Link
                  key={category._id}
                  to="/dashboard/questions"
                  search={{ category: category.slug }}
                  className="block group"
                >
                  <div
                    className="bg-card border border-border rounded-lg p-4 transition-all duration-200 hover:shadow-lg hover:border-primary cursor-pointer"
                    style={
                      category.color
                        ? {
                          borderLeftWidth: '4px',
                          borderLeftColor: category.color,
                        }
                        : undefined
                    }
                  >
                    {/* Category Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors mb-2">
                          {category.name}
                        </h3>
                        {/* Description */}
                        {category.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        {/* Stats */}
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} className="text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            {category.questionCount}{' '}
                            <span className="text-muted-foreground">
                              {category.questionCount === 1 ? 'question' : 'questions'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Filters - sticky floating card on right */}
        <div className="w-80 flex-shrink-0">
          <div className="sticky top-30 bg-card border border-border rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Sort</h2>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Sort by
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    checked={sortBy === 'name-asc'}
                    onChange={() => setSortBy('name-asc')}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-foreground">Name (A-Z)</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    checked={sortBy === 'name-desc'}
                    onChange={() => setSortBy('name-desc')}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-foreground">Name (Z-A)</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    checked={sortBy === 'questions-desc'}
                    onChange={() => setSortBy('questions-desc')}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-foreground">Most Questions</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    checked={sortBy === 'questions-asc'}
                    onChange={() => setSortBy('questions-asc')}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-foreground">Fewest Questions</span>
                </label>
              </div>
            </div>

            {/* Clear filters */}
            {(searchQuery.trim() || sortBy !== 'name-asc') && (
              <div className="pt-4 border-t border-border">
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSortBy('name-asc')
                  }}
                  className="text-sm text-primary hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
