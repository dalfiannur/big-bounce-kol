import {useState} from 'react'
import {Search, Ticket} from 'lucide-react'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table'
import {Pagination} from '@/components/pagination'
import {useAuthorization} from '@/hooks/use-authorization'
import {trpc} from '@/utils/trpc'

const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})
}

export const AdminDashboard = () => {
	useAuthorization(true)
	
	const [search, setSearch] = useState('')
	const [page, setPage] = useState(1)
	const [itemsPerPage, setItemsPerPage] = useState(10)
	
	const {data: totalPublicFollowers = 0} = trpc.getTotalFollowers.useQuery({
		hasMember: false
	})
	const {data: totalFollowers = 0} = trpc.getTotalFollowers.useQuery({
		hasMember: true
	})
	const {data: followers = []} = trpc.getFollowers.useQuery({
		hasMember: false,
		search,
		page
	})
	
	const totalPages = Math.ceil(totalPublicFollowers / itemsPerPage)
	
	return (
		<div className="p-6">
			<>
				{/* Stats Cards */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Public Register</CardTitle>
							<Ticket className="h-4 w-4 text-muted-foreground"/>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{totalPublicFollowers}</div>
							<p className="text-xs text-muted-foreground">All time</p>
						</CardContent>
					</Card>
					
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Follower K.O.L</CardTitle>
							<div className="h-2 w-2 rounded-full bg-blue-500"/>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{totalFollowers}</div>
							<p className="text-xs text-muted-foreground">All time</p>
						</CardContent>
					</Card>
				</div>
				
				{/* Main Content */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Public Register</CardTitle>
								<CardDescription>Track public register</CardDescription>
							</div>
						</div>
						
						{/* Filters and Search */}
						<div className="flex flex-col sm:flex-row gap-4 pt-4">
							<div className="relative flex-1">
								<Search
									className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
								<Input
									placeholder="Search by name"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
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
										<TableHead>Full Name</TableHead>
										<TableHead>Phone Number</TableHead>
										<TableHead>Event Join Date</TableHead>
										<TableHead>Added On</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{followers.map((follower) => (
										<TableRow key={follower.id} className="cursor-pointer hover:bg-muted/50">
											<TableCell>
												<div>
													<div className="font-medium">{follower.id}</div>
													<div
														className="text-sm text-muted-foreground line-clamp-1">{follower.fullname}</div>
												</div>
											</TableCell>
											<TableCell>
												<div>
													<div className="font-medium">{follower.phoneNumber}</div>
													<div
														className="text-sm text-muted-foreground">{follower.phoneNumber}</div>
												</div>
											</TableCell>
											<TableCell>
												<div>{formatDate(follower.arrivalDate)}</div>
											</TableCell>
											<TableCell
												className="text-sm text-muted-foreground">{formatDate(follower.createdAt)}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
						
						<Pagination
							currentPage={page}
							totalPages={totalPages}
							totalItems={totalPublicFollowers}
							itemsPerPage={itemsPerPage}
							onPageChange={setPage}
							onItemsPerPageChange={setItemsPerPage}
						/>
						
						{totalPublicFollowers === 0 && (
							<div className="text-center py-8">
								<Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
								<h3 className="text-lg font-medium">No data found</h3>
								<p className="text-muted-foreground">
									Try adjusting your search or filter criteria.
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</>
		</div>
	)
}
