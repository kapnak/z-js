const {Writable} = require('node:stream');
const {setOptions} = require('./utils');


module.exports = class WriteStream extends Writable {
    constructor(file, options) {
        super();
        setOptions(options, {encoding: undefined, start: 0, end: Infinity, autoClose: true});
        this.file = file;
        this.start = options.start;
        this.end = options.end;
        this.pos = this.start;      // TODO : Remember by default pos is undefined in Node.js and not used when there is no options.start.
        this.autoClose = options.autoClose;
        this.performingIO = false;
        this.file.on('close', Function.prototype.bind(this.close, this));

        if (!this.autoClose)
            this.on('finish', this.destroy);

        if (options.encoding)
            this.setDefaultEncoding(options.encoding);
    }

    _write(data, encoding, cb) {
        this.performingIO = true;
        writeAll(data, data.length, this.pos).then(() => {
            this.performingIO = false;
            if (this.destroyed)
                return this.emit('readyToDestroy');
            this.pos += data.length;
        });
    }

    _destroy(error, cb) {
        if (this.performingIO) {
            this.once('readyToDestroy', () => {
                this.file.close();
            });
        } else {
            this.file.close();
        }
    }
}


async function writeAll(data, size, pos, retries = 0) {
    let bytesWritten;
    try {
        bytesWritten = await this.file.write(data, {position: this.pos, length: size});
    } catch (error) {
        if (error.code === 'EAGAIN') {
            bytesWritten = 0;
        }
    }

    if (this.destroyed)
        return new Error('Stream destroyed, can\'t write.');

    retries = bytesWritten ? 0 : retries + 1;
    size -= bytesWritten;
    pos += bytesWritten;

    // Try writing non-zero number of bytes up to 5 times.
    if (retries > 5)
        return new Error('Write failed, max tries reach.');
    else if (size)
        return writeAll.call(this, data.slice(bytesWritten), size, pos, retries);
}
