import { io } from 'socket.io-client';

console.log('process.env.NEXT_PUBLIC_APP_URL', process.env.NEXT_PUBLIC_APP_URL);

const socket = io(process.env.NEXT_PUBLIC_APP_URL);

export default socket;
