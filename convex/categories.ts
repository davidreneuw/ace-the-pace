import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Get all categories
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query('categories').collect()
  },
})

// Get a single category by ID
export const get = query({
  args: { id: v.id('categories') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// Get a category by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('categories')
      .withIndex('slug', (q) => q.eq('slug', args.slug))
      .unique()
  },
})

// Get all categories with question count statistics
export const listWithStats = query({
  handler: async (ctx) => {
    const categories = await ctx.db.query('categories').collect()

    // Get all active questions
    const questions = await ctx.db
      .query('questions')
      .withIndex('isActive', (q) => q.eq('isActive', true))
      .collect()

    // Calculate question count for each category
    return categories.map((category) => {
      const questionCount = questions.filter((q) =>
        q.categoryIds.includes(category._id),
      ).length

      return {
        ...category,
        questionCount,
      }
    })
  },
})

// Create a new category
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    iconStorageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    // Check if slug already exists
    const existing = await ctx.db
      .query('categories')
      .withIndex('slug', (q) => q.eq('slug', args.slug))
      .unique()

    if (existing) {
      throw new Error(`Category with slug "${args.slug}" already exists`)
    }

    const categoryId = await ctx.db.insert('categories', {
      name: args.name,
      slug: args.slug,
      description: args.description,
      color: args.color,
      iconStorageId: args.iconStorageId,
    })

    return categoryId
  },
})

// Update a category
export const update = mutation({
  args: {
    id: v.id('categories'),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    iconStorageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    // If updating slug, check it doesn't already exist
    if (updates.slug !== undefined) {
      const existing = await ctx.db
        .query('categories')
        .withIndex('slug', (q) => q.eq('slug', updates.slug!))
        .unique()

      if (existing && existing._id !== id) {
        throw new Error(`Category with slug "${updates.slug}" already exists`)
      }
    }

    await ctx.db.patch(id, updates)
    return id
  },
})

// Delete a category
export const remove = mutation({
  args: { id: v.id('categories') },
  handler: async (ctx, args) => {
    // Check if any questions are using this category
    const allQuestions = await ctx.db.query('questions').collect()
    const questionsWithCategory = allQuestions.find((q) =>
      q.categoryIds.includes(args.id),
    )

    if (questionsWithCategory) {
      throw new Error(
        'Cannot delete category that is assigned to questions. Please reassign or delete those questions first.',
      )
    }

    await ctx.db.delete(args.id)
  },
})
