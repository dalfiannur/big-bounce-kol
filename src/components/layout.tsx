import {Geist, Geist_Mono} from 'next/font/google'
import {LogOutIcon, Ticket} from 'lucide-react'
import Link from 'next/link'
import {Button} from '@/components/ui/button'
import {ReactNode} from 'react'
import {usePathname, useRouter} from 'next/navigation'
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
				<div className="flex h-auto md:h-16 items-center px-6 py-2">
					<div className="flex items-center gap-2">
						<Ticket className="h-6 w-6 text-blue-600"/>
						<h1 className="text-md md:text-xl font-semibold">Support Dashboard</h1>
					</div>
					<nav className="ml-8 flex items-center gap-6">
						{isAdmin && (
							<>
								<Link
									href="/dashboard"
									className={`text-sm font-medium transition-colors hover:text-primary ${
										pathname === '/dashboard' ? 'text-foreground border-b-2 border-blue-600 pb-4' : 'text-muted-foreground'
									}`}
								>
									Dashboard
								</Link>
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
								<a
									href="/api/export"
									className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
								>
									Export Data
								</a>
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
