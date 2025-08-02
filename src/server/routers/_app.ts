import {procedure, router} from '../trpc'
import prisma from '@/lib/prisma'
import {z} from 'zod'
import {Prisma} from '@/generated/prisma'
import {compareSync, genSaltSync, hashSync} from 'bcrypt'
import {TRPCError} from '@trpc/server'
import {sign} from 'jsonwebtoken'

export const appRouter = router({
	login: procedure.input(z.object({
		username: z.string(),
		password: z.string()
	})).mutation(async ({input}) => {
		const user = await prisma.user.findUnique({
			where: {
				username: input.username
			},
			include: {
				role: true
			}
		})
		
		if (!user) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Invalid Credentials'
			})
		}
		
		if (!compareSync(input.password, user.password)) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Invalid Credentials'
			})
		}
		
		return {
			user,
			accessToken: sign({id: user.id, username: user.username, role: user.role.name}, 'qwerty123')
		}
	}),
	
	getTotalUsers: procedure.input(z.object({
		role: z.string().optional()
	})).query(async ({input}) => {
		const where: Prisma.UserWhereInput = {}
		
		if (input.role) {
			where.role = {
				name: input.role
			}
		}
		
		return prisma.user.count({
			where
		})
	}),
	
	getUsers: procedure
		.input(z.object({
			role: z.string().optional(),
			orderBy: z.enum(['id', 'fullname', 'username', 'roleId', 'createdAt']).optional().default('createdAt'),
			orderSort: z.enum(['asc', 'desc']).optional().default('desc')
		}))
		.query(async ({input, ctx}) => {
			if (!ctx.user || ctx.user.role !== 'Administrator') {
				throw new TRPCError({
					message: 'Not Allowed',
					code: 'UNAUTHORIZED'
				})
			}
			
			const where: Prisma.UserWhereInput = {}
			if (input.role) {
				where.role = {
					name: input.role
				}
			}
			return prisma.user.findMany({
				where,
				orderBy: {
					[input.orderBy]: input.orderSort
				},
				include: {
					role: true,
					followers: true
				}
			})
		}),
	
	createUser: procedure.input(z.object({
		fullname: z.string(),
		username: z.string(),
		password: z.string(),
		roleId: z.number()
	})).mutation(async ({input, ctx}) => {
		if (!ctx.user || ctx.user.role !== 'Administrator') {
			throw new TRPCError({
				message: 'Not Allowed',
				code: 'UNAUTHORIZED'
			})
		}
		
		const {password, ...rest} = input
		return prisma.user.create({
			data: {
				...rest,
				password: hashSync(password, genSaltSync())
			}
		})
	}),
	
	updateUser: procedure.input(z.object({
		id: z.number(),
		fullname: z.string(),
		username: z.string(),
		password: z.string().optional()
	})).mutation(async ({input, ctx}) => {
		if (!ctx.user || ctx.user.role !== 'Administrator') {
			throw new TRPCError({
				message: 'Not Allowed',
				code: 'UNAUTHORIZED'
			})
		}
		
		const {id, password, ...rest} = input
		
		const data: Prisma.UserUpdateInput = rest
		
		if (password) {
			data.password = hashSync(password, genSaltSync())
		}
		
		return prisma.user.update({
			where: {id},
			data
		})
	}),
	
	deleteUser: procedure.input(z.object({
		id: z.number()
	})).mutation(async ({input, ctx}) => {
		if (!ctx.user || ctx.user.role !== 'Administrator') {
			throw new TRPCError({
				message: 'Not Allowed',
				code: 'UNAUTHORIZED'
			})
		}
		
		const {id} = input
		
		return prisma.user.delete({
			where: {id}
		})
	}),
	
	getTotalFollowers: procedure.input(z.object({
		hasMember: z.boolean().optional().default(false)
	})).query(async ({input}) => {
		const where: Prisma.FollowerWhereInput = {
			memberId: null
		}
		
		if (input.hasMember) {
			where.memberId = {
				not: null
			}
		}
		
		return prisma.follower.count({
			where
		})
	}),
	
	getFollowers: procedure
		.input(z.object({
			page: z.number().optional().default(1),
			search: z.string().optional(),
			memberId: z.number().optional().nullish(),
			hasMember: z.boolean().optional().default(false)
		}))
		.query(async ({input, ctx}) => {
			if (!ctx.user) {
				throw new TRPCError({
					message: 'Not Allowed',
					code: 'UNAUTHORIZED'
				})
			}
			
			const where: Prisma.FollowerWhereInput = {}
			
			if (input.search) {
				where.OR = [
					{
						member: {
							fullname: {
								contains: `%${input.search}%`,
								mode: 'insensitive'
							}
						}
					},
					{
						fullname: {
							contains: `%${input.search}%`,
							mode: 'insensitive'
						}
					}
				]
			}
			
			if (input.memberId) {
				where.memberId = input.memberId
			} else if (input.hasMember) {
				where.memberId = {
					not: null
				}
			} else if (ctx.user.role === 'Administrator') {
				where.memberId = null
			} else {
				where.memberId = ctx.user.id
			}
			
			const offset = input.page - 1
			const take = 10
			return prisma.follower.findMany({
				skip: offset * take,
				take,
				where,
				include: {
					member: true
				}
			})
		}),
	
	createFollower: procedure.input(z.object({
		fullname: z.string(),
		phoneNumber: z.string(),
		arrivalDate: z.string()
	})).mutation(async ({input, ctx}) => {
		if (!ctx.user) {
			return prisma.follower.create({
				data: {
					...input,
					arrivalDate: new Date(input.arrivalDate)
				}
			})
		}
		
		return prisma.follower.create({
			data: {
				...input,
				arrivalDate: new Date(input.arrivalDate),
				memberId: ctx.user.id
			}
		})
	}),
	
	updateFollower: procedure.input(z.object({
		id: z.number(),
		fullname: z.string(),
		phoneNumber: z.string(),
		arrivalDate: z.string()
	})).mutation(async ({input, ctx}) => {
		if (!ctx.user) {
			throw new TRPCError({
				message: 'Not Allowed',
				code: 'UNAUTHORIZED'
			})
		}
		
		const {id, arrivalDate, ...rest} = input
		return prisma.follower.update({
			where: {
				id
			},
			data: {
				...rest,
				arrivalDate: new Date(arrivalDate),
				memberId: ctx.user.id
			}
		})
	}),
	
	deleteFollower: procedure.input(z.object({
		id: z.number()
	})).mutation(async ({input, ctx}) => {
		if (!ctx.user) {
			throw new TRPCError({
				message: 'Not Allowed',
				code: 'UNAUTHORIZED'
			})
		}
		
		const {id} = input
		return prisma.follower.delete({
			where: {
				id,
				memberId: ctx.user.id
			}
		})
	})
})

export type AppRouter = typeof appRouter;