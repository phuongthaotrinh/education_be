/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'dotenv/config'
import { drive_v3, google } from 'googleapis'
import { Stream } from 'stream'
import { drive } from '../../configs/googleApis.config'
import removeVietnameseTones from '../../helpers/vnFullTextSearch'

// Creates a permission for a file or shared drive.
const setFilePublic = async (fileId: string) => {
	await drive.permissions.create({
		fileId,
		requestBody: {
			role: 'reader',
			type: 'anyone'
		}
	})
	return drive.files.get({
		fileId,
		fields: 'webViewLink, webContentLink'
	})
}

export const uploadFile = async (file: Express.Multer.File, dir: string = process.env.FOLDER_ID!) => {
	/* tạo nơi lưu trữ file tạm thời (buffer) -> file sẽ được upload qua stream */
	const bufferStream = new Stream.PassThrough()
	bufferStream.end(file.buffer)
	const createdFile = await drive.files.create({
		requestBody: {
			name: removeVietnameseTones(file.originalname),
			parents: [dir]
		},
		media: {
			body: bufferStream
			/* file được upload lấy từ buffer đã được lưu trữ tạm thời trước đó */
		},
		fields: 'id,size'
	} as drive_v3.Params$Resource$Files$Create)
	await setFilePublic(createdFile.data.id as string)
	return createdFile
}

export const deleteFile = async (fileId: string) => {
	try {
		return await drive.files.delete({ fileId })
	} catch (error) {
		return Promise.resolve(error) // inore error after delete file on google drive successfully
	}
}
