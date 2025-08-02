import type React from 'react'
import {useState} from 'react'
import {CalendarIcon, PhoneIcon, Ticket, UserIcon} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {trpc} from '@/utils/trpc'
import {NextPageWithLayout} from '@/pages/_app'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {format} from 'date-fns'
import {Calendar} from '@/components/ui/calendar'

const Page: NextPageWithLayout = () => {
	const [formData, setFormData] = useState({
		fullname: '',
		phoneNumber: '',
		arrivalDate: ''
	})
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	
	const {mutate} = trpc.createFollower.useMutation({
		onSuccess: () => {
			setIsLoading(false)
			alert('Success')
		}
	})
	
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setError('')
		
		mutate(formData)
	}
	
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<div className="flex items-center justify-center gap-2 mb-4">
						<div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
							<Ticket className="h-6 w-6 text-white"/>
						</div>
						<h1 className="text-2xl font-bold text-gray-900">K.O.L Monitoring</h1>
					</div>
				</div>
				
				<Card className="shadow-lg border-0">
					<CardHeader className="space-y-1 pb-4">
						<CardTitle className="text-2xl font-semibold text-center">Welcome</CardTitle>
						<CardDescription className="text-center">
							Please fill in the form below.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							{error && (
								<Alert variant="destructive">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}
							
							<div className="space-y-2">
								<Label htmlFor="fullname">Full Name</Label>
								<div className="relative">
									<UserIcon
										className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
									<Input
										id="fullname"
										placeholder="Enter your full name"
										onChange={(e) => setFormData(prev => ({...prev, fullname: e.target.value}))}
										className="pl-10"
										required
									/>
								</div>
							</div>
							
							<div className="space-y-2">
								<Label htmlFor="phoneNumber">Phone Number</Label>
								<div className="relative">
									<PhoneIcon
										className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
									<Input
										id="phoneNumber"
										placeholder="Enter your phone number"
										onChange={(e) => setFormData(prev => ({...prev, phoneNumber: e.target.value}))}
										className="pl-10 pr-10"
										required
									/>
								</div>
							</div>
							
							<div className="space-y-2">
								<Label htmlFor="password">Join Date</Label>
								<div className="relative w-full">
									<CalendarIcon
										className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												data-empty={!formData.arrivalDate}
												className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
											>
												<CalendarIcon/>
												{formData.arrivalDate ? format(formData.arrivalDate, 'PPP') :
													<span>Pick a date</span>}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0">
											<Calendar
												mode="single"
												className="w-full"
												captionLayout="dropdown"
												onSelect={(event) => setFormData((prev) => ({
													...prev,
													arrivalDate: event?.toLocaleDateString() || ''
												}))}
											/>
										</PopoverContent>
									</Popover>
								</div>
							</div>
							
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? 'Submitting...' : 'Submit'}
							</Button>
						</form>
					</CardContent>
				</Card>
				
				<div className="mt-8 text-center text-sm text-gray-600">
					<p className="mt-2">© {new Date().getFullYear()} Support Dashboard. All rights reserved.</p>
				</div>
			</div>
		</div>
	)
}

export default Page