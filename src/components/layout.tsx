import '../globals.css'
import {Geist, Geist_Mono} from 'next/font/google'
import {LogOutIcon, Ticket} from 'lucide-react'
import Link from 'next/link'
import {Button} from '@/components/ui/button'
import {ReactNode} from 'react'
import {usePathname, useRouter} from 'next/navigation'
import {useAuthorization} from '@/hooks/use-authorization'
import {useUser} from '@/hooks/use-user'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin']
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin']
})

export default function RootLayout({children}: Readonly<{ children: ReactNode; }>) {
	useAuthorization()
	
	const pathname = usePathname()
	const user = useUser()
	const router = useRouter()
	
	const isAdmin = user?.role.name === 'Administrator'
	
	const logout = () => {
		localStorage.removeItem('access_token')
		localStorage.removeItem('user')
		router.push('/login')
	}
	
	return (
		<div className={`min-h-screen bg-gray-50/50 ${geistSans.variable} ${geistMono.variable} antialiased`}>
			<header className="border-b bg-white">
				<div className="flex h-16 items-center px-6">
					<div className="flex items-center gap-2">
						<Ticket className="h-6 w-6 text-blue-600"/>
						<h1 className="text-xl font-semibold">Support Dashboard</h1>
					</div>
					<nav className="ml-8 flex items-center gap-6">
						<Link
							href="/"
							className={`text-sm font-medium transition-colors hover:text-primary ${
								pathname === '/' ? 'text-foreground border-b-2 border-blue-600 pb-4' : 'text-muted-foreground'
							}`}
						>
							Dashboard
						</Link>
						
						{isAdmin && (
							<>
								<Link
									href="/user"
									className={`text-sm font-medium transition-colors hover:text-primary ${
										pathname === '/user' ? 'text-foreground border-b-2 border-blue-600 pb-4' : 'text-muted-foreground'
									}`}
								>
									User Management
								</Link>
								<Link
									href="/follower"
									className={`text-sm font-medium transition-colors hover:text-primary ${
										pathname === '/follower'
											? 'text-foreground border-b-2 border-blue-600 pb-4'
											: 'text-muted-foreground'
									}`}
								>
									Monitor Followers
								</Link>
							</>
						)}
					</nav>
					<div className="ml-auto flex items-center gap-4">
						<Button onClick={logout}>
							<LogOutIcon className="h-4 w-4 mr-2"/>
							Logout
						</Button>
					</div>
				</div>
			</header>
			
			{children}
		</div>
	)
}
