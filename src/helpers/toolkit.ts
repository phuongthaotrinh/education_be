/* eslint-disable */

// so sánh 2 ngày với nhau
export const compareDates = (date1: Date, date2: Date): number => {
	try {
		const d1 = new Date(formatDate(date1))
		const d2 = new Date(formatDate(date2))

		if (d1.getTime() === d2.getTime()) {
			return 0
		} else if (d1.getTime() > d2.getTime()) {
			return 1
		} else {
			return -1
		}
	} catch (error) {
		throw error
	}
}

// format date MM-DD-YYYY
export const formatDate = (date: Date): string => {
	try {
		let month = '' + (date.getMonth() + 1)
		let day = '' + date.getDate()
		const year = date.getFullYear()

		if (month.length < 2) {
			month = '0' + month
		}

		if (day.length < 2) {
			day = '0' + day
		}

		return [month, day, year].join('-')
	} catch (error) {
		throw error
	}
}

export const toCapitalize = (value: string) => {
	value = value.trim().replace(/\s+/g, ' ')
	const subString = value.split(' ')
	const result = subString.map((str) => str.at(0)?.toUpperCase() + str.slice(1).toLowerCase()).join(' ')
	return result
}

export const getFileSize = (fileSize: number): string => {
	fileSize = +fileSize
	switch (true) {
		case fileSize / 1000000000 > 1:
			return (fileSize / 1000000000).toFixed(2) + 'gb'
		case fileSize / 1000000 > 1:
			return (fileSize / 1000000).toFixed(2) + 'mb'
		case fileSize / 1000 > 1:
			return (fileSize / 1000).toFixed(2) + 'kb'
		default:
			return fileSize + 'bytes'
	}
}

export const toUpperCase = (value: string) => {
	if (!value || typeof value !== 'string') return
	return value.trim().replace(/\s+/g, ' ').toUpperCase()
}
