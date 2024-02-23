import { paramsStringify } from './queryParams'

const randomHexColor = () => {
	const RanHexColor = Math.floor(Math.random() * 16777215).toString(16)
	return RanHexColor
}

const generatePictureByName = (char: string) => {
	return (
		'https://ui-avatars.com/api/' +
		paramsStringify({
			name: char
		})
	)
}

export default generatePictureByName
