import * as trpcNext from '@trpc/server/adapters/next'
import {verify} from 'jsonwebtoken'

export async function createContext({req}: trpcNext.CreateNextContextOptions) {
	async function getUserFromHeader() {
		if (req.headers.authorization) {
			const decoded = verify(req.headers.authorization.split(' ')[1], 'qwerty123')
			return decoded as never as { id: number, username: string, role: string }
		}
		return null
	}
	
	const user = await getUserFromHeader()
	return {
		user
	}
}

export type Context = Awaited<ReturnType<typeof createContext>>;