import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { FolderTree, BookOpen, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/dashboard/categories')({
  component: CategoriesPage,
})

function CategoriesPage() {
  const categories = useQuery(api.categories.listWithStats)

  const isLoading = categories === undefined

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <FolderTree className="text-primary" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Question Categories
            </h1>
            <p className="text-muted-foreground">
              Browse questions by medical topic
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && categories.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <FolderTree className="mx-auto mb-4 text-muted-foreground" size={64} />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Categories Yet
            </h2>
            <p className="text-muted-foreground">
              Categories will appear here once they are created.
            </p>
          </div>
        )}

        {/* Categories Grid */}
        {!isLoading && categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category._id}
                to="/dashboard/questions/bank"
                search={{ category: category.slug }}
                className="group"
              >
                <div
                  className="bg-card border border-border rounded-lg p-6 h-full transition-all duration-200 hover:shadow-lg hover:border-primary cursor-pointer"
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
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                    </div>
                    <FolderTree
                      className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
                      size={20}
                    />
                  </div>

                  {/* Description */}
                  {category.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border">
                    <BookOpen size={16} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {category.questionCount}{' '}
                      <span className="text-muted-foreground">
                        {category.questionCount === 1 ? 'question' : 'questions'}
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
