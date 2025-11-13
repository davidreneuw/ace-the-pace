import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useState } from 'react'
import { Id } from '../../../../convex/_generated/dataModel'
import { Plus, Edit, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/dashboard/admin/categories')({
  component: CategoryManagement,
})

type CategoryForm = {
  id?: Id<'categories'>
  name: string
  slug: string
  description?: string
  color?: string
  iconStorageId?: string
}

const emptyForm: CategoryForm = {
  name: '',
  slug: '',
}

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function CategoryManagement() {
  const [formData, setFormData] = useState<CategoryForm>(emptyForm)
  const [selectedId, setSelectedId] = useState<Id<'categories'> | null>(null)

  // Queries
  const categories = useQuery(api.categories.list)
  const allQuestions = useQuery(api.questions.listAll)

  // Mutations
  const createMutation = useMutation(api.categories.create)
  const updateMutation = useMutation(api.categories.update)
  const deleteMutation = useMutation(api.categories.remove)

  const categoriesLoading = categories === undefined

  // Count questions per category
  const getQuestionCount = (categoryId: Id<'categories'>) => {
    return allQuestions?.filter((q) => q.categoryIds.includes(categoryId)).length || 0
  }

  // Load selected category into form
  const handleSelectCategory = (id: Id<'categories'>) => {
    setSelectedId(id)
    const category = categories?.find((c) => c._id === id)
    if (category) {
      setFormData({
        id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        color: category.color,
        iconStorageId: category.iconStorageId,
      })
    }
  }

  // Clear form
  const handleNewCategory = () => {
    setSelectedId(null)
    setFormData(emptyForm)
  }

  // Save category
  const handleSave = async () => {
    try {
      // Validation
      if (!formData.name.trim()) {
        alert('Category name is required')
        return
      }
      if (!formData.slug.trim()) {
        alert('Slug is required')
        return
      }

      if (formData.id) {
        // Update existing category
        await updateMutation({
          id: formData.id,
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          color: formData.color,
          iconStorageId: formData.iconStorageId as Id<'_storage'> | undefined,
        })
      } else {
        // Create new category
        await createMutation({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          color: formData.color,
          iconStorageId: formData.iconStorageId as Id<'_storage'> | undefined,
        })
      }

      // Reset form
      handleNewCategory()
      alert('Category saved successfully!')
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Error saving category: ' + (error as Error).message)
    }
  }

  // Delete category
  const handleDelete = async (id: Id<'categories'>) => {
    const questionCount = getQuestionCount(id)
    if (questionCount > 0) {
      alert(
        `Cannot delete this category. It is used by ${questionCount} question(s). Please reassign those questions first.`,
      )
      return
    }

    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      await deleteMutation({ id })
      if (selectedId === id) {
        handleNewCategory()
      }
      alert('Category deleted successfully!')
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error deleting category: ' + (error as Error).message)
    }
  }

  // Auto-generate slug when name changes
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: formData.id ? formData.slug : generateSlug(name), // Only auto-generate for new categories
    })
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel - Category List */}
      <div className="w-2/5 border-r border-border flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-foreground">Categories</h2>
            <button
              onClick={handleNewCategory}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Plus size={16} />
              New
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            {categories?.length || 0} categories
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {categoriesLoading && (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          )}
          {!categoriesLoading && categories?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No categories yet. Create one!
            </div>
          )}
          {categories?.map((category) => {
            const questionCount = getQuestionCount(category._id)
            return (
              <div
                key={category._id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedId === category._id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
                onClick={() => handleSelectCategory(category._id)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    {category.color && (
                      <div
                        className="w-4 h-4 rounded-full border border-border flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {category.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{category.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectCategory(category._id)
                      }}
                      className="p-1 hover:bg-muted rounded cursor-pointer"
                      aria-label="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(category._id)
                      }}
                      className="p-1 hover:bg-destructive/10 text-destructive rounded cursor-pointer"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {questionCount} question{questionCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right Panel - Category Form */}
      <div className="w-3/5 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          {formData.id ? 'Edit Category' : 'New Category'}
        </h2>

        <div className="space-y-6 max-w-xl">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Cardiology"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Slug * (URL-friendly)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., cardiology"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Auto-generated from name, but you can edit it
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description (optional)
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value || undefined })
              }
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Brief description of this category..."
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Color (optional)
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.color || '#3b82f6'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-10 w-16 border border-border rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.color || ''}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value || undefined })
                }
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="#3b82f6"
              />
            </div>
          </div>

          {/* Icon Storage ID */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Icon Storage ID (optional)
            </label>
            <input
              type="text"
              value={formData.iconStorageId || ''}
              onChange={(e) =>
                setFormData({ ...formData, iconStorageId: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Storage ID for category icon"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors cursor-pointer"
            >
              {formData.id ? 'Update Category' : 'Create Category'}
            </button>
            <button
              onClick={handleNewCategory}
              className="px-6 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
