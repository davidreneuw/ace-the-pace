import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import { Plus, Shield, Trash2, User, X } from 'lucide-react'
import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'

export const Route = createFileRoute('/_authenticated/dashboard/admin/users')({
  component: UserManagement,
})

type UserForm = {
  id?: Id<'users'>
  workosUserId: string
  displayName: string
  roles: Array<string>
  metadata?: any
}

const emptyForm: UserForm = {
  workosUserId: '',
  displayName: '',
  roles: [],
  metadata: undefined,
}

function UserManagement() {
  const [formData, setFormData] = useState<UserForm>(emptyForm)
  const [selectedId, setSelectedId] = useState<Id<'users'> | null>(null)
  const [newRole, setNewRole] = useState('')

  // Queries
  const allUsers = useQuery(api.users.listAll)

  // Mutations
  const createMutation = useMutation(api.users.create)
  const updateMutation = useMutation(api.users.updateUser)
  const deleteMutation = useMutation(api.users.deleteUser)

  const usersLoading = allUsers === undefined

  // Load selected user into form
  const handleSelectUser = (id: Id<'users'>) => {
    setSelectedId(id)
    const user = allUsers?.find((u) => u._id === id)
    if (user) {
      setFormData({
        id: user._id,
        workosUserId: user.workosUserId,
        displayName: user.displayName,
        roles: [...user.roles],
        metadata: user.metadata,
      })
    }
  }

  // Clear form
  const handleNewUser = () => {
    setSelectedId(null)
    setFormData(emptyForm)
  }

  // Save user
  const handleSave = async () => {
    try {
      // Validation
      if (!formData.workosUserId.trim()) {
        alert('WorkOS User ID is required')
        return
      }
      if (!formData.displayName.trim()) {
        alert('Display Name is required')
        return
      }

      if (formData.id) {
        // Update existing user
        await updateMutation({
          id: formData.id,
          displayName: formData.displayName,
          roles: formData.roles,
          metadata: formData.metadata,
        })
      } else {
        // Create new user
        await createMutation({
          workosUserId: formData.workosUserId,
          displayName: formData.displayName,
          roles: formData.roles,
          metadata: formData.metadata,
        })
      }

      // Reset form
      handleNewUser()
      alert('User saved successfully!')
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Error saving user: ' + (error as Error).message)
    }
  }

  // Delete user
  const handleDelete = async (id: Id<'users'>) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      await deleteMutation({ id })
      if (selectedId === id) {
        handleNewUser()
      }
      alert('User deleted successfully!')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user: ' + (error as Error).message)
    }
  }

  // Add role to user
  const handleAddRole = () => {
    if (!newRole.trim()) return
    if (formData.roles.includes(newRole.trim())) {
      alert('Role already exists')
      return
    }
    setFormData({
      ...formData,
      roles: [...formData.roles, newRole.trim()],
    })
    setNewRole('')
  }

  // Remove role from user
  const handleRemoveRole = (role: string) => {
    setFormData({
      ...formData,
      roles: formData.roles.filter((r) => r !== role),
    })
  }

  // Quick toggle admin role
  const toggleAdminRole = () => {
    if (formData.roles.includes('admin')) {
      handleRemoveRole('admin')
    } else {
      setFormData({
        ...formData,
        roles: [...formData.roles, 'admin'],
      })
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel - User List */}
      <div className="w-2/5 border-r border-border flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-foreground">Users</h2>
            <button
              onClick={handleNewUser}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Plus size={16} />
              New
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            {allUsers?.length || 0} users
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {usersLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          )}
          {!usersLoading && allUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users yet. Create one!
            </div>
          )}
          {allUsers?.map((user) => (
            <div
              key={user._id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedId === user._id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
              onClick={() => handleSelectUser(user._id)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <User
                    size={16}
                    className="flex-shrink-0 text-muted-foreground mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.displayName || 'Unnamed User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.workosUserId}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(user._id)
                  }}
                  className="p-1 hover:bg-destructive/10 text-destructive rounded cursor-pointer flex-shrink-0"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {user.roles.length === 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full border bg-muted text-muted-foreground border-border">
                    No roles
                  </span>
                )}
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                      role === 'admin'
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'bg-secondary/10 text-secondary-foreground border-secondary/30'
                    }`}
                  >
                    {role === 'admin' && <Shield size={10} />}
                    {role}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - User Form */}
      <div className="w-3/5 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            {formData.id ? 'Edit User' : 'New User'}
          </h2>

          <div className="space-y-6">
            {/* WorkOS User ID */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                WorkOS User ID *
              </label>
              <input
                type="text"
                value={formData.workosUserId}
                onChange={(e) =>
                  setFormData({ ...formData, workosUserId: e.target.value })
                }
                disabled={!!formData.id}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="user_01ABC..."
              />
              {formData.id && (
                <p className="text-xs text-muted-foreground mt-1">
                  WorkOS User ID cannot be changed after creation
                </p>
              )}
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Display Name *
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="John Doe"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Name displayed throughout the application
              </p>
            </div>

            {/* Roles Section */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Roles
              </label>

              {/* Quick Admin Toggle */}
              <div className="mb-3 p-3 border border-border rounded-lg bg-card">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes('admin')}
                    onChange={toggleAdminRole}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <Shield size={16} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Administrator
                  </span>
                </label>
                <p className="text-xs text-muted-foreground mt-1 ml-6">
                  Full access to admin panel and all features
                </p>
              </div>

              {/* Current Roles */}
              {formData.roles.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    Current roles:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.roles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full border bg-secondary/10 text-secondary-foreground border-secondary/30"
                      >
                        {role}
                        <button
                          onClick={() => handleRemoveRole(role)}
                          className="hover:bg-destructive/20 rounded-full p-0.5 cursor-pointer"
                          aria-label={`Remove ${role} role`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Role */}
              <div>
                <label className="block text-xs text-muted-foreground mb-2">
                  Add custom role:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddRole()
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., moderator, premium"
                  />
                  <button
                    onClick={handleAddRole}
                    className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Metadata (JSON)
              </label>
              <textarea
                value={
                  formData.metadata
                    ? JSON.stringify(formData.metadata, null, 2)
                    : ''
                }
                onChange={(e) => {
                  try {
                    const parsed = e.target.value
                      ? JSON.parse(e.target.value)
                      : undefined
                    setFormData({ ...formData, metadata: parsed })
                  } catch {
                    // Invalid JSON - still update the field for user to fix
                    setFormData({ ...formData, metadata: e.target.value })
                  }
                }}
                rows={6}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={'{\n  "key": "value"\n}'}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional: Store additional user data as JSON
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors cursor-pointer"
              >
                {formData.id ? 'Update User' : 'Create User'}
              </button>
              <button
                onClick={handleNewUser}
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
