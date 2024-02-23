/* eslint-disable @typescript-eslint/no-empty-interface */
import http from 'http'
import { Server } from 'socket.io'

export interface ServerToClientEvents {
	noArg: () => void
	basicEmit: (a: number, b: string, c: Buffer) => void
	withAck: (d: string, callback: (e: number) => void) => void
}

export interface ClientToServerEvents {}

export interface InterServerEvents {}

export interface SocketData {}

const connectSocketIO = (server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) => {
	const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
		cors: {
			// origin: "http://localhost:3000", //* base url from front end
			methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
		}
	})
	io.on('connection', (socket) => {
		console.log('User connected:>>', socket.id)
		socket.on('disconnect', () => console.log('User disconnected!'))
	})
}

export default connectSocketIO
