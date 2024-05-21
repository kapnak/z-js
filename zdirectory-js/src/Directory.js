const zprotocol = require('zprotocol-js');


module.exports = class Directory {
    /**
     * @param {string} host
     * @param {number} port
     * @param {Uint8Array<32>|string} pk
     * @param {function} cb
     * @param {object} options
     * @param {boolean} [options.connect=false] - When true, a connection is made and
     * kept else the connection start / end for each request. Default: false.
     * @param {{pk: Uint8Array<32>, sk: Uint8Array<64>}} [options.kp=undefined] - The
     * key pair used to connect to the directory.
     */
    constructor(host, port, pk, cb, options={}) {
        this.host = host;
        this.port = port;
        if (typeof pk === 'string')
            pk = zprotocol.bs32toBytes(pk);
        this.pk = pk;
        this.kp = options.kp === undefined ? undefined : options.kp;
        this.remotePeer = undefined;

        if (options.connect) {
            this._getConnection().then((remotePeer) => {
                this.remotePeer = remotePeer;
                cb(this);
            });
        }
    }

    async _getConnection(local_kp=this.kp) {
        if (this.remotePeer === undefined) {
            if (local_kp === undefined)
                local_kp = zprotocol.generate_kp();
            let peer = new zprotocol.Peer(local_kp);
            return await peer.connect(this.host, this.port, this.pk);
        }
        return this.remotePeer;
    }

    /**
     * Register an address to the directory.
     * @param {string} address - The address to register.
     * @param {{pk: Uint8Array<32>, sk: Uint8Array<64>}} [local_kp=this.kp] - The public
     * key will identify the address in the directory.
     * @param {number} [timeout=5] - The timeout in seconds. Default: 5.
     * @return {Promise<void>}
     */
    async register(address, local_kp=this.kp, timeout=5) {
        let server = await this._getConnection(local_kp);
        let buf = Buffer.alloc(2 + address.length);
        buf.write(address, 1)
        let reply = await server.request(buf, timeout);
        server.disconnect();
        if (reply[0] === 2) {
            throw Error('Remote peer reply with 2 (BAD_REQUEST).');
        } else if (reply[0]) {
            throw Error(`Remote peer reply with ${reply[0]} (?), unknown error code.`);
        }
    }

    /**
     * Get the address associate to the given public key (`pk`).
     * @param {Uint8Array<32>} pk - The public key.
     * @param {number} [timeout=5] - The timeout in seconds. Default: 5.
     * @return {Promise<string|undefined>}
     */
    async ask(pk, timeout=5) {
        let server = await this._getConnection();
        let buf = Buffer.alloc(33);
        buf[0] = 1;
        buf.set(pk, 1);
        let reply = await server.request(buf, timeout);
        server.disconnect();
        if (reply[0] === 2)
            throw Error('Remote peer reply with 2 (BAD_REQUEST).');
        else if (reply[0] === 10)
            return undefined;
        else if (reply[0])
            throw Error(`Remote peer reply with ${reply[0]} (?), unknown error code.`);

        return reply.subarray(1).toString();
    }
}
