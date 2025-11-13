import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { Id } from './_generated/dataModel'

// Get all active questions
export const listActive = query({
  handler: async (ctx) => {
    return await ctx.db
      .query('questions')
      .withIndex('isActive', (q) => q.eq('isActive', true))
      .collect()
  },
})

// Get all questions (including inactive, for admin)
export const listAll = query({
  handler: async (ctx) => {
    return await ctx.db.query('questions').collect()
  },
})

// Get questions by category
export const listByCategory = query({
  args: { categoryId: v.id('categories') },
  handler: async (ctx, args) => {
    const allQuestions = await ctx.db
      .query('questions')
      .withIndex('isActive', (q) => q.eq('isActive', true))
      .collect()

    return allQuestions.filter((q) => q.categoryIds.includes(args.categoryId))
  },
})

// Get a single question with its answer choices
export const getWithAnswers = query({
  args: { id: v.id('questions') },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.id)
    if (!question) return null

    const answers = await ctx.db
      .query('answerChoices')
      .withIndex('questionId', (q) => q.eq('questionId', args.id))
      .order('asc')
      .collect()

    return {
      ...question,
      answers: answers.sort((a, b) => a.order - b.order),
    }
  },
})

// Create a new question with answer choices
export const create = mutation({
  args: {
    questionText: v.string(),
    imageStorageId: v.optional(v.id('_storage')),
    audioStorageId: v.optional(v.id('_storage')),
    videoStorageId: v.optional(v.id('_storage')),
    difficulty: v.union(v.literal('easy'), v.literal('medium'), v.literal('hard')),
    explanation: v.string(),
    categoryIds: v.array(v.id('categories')),
    isActive: v.boolean(),
    order: v.optional(v.number()),
    answers: v.array(
      v.object({
        choiceText: v.string(),
        choiceLetter: v.string(),
        isCorrect: v.boolean(),
        imageStorageId: v.optional(v.id('_storage')),
        order: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { answers, ...questionData } = args

    // Validate that exactly one answer is correct
    const correctAnswers = answers.filter((a) => a.isCorrect)
    if (correctAnswers.length !== 1) {
      throw new Error('Exactly one answer must be marked as correct')
    }

    // Validate that all category IDs exist
    for (const categoryId of args.categoryIds) {
      const category = await ctx.db.get(categoryId)
      if (!category) {
        throw new Error(`Category ${categoryId} not found`)
      }
    }

    // Create the question
    const questionId = await ctx.db.insert('questions', questionData)

    // Create the answer choices
    for (const answer of answers) {
      await ctx.db.insert('answerChoices', {
        questionId,
        choiceText: answer.choiceText,
        choiceLetter: answer.choiceLetter,
        isCorrect: answer.isCorrect,
        imageStorageId: answer.imageStorageId,
        order: answer.order,
      })
    }

    return questionId
  },
})

// Update a question
export const update = mutation({
  args: {
    id: v.id('questions'),
    questionText: v.optional(v.string()),
    imageStorageId: v.optional(v.id('_storage')),
    audioStorageId: v.optional(v.id('_storage')),
    videoStorageId: v.optional(v.id('_storage')),
    difficulty: v.optional(
      v.union(v.literal('easy'), v.literal('medium'), v.literal('hard')),
    ),
    explanation: v.optional(v.string()),
    categoryIds: v.optional(v.array(v.id('categories'))),
    isActive: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    // Validate category IDs if provided
    if (updates.categoryIds) {
      for (const categoryId of updates.categoryIds) {
        const category = await ctx.db.get(categoryId)
        if (!category) {
          throw new Error(`Category ${categoryId} not found`)
        }
      }
    }

    await ctx.db.patch(id, updates)
    return id
  },
})

// Update answer choices for a question
export const updateAnswers = mutation({
  args: {
    questionId: v.id('questions'),
    answers: v.array(
      v.object({
        id: v.optional(v.id('answerChoices')), // If provided, update existing; otherwise create new
        choiceText: v.string(),
        choiceLetter: v.string(),
        isCorrect: v.boolean(),
        imageStorageId: v.optional(v.id('_storage')),
        order: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Validate that exactly one answer is correct
    const correctAnswers = args.answers.filter((a) => a.isCorrect)
    if (correctAnswers.length !== 1) {
      throw new Error('Exactly one answer must be marked as correct')
    }

    // Get existing answers
    const existingAnswers = await ctx.db
      .query('answerChoices')
      .withIndex('questionId', (q) => q.eq('questionId', args.questionId))
      .collect()

    const existingIds = new Set(existingAnswers.map((a) => a._id))
    const providedIds = new Set(
      args.answers.map((a) => a.id).filter((id): id is Id<'answerChoices'> => id !== undefined),
    )

    // Delete answers that are no longer present
    for (const existing of existingAnswers) {
      if (!providedIds.has(existing._id)) {
        await ctx.db.delete(existing._id)
      }
    }

    // Update or create answers
    for (const answer of args.answers) {
      if (answer.id && existingIds.has(answer.id)) {
        // Update existing answer
        await ctx.db.patch(answer.id, {
          choiceText: answer.choiceText,
          choiceLetter: answer.choiceLetter,
          isCorrect: answer.isCorrect,
          imageStorageId: answer.imageStorageId,
          order: answer.order,
        })
      } else {
        // Create new answer
        await ctx.db.insert('answerChoices', {
          questionId: args.questionId,
          choiceText: answer.choiceText,
          choiceLetter: answer.choiceLetter,
          isCorrect: answer.isCorrect,
          imageStorageId: answer.imageStorageId,
          order: answer.order,
        })
      }
    }

    return args.questionId
  },
})

// Delete a question and its answer choices
export const remove = mutation({
  args: { id: v.id('questions') },
  handler: async (ctx, args) => {
    // Delete all associated answer choices
    const answers = await ctx.db
      .query('answerChoices')
      .withIndex('questionId', (q) => q.eq('questionId', args.id))
      .collect()

    for (const answer of answers) {
      await ctx.db.delete(answer._id)
    }

    // Delete the question
    await ctx.db.delete(args.id)
  },
})
