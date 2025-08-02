import type {AppProps, AppType} from 'next/app'
import {trpc} from '@/utils/trpc'
import {ReactElement, ReactNode} from 'react'
import {NextPage} from 'next'
import '../globals.css'

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
	getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout
}

const MyApp: AppType = ({Component, pageProps}: AppPropsWithLayout) => {
	const getLayout = Component.getLayout ?? ((page) => page)
	return getLayout(<Component {...pageProps} />)
}

export default trpc.withTRPC(MyApp)