import {useEffect, useState} from 'react'
import {Role, User} from '@/generated/prisma'

export const useUser = () => {
	const [user, setUser] = useState<User & { role: Role } | null>(null)
	
	useEffect(() => {
		const userTmp = localStorage.getItem('user')
		if (userTmp) {
			setUser(JSON.parse(userTmp))
		}
	}, [])
	
	return user
}