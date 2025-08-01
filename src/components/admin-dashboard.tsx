import {useState} from 'react'
import {Clock, MoreHorizontal, Search, Ticket} from 'lucide-react'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {Input} from '@/components/ui/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table'
import {Pagination} from '@/components/pagination'

// Mock data for tickets
const tickets = [
	{
		id: 'TK-001',
		title: 'Login issues with mobile app',
		customer: 'John Smith',
		email: 'john.smith@email.com',
		status: 'open',
		priority: 'high',
		assignee: 'Sarah Wilson',
		created: '2024-01-15T10:30:00Z',
		updated: '2024-01-15T14:20:00Z',
		category: 'Technical'
	},
	{
		id: 'TK-002',
		title: 'Billing inquiry for December invoice',
		customer: 'Emily Johnson',
		email: 'emily.j@company.com',
		status: 'in-progress',
		priority: 'medium',
		assignee: 'Mike Chen',
		created: '2024-01-15T09:15:00Z',
		updated: '2024-01-15T13:45:00Z',
		category: 'Billing'
	},
	{
		id: 'TK-003',
		title: 'Feature request: Dark mode support',
		customer: 'Alex Rodriguez',
		email: 'alex.r@startup.io',
		status: 'resolved',
		priority: 'low',
		assignee: 'Sarah Wilson',
		created: '2024-01-14T16:20:00Z',
		updated: '2024-01-15T11:30:00Z',
		category: 'Feature Request'
	},
	{
		id: 'TK-004',
		title: 'Cannot access dashboard after update',
		customer: 'Lisa Chen',
		email: 'lisa.chen@corp.com',
		status: 'open',
		priority: 'critical',
		assignee: 'David Park',
		created: '2024-01-15T08:45:00Z',
		updated: '2024-01-15T12:15:00Z',
		category: 'Technical'
	},
	{
		id: 'TK-005',
		title: 'Password reset not working',
		customer: 'Robert Taylor',
		email: 'r.taylor@business.net',
		status: 'in-progress',
		priority: 'high',
		assignee: 'Mike Chen',
		created: '2024-01-15T07:30:00Z',
		updated: '2024-01-15T10:45:00Z',
		category: 'Account'
	}
]

const getStatusColor = (status: string) => {
	switch (status) {
		case 'open':
			return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
		case 'in-progress':
			return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
		case 'resolved':
			return 'bg-green-100 text-green-800 hover:bg-green-100'
		case 'closed':
			return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
		default:
			return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
	}
}

const getPriorityColor = (priority: string) => {
	switch (priority) {
		case 'critical':
			return 'bg-red-100 text-red-800 hover:bg-red-100'
		case 'high':
			return 'bg-orange-100 text-orange-800 hover:bg-orange-100'
		case 'medium':
			return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
		case 'low':
			return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
		default:
			return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
	}
}

const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})
}

export const AdminDashboard = () => {
	const [searchTerm, setSearchTerm] = useState('')
	const [statusFilter, setStatusFilter] = useState('all')
	const [priorityFilter, setPriorityFilter] = useState('all')
	const [activeTab, setActiveTab] = useState('dashboard')
	const [currentUserRole] = useState('administrator') // Simulating admin user
	
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage, setItemsPerPage] = useState(10)
	
	const allFilteredTickets = tickets.filter((ticket) => {
		const matchesSearch =
			ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
			ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
		const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
		
		return matchesSearch && matchesStatus && matchesPriority
	})
	
	const totalPages = Math.ceil(allFilteredTickets.length / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage
	const filteredTickets = allFilteredTickets.slice(startIndex, startIndex + itemsPerPage)
	
	const handlePageChange = (page: number) => {
		setCurrentPage(page)
	}
	
	const handleItemsPerPageChange = (newItemsPerPage: number) => {
		setItemsPerPage(newItemsPerPage)
		setCurrentPage(1) // Reset to first page when changing items per page
	}
	
	const resetPagination = () => {
		setCurrentPage(1)
	}
	
	const handleSearchChange = (value: string) => {
		setSearchTerm(value)
		resetPagination()
	}
	
	const handleStatusFilterChange = (value: string) => {
		setStatusFilter(value)
		resetPagination()
	}
	
	const handlePriorityFilterChange = (value: string) => {
		setPriorityFilter(value)
		resetPagination()
	}
	
	const stats = {
		total: tickets.length,
		open: tickets.filter((t) => t.status === 'open').length,
		inProgress: tickets.filter((t) => t.status === 'in-progress').length,
		resolved: tickets.filter((t) => t.status === 'resolved').length,
		avgResponseTime: '2.4 hours'
	}
	
	return (
		<div className="p-6">
			{activeTab === 'dashboard' && (
				<>
					{/* Stats Cards */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
								<Ticket className="h-4 w-4 text-muted-foreground"/>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stats.total}</div>
								<p className="text-xs text-muted-foreground">All time</p>
							</CardContent>
						</Card>
						
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Open</CardTitle>
								<div className="h-2 w-2 rounded-full bg-blue-500"/>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stats.open}</div>
								<p className="text-xs text-muted-foreground">Awaiting response</p>
							</CardContent>
						</Card>
						
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">In Progress</CardTitle>
								<div className="h-2 w-2 rounded-full bg-yellow-500"/>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stats.inProgress}</div>
								<p className="text-xs text-muted-foreground">Being worked on</p>
							</CardContent>
						</Card>
						
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Resolved</CardTitle>
								<div className="h-2 w-2 rounded-full bg-green-500"/>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stats.resolved}</div>
								<p className="text-xs text-muted-foreground">This week</p>
							</CardContent>
						</Card>
						
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Avg Response</CardTitle>
								<Clock className="h-4 w-4 text-muted-foreground"/>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stats.avgResponseTime}</div>
								<p className="text-xs text-muted-foreground">Last 30 days</p>
							</CardContent>
						</Card>
					</div>
					
					{/* Main Content */}
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Support Tickets</CardTitle>
									<CardDescription>Manage and track customer support requests</CardDescription>
								</div>
							</div>
							
							{/* Filters and Search */}
							<div className="flex flex-col sm:flex-row gap-4 pt-4">
								<div className="relative flex-1">
									<Search
										className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
									<Input
										placeholder="Search tickets..."
										value={searchTerm}
										onChange={(e) => handleSearchChange(e.target.value)}
										className="pl-10"
									/>
								</div>
								
								<Select value={statusFilter} onValueChange={handleStatusFilterChange}>
									<SelectTrigger className="w-[140px]">
										<SelectValue placeholder="Status"/>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Status</SelectItem>
										<SelectItem value="open">Open</SelectItem>
										<SelectItem value="in-progress">In Progress</SelectItem>
										<SelectItem value="resolved">Resolved</SelectItem>
										<SelectItem value="closed">Closed</SelectItem>
									</SelectContent>
								</Select>
								
								<Select value={priorityFilter} onValueChange={handlePriorityFilterChange}>
									<SelectTrigger className="w-[140px]">
										<SelectValue placeholder="Priority"/>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Priority</SelectItem>
										<SelectItem value="critical">Critical</SelectItem>
										<SelectItem value="high">High</SelectItem>
										<SelectItem value="medium">Medium</SelectItem>
										<SelectItem value="low">Low</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardHeader>
						
						<CardContent>
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Ticket</TableHead>
											<TableHead>Customer</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Priority</TableHead>
											<TableHead>Assignee</TableHead>
											<TableHead>Updated</TableHead>
											<TableHead className="w-[50px]"></TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredTickets.map((ticket) => (
											<TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50">
												<TableCell>
													<div>
														<div className="font-medium">{ticket.id}</div>
														<div
															className="text-sm text-muted-foreground line-clamp-1">{ticket.title}</div>
													</div>
												</TableCell>
												<TableCell>
													<div>
														<div className="font-medium">{ticket.customer}</div>
														<div
															className="text-sm text-muted-foreground">{ticket.email}</div>
													</div>
												</TableCell>
												<TableCell>
													<Badge variant="secondary"
														   className={getStatusColor(ticket.status)}>
														{ticket.status.replace('-', ' ')}
													</Badge>
												</TableCell>
												<TableCell>
													<Badge variant="secondary"
														   className={getPriorityColor(ticket.priority)}>
														{ticket.priority}
													</Badge>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<div
															className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium">
															{ticket.assignee
																.split(' ')
																.map((n) => n[0])
																.join('')}
														</div>
														<span className="text-sm">{ticket.assignee}</span>
													</div>
												</TableCell>
												<TableCell
													className="text-sm text-muted-foreground">{formatDate(ticket.updated)}</TableCell>
												<TableCell>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="icon">
																<MoreHorizontal className="h-4 w-4"/>
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem>View Details</DropdownMenuItem>
															<DropdownMenuItem>Edit Ticket</DropdownMenuItem>
															<DropdownMenuItem>Assign Agent</DropdownMenuItem>
															<DropdownMenuSeparator/>
															<DropdownMenuItem>Close Ticket</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
							
							<Pagination
								currentPage={currentPage}
								totalPages={totalPages}
								totalItems={allFilteredTickets.length}
								itemsPerPage={itemsPerPage}
								onPageChange={handlePageChange}
								onItemsPerPageChange={handleItemsPerPageChange}
							/>
							
							{allFilteredTickets.length === 0 && (
								<div className="text-center py-8">
									<Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
									<h3 className="text-lg font-medium">No tickets found</h3>
									<p className="text-muted-foreground">Try adjusting your search or filter
										criteria.</p>
								</div>
							)}
						</CardContent>
					</Card>
				</>
			)}
		</div>
	)
}
