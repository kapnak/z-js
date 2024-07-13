const zprotocol = require('zprotocol-js');


module.exports = class LocalDirectory {
    constructor(server) {
        this.server = server;
        this.directory = {};

        this.server.on('connection', (peer) => {
            peer.on('request', (message) => {
                if (message.content[0] === 0 && message.content.length > 1) { // Register
                    const address = message.content.subarray(1);
                    this.directory[peer.pk] = address;
                    message.reply(Buffer.from([0]));
                    console.log(
                        `[REGISTER] ${zprotocol.bytesToBs32(peer.pk)} -> ${address}, 
                        ${Object.keys(this.directory).length} entries.`);

                } else if (message.content[0] === 1 && message.content.length <= 34) {  // Ask
                    const pk = message.content.subarray(1);
                    if (pk in this.directory) {
                        const address = this.directory[pk];
                        let buf = Buffer.alloc(1 + address.length);
                        buf[0] = 0;
                        buf.set(address, 1);
                        message.reply(buf);
                        console.log(`[ASK] ${zprotocol.bytesToBs32(pk)} -> ${this.directory[pk]}`);
                    } else {
                        message.reply(Buffer.from([0]));
                        console.log(`[ASK] Unknown ${zprotocol.bytesToBs32(pk)}`);
                    }

                } else {    // Bad request.
                    message.reply(Buffer.from([2]));
                    console.log(`[ERR] Bad request from '${zprotocol.bytesToBs32(peer.pk)}'`);
                }
            });
        });
    }

    /**
     * Host a ZDirectory server.
     * @param {string|{pk: Uint8Array<32>, sk: Uint8Array<64>}} kp - The server key pair or the path to it.
     * @param {{
     *     [host='0.0.0.0']: string,
     *     [port=1501]: number
     * }} [options]
     * @return {Promise<LocalDirectory>}
     */
    static async host(kp, {host='0.0.0.0', port=1501}={}) {
        if (typeof kp === 'string')
            kp = await zprotocol.read_kp(kp, true);

        const server = await zprotocol.host(host, port, kp);
        return new LocalDirectory(server);
    }
}