import {exportExcel} from '@/lib/export-excel'
import {Readable} from 'node:stream'
import {NextApiRequest, NextApiResponse} from 'next'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
	//Set Header for XLSX File
	response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
	response.setHeader('Content-Disposition', 'attachment; filename=data.xlsx')
	
	// Generate XLSX File, return a buffer
	const buffer = await exportExcel()
	const stream = Readable.from(buffer)
	stream.pipe(response)
}