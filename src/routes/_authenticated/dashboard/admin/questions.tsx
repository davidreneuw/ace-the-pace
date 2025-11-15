import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { useEffect, useState } from 'react'
import { Copy, Edit, Plus, Trash2 } from 'lucide-react'
import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'

export const Route = createFileRoute(
  '/_authenticated/dashboard/admin/questions',
)({
  component: QuestionManagement,
})

type AnswerChoice = {
  id?: Id<'answerChoices'>
  choiceText: string
  choiceLetter: string
  isCorrect: boolean
  imageStorageId?: string
  order: number
}

type QuestionForm = {
  id?: Id<'questions'>
  questionText: string
  imageStorageId?: string
  audioStorageId?: string
  videoStorageId?: string
  difficulty: 'easy' | 'medium' | 'hard'
  explanation: string
  categoryIds: Array<Id<'categories'>>
  isActive: boolean
  order?: number
  answers: Array<AnswerChoice>
}

const emptyForm: QuestionForm = {
  questionText: '',
  difficulty: 'medium',
  explanation: '',
  categoryIds: [],
  isActive: true,
  answers: [
    { choiceText: '', choiceLetter: 'A', isCorrect: false, order: 0 },
    { choiceText: '', choiceLetter: 'B', isCorrect: false, order: 1 },
    { choiceText: '', choiceLetter: 'C', isCorrect: false, order: 2 },
    { choiceText: '', choiceLetter: 'D', isCorrect: false, order: 3 },
  ],
}

function QuestionManagement() {
  const [formData, setFormData] = useState<QuestionForm>(emptyForm)
  const [selectedId, setSelectedId] = useState<Id<'questions'> | null>(null)
  const [isCloning, setIsCloning] = useState(false)

  // Queries
  const questions = useQuery(api.questions.listAll)
  const categories = useQuery(api.categories.list)
  const selectedQuestion = useQuery(
    api.questions.getWithAnswers,
    selectedId ? { id: selectedId } : 'skip',
  )

  // Mutations
  const createMutation = useMutation(api.questions.create)
  const updateMutation = useMutation(api.questions.update)
  const updateAnswersMutation = useMutation(api.questions.updateAnswers)
  const deleteMutation = useMutation(api.questions.remove)

  const questionsLoading = questions === undefined

  // Handle cloning when question data loads
  useEffect(() => {
    if (isCloning && selectedQuestion && selectedId) {
      const question = questions?.find((q) => q._id === selectedId)
      if (question) {
        setFormData({
          questionText: `Copy of ${question.questionText}`,
          imageStorageId: question.imageStorageId,
          audioStorageId: question.audioStorageId,
          videoStorageId: question.videoStorageId,
          difficulty: question.difficulty,
          explanation: question.explanation,
          categoryIds: question.categoryIds,
          isActive: question.isActive,
          order: question.order,
          answers: selectedQuestion.answers.map((a) => ({
            choiceText: a.choiceText,
            choiceLetter: a.choiceLetter,
            isCorrect: a.isCorrect,
            imageStorageId: a.imageStorageId,
            order: a.order,
          })),
        })
        setSelectedId(null)
        setIsCloning(false)
      }
    }
  }, [isCloning, selectedQuestion, selectedId, questions])

  // Load selected question into form
  const handleSelectQuestion = (id: Id<'questions'>) => {
    setIsCloning(false)
    setSelectedId(id)
    const question = questions?.find((q) => q._id === id)
    if (question && selectedQuestion) {
      setFormData({
        id: question._id,
        questionText: question.questionText,
        imageStorageId: question.imageStorageId,
        audioStorageId: question.audioStorageId,
        videoStorageId: question.videoStorageId,
        difficulty: question.difficulty,
        explanation: question.explanation,
        categoryIds: question.categoryIds,
        isActive: question.isActive,
        order: question.order,
        answers: selectedQuestion.answers.map((a) => ({
          id: a._id,
          choiceText: a.choiceText,
          choiceLetter: a.choiceLetter,
          isCorrect: a.isCorrect,
          imageStorageId: a.imageStorageId,
          order: a.order,
        })),
      })
    }
  }

  // Clear form
  const handleNewQuestion = () => {
    setSelectedId(null)
    setFormData(emptyForm)
    setIsCloning(false)
  }

  // Save question
  const handleSave = async () => {
    try {
      // Validation
      if (!formData.questionText.trim()) {
        alert('Question text is required')
        return
      }
      if (!formData.explanation.trim()) {
        alert('Explanation is required')
        return
      }
      if (formData.categoryIds.length === 0) {
        alert('At least one category is required')
        return
      }
      const correctCount = formData.answers.filter((a) => a.isCorrect).length
      if (correctCount !== 1) {
        alert('Exactly one answer must be marked as correct')
        return
      }

      if (formData.id) {
        // Update existing question
        await updateMutation({
          id: formData.id,
          questionText: formData.questionText,
          imageStorageId: formData.imageStorageId as Id<'_storage'> | undefined,
          audioStorageId: formData.audioStorageId as Id<'_storage'> | undefined,
          videoStorageId: formData.videoStorageId as Id<'_storage'> | undefined,
          difficulty: formData.difficulty,
          explanation: formData.explanation,
          categoryIds: formData.categoryIds,
          isActive: formData.isActive,
          order: formData.order,
        })

        // Update answers
        await updateAnswersMutation({
          questionId: formData.id,
          answers: formData.answers.map((a) => ({
            ...a,
            imageStorageId: a.imageStorageId as Id<'_storage'> | undefined,
          })),
        })
      } else {
        // Create new question
        await createMutation({
          questionText: formData.questionText,
          imageStorageId: formData.imageStorageId as Id<'_storage'> | undefined,
          audioStorageId: formData.audioStorageId as Id<'_storage'> | undefined,
          videoStorageId: formData.videoStorageId as Id<'_storage'> | undefined,
          difficulty: formData.difficulty,
          explanation: formData.explanation,
          categoryIds: formData.categoryIds,
          isActive: formData.isActive,
          order: formData.order,
          answers: formData.answers.map((a) => ({
            ...a,
            imageStorageId: a.imageStorageId as Id<'_storage'> | undefined,
          })),
        })
      }

      // Reset form
      handleNewQuestion()
      alert('Question saved successfully!')
    } catch (error) {
      console.error('Error saving question:', error)
      alert('Error saving question: ' + (error as Error).message)
    }
  }

  // Delete question
  const handleDelete = async (id: Id<'questions'>) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      await deleteMutation({ id })
      if (selectedId === id) {
        handleNewQuestion()
      }
      alert('Question deleted successfully!')
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Error deleting question: ' + (error as Error).message)
    }
  }

  // Clone question
  const handleClone = (id: Id<'questions'>) => {
    setIsCloning(true)
    setSelectedId(id)
  }

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    hard: 'bg-red-100 text-red-800 border-red-200',
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel - Question List */}
      <div className="w-2/5 border-r border-border flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-foreground">Questions</h2>
            <button
              onClick={handleNewQuestion}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Plus size={16} />
              New
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            {questions?.length || 0} questions
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {questionsLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          )}
          {!questionsLoading && questions?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No questions yet. Create one!
            </div>
          )}
          {questions?.map((question) => (
            <div
              key={question._id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedId === question._id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
              onClick={() => handleSelectQuestion(question._id)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-medium text-foreground line-clamp-2 flex-1">
                  {question.questionText}
                </p>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectQuestion(question._id)
                    }}
                    className="p-1 hover:bg-muted rounded cursor-pointer"
                    aria-label="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleClone(question._id)
                    }}
                    className="p-1 hover:bg-primary/10 text-primary rounded cursor-pointer"
                    aria-label="Clone"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(question._id)
                    }}
                    className="p-1 hover:bg-destructive/10 text-destructive rounded cursor-pointer"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColors[question.difficulty]}`}
                >
                  {question.difficulty}
                </span>
                {!question.isActive && (
                  <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-100 text-gray-600 border-gray-200">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Question Form */}
      <div className="w-3/5 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            {formData.id ? 'Edit Question' : 'New Question'}
          </h2>

          <div className="space-y-6">
            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Question Text *
              </label>
              <textarea
                value={formData.questionText}
                onChange={(e) =>
                  setFormData({ ...formData, questionText: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter the question..."
              />
            </div>

            {/* Media Storage IDs */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Image Storage ID
                </label>
                <input
                  type="text"
                  value={formData.imageStorageId || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      imageStorageId: e.target.value || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Audio Storage ID
                </label>
                <input
                  type="text"
                  value={formData.audioStorageId || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      audioStorageId: e.target.value || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Video Storage ID
                </label>
                <input
                  type="text"
                  value={formData.videoStorageId || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      videoStorageId: e.target.value || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Difficulty and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Difficulty *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      difficulty: e.target.value as 'easy' | 'medium' | 'hard',
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <label className="flex items-center gap-2 px-3 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-foreground">Active</span>
                </label>
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Categories * (select at least one)
              </label>
              <div className="grid grid-cols-2 gap-2 p-3 border border-border rounded-lg bg-background max-h-48 overflow-y-auto">
                {categories?.map((category) => (
                  <label
                    key={category._id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted px-2 py-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.categoryIds.includes(category._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            categoryIds: [
                              ...formData.categoryIds,
                              category._id,
                            ],
                          })
                        } else {
                          setFormData({
                            ...formData,
                            categoryIds: formData.categoryIds.filter(
                              (id) => id !== category._id,
                            ),
                          })
                        }
                      }}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm text-foreground">
                      {category.name}
                    </span>
                  </label>
                ))}
                {(!categories || categories.length === 0) && (
                  <p className="text-sm text-muted-foreground col-span-2">
                    No categories available. Create categories first.
                  </p>
                )}
              </div>
            </div>

            {/* Explanation */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Explanation *
              </label>
              <textarea
                value={formData.explanation}
                onChange={(e) =>
                  setFormData({ ...formData, explanation: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Explain why the correct answer is correct..."
              />
            </div>

            {/* Answer Choices */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Answer Choices * (select one as correct)
              </label>
              <div className="space-y-3">
                {formData.answers.map((answer, idx) => (
                  <div
                    key={idx}
                    className={`p-3 border rounded-lg ${answer.isCorrect ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        checked={answer.isCorrect}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            answers: formData.answers.map((a, i) => ({
                              ...a,
                              isCorrect: i === idx,
                            })),
                          })
                        }
                        className="mt-1 cursor-pointer"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {answer.choiceLetter}.
                          </span>
                          <input
                            type="text"
                            value={answer.choiceText}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                answers: formData.answers.map((a, i) =>
                                  i === idx
                                    ? { ...a, choiceText: e.target.value }
                                    : a,
                                ),
                              })
                            }
                            className="flex-1 px-2 py-1 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Answer choice text..."
                          />
                        </div>
                        <input
                          type="text"
                          value={answer.imageStorageId || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              answers: formData.answers.map((a, i) =>
                                i === idx
                                  ? {
                                      ...a,
                                      imageStorageId:
                                        e.target.value || undefined,
                                    }
                                  : a,
                              ),
                            })
                          }
                          className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Image Storage ID (optional)"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order (optional) */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Order (optional)
              </label>
              <input
                type="number"
                value={formData.order || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Display order"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors cursor-pointer"
              >
                {formData.id ? 'Update Question' : 'Create Question'}
              </button>
              <button
                onClick={handleNewQuestion}
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
