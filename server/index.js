require('./env');

const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME;
const port = Number(process.env.PORT);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer);

    io.on("connection", (socket) => {
        console.log('Client connected');

        const onEvent = (eventName, ...args) => {
            const cb = args.filter(arg => typeof arg === 'function')[0];
            args = args.filter(arg => typeof arg !== 'function');
            io.emit(eventName, ...args);
            if (cb) cb({ status: 'ok', });
        };

        socket.on('data_changed', (...args) => onEvent('data_changed', ...args));
        socket.on('mode_changed', (...args) => onEvent('mode_changed', ...args));
        socket.on('update_system', (...args) => onEvent('update_system', ...args));
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});
