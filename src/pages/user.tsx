import {useState} from 'react'
import {MoreHorizontal, Plus, Search, Shield, User as UserIcon, UserCheck, UserX} from 'lucide-react'
import {Badge} from '@/components/ui/badge'
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
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
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
import {Pagination} from '@/components/pagination'
import {NextPageWithLayout} from '@/pages/_app'
import RootLayout from '@/components/layout'
import {trpc} from '@/utils/trpc'
import {useAuthorization} from '@/hooks/use-authorization'

const getRoleColor = (role: string) => {
	switch (role) {
		case 'administrator':
			return 'bg-purple-100 text-purple-800 hover:bg-purple-100'
		case 'member':
			return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
		default:
			return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
	}
}

const getStatusColor = (status: string) => {
	switch (status) {
		case 'active':
			return 'bg-green-100 text-green-800 hover:bg-green-100'
		case 'inactive':
			return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
		default:
			return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
	}
}

const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})
}

interface UserFormData {
	fullname: string
	username: string
	password: string
}


const Page: NextPageWithLayout = () => {
	useAuthorization(true)
	
	const {data: users = [], refetch: refetchGetUsers} = trpc.getUsers.useQuery({})
	const {data: totalUsers = 0} = trpc.getTotalUsers.useQuery({})
	const {data: totalAdministrators = 0} = trpc.getTotalUsers.useQuery({
		role: 'Administrator'
	})
	const {data: totalMembers = 0} = trpc.getTotalUsers.useQuery({
		role: 'Member'
	})
	
	const [editingUser, setEditingUser] = useState<typeof users[0] | null>(null)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
	const [formData, setFormData] = useState<UserFormData>({
		fullname: '',
		username: '',
		password: ''
	})
	
	const resetForm = () => {
		setFormData({fullname: '', username: '', password: ''})
		setEditingUser(null)
	}
	
	const {mutate: createMutation} = trpc.createUser.useMutation({
		onSuccess: () => {
			resetForm()
			refetchGetUsers()
			setIsAddDialogOpen(false)
		}
	})
	const {mutate: updateMutation} = trpc.updateUser.useMutation({
		onSuccess: () => {
			resetForm()
			refetchGetUsers()
			setIsEditDialogOpen(false)
		}
	})
	const {mutate: deleteMutation} = trpc.deleteUser.useMutation({
		onSuccess: () => {
			refetchGetUsers()
		}
	})
	
	const [searchTerm, setSearchTerm] = useState('')
	const [roleFilter, setRoleFilter] = useState('all')
	
	
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage, setItemsPerPage] = useState(10)
	
	const totalPages = Math.ceil(totalUsers / itemsPerPage)
	
	const handleAddUser = () => {
		if (!formData.fullname || !formData.username || !formData.password) return
		
		createMutation({
			fullname: formData.fullname,
			username: formData.username,
			password: formData.password,
			roleId: 2
		})
	}
	
	const handleEditUser = () => {
		if (!editingUser || !formData.fullname || !formData.username) return
		
		updateMutation({
			...formData,
			id: editingUser.id
		})
	}

	const openEditDialog = (user: typeof users[0]) => {
		setEditingUser(user)
		setFormData(user)
		setIsEditDialogOpen(true)
	}
	
	const handlePageChange = (page: number) => {
		setCurrentPage(page)
	}
	
	const handleItemsPerPageChange = (newItemsPerPage: number) => {
		setItemsPerPage(newItemsPerPage)
		setCurrentPage(1)
	}
	
	const resetPagination = () => {
		setCurrentPage(1)
	}
	
	return (
		<div className="p-6 space-y-6">
			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Users</CardTitle>
						<UserIcon className="h-4 w-4 text-muted-foreground"/>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalUsers}</div>
						<p className="text-xs text-muted-foreground">All registered users</p>
					</CardContent>
				</Card>
				
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Administrators</CardTitle>
						<Shield className="h-4 w-4 text-muted-foreground"/>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalAdministrators}</div>
						<p className="text-xs text-muted-foreground">System administrators</p>
					</CardContent>
				</Card>
				
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Members</CardTitle>
						<UserCheck className="h-4 w-4 text-muted-foreground"/>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalMembers}</div>
						<p className="text-xs text-muted-foreground">Regular members</p>
					</CardContent>
				</Card>
				
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Users</CardTitle>
						<UserCheck className="h-4 w-4 text-muted-foreground"/>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalUsers}</div>
						<p className="text-xs text-muted-foreground">Currently active</p>
					</CardContent>
				</Card>
			</div>
			
			{/* Main Content */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>User Management</CardTitle>
							<CardDescription>Manage system users and their permissions</CardDescription>
						</div>
						<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
							<DialogTrigger asChild>
								<Button onClick={resetForm}>
									<Plus className="h-4 w-4 mr-2"/>
									Add User
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Add New User</DialogTitle>
									<DialogDescription>Create a new user account with specified role and
										permissions.</DialogDescription>
								</DialogHeader>
								<div className="grid gap-4 py-4">
									<div className="grid gap-2">
										<Label htmlFor="name">Full Name</Label>
										<Input
											id="name"
											value={formData.fullname}
											onChange={(e) => setFormData({...formData, fullname: e.target.value})}
											placeholder="Enter full name"
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="username">Username</Label>
										<Input
											id="username"
											type="text"
											value={formData.username}
											onChange={(e) => setFormData({...formData, username: e.target.value})}
											placeholder="Enter username"
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="password">Password</Label>
										<Input
											id="password"
											type="password"
											onChange={(e) => setFormData({...formData, password: e.target.value})}
											placeholder="Enter password"
										/>
									</div>
								</div>
								<DialogFooter>
									<Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
										Cancel
									</Button>
									<Button onClick={handleAddUser}>Add User</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
					
					{/* Filters and Search */}
					<div className="flex flex-col sm:flex-row gap-4 pt-4">
						<div className="relative flex-1">
							<Search
								className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
							<Input
								placeholder="Search users..."
								value={searchTerm}
								onChange={(e) => {
									setSearchTerm(e.target.value)
									resetPagination()
								}}
								className="pl-10"
							/>
						</div>
						
						<Select
							value={roleFilter}
							onValueChange={(value) => {
								setRoleFilter(value)
								resetPagination()
							}}
						>
							<SelectTrigger className="w-[140px]">
								<SelectValue placeholder="Role"/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Roles</SelectItem>
								<SelectItem value="administrator">Administrator</SelectItem>
								<SelectItem value="member">Member</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				
				<CardContent>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>User</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Last Login</TableHead>
									<TableHead>Created</TableHead>
									<TableHead className="w-[50px]"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.map((user) => (
									<TableRow key={user.id}>
										<TableCell>
											<div className="flex items-center gap-3">
												<div
													className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
													{user.fullname.at(0)}
												</div>
												<div>
													<div className="font-medium">{user.fullname}</div>
													<div className="text-sm text-muted-foreground">{user.username}</div>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="secondary" className={getRoleColor(user.role.name)}>
												{user.role.name === 'Administrator' ? (
													<>
														<Shield className="h-3 w-3 mr-1"/>
														Administrator
													</>
												) : (
													<>
														<UserIcon className="h-3 w-3 mr-1"/>
														Member
													</>
												)}
											</Badge>
										</TableCell>
										<TableCell>
											<Badge variant="secondary"
												   className={getStatusColor(user.createdAt ? 'active' : 'inactive')}>
												{user.createdAt ? 'Active' : 'Inactive'}
											</Badge>
										</TableCell>
										<TableCell
											className="text-sm text-muted-foreground">{formatDate(user.updatedAt.toString())}</TableCell>
										<TableCell
											className="text-sm text-muted-foreground">{formatDate(user.createdAt.toString())}</TableCell>
										<TableCell>
											{user.role.name !== 'Administrator' && (
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<MoreHorizontal className="h-4 w-4"/>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onClick={() => openEditDialog(user)}>
															Edit User
														</DropdownMenuItem>
														<DropdownMenuSeparator/>
														{user.role.name !== 'Administrator' && (
															<AlertDialog>
																<AlertDialogTrigger asChild>
																	<DropdownMenuItem
																		onSelect={(e) => e.preventDefault()}
																		className="text-red-600">
																		<UserX className="h-4 w-4 mr-2"/>
																		Delete User
																	</DropdownMenuItem>
																</AlertDialogTrigger>
																<AlertDialogContent>
																	<AlertDialogHeader>
																		<AlertDialogTitle>Delete User</AlertDialogTitle>
																		<AlertDialogDescription>
																			Are you sure you want to
																			delete {user.fullname}?
																			This action cannot be undone and will
																			remove all associated data.
																		</AlertDialogDescription>
																	</AlertDialogHeader>
																	<AlertDialogFooter>
																		<AlertDialogCancel>Cancel</AlertDialogCancel>
																		<AlertDialogAction
																			onClick={() => deleteMutation({id: user.id})}
																			className="bg-red-600 hover:bg-red-700"
																		>
																			Delete User
																		</AlertDialogAction>
																	</AlertDialogFooter>
																</AlertDialogContent>
															</AlertDialog>
														)}
													</DropdownMenuContent>
												</DropdownMenu>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
					
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						totalItems={totalUsers}
						itemsPerPage={itemsPerPage}
						onPageChange={handlePageChange}
						onItemsPerPageChange={handleItemsPerPageChange}
					/>
					
					{users.length === 0 && (
						<div className="text-center py-8">
							<UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
							<h3 className="text-lg font-medium">No users found</h3>
							<p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
						</div>
					)}
				</CardContent>
			</Card>
			
			{/* Edit User Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit User</DialogTitle>
						<DialogDescription>Update user information and permissions.</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="edit-name">Full Name</Label>
							<Input
								id="edit-name"
								value={formData.fullname}
								onChange={(e) => setFormData({...formData, fullname: e.target.value})}
								placeholder="Enter full name"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-email">Username</Label>
							<Input
								id="edit-email"
								type="username"
								value={formData.username}
								onChange={(e) => setFormData({...formData, username: e.target.value})}
								placeholder="Enter username"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-email">Password</Label>
							<Input
								id="edit-password"
								type="password"
								onChange={(e) => setFormData({...formData, password: e.target.value})}
								placeholder="Enter new password"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleEditUser}>Save Changes</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}

Page.getLayout = (page) => (
	<RootLayout>{page}</RootLayout>
)

export default Page