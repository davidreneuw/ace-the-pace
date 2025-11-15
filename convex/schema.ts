import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Users table for role-based access control
  users: defineTable({
    workosUserId: v.string(), // WorkOS user ID (unique identifier)
    displayName: v.string(), // User's display name
    roles: v.array(v.string()), // User roles (e.g., ["admin"])
    metadata: v.optional(v.any()), // Flexible field for future extensions
  }).index('workosUserId', ['workosUserId']),
  // Categories for organizing questions
  categories: defineTable({
    name: v.string(), // "Cardiology"
    slug: v.string(), // "cardiology" (URL-friendly)
    description: v.optional(v.string()), // Category description
    color: v.optional(v.string()), // UI color hex code
    iconStorageId: v.optional(v.id('_storage')), // Category icon
  }).index('slug', ['slug']),

  // Practice questions
  questions: defineTable({
    questionText: v.string(), // Main question text

    // Multimedia support
    imageStorageId: v.optional(v.id('_storage')),
    audioStorageId: v.optional(v.id('_storage')),
    videoStorageId: v.optional(v.id('_storage')),

    // Metadata
    difficulty: v.union(
      v.literal('easy'),
      v.literal('medium'),
      v.literal('hard'),
    ),
    explanation: v.string(), // General explanation (why answer is correct)

    // References
    categoryIds: v.array(v.id('categories')), // Multiple categories support

    // Admin fields
    isActive: v.boolean(), // Published/draft status
    order: v.optional(v.number()), // Display order within categories
  }).index('isActive', ['isActive']),

  // Answer choices for questions (multiple choice)
  answerChoices: defineTable({
    questionId: v.id('questions'), // Parent question
    choiceText: v.string(), // "A. Option text"
    choiceLetter: v.string(), // "A", "B", "C", "D"
    isCorrect: v.boolean(), // Only one should be true per question

    // Optional multimedia for answer choices
    imageStorageId: v.optional(v.id('_storage')),

    // Order
    order: v.number(), // Display order (0, 1, 2, 3)
  }).index('questionId', ['questionId']),

  // User answers/attempts - tracks individual question responses
  userAnswers: defineTable({
    userId: v.id('users'), // User who answered
    questionId: v.id('questions'), // Question answered
    selectedAnswerId: v.id('answerChoices'), // Answer choice selected
    isCorrect: v.boolean(), // Whether the answer was correct
    timeSpentMs: v.optional(v.number()), // Time spent on question in milliseconds
    // Future: sessionId will link to practice sessions table
  })
    .index('userId', ['userId'])
    .index('questionId', ['questionId'])
    .index('by_user_and_question', ['userId', 'questionId']),
})
