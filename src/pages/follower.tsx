import {useState} from 'react'
import {Calendar, Phone, Search, Shield, User, Users} from 'lucide-react'
import {Badge} from '@/components/ui/badge'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table'
import {Pagination} from '@/components/pagination'
import {NextPageWithLayout} from '@/pages/_app'
import RootLayout from '@/components/layout'
import {trpc} from '@/utils/trpc'
import {useUser} from '@/hooks/use-user'
import {useAuthorization} from '@/hooks/use-authorization'

const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	})
}

const formatDateTime = (dateString: string) => {
	return new Date(dateString).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})
}

const Page: NextPageWithLayout = () => {
	useAuthorization(true)
	
	const user = useUser()
	
	const [page, setPage] = useState(1)
	const [search, setSearchTerm] = useState('')
	const [memberId, setMemberId] = useState<number | undefined>(undefined)
	
	const {data: totalFollowers = 0} = trpc.getTotalFollowers.useQuery({
		hasMember: false
	})
	const {data: totalMembers = 0} = trpc.getTotalUsers.useQuery({
		role: 'Member'
	})
	const {data: members = []} = trpc.getUsers.useQuery({
		role: 'Member'
	})
	const {data: followers = []} = trpc.getFollowers.useQuery({
		page,
		search,
		memberId,
		hasMember: true
	})
	
	const [itemsPerPage, setItemsPerPage] = useState(10)
	
	const totalPages = Math.ceil(totalFollowers / itemsPerPage)
	
	const handlePageChange = (page: number) => {
		setPage(page)
	}
	
	const handleItemsPerPageChange = (newItemsPerPage: number) => {
		setItemsPerPage(newItemsPerPage)
		setPage(1)
	}
	
	const resetPagination = () => {
		setPage(1)
	}
	
	if (user?.role.name !== 'Administrator') {
		return (
			<div className="text-center py-12">
				<Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
				<h3 className="text-lg font-medium">Access Restricted</h3>
				<p className="text-muted-foreground">Only administrators can monitor followers.</p>
			</div>
		)
	}
	
	return (
		<div className="space-y-6 p-6">
			<Card className="bg-purple-50 border-purple-200">
				<CardHeader>
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
							<Shield className="h-5 w-5 text-purple-600"/>
						</div>
						<div>
							<CardTitle className="text-purple-900">Administrator Dashboard</CardTitle>
							<CardDescription className="text-purple-700">
								Monitor all member followers across the system
							</CardDescription>
						</div>
					</div>
				</CardHeader>
			</Card>
			
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Followers</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground"/>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalFollowers}</div>
						<p className="text-xs text-muted-foreground">Across all members</p>
					</CardContent>
				</Card>
				
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Members</CardTitle>
						<User className="h-4 w-4 text-muted-foreground"/>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalMembers}</div>
						<p className="text-xs text-muted-foreground">With follower access</p>
					</CardContent>
				</Card>
				
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Average per Member</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground"/>
					</CardHeader>
					<CardContent>
						<div
							className="text-2xl font-bold">{Math.round((totalFollowers / totalMembers) * 10) / 10}</div>
						<p className="text-xs text-muted-foreground">Followers per member</p>
					</CardContent>
				</Card>
			</div>
			
			<Card>
				<CardHeader>
					<CardTitle>Member Overview</CardTitle>
					<CardDescription>Follower distribution across members</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{members.map((member) => (
							<Card key={member.id} className="border-l-4 border-l-blue-500">
								<CardContent className="pt-4">
									<div className="flex items-center justify-between">
										<div>
											<div className="font-medium">{member.fullname}</div>
											<div className="text-sm text-muted-foreground">{member.username}</div>
										</div>
										<div className="text-right">
											<div className="text-2xl font-bold">{member.followers.length}</div>
											<div className="text-xs text-muted-foreground">followers</div>
										</div>
									</div>
									<div className="mt-2 flex items-center gap-4 text-sm">
										<span
											className="text-muted-foreground">{0} upcoming events</span>
										<Badge variant="outline" className="text-xs">
											{member.followers.length}/10 slots
										</Badge>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>
			
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>All Followers</CardTitle>
							<CardDescription>Complete list of followers across all members</CardDescription>
						</div>
					</div>
					
					<div className="flex flex-col sm:flex-row gap-4 pt-4">
						<div className="relative flex-1">
							<Search
								className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
							<Input
								placeholder="Search followers or members..."
								value={search}
								onChange={(e) => {
									setSearchTerm(e.target.value)
									resetPagination()
								}}
								className="pl-10"
							/>
						</div>
						
						<Select
							value={memberId?.toString()}
							onValueChange={(value) => {
								setMemberId(+value)
								resetPagination()
							}}
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Filter by Member"/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Members</SelectItem>
								{members.map((member) => (
									<SelectItem key={member.id} value={member.id.toString()}>
										{member.fullname}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				
				<CardContent>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Follower</TableHead>
									<TableHead>KOL</TableHead>
									<TableHead>Phone Number</TableHead>
									<TableHead>Event Join Date</TableHead>
									<TableHead>Added On</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{followers.map((follower) => (
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
													<div
														className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium">
														{follower.member?.fullname
															.split(' ')
															.map((n) => n[0])
															.join('')}
													</div>
													<span className="text-sm">{follower.member?.fullname}</span>
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
											<TableCell className="text-sm text-muted-foreground">
												{formatDateTime(follower.createdAt)}
											</TableCell>
										</TableRow>
									)
								)}
							</TableBody>
						</Table>
					</div>
					
					<Pagination
						currentPage={page}
						totalPages={totalPages}
						totalItems={totalFollowers}
						itemsPerPage={itemsPerPage}
						onPageChange={handlePageChange}
						onItemsPerPageChange={handleItemsPerPageChange}
					/>
					
					{totalFollowers === 0 && (
						<div className="text-center py-8">
							<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
							<h3 className="text-lg font-medium">No followers found</h3>
							<p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}

Page.getLayout = (page) => (
	<RootLayout>{page}</RootLayout>
)

export default Page