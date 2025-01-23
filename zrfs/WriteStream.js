const {Writable} = require('node:stream');
const {setOptions} = require('./utils');


module.exports = class WriteStream extends Writable {
    constructor(file, options) {
        setOptions(options, {encoding: undefined, start: 0, autoClose: true});
        super({autoDestroy: options.autoClose});
        this.file = file;
        this.start = options.start;
        this.pos = this.start;
        this.bytesWritten = 0;
        this._autoDestroy = options.autoClose;
        this.performingIO = false;

        if (options.encoding)
            this.setDefaultEncoding(options.encoding);
    }

    get autoClose() {
        return this._autoDestroy;
    }

    set autoClose(val) {
        this._autoDestroy = val;
    }

    _write(data, encoding, cb) {
        this.performingIO = true;
        writeAll(this, data, data.length, this.pos).finally(() => {
            this.performingIO = false;
            if (this.destroyed) {
                cb();
                return this.emit('readyToDestroy');
            }
            cb();
        });

        if (this.pos !== undefined)
            this.pos += data.length;
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

    close(cb) {
        if (cb) {
            if (this.closed) {
                process.nextTick(cb);
                return;
            }
            this.on('close', cb);
        }

        if (!this.autoClose) {
            this.on('finish', this.destroy);
        }
        this.end();
    }
}


async function writeAll(stream, data, size, pos, retries = 0) {
    let bytesWritten;
    try {
        bytesWritten = Number(await stream.file.write(data, {position: pos, length: size}));
    } catch (error) {
        if (error.code === 'EAGAIN') {
            bytesWritten = 0;
        }
    }

    if (stream.destroyed)
        return new Error('Stream destroyed, can\'t write.');

    stream.bytesWritten += bytesWritten;

    retries = bytesWritten ? 0 : retries + 1;
    size -= bytesWritten;
    pos += bytesWritten;

    // Try writing non-zero number of bytes up to 5 times.
    if (retries > 5)
        return new Error('Write failed, max tries reach.');
    else if (size)
        return await writeAll(stream, data.slice(bytesWritten), size, pos, retries);
}
