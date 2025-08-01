import {useEffect} from 'react'
import {useRouter} from 'next/navigation'

export const useAuthorization = () => {
	const router = useRouter()
	
	useEffect(() => {
		const accessToken = localStorage.getItem('access_token')
		if (!accessToken) {
			router.push('/login')
		}
	}, [])
}