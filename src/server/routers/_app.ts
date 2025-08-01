import {procedure, router} from '../trpc'
import prisma from '@/lib/prisma'
import {z} from 'zod'
import {Prisma} from '@/app/generated/prisma'
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
			accessToken: sign({sub: user.username}, 'qwerty123')
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
		.query(async ({input}) => {
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
	})).mutation(async ({input}) => {
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
	})).mutation(async ({input}) => {
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
	})).mutation(async ({input}) => {
		const {id} = input
		
		return prisma.user.delete({
			where: {id}
		})
	}),
	
	getTotalFollowers: procedure.query(async ({}) => {
		return prisma.follower.count()
	}),
	
	getFollowers: procedure.input(z.object({
		page: z.number().optional().default(1),
		search: z.string().optional(),
		memberId: z.number().optional().nullish()
	})).query(async ({input}) => {
		const where: Prisma.FollowerWhereInput = {}
		
		if (input.search) {
			where.OR = [
				{
					member: {
						fullname: {
							contains: `%${input.search}%`
						}
					}
				},
				{
					fullname: {
						contains: `%${input.search}%`
					}
				}
			]
		}
		
		if (input.memberId) {
			where.memberId = input.memberId
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
	})).mutation(async ({input}) => {
		return prisma.follower.create({
			data: {
				...input,
				arrivalDate: new Date(input.arrivalDate),
				memberId: 2
			}
		})
	}),
	
	updateFollower: procedure.input(z.object({
		id: z.number(),
		fullname: z.string(),
		phoneNumber: z.string(),
		arrivalDate: z.string()
	})).mutation(async ({input}) => {
		const {id, arrivalDate, ...rest} = input
		return prisma.follower.update({
			where: {
				id
			},
			data: {
				...rest,
				arrivalDate: new Date(arrivalDate),
				memberId: 2
			}
		})
	}),
	
	deleteFollower: procedure.input(z.object({
		id: z.number()
	})).mutation(async ({input}) => {
		const {id} = input
		return prisma.follower.delete({
			where: {
				id
			}
		})
	})
})

export type AppRouter = typeof appRouter;