import prisma from '@/lib/prisma'

export async function GET(request: Request) {
	const data = await prisma.role.findMany()
	return new Response(JSON.stringify({
		data
	}))
}