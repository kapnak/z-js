const {Readable} = require('node:stream');
const {once} = require('node:events');
const {setOptions} = require('./utils');


module.exports = class ReadStream extends Readable {
    /**
     * @param {FileHandle} file
     * @param {object} options
     * @param {number} [options.start=0]
     * @param {number} [options.end=Infinity]
     * @param {number} [options.highWaterMark]
     * @param {boolean} [options.autoClose=true]
     */
    constructor(file, options={}) {
        setOptions(options, {start: 0, end: Infinity, highWaterMark: undefined, autoClose: true});
        super({highWaterMark: options.highWaterMark, autoDestroy: options.autoClose});
        
        this.file = file;
        this.start = options.start;
        this.end = options.end;
        this.pos = this.start;
        this.performingIO = false;
        this.file.on('close', this.destroy.bind(this));
    }

    _read(size) {
        size = Math.min(this.end - this.pos + 1, size);

        if (size <= 0) {
            this.push(null);
            return;
        }

        this.performingIO = true;
        this.file.read(size, this.pos).then((buf) => {
            this.performingIO = false;
            if (this.destroyed) {
                this.emit('readyToDestroy');
                return;
            }

            if (buf.length > 0) {
                this.pos += buf.length;
                this.push(buf);
            } else {
                this.push(null);
            }
        });
    }

    async _destroy(error, cb) {
        if (this.performingIO)
            await once(this, 'readyToDestroy');
        await this.file.close();
        super._destroy(error, cb);
    }
}
