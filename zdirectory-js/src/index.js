const Directory = require('./Directory');


/**
 * Return a `Directory` object.
 * If `options.connect` is not changed to `true` this function will connect / disconnect
 * of the server for every request (ask/register).
 * @param {string} host
 * @param {number} port
 * @param {Uint8Array<32>|string} pk - The public key or a base 32 representation of it.
 * @param {object} options
 * @param {boolean} [options.connect=false] - When true, a connection is made and
 * kept else the connection start / end for each request. Default: false.
 * @param {{pk: Uint8Array<32>, sk: Uint8Array<64>}} [options.kp=undefined] - The
 * key pair used to connect to the directory.
 * @return {Promise<Directory>|Directory} - A promise or directly the Directory if the `options.connect` is `false`.
 */
function connect(host, port, pk, options) {
    if (!options.connect)
        return new Directory(host, port, pk, () => {}, options);
    return new Promise((resolve) => {
        new Directory(host, port, pk, resolve, options);
    });
}


module.exports = {
    connect,
    Directory
}
