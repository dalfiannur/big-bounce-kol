import {useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {useUser} from '@/hooks/use-user'

export const useAuthorization = (isAdmin: boolean) => {
	const router = useRouter()
	const user = useUser()
	
	useEffect(() => {
		const accessToken = localStorage.getItem('access_token')
		if (!accessToken) {
			router.push('/login')
		}
		
		if (!isAdmin && user && user.role.name !== 'Administrator') {
			router.push('/login')
		}
	}, [user, router, isAdmin])
}