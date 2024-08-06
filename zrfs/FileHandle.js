const {EventEmitter} = require('node:events');
const ReadStream = require('./ReadStream');
const WriteStream = require('./WriteStream');
const protocol = require('./protocol');
const {setOptions} = require('./utils');


module.exports = class FileHandle extends EventEmitter {
    // EVENT : close
    /**
     * A <FileHandle> object is an object wrapper for a numeric file descriptor.
     *
     * Instances of the <FileHandle> object are created by the open() function.
     *
     * All <FileHandle> objects are <EventEmitter>s.
     *
     * @event close - TODO
     * @property {number} fd - The numeric file descriptor managed by the <FileHandle> object.
     * @param {RFS} rfs
     * @param {number} fd
     */
    constructor(rfs, fd) {
        super();
        this.rfs = rfs;
        this.fd = fd;
        this.closed = false;
        this.encoding = undefined; // TODO : Add this as an option **if Node.js has it**.
    }

    /**
     * Asynchronously append data to a file, creating the file if it does not yet exist.
     * @param {string|Buffer} data
     * @param {string} [encoding='utf8'] - Only used if data is a string.
     * @return {Promise<void>}
     */
    async appendFile(data, encoding='utf8') {
        return this.rfs.appendFile(this, data, encoding);
    }

    /**
     * Closes the file handle after waiting for any pending operation on the handle to complete.
     * @return {Promise<void>}
     */
    async close() {
        if (this.closed)
            return;
        let r = await protocol.release(this.rfs.server, this.fd);
        this.closed = true;
        this.emit('close');
        return r;
    }

    /**
     * @param {object} options
     * @param {number} [options.start=0]
     * @param {number} [options.end=Infinity]
     * @param {number} [options.highWaterMark]
     */
    createReadStream(options={}) {
        return new ReadStream(this, options);
    }

    createWriteStream(options={}) {
        return new WriteStream(this, options);
    }

    datasync() {
        throw Error('"FileHandle.datasync()" is not yet implemented.');
    }

    async read(length, position) {
        let buffer = (await protocol.read(this.rfs.server, this.fd, length, position)).buf;
        return this.encoding === undefined ? buffer : buffer.toString(this.encoding);
    }

    readFile(options=undefined) {
        throw Error('"FileHandle.readFile()" is not yet implemented.');
    }

    readLines(options=undefined) {
        throw Error('"FileHandle.readLines()" is not yet implemented.');
    }

    readv(buffers, options=undefined) {
        throw Error('"FileHandle.readv()" is not yet implemented.');
    }

    async stat(option=undefined) {
        return await this.rfs.fstat(this.fd);
    }

    sync() {
        throw Error('"FileHandle.sync()" is not yet implemented.');
    }

    /**
     * Truncates (shortens or extends the length) of the content to `len` bytes.
     * @param {number|bigint} [length=0]
     * @return {Promise<void>}
     */
    async truncate(length=0) {
        return await this.rfs.truncate(this, length);
    }

    /**
     * Write `data` to the file.
     * @param {string|Buffer} data
     * @param {object} options
     * @param {string} [options.encoding='utf8'] - Only used if data is a string.
     * @param {number} [options.offset=0]
     * @param {number} [options.length=buffer.length - options.offset]
     * @param {number} [options.position=0]
     * @return {Promise<number>} - Fullfill with the number of bytes written.
     */
    async write(data, options={}) {
        setOptions(options, {encoding: 'utf8', offset: 0, length: undefined, position: 0})

        if (typeof data === 'string')
            data = Buffer.from(data, options.encoding);

        if (options.length === undefined)
            options.length = data.length - options.offset;

        if (options.offset !== 0)
            data = data.subarray(options.offset);

        return (
            await protocol.write(this.rfs.server, this.fd, options.position, data, options.length)
        ).bytes;
    }

    writeFile(data, options=undefined) {
        throw Error('"FileHandle.writeFile()" is not yet implemented.');
    }

    writev(buffers, position=undefined) {
        throw Error('"FileHandle.writev()" is not yet implemented.');
    }
}
