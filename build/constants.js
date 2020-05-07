"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENTRY_CLIENT = 'client';
exports.ENTRY_SERVER = 'server';
exports.DEFAULT_LISTEN_PORT = 3000;
exports.DEFAULT_LISTEN_BASE = '/';
exports.DEFAULT_REDIRECT_URL = '/';
exports.DEFAULT_REDIRECT_STATUS = 301;
exports.DEFAULT_CLIENT_PORT = 8080;
exports.DEFAULT_SERVER_PORT = 8081;
exports.DEFAULT_SECRET_SALT = '"7-!~9tdMYa=;Ps3';
exports.DEFAULT_OPTIONS = {
    bundler: {
        flag: '-b, --bundler <webpack>',
        description: 'Which tool to use to bundle assets (only webpack is supported right now)',
    },
    base: {
        flag: '--base </>',
        description: 'Base html tag to listen for the server',
    },
    nodePort: {
        flag: '-p --node-port <3000>',
        description: 'Port to listen for server side rendering server',
    },
    clientConfig: {
        flag: '-c, --client-config <config.client.js>',
        description: 'Path to bundler tool client config',
    },
    clientPort: {
        flag: '--client-port <8080>',
        description: 'Port to listen for client bundler',
    },
    serverConfig: {
        flag: '-s --server-config <config.server.js>',
        description: 'Path to bundler tool server config',
    },
    serverPort: {
        flag: '--server-port <8081>',
        description: 'Port to listen for server bundler',
    },
};
