import type React from 'react'
import {useState} from 'react'
import {Eye, EyeOff, Lock, Mail, Ticket} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Checkbox} from '@/components/ui/checkbox'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {useRouter} from 'next/navigation'
import {trpc} from '@/utils/trpc'
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog'

const Page = () => {
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [rememberMe, setRememberMe] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const router = useRouter()
	
	const {mutate: loginMutation} = trpc.login.useMutation({
		onSuccess: (data) => {
			localStorage.setItem('access_token', data.accessToken)
			localStorage.setItem('user', JSON.stringify(data.user))
			setIsLoading(false)
			router.push('/dashboard')
		},
		onError(error) {
			setErrorMessage(error.message)
		}
	})
	
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setError('')
		
		loginMutation({
			username,
			password
		})
	}
	
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="flex items-center justify-center gap-2 mb-4">
						<div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
							<Ticket className="h-6 w-6 text-white"/>
						</div>
						<h1 className="text-2xl font-bold text-gray-900">Support Dashboard</h1>
					</div>
					<p className="text-gray-600">Sign in to access your account</p>
				</div>
				
				{/* Login Card */}
				<Card className="shadow-lg border-0">
					<CardHeader className="space-y-1 pb-4">
						<CardTitle className="text-2xl font-semibold text-center">Welcome back</CardTitle>
						<CardDescription className="text-center">Enter your credentials to access the
							dashboard</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							{error && (
								<Alert variant="destructive">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}
							
							<div className="space-y-2">
								<Label htmlFor="email">Email address</Label>
								<div className="relative">
									<Mail
										className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
									<Input
										id="username"
										type="text"
										placeholder="Enter your username"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										className="pl-10"
										required
									/>
								</div>
							</div>
							
							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<div className="relative">
									<Lock
										className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
									<Input
										id="password"
										type={showPassword ? 'text' : 'password'}
										placeholder="Enter your password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="pl-10 pr-10"
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
									>
										{showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
									</button>
								</div>
							</div>
							
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<Checkbox
										id="remember"
										checked={rememberMe}
										onCheckedChange={(checked) => setRememberMe(checked as boolean)}
									/>
									<Label htmlFor="remember" className="text-sm text-gray-600">
										Remember me
									</Label>
								</div>
								<button type="button"
										className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
									Forgot password?
								</button>
							</div>
							
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? 'Signing in...' : 'Sign in'}
							</Button>
						</form>
					</CardContent>
				</Card>
				
				{/* Footer */}
				<div className="mt-8 text-center text-sm text-gray-600">
					<p>{`Don't have an account? Contact your administrator`}</p>
					<p className="mt-2">© 2024 Support Dashboard. All rights reserved.</p>
				</div>
			</div>
			
			<Dialog open={!!errorMessage}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Error</DialogTitle>
					</DialogHeader>
					<p>{errorMessage}</p>
					<DialogFooter>
						<Button onClick={() => setErrorMessage(null)}>OK</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default Page