const zprotocol = require('../zprotocol');
const RFS = require('./RFS');

/**
 * Connect to ZRFS server.
 * @param {string} host - The server host.
 * @param {number} port - The server port.
 * @param {Uint8Array<32>|string} pk - The server public key or its representation in base 32.
 * @param {{pk: Uint8Array<32>, sk: Uint8Array<64>}} local_kp - The local key pair.
 * @return {Promise<RFS>} - Fulfill with an RFS object ready.
 */
function connect(host, port, pk, local_kp) {
    return new Promise((resolve) => {
        zprotocol.ready.then(() => new RFS(host, port, pk, local_kp, resolve));
    });
}


module.exports = {
    connect
};