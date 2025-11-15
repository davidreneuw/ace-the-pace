import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * Submit a user's answer to a question
 * Automatically determines correctness and records the attempt
 */
export const submitAnswer = mutation({
  args: {
    questionId: v.id('questions'),
    selectedAnswerId: v.id('answerChoices'),
    timeSpentMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Get user from Convex
    const user = await ctx.db
      .query('users')
      .withIndex('workosUserId', (q) => q.eq('workosUserId', identity.subject))
      .first()
    if (!user) {
      throw new Error('User not found')
    }

    // Verify the selected answer belongs to the question
    const selectedAnswer = await ctx.db.get(args.selectedAnswerId)
    if (!selectedAnswer) {
      throw new Error('Answer choice not found')
    }
    if (selectedAnswer.questionId !== args.questionId) {
      throw new Error('Answer choice does not belong to this question')
    }

    // Get the question to verify it exists
    const question = await ctx.db.get(args.questionId)
    if (!question) {
      throw new Error('Question not found')
    }

    // Record the answer
    const userAnswerId = await ctx.db.insert('userAnswers', {
      userId: user._id,
      questionId: args.questionId,
      selectedAnswerId: args.selectedAnswerId,
      isCorrect: selectedAnswer.isCorrect,
      timeSpentMs: args.timeSpentMs,
    })

    // Return the result with correctness and explanation
    return {
      userAnswerId,
      isCorrect: selectedAnswer.isCorrect,
      explanation: question.explanation,
      selectedAnswer: {
        _id: selectedAnswer._id,
        choiceText: selectedAnswer.choiceText,
        choiceLetter: selectedAnswer.choiceLetter,
      },
    }
  },
})

/**
 * Get all of the current user's answers for a specific question
 * Returns answer history ordered by most recent first
 */
export const getUserAnswerHistory = query({
  args: {
    questionId: v.id('questions'),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }

    const user = await ctx.db
      .query('users')
      .withIndex('workosUserId', (q) => q.eq('workosUserId', identity.subject))
      .first()
    if (!user) {
      return []
    }

    // Get all user answers for this question
    const answers = await ctx.db
      .query('userAnswers')
      .withIndex('by_user_and_question', (q) =>
        q.eq('userId', user._id).eq('questionId', args.questionId),
      )
      .collect()

    // Enrich with answer choice details
    const enrichedAnswers = await Promise.all(
      answers.map(async (answer) => {
        const answerChoice = await ctx.db.get(answer.selectedAnswerId)
        return {
          _id: answer._id,
          _creationTime: answer._creationTime,
          isCorrect: answer.isCorrect,
          timeSpentMs: answer.timeSpentMs,
          selectedAnswer: answerChoice
            ? {
              choiceText: answerChoice.choiceText,
              choiceLetter: answerChoice.choiceLetter,
            }
            : null,
        }
      }),
    )

    // Sort by most recent first
    return enrichedAnswers.sort((a, b) => b._creationTime - a._creationTime)
  },
})

/**
 * Get overall statistics for a specific question across all users
 * Useful for analytics and identifying difficult questions
 */
export const getQuestionStats = query({
  args: {
    questionId: v.id('questions'),
  },
  handler: async (ctx, args) => {
    const answers = await ctx.db
      .query('userAnswers')
      .withIndex('questionId', (q) => q.eq('questionId', args.questionId))
      .collect()

    if (answers.length === 0) {
      return {
        totalAttempts: 0,
        correctAttempts: 0,
        successRate: 0,
        averageTimeMs: null,
      }
    }

    const correctAttempts = answers.filter((a) => a.isCorrect).length
    const timesWithData = answers
      .filter((a) => a.timeSpentMs !== undefined)
      .map((a) => a.timeSpentMs!)
    const averageTimeMs =
      timesWithData.length > 0
        ? timesWithData.reduce((sum, time) => sum + time, 0) /
        timesWithData.length
        : null

    return {
      totalAttempts: answers.length,
      correctAttempts,
      successRate: (correctAttempts / answers.length) * 100,
      averageTimeMs,
    }
  },
})

/**
 * Get the current user's overall performance statistics
 * Returns total questions answered, correct percentage, etc.
 */
export const getUserPerformance = query({
  handler: async (ctx) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }

    const user = await ctx.db
      .query('users')
      .withIndex('workosUserId', (q) => q.eq('workosUserId', identity.subject))
      .first()
    if (!user) {
      return null
    }

    // Get all user answers
    const answers = await ctx.db
      .query('userAnswers')
      .withIndex('userId', (q) => q.eq('userId', user._id))
      .collect()

    if (answers.length === 0) {
      return {
        totalAttempts: 0,
        uniqueQuestionsAnswered: 0,
        correctAttempts: 0,
        successRate: 0,
        averageTimeMs: null,
      }
    }

    const correctAttempts = answers.filter((a) => a.isCorrect).length
    const uniqueQuestions = new Set(answers.map((a) => a.questionId)).size
    const timesWithData = answers
      .filter((a) => a.timeSpentMs !== undefined)
      .map((a) => a.timeSpentMs!)
    const averageTimeMs =
      timesWithData.length > 0
        ? timesWithData.reduce((sum, time) => sum + time, 0) /
        timesWithData.length
        : null

    return {
      totalAttempts: answers.length,
      uniqueQuestionsAnswered: uniqueQuestions,
      correctAttempts,
      successRate: (correctAttempts / answers.length) * 100,
      averageTimeMs,
    }
  },
})

/**
 * Get whether the current user has answered a specific question before
 * and their most recent result
 */
export const hasUserAnsweredQuestion = query({
  args: {
    questionId: v.id('questions'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return { hasAnswered: false, lastAttempt: null }
    }

    const user = await ctx.db
      .query('users')
      .withIndex('workosUserId', (q) => q.eq('workosUserId', identity.subject))
      .first()
    if (!user) {
      return { hasAnswered: false, lastAttempt: null }
    }

    const answers = await ctx.db
      .query('userAnswers')
      .withIndex('by_user_and_question', (q) =>
        q.eq('userId', user._id).eq('questionId', args.questionId),
      )
      .collect()

    if (answers.length === 0) {
      return { hasAnswered: false, lastAttempt: null }
    }

    // Get most recent attempt
    const lastAttempt = answers.sort((a, b) => b._creationTime - a._creationTime)[0]

    return {
      hasAnswered: true,
      lastAttempt: {
        isCorrect: lastAttempt.isCorrect,
        _creationTime: lastAttempt._creationTime,
      },
    }
  },
})
