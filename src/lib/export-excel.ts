import * as XLSX from 'xlsx'
import prisma from '@/lib/prisma'

//Date Formater to DD/MM/YYYY
const formatDate = (date: Date) => {
	const day = String(date.getDate()).padStart(2, '0')
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const year = date.getFullYear()
	return `${day}/${month}/${year}`
}

export const exportExcel = async () => {
	const followers = await prisma.follower.findMany({
		where: {
			memberId: {
				not: null
			}
		},
		include: {
			member: true
		}
	})
	const publicFollowers = await prisma.follower.findMany({
		where: {
			memberId: null
		}
	})
	const users = await prisma.user.findMany({
		where: {
			username: {
				not: 'magenta'
			}
		}
	})
	
	const workbook = XLSX.utils.book_new()
	const worksheet = XLSX.utils.json_to_sheet(followers.map((f, index) => ({
		no: index + 1,
		name: f.fullname,
		phone: f.phoneNumber,
		joinDate: formatDate(f.arrivalDate),
		kol: f.member?.fullname
	})))
	const worksheet2 = XLSX.utils.json_to_sheet(users.map((u, index) => ({
		no: index + 1,
		username: u.username,
		fullname: u.fullname
	})))
	const worksheet3 = XLSX.utils.json_to_sheet(publicFollowers.map((f, index) => ({
		no: index + 1,
		name: f.fullname,
		phone: f.phoneNumber,
		joinDate: formatDate(f.arrivalDate)
	})))
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Followers')
	XLSX.utils.book_append_sheet(workbook, worksheet2, 'KOL')
	XLSX.utils.book_append_sheet(workbook, worksheet3, 'Public Followers')
	
	return XLSX.write(workbook, {type: 'buffer', bookType: 'xlsx'})
}