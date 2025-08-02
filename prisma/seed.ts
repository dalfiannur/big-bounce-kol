import {Prisma, PrismaClient} from '../src/generated/prisma'
import {genSaltSync, hashSync} from 'bcrypt'

const prisma = new PrismaClient()

const roleData: Prisma.RoleCreateInput[] = [
	{
		id: 1,
		name: 'Administrator'
	},
	{
		id: 2,
		name: 'Member'
	}
]

const userData: Prisma.UserCreateInput[] = [
	{
		fullname: 'Administrator',
		username: 'magenta',
		password: hashSync('magentasatu2025', genSaltSync()),
		role: {
			connect: {
				id: 1
			}
		}
	}
]

export async function main() {
	for (const r of roleData) {
		await prisma.role.create({data: r})
	}
	for (const u of userData) {
		await prisma.user.create({data: u})
	}
}

main()