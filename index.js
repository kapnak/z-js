const zprotocol = require('./zprotocol');
const zrfs = require('./zrfs');
const zdirectory = require('./zdirectory');
const {setOptions} = require('./zrfs/utils');


let defaults = {
    localKp: undefined,
    directory: undefined
};


let ready = new Promise(async (resolve) => {
    await zprotocol.ready;
    let publicDirectory = {
        host: '176.166.203.236',
        port: 1501,
        pk: zprotocol.bs32toBytes('ak2zmeleqefpkxvb2u3smpr77vjnnkdfomdveyv7rvl3ejxwvy3a')
    };
    defaults.localKp = zprotocol.generate_kp();
    defaults.directory = zdirectory.connect(publicDirectory.host, publicDirectory.port, publicDirectory.pk, {});
    resolve();
});


/**
 * Set the default `local key pair` or `directory` to use.
 * @param {{pk: Uint8Array<32>, sk: Uint8Array<64>}|zdirectory.Directory} default_ - A kp or a directory.
 */
function use(default_) {
    if (default_ instanceof zdirectory.Directory)
        defaults.directory = default_;
    else if (default_ instanceof Object && default_.pk !== undefined && default_.sk !== undefined)
        defaults.localKp = default_;
    else
        throw Error('Incorrect argument, the argument needs to be an instance of Directory ' +
            'or a key pair ({pk: Uint8Array<32>, sk: Uint8Array<64>}).');
}


async function getConnectOptions(pk, options={}) {

    setOptions(options,
        {localKp: defaults.localKp, directory: defaults.directory, host: undefined, port: undefined});

    if (options.host === undefined || options.port === undefined) {
        if (options.directory === undefined)
            throw Error(
                '`host` and `port` are not provided but no directory is passed in options or defined by default.');

        let address = await options.directory.ask(pk);
        if (address === undefined)
            throw Error(`The directory don't know any address corresponding to the public key.`);
        address = parseAddress(address);
        options.host = address.host;
        options.port = address.port;
    }

    return options;
}

/**
 * Host a Z server (using ZProtocol).
 * @param {object} [options={}]
 * @param {{pk: Uint8Array<32>, sk: Uint8Array<64>}} [options.localKp=defaultLocalKp]
 * @param {string} [options.host='0.0.0.0'] - The host to listen to.
 * @param {number} [options.port=0] - The port to listen to.
 * @param {boolean} [options.register=false] - If true, a request will be sent to the directory to register the address
 * for the local key pair.
 * @param {Directory} [options.directory=defaultDirectory] - The directory use to register the public key if register
 * is true. Else it doesn't do anything.
 * @return {Promise<{stop: Function, socket: net.Server}>}
 */
async function host(options={}) {
    setOptions(options, {
        localKp: defaults.localKp, directory: defaults.directory, host: '0.0.0.0', port: 0, register: false
    });

    if (options.localKp === undefined)
        throw Error('No key pair is passed in options or defined by default.');

    if (options.register && options.directory === undefined)
            throw Error('Register option is enable but no directory is passed in options or defined by default.');

    let peer = new zprotocol.Peer(options.localKp);
    let server = await peer.listen(options.host, options.port);
    if (options.register) {
        // TODO : Get ext IP.
        let address = server.socket.address();
        options.directory.register(joinAddress(address.address, address.port), options.localKp);
    }
    return server;
}


async function connect(pk, options) {
    options = await getConnectOptions(pk, options);
    return zprotocol.connect(options.host, options.port, pk, options.localKp);
}


async function rfsConnect(pk, options) {
    options = await getConnectOptions(pk, options);
    return zrfs.connect(options.host, options.port, pk, options.localKp);
}

/**
 * Convert an address object in string.
 * @param {string} host
 * @param {number} port
 * @return {string} - The address in format `host:port`.
 */
function joinAddress(host, port) {
    return `${host}:${port}`;
}

/**
 * Convert an address string in object.
 * @param {string} address - The address in format `host:port`.
 * @return {{host: string, port: number}}
 */
function parseAddress(address) {
    return {
        host: address.slice(0, address.lastIndexOf(':')),
        port: parseInt(address.slice(address.lastIndexOf(':') + 1))
    };
}


module.exports = {
    ready,
    defaults,
    use,
    directory: zdirectory,
    rfs: {
        connect: rfsConnect
    },
    connect,
    host,
    generate_kp: zprotocol.generate_kp,
    read_kp: zprotocol.read_kp,
    bs32toBytes: zprotocol.bs32toBytes,
    bytesToBs32: zprotocol.bytesToBs32,
    joinAddress,
    parseAddress
};
