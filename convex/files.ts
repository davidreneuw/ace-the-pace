import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * Generate an upload URL for file uploads
 *
 * Usage from client:
 * 1. Call this mutation to get an upload URL
 * 2. POST the file to the returned URL
 * 3. The POST response will contain the storageId
 * 4. Use the storageId when creating/updating questions or categories
 */
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})

/**
 * Get a public URL for a stored file
 *
 * Usage from client:
 * Pass the storageId to get a temporary URL for displaying/downloading the file
 */
export const getFileUrl = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId)
  },
})

/**
 * Delete a file from storage
 *
 * Note: Be careful with this! Only delete files that are no longer
 * referenced by any questions, answers, or categories.
 */
export const deleteFile = mutation({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId)
  },
})

/**
 * Get metadata about a stored file (if you need it)
 */
export const getFileMetadata = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId)
    return {
      storageId: args.storageId,
      url,
    }
  },
})
