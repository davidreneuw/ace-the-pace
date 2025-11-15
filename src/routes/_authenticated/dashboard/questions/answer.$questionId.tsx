import { Link, createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@workos-inc/authkit-react'
import { useMutation, useQuery } from 'convex/react'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Headphones,
  Image as ImageIcon,
  Loader2,
  Video,
  XCircle,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'

export const Route = createFileRoute(
  '/_authenticated/dashboard/questions/answer/$questionId',
)({
  component: QuestionAnswerPage,
})

function QuestionAnswerPage() {
  const { questionId } = Route.useParams()
  const [selectedAnswerId, setSelectedAnswerId] =
    useState<Id<'answerChoices'> | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const startTimeRef = useRef<number>(Date.now())
  const { user, getAccessToken } = useAuth()

  // Mutations
  const submitAnswerMutation = useMutation(api.userAnswers.submitAnswer)

  // Fetch question with answers
  const questionData = useQuery(api.questions.getWithAnswers, {
    id: questionId as Id<'questions'>,
  })

  // Fetch categories
  const categories = useQuery(api.categories.list)

  // Fetch user's answer history for this question
  const answerHistory = useQuery(api.userAnswers.getUserAnswerHistory, {
    questionId: questionId as Id<'questions'>,
  })

  const isLoading = questionData === undefined

  // Get category names for the question
  const getCategoryNames = (categoryIds: Array<Id<'categories'>>) => {
    if (!categories) return []
    return categoryIds
      .map((id) => categories.find((c) => c._id === id))
      .filter((c) => c !== undefined)
      .map((c) => c.name)
  }

  // Determine if the selected answer is correct
  const selectedAnswer = questionData?.answers.find(
    (a) => a._id === selectedAnswerId,
  )
  const correctAnswer = questionData?.answers.find((a) => a.isCorrect)
  const isCorrect = hasSubmitted && selectedAnswer?.isCorrect

  // Get difficulty badge color
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

  // Reset timer when question changes
  useEffect(() => {
    startTimeRef.current = Date.now()
    setHasSubmitted(false)
    setSelectedAnswerId(null)
  }, [questionId])

  // Handle answer submission
  const handleSubmit = async () => {
    if (!selectedAnswerId || isSubmitting) return
    // DEBUG: Log WorkOS and Convex auth state
    console.log("=== FRONTEND AUTH DEBUG ===")
    console.log("WorkOS user:", user)  // from useAuth()
    console.log("Selected answer ID:", selectedAnswerId)
    console.log("Question ID:", questionId)

    // Test token fetch
    try {
      const { getAccessToken } = useAuth()
      const token = await getAccessToken()
      console.log("WorkOS token available:", !!token)
      console.log("Token preview:", token?.substring(0, 50) + "...")
    } catch (err) {
      console.error("Failed to get WorkOS token:", err)
    }
    console.log("========================")

    try {
      const token = await getAccessToken()
      console.log("WorkOS token available:", !!token)
      console.log("Token preview:", token?.substring(0, 50) + "...")
    } catch (err) {
      console.error("Failed to get WorkOS token:", err)
    }

    setIsSubmitting(true)
    try {
      const timeSpentMs = Date.now() - startTimeRef.current

      await submitAnswerMutation({
        questionId: questionId as Id<'questions'>,
        selectedAnswerId,
        timeSpentMs,
      })

      setHasSubmitted(true)
    } catch (error) {
      console.error('Failed to submit answer:', error)
      alert('Failed to submit answer. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/dashboard/questions"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span>Back to Question Bank</span>
        </Link>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        )}

        {/* Error State - Question Not Found */}
        {!isLoading && !questionData && (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <AlertCircle className="mx-auto mb-4 text-destructive" size={64} />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Question Not Found
            </h2>
            <p className="text-muted-foreground mb-6">
              The question you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/dashboard/questions"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
              Return to Question Bank
            </Link>
          </div>
        )}

        {/* Question Content */}
        {!isLoading && questionData && (
          <div className="space-y-6">
            {/* Question Header */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded border ${getDifficultyColor(questionData.difficulty)}`}
                >
                  {questionData.difficulty.charAt(0).toUpperCase() +
                    questionData.difficulty.slice(1)}
                </span>

                {/* Categories */}
                {getCategoryNames(questionData.categoryIds).map((name, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary border border-primary/20"
                  >
                    {name}
                  </span>
                ))}

                {!questionData.isActive && (
                  <span className="px-2 py-1 text-xs font-medium rounded bg-muted text-muted-foreground border border-border">
                    Inactive
                  </span>
                )}
              </div>

              {/* Question Text */}
              <h1 className="text-2xl font-bold text-foreground mb-4">
                {questionData.questionText}
              </h1>

              {/* Media Indicators */}
              {(questionData.imageStorageId ||
                questionData.audioStorageId ||
                questionData.videoStorageId) && (
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    {questionData.imageStorageId && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded border border-border">
                        <ImageIcon size={14} />
                        <span>Image attached</span>
                      </div>
                    )}
                    {questionData.audioStorageId && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded border border-border">
                        <Headphones size={14} />
                        <span>Audio attached</span>
                      </div>
                    )}
                    {questionData.videoStorageId && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded border border-border">
                        <Video size={14} />
                        <span>Video attached</span>
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* Answer Choices */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">
                Answer Choices
              </h2>
              {questionData.answers.map((answer) => {
                const isSelected = selectedAnswerId === answer._id
                const isCorrectAnswer = answer.isCorrect
                const showCorrect = hasSubmitted && isCorrectAnswer
                const showIncorrect =
                  hasSubmitted && isSelected && !isCorrectAnswer

                return (
                  <button
                    key={answer._id}
                    onClick={() =>
                      !hasSubmitted && setSelectedAnswerId(answer._id)
                    }
                    disabled={hasSubmitted}
                    className={`
                      w-full text-left p-4 rounded-lg border-2 transition-all cursor-pointer
                      ${hasSubmitted ? 'cursor-not-allowed' : 'hover:border-primary/50'}
                      ${isSelected && !hasSubmitted ? 'border-primary bg-primary/5' : 'border-border bg-card'}
                      ${showCorrect ? 'border-green-500 bg-green-50' : ''}
                      ${showIncorrect ? 'border-red-500 bg-red-50' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {/* Radio/Status Indicator */}
                      <div className="flex-shrink-0 mt-0.5">
                        {showCorrect && (
                          <CheckCircle2 size={20} className="text-green-600" />
                        )}
                        {showIncorrect && (
                          <XCircle size={20} className="text-red-600" />
                        )}
                        {!hasSubmitted && (
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                              ? 'border-primary bg-primary'
                              : 'border-border bg-background'
                              }`}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Answer Text */}
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-foreground">
                            {answer.choiceLetter}.
                          </span>
                          <span className="text-foreground">
                            {answer.choiceText}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Submit Button */}
            {!hasSubmitted && (
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswerId || isSubmitting}
                className={`
                  w-full py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
                  ${selectedAnswerId && !isSubmitting
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }
                `}
              >
                {isSubmitting && <Loader2 className="animate-spin" size={20} />}
                {isSubmitting ? 'Submitting...' : 'Submit Answer'}
              </button>
            )}

            {/* Feedback After Submission */}
            {hasSubmitted && (
              <div
                className={`p-6 rounded-lg border-2 ${isCorrect
                  ? 'bg-green-50 border-green-500'
                  : 'bg-red-50 border-red-500'
                  }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {isCorrect ? (
                    <>
                      <CheckCircle2
                        size={32}
                        className="text-green-600 flex-shrink-0"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-green-900">
                          Correct!
                        </h3>
                        <p className="text-green-700">
                          Great job! You selected the right answer.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle
                        size={32}
                        className="text-red-600 flex-shrink-0"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-red-900">
                          Incorrect
                        </h3>
                        <p className="text-red-700">
                          The correct answer was{' '}
                          <span className="font-semibold">
                            {correctAnswer?.choiceLetter}
                          </span>
                          .
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Explanation */}
                <div className="mt-4 pt-4 border-t border-current/20">
                  <h4 className="font-semibold text-foreground mb-2">
                    Explanation
                  </h4>
                  <p className="text-foreground whitespace-pre-wrap">
                    {questionData.explanation}
                  </p>
                </div>
              </div>
            )}

            {/* Back Button After Submission */}
            {/* Answer History */}
            {answerHistory && answerHistory.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Your Answer History ({answerHistory.length}{' '}
                  {answerHistory.length === 1 ? 'attempt' : 'attempts'})
                </h3>
                <div className="space-y-3">
                  {answerHistory.map((attempt, index) => {
                    const attemptDate = new Date(attempt._creationTime)
                    const timeSpentText = attempt.timeSpentMs
                      ? attempt.timeSpentMs < 60000
                        ? `${Math.round(attempt.timeSpentMs / 1000)}s`
                        : `${Math.floor(attempt.timeSpentMs / 60000)}m ${Math.round((attempt.timeSpentMs % 60000) / 1000)}s`
                      : 'N/A'

                    return (
                      <div
                        key={attempt._id}
                        className={`p-4 rounded-lg border ${attempt.isCorrect
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                          }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            {attempt.isCorrect ? (
                              <CheckCircle2
                                size={20}
                                className="text-green-600 flex-shrink-0 mt-0.5"
                              />
                            ) : (
                              <XCircle
                                size={20}
                                className="text-red-600 flex-shrink-0 mt-0.5"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`font-semibold ${attempt.isCorrect
                                    ? 'text-green-900'
                                    : 'text-red-900'
                                    }`}
                                >
                                  {attempt.isCorrect ? 'Correct' : 'Incorrect'}
                                </span>
                                {attempt.selectedAnswer && (
                                  <span className="text-sm text-muted-foreground">
                                    • Answer: {attempt.selectedAnswer.choiceLetter}
                                  </span>
                                )}
                                <span className="text-sm text-muted-foreground">
                                  • {timeSpentText}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {attemptDate.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                          {index === 0 && (
                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded border border-primary/20 flex-shrink-0">
                              Latest
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {hasSubmitted && (
              <Link
                to="/dashboard/questions/bank"
                className="block w-full text-center py-3 px-6 bg-card border border-border text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                Back to Question Bank
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
