import {NextPageWithLayout} from '@/pages/_app'
import RootLayout from '@/components/layout'
import {AdminDashboard} from '@/components/admin-dashboard'
import {FollowerDashboard} from '@/components/follower-dashboard'
import {useUser} from '@/hooks/use-user'

const Page: NextPageWithLayout = () => {
	const user = useUser()
	return user?.role.name === 'Administrator' ? <AdminDashboard/> : <FollowerDashboard/>
}

Page.getLayout = (page) => (
	<RootLayout>{page}</RootLayout>
)

export default Page
