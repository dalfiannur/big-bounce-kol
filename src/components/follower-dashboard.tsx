import {useState} from 'react'
import {Calendar, MoreHorizontal, Phone, Plus, Search, User, Users} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import {trpc} from '@/utils/trpc'
import {useUser} from '@/hooks/use-user'
import {Badge} from '@/components/ui/badge'

const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	})
}

interface FollowerFormData {
	fullname: string
	phoneNumber: string
	arrivalDate: string
}

export const FollowerDashboard = () => {
	const user = useUser()
	
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [page] = useState(1)
	const [search, setSearch] = useState('')
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [editingFollower, setEditingFollower] = useState<typeof followers[0] | null>(null)
	const [formData, setFormData] = useState<FollowerFormData>({
		fullname: '',
		phoneNumber: '',
		arrivalDate: ''
	})
	
	const {data: followers = [], refetch: refetchFollowers} = trpc.getFollowers.useQuery({
		page,
		search
	})
	const {data: totalFollowers = 0, refetch: refetchTotalFollowers} = trpc.getTotalFollowers.useQuery({})
	
	const refetch = () => {
		refetchFollowers()
		refetchTotalFollowers()
	}
	
	const {mutate: createMutation} = trpc.createFollower.useMutation({
		onMutate() {
			setIsLoading(true)
			setErrorMessage(null)
		},
		onSuccess: () => {
			refetch()
			setFormData({fullname: '', phoneNumber: '', arrivalDate: ''})
			setIsAddDialogOpen(false)
			setIsLoading(false)
		},
		onError: (error) => {
			setErrorMessage(error.message)
			setIsLoading(false)
		}
	})
	const {mutate: updateMutation} = trpc.updateFollower.useMutation({
		onSuccess: () => {
			refetch()
			setEditingFollower(null)
			setFormData({fullname: '', phoneNumber: '', arrivalDate: ''})
			setIsEditDialogOpen(false)
		}
	})
	const {mutate: deleteMutation} = trpc.deleteFollower.useMutation({
		onSuccess: () => {
			refetch()
		}
	})
	
	const handleAddFollower = () => {
		if (!formData.fullname || !formData.phoneNumber || !formData.arrivalDate) return
		
		if (followers.length >= 10) {
			alert('You have reached the maximum limit of 10 followers.')
			return
		}
		
		createMutation(formData)
	}
	
	const handleEditFollower = () => {
		if (!editingFollower || !formData.fullname || !formData.phoneNumber || !formData.arrivalDate) return
		
		updateMutation({
			id: editingFollower.id,
			...formData
		})
	}
	
	const openEditDialog = (follower: typeof followers[0]) => {
		setEditingFollower(follower)
		setFormData(follower)
		setIsEditDialogOpen(true)
	}
	
	const resetForm = () => {
		setFormData({fullname: '', phoneNumber: '', arrivalDate: ''})
		setEditingFollower(null)
	}
	
	if (!user) {
		return (
			<div className="text-center py-12">
				<Users className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
				<h3 className="text-lg font-medium">Access Restricted</h3>
				<p className="text-muted-foreground">Only members can manage followers.</p>
			</div>
		)
	}
	
	return (
		<div className="space-y-6 p-6">
			{/* Member Info */}
			<Card className="bg-blue-50 border-blue-200">
				<CardHeader>
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
							<User className="h-5 w-5 text-blue-600"/>
						</div>
						<div>
							<CardTitle className="text-blue-900">Welcome, {user.fullname}</CardTitle>
							<CardDescription className="text-blue-700">Manage your event followers</CardDescription>
						</div>
					</div>
				</CardHeader>
			</Card>
			
			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">My Followers</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground"/>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalFollowers}</div>
						<p className="text-xs text-muted-foreground">Total followers</p>
					</CardContent>
				</Card>
				
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Remaining Slots</CardTitle>
						<Plus className="h-4 w-4 text-muted-foreground"/>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{10 - totalFollowers}</div>
						<p className="text-xs text-muted-foreground">Out of {10} allowed</p>
					</CardContent>
				</Card>
				
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground"/>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{new Date().toLocaleDateString()}</div>
						<p className="text-xs text-muted-foreground">Future join dates</p>
					</CardContent>
				</Card>
				
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Limit Status</CardTitle>
						<div className={`h-2 w-2 rounded-full ${totalFollowers < 10 ? 'bg-green-500' : 'bg-red-500'}`}/>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{Math.round((totalFollowers / 10) * 100)}%</div>
						<p className="text-xs text-muted-foreground">Capacity used</p>
					</CardContent>
				</Card>
			</div>
			
			<Card>
				<CardHeader>
					<div className="flex flex-col md:flex-row items-center justify-between">
						<div>
							<CardTitle>My Followers</CardTitle>
							<CardDescription>Manage your event followers (Maximum 10 allowed)</CardDescription>
						</div>
						<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
							<DialogTrigger asChild>
								<Button onClick={resetForm} disabled={followers.length === 10} className="w-full md:w-auto">
									<Plus className="h-4 w-4 mr-2"/>
									Add Follower {followers.length === 10 && '(Limit Reached)'}
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Add New Follower</DialogTitle>
									<DialogDescription>
										Add a new follower to your event list. You can have up to 10 followers.
									</DialogDescription>
								</DialogHeader>
								<div className="grid gap-4 py-4">
									<div className="grid gap-2">
										<Label htmlFor="fullName">Full Name</Label>
										<Input
											id="fullName"
											value={formData.fullname}
											onChange={(e) => setFormData({...formData, fullname: e.target.value})}
											placeholder="Enter full name"
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="phoneNumber">Phone Number</Label>
										<Input
											id="phoneNumber"
											type="tel"
											value={formData.phoneNumber}
											onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
											placeholder="Enter phone number"
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="dateToJoinEvent">Date to Join Event</Label>
										<Input
											id="dateToJoinEvent"
											type="date"
											value={formData.arrivalDate.toString()}
											onChange={(e) => setFormData({
												...formData,
												arrivalDate: e.target.value
											})}
										/>
									</div>
								</div>
								<DialogFooter>
									<Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
										Cancel
									</Button>
									<Button disabled={isLoading}
											onClick={handleAddFollower}
									>
										Add Follower
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
					
					{/* Search */}
					<div className="flex flex-col sm:flex-row gap-4 pt-4">
						<div className="relative flex-1">
							<Search
								className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
							<Input
								placeholder="Search followers by name or phone..."
								value={search}
								onChange={(e) => {
									setSearch(e.target.value)
								}}
								className="pl-10"
							/>
						</div>
					</div>
				</CardHeader>
				
				<CardContent>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Follower</TableHead>
									<TableHead>Phone Number</TableHead>
									<TableHead>Event Join Date</TableHead>
									<TableHead>Added On</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="w-[50px]"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{followers.map((follower) => {
									const isUpcoming = new Date(follower.arrivalDate) > new Date()
									const isToday = new Date(follower.arrivalDate).toDateString() === new Date().toDateString()
									
									return (
										<TableRow key={follower.id}>
											<TableCell>
												<div className="flex items-center gap-3">
													<div
														className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium">
														{follower.fullname
															.split(' ')
															.map((n) => n[0])
															.join('')
															.toUpperCase()}
													</div>
													<div>
														<div className="font-medium">{follower.fullname}</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Phone className="h-4 w-4 text-muted-foreground"/>
													<span className="font-mono text-sm">{follower.phoneNumber}</span>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Calendar className="h-4 w-4 text-muted-foreground"/>
													<span>{formatDate(follower.arrivalDate)}</span>
												</div>
											</TableCell>
											<TableCell
												className="text-sm text-muted-foreground">{formatDate(follower.createdAt)}</TableCell>
											<TableCell>
												<Badge
													variant="secondary"
													className={
														isToday
															? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
															: isUpcoming
																? 'bg-green-100 text-green-800 hover:bg-green-100'
																: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
													}
												>
													{isToday ? 'Today' : isUpcoming ? 'Upcoming' : 'Past'}
												</Badge>
											</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<MoreHorizontal className="h-4 w-4"/>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onClick={() => openEditDialog(follower)}>Edit
															Follower</DropdownMenuItem>
														<DropdownMenuSeparator/>
														<AlertDialog>
															<AlertDialogTrigger asChild>
																<DropdownMenuItem onSelect={(e) => e.preventDefault()}
																				  className="text-red-600">
																	Delete Follower
																</DropdownMenuItem>
															</AlertDialogTrigger>
															<AlertDialogContent>
																<AlertDialogHeader>
																	<AlertDialogTitle>Delete Follower</AlertDialogTitle>
																	<AlertDialogDescription>
																		Are you sure you want to
																		remove {follower.fullname} from your followers
																		list? This
																		action cannot be undone.
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<AlertDialogCancel>Cancel</AlertDialogCancel>
																	<AlertDialogAction
																		onClick={() => deleteMutation({id: follower.id})}
																		className="bg-red-600 hover:bg-red-700"
																	>
																		Delete Follower
																	</AlertDialogAction>
																</AlertDialogFooter>
															</AlertDialogContent>
														</AlertDialog>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									)
								})}
							</TableBody>
						</Table>
					</div>
					
					{followers.length === 0 && (
						<div className="text-center py-8">
							<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
							<h3 className="text-lg font-medium">No followers found</h3>
							<p className="text-muted-foreground">
								{followers.length === 0
									? 'Start by adding your first follower to the event.'
									: 'Try adjusting your search criteria.'}
							</p>
						</div>
					)}
				</CardContent>
			</Card>
			
			{/* Edit Follower Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Follower</DialogTitle>
						<DialogDescription>Update follower information and event details.</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="edit-fullName">Full Name</Label>
							<Input
								id="edit-fullName"
								value={formData.fullname}
								onChange={(e) => setFormData({...formData, fullname: e.target.value})}
								placeholder="Enter full name"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-phoneNumber">Phone Number</Label>
							<Input
								id="edit-phoneNumber"
								type="tel"
								value={formData.phoneNumber}
								onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
								placeholder="Enter phone number"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-dateToJoinEvent">Date to Join Event</Label>
							<Input
								id="edit-dateToJoinEvent"
								type="date"
								value={formData.arrivalDate.toString()}
								onChange={(e) => setFormData({...formData, arrivalDate: e.target.value})}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleEditFollower}>Save Changes</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			
			<Dialog open={!!errorMessage}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Error</DialogTitle>
					</DialogHeader>
					<p>{errorMessage}</p>
					<DialogFooter>
						<Button onClick={() => setErrorMessage(null)}>Ok</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}