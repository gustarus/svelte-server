export const ENTRY_CLIENT = 'client';
export const ENTRY_SERVER = 'server';
export const DEFAULT_LISTEN_PORT = 3000;
export const DEFAULT_LISTEN_BASE = '/';
export const DEFAULT_REDIRECT_URL = '/';
export const DEFAULT_REDIRECT_STATUS = 301;
export const DEFAULT_CLIENT_PORT = 8080;
export const DEFAULT_SERVER_PORT = 8081;
export const DEFAULT_SECRET_SALT = '"7-!~9tdMYa=;Ps3';
export const DEFAULT_OPTIONS = {
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
