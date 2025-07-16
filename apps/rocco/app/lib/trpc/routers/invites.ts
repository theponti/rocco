import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { list, listInvite } from "../../../db/schema";
import { protectedProcedure, router } from "../context";

export const invitesRouter = router({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.user) {
			throw new Error("User not found in context");
		}

		const userInvites = await ctx.db.query.listInvite.findMany({
			where: eq(listInvite.invitedUserEmail, ctx.user.email),
		});

		return userInvites;
	}),

	create: protectedProcedure
		.input(
			z.object({
				listId: z.string().uuid(),
				invitedUserEmail: z.string().email(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error("User not found in context");
			}

			// Check if user owns the list
			const listItem = await ctx.db.query.list.findFirst({
				where: and(eq(list.id, input.listId), eq(list.userId, ctx.user.id)),
			});

			if (!listItem) {
				throw new Error(
					"List not found or you don't have permission to invite users to it",
				);
			}

			// Check if invite already exists
			const existingInvite = await ctx.db.query.listInvite.findFirst({
				where: and(
					eq(listInvite.listId, input.listId),
					eq(listInvite.invitedUserEmail, input.invitedUserEmail),
				),
			});

			if (existingInvite) {
				throw new Error("Invite already exists for this user and list");
			}

			const newInvite = await ctx.db
				.insert(listInvite)
				.values({
					...input,
					userId: ctx.user.id,
				})
				.returning();

			return newInvite[0];
		}),

	accept: protectedProcedure
		.input(
			z.object({
				listId: z.string().uuid(),
				invitedUserEmail: z.string().email(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error("User not found in context");
			}

			// Verify the invite is for the current user
			if (input.invitedUserEmail !== ctx.user.email) {
				throw new Error("You can only accept invites sent to your email");
			}

			const updatedInvite = await ctx.db
				.update(listInvite)
				.set({
					accepted: true,
					acceptedAt: new Date().toISOString(),
					invitedUserId: ctx.user.id,
				})
				.where(
					and(
						eq(listInvite.listId, input.listId),
						eq(listInvite.invitedUserEmail, input.invitedUserEmail),
					),
				)
				.returning();

			if (updatedInvite.length === 0) {
				throw new Error("Invite not found");
			}

			return updatedInvite[0];
		}),

	decline: protectedProcedure
		.input(
			z.object({
				listId: z.string().uuid(),
				invitedUserEmail: z.string().email(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error("User not found in context");
			}

			// Verify the invite is for the current user
			if (input.invitedUserEmail !== ctx.user.email) {
				throw new Error("You can only decline invites sent to your email");
			}

			const deletedInvite = await ctx.db
				.delete(listInvite)
				.where(
					and(
						eq(listInvite.listId, input.listId),
						eq(listInvite.invitedUserEmail, input.invitedUserEmail),
					),
				)
				.returning();

			if (deletedInvite.length === 0) {
				throw new Error("Invite not found");
			}

			return { success: true };
		}),
});
