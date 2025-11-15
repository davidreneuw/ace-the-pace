import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * Get or create a user by WorkOS user ID
 * Returns the user record, creating it if it doesn't exist
 */
export const getOrCreateUser = mutation({
  args: {
    workosUserId: v.string(),
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('workosUserId', (q) => q.eq('workosUserId', args.workosUserId))
      .first()

    if (existingUser) {
      return existingUser
    }

    // Create new user with empty roles array
    const userId = await ctx.db.insert('users', {
      workosUserId: args.workosUserId,
      displayName: args.displayName || '',
      roles: [],
    })

    return await ctx.db.get(userId)
  },
})

/**
 * Get user by WorkOS user ID
 */
export const getUserByWorkosId = query({
  args: {
    workosUserId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('workosUserId', (q) => q.eq('workosUserId', args.workosUserId))
      .first()
  },
})

/**
 * Check if a user has a specific role
 */
export const hasRole = query({
  args: {
    workosUserId: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('workosUserId', (q) => q.eq('workosUserId', args.workosUserId))
      .first()

    if (!user) {
      return false
    }

    return user.roles.includes(args.role)
  },
})

/**
 * Add a role to a user (admin only)
 */
export const addRole = mutation({
  args: {
    workosUserId: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('workosUserId', (q) => q.eq('workosUserId', args.workosUserId))
      .first()

    if (!user) {
      throw new Error('User not found')
    }

    // Don't add duplicate roles
    if (user.roles.includes(args.role)) {
      return user
    }

    await ctx.db.patch(user._id, {
      roles: [...user.roles, args.role],
    })

    return await ctx.db.get(user._id)
  },
})

/**
 * Remove a role from a user (admin only)
 */
export const removeRole = mutation({
  args: {
    workosUserId: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('workosUserId', (q) => q.eq('workosUserId', args.workosUserId))
      .first()

    if (!user) {
      throw new Error('User not found')
    }

    await ctx.db.patch(user._id, {
      roles: user.roles.filter((r) => r !== args.role),
    })

    return await ctx.db.get(user._id)
  },
})

/**
 * Get all admin users
 */
export const getAdmins = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query('users').collect()
    return allUsers.filter((user) => user.roles.includes('admin'))
  },
})

/**
 * Update user metadata
 */
export const updateMetadata = mutation({
  args: {
    workosUserId: v.string(),
    metadata: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('workosUserId', (q) => q.eq('workosUserId', args.workosUserId))
      .first()

    if (!user) {
      throw new Error('User not found')
    }

    await ctx.db.patch(user._id, {
      metadata: args.metadata,
    })

    return await ctx.db.get(user._id)
  },
})

/**
 * List all users (admin only)
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('users').collect()
  },
})

/**
 * Create a new user
 */
export const create = mutation({
  args: {
    workosUserId: v.string(),
    displayName: v.string(),
    roles: v.array(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('workosUserId', (q) => q.eq('workosUserId', args.workosUserId))
      .first()

    if (existingUser) {
      throw new Error('User with this WorkOS ID already exists')
    }

    const userId = await ctx.db.insert('users', {
      workosUserId: args.workosUserId,
      displayName: args.displayName,
      roles: args.roles,
      metadata: args.metadata,
    })

    return await ctx.db.get(userId)
  },
})

/**
 * Update user roles and metadata
 */
export const updateUser = mutation({
  args: {
    id: v.id('users'),
    displayName: v.string(),
    roles: v.array(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      displayName: args.displayName,
      roles: args.roles,
      metadata: args.metadata,
    })

    return await ctx.db.get(args.id)
  },
})

/**
 * Delete a user
 */
export const deleteUser = mutation({
  args: {
    id: v.id('users'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})
