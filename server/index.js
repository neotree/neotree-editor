require('./env');

const postgres = require('postgres');
const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME;
const port = Number(process.env.PORT);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const sql = postgres(process.env.POSTGRES_DB_URL);

app.prepare().then(() => {
    (async () => {
        try {
            await sql`delete from nt_tmp_transactions`;
        } catch(e) {
            console.log(e);
            // do nothing
        }

        const httpServer = createServer(handler);

        const io = new Server(httpServer, {
            cors: '*',
            maxHttpBufferSize: 1e7,
            pingTimeout: 60000,
        });

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
            socket.on('file_uploaded', (...args) => onEvent('file_uploaded', ...args));
            socket.on('files_deleted', (...args) => onEvent('files_deleted', ...args));
            socket.on('in_progress', (...args) => {
                const [requestKey, action, loading] = args;
                onEvent(requestKey, action, loading);
            });
        });

        httpServer
            .once("error", (err) => {
                console.error(err);
                process.exit(1);
            })
            .listen(port, () => {
                console.log(`> Ready on http://${hostname}:${port}`);
            });
    })();
});
