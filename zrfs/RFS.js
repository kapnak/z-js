const zprotocol = require('../zprotocol');
const protocol = require('./protocol');
const Stats = require('./Stats');
const constants = require('./constants');
const c = require('node:constants');
const {stringToFlags} = require('./utils');
const FileHandle = require('./FileHandle');
const Dir = require('./Dir');


module.exports = class RFS {
    constructor(host, port, pk, local_kp, cb) {
        if (typeof pk === 'string')
            pk = zprotocol.bs32toBytes(pk);

        zprotocol.connect(host, port, pk, local_kp).then((server) => {
            this.server = server;
            cb(this);
        });
    }


    /**
     * Tests a user's permissions for the file or directory specified by `path`.
     * @param {string} path
     * @return {Promise<void>}
     */
    async access(path) {
        let res = await protocol.access(this.server, path);
        if (res.err !== 0n)
            throw Error("Can't access file.");
    }


    /**
     * Asynchronously append data to a file, creating the file if it does not yet exist.
     * @param {string|FileHandle} path
     * @param {string|Buffer} data
     * @param {string} [encoding='utf8'] - Only used if data is a string.
     * @return {Promise<void>}
     */
    async appendFile(path, data, encoding='utf8') {
        return this.writeFile(path, data, encoding, 'a');
    }


    /**
     * Asynchronously copies `src` to `dest`.
     * By default, `dest` is overwritten if it already exists.
     * @param src
     * @param dest
     * @param mode
     * @return {Promise<void>}
     */
    async copyFile(src, dest, mode=undefined) {
        throw Error('"copyFile" method is not implemented.');
    }
    async cp(src, dest, mode=undefined) {
        throw Error('"cp" method is not implemented.');
    }

    /**
     * Create a new link from the `existingPath` to the `newPath`.
     * See POSIX [link(2)](https://man7.org/linux/man-pages/man2/link.2.html) for more detail.
     * @param {string} existingPath
     * @param {string} newPath
     * @return {Promise<void>}
     */
    async link(existingPath, newPath) {
        await protocol.link(this.server, existingPath, newPath);
    }

    /**
     * Equivalent to `stat()`, if `path` refers to a symbolic link, the link itself is stat-ed,
     * not the file that it refers to.
     * Refer to the POSIX [lstat(2)](https://man7.org/linux/man-pages/man2/lstat.2.html) document for more detail.
     * @param {string} path
     * @return {Promise<Stats>} - Fulfills with the `Stats` object for the given symbolic link `path`.
     */
    async lstat(path) {
        let values = await protocol.getattr(this.server, path);
        return new Stats(values.dev, values.ino, values.mode, values.size, values.blksize, values.blocks);
    }

    async fstat(fd) {
        let values = await protocol.getattr(this.server, fd);
        return new Stats(values.dev, values.ino, values.mode, values.size, values.blksize, values.blocks);
    }

    /**
     * Asynchronously creates a directory.
     * @param {string} path
     * @param {boolean} [recursive=false] - Indicating whether parent directories should be created. Default: false.
     * @return {Promise<string|undefined>} - Upon success, fulfills with undefined if recursive is false,
     * or the first directory path created if recursive is true.
     */
    async mkdir(path, recursive=false) {
        if (!recursive) {
            await protocol.mkdir(this.server, path);
        } else {
            const parts = path.replace('\\', '/').split('/');
            let currentPath = '';
            let firstDirCreated = undefined;

            for (const part of parts) {
                currentPath += part + '/';
                try {
                    await protocol.mkdir(this.server, currentPath);
                    if (!firstDirCreated)
                        firstDirCreated = currentPath;
                } catch(error) {
                    if (error.errno !== constants.errnoCode.EEXIST)
                        throw error;
                }
            }
            return firstDirCreated;
        }
    }

    /**
     * Opens a <FileHandle>.
     * Refer to the POSIX [open(2)](https://man7.org/linux/man-pages/man2/open.2.html) documentation for more detail.
     * @param {string} path
     * @param {string|number} [flags='r'|O_RDONLY] - Can be string flags or POSIX flags.
     * See [Node.js File system flags](https://nodejs.org/api/fs.html#file-system-flags) for more information.
     * @return {Promise<FileHandle>} - Fulfills with a <FileHandle> object.
     */
    async open(path, flags=c.O_RDONLY) {
        if (typeof flags === 'string')
            flags = stringToFlags(flags);
        let res = await protocol.open(this.server, path, flags);
        return new FileHandle(this, res.fd);
    }

    /**
     * Creates an <fs.Dir>, which contains all further functions for reading from and cleaning up the directory.
     * Note that ZRFS servers doesn't support dir openning / dir handles, this function will just return a Dir object
     * for easier usage, but it will not open the dir. You can directly use `readdir` or the operation you need.
     * Every operation on directory is made with his path.
     * @param {string} path
     * @return {Dir}
     */
    opendir(path) {
        return new Dir(this.server, path);
    }

    /**
     * Reads the contents of a directory.
     * @param {string} path
     * @param {{recusive?: boolean; withFileTypes?: boolean;}} [option]
     * @return {Promise<[string]>} - Fulfills with an array of the names of the files in the directory excluding '.' and '..'.
     */
    async readdir(path, option) {
        // TODO : Handle recusive and withFileTypes options.
        let dirs = await protocol.readdir(this.server, path);
        return dirs.flatMap(dir => (dir.name !== '.' && dir.name !== '..') ? dir.name : []);
    }

    /**
     * Asynchronously reads the entire contents of a file.
     * If no encoding is specified, the data is returned as a <Buffer> object.
     * Otherwise, the data will be a string.
     * @param {string|FileHandle} path
     * @param {BufferEncoding|undefined} [encoding=undefined]
     * @return {Promise<string|Buffer>} - Fulfills with the contents of the file. string if encoding is specified.
     */
    async readFile(path, encoding=undefined) {
        let closeAfterRead = false;
        if (typeof path === 'string') {
            path = await this.open(path);
            closeAfterRead = true;
        }

        let stat = await path.stat();

        let buffer;
        if (stat.isFile()) {
            buffer = (await protocol.read(this.server, path.fd, stat.size, 0)).buf;
        } else {
            let buffers = [];
            let length = 0;
            do {
                buffer = (await protocol.read(this.server, path.fd, 8192, 0)).buf;
                if (buffer.length !== 0) {
                    length += buffer.length;
                    buffers.push(buffer);
                }
            } while (buffer.length !== 0);
            buffer = Buffer.concat(buffers, length);
        }

        if (closeAfterRead)
            await path.close();

        return encoding ? buffer.toString(encoding) : buffer;
    }

    /**
     * Renames `oldPath` to `newPath`.
     * @param {string} oldPath
     * @param {string} newPath
     * @return {Promise<void>}
     */
    async rename(oldPath, newPath) {
        await protocol.rename(this.server, oldPath, newPath);
    }

    /**
     * Removes the directory identified by `path`.
     * Using this function on a file (not a directory) results in a `ENOTDIR` error.
     * @param {string} path
     * @return {Promise<void>}
     */
    async rmdir(path) {
        return await protocol.rmdir(this.server, path);
    }

    /**
     * Removes files and directories (modeled on the standard POSIX rm utility).
     * @todo Change with option dict.
     * @param {string} path
     * @param {boolean} [recursive=false] - If true, perform a recursive directory removal.
     * @param {boolean} [force=false] - When true, exceptions will be ignored if path does not exist.
     * @return {Promise<void>}
     */
    async rm(path, recursive=false, force=false) {
        let stat;
        try {
            stat = await this.lstat(path);
        } catch (error) {
            if (force && error.code === 'ENOENT')
                return;
            throw error;
        }

        if (!stat.isDirectory())
            return await this.unlink(path);

        if (recursive) {
            let entries = await this.readdir(path);
            for (const entry of entries)
                await this.rm(path + '/' + entry, true, true);
        }

        return await protocol.rmdir(this.server, path);
    }

    /**
     * Return stat of item.
     * @param {string} path
     * @return {Promise<Stats>} - Fulfills with the <fs.Stats> object for the given path.
     */
    async stat(path) {
        let values = await protocol.getattr(this.server, path);
        return new Stats(values.dev, values.ino, values.mode, values.size, values.blksize, values.blocks);
    }


    /**
     * Get file system stats.
     * @param {string} path
     * @return {Promise<StatFs>} - Fulfills with the <StatFs> object for the given path.
     */
    async statfs(path) {
        let values = await protocol.statfs(this.server, path);
        return new StatFs(values.bavail, values.bfree, values.blocks, values.bsize, values.ffree,
            values.files, values.favail, values.fsid, values.frsize, values.flag, values.namemax);
    }


    /**
     * Creates a symbolic link.
     * @param {string} target
     * @param {string} path
     * @return {Promise<void>}
     */
    async symlink(target, path) {
        return await protocol.symlink(this.server, target, path);
    }

    /**
     * Truncates (shortens or extends the length) of the content at `path` to `len` bytes.
     * @param {string|FileHandle|number|bigint} path
     * @param {number|bigint} [length=0]
     * @return {Promise<void>}
     */
    async truncate(path, length=0) {
        if (typeof path === 'object')
            path = path.fd;
        return await protocol.truncate(this.server, path, length);
    }

    /**
     * If path refers to a symbolic link, then the link is removed
     * without affecting the file or directory to which that link refers.
     * If the path refers to a file path that is not a symbolic link,
     * the file is deleted.
     * See the POSIX [unlink(2)](https://man7.org/linux/man-pages/man2/unlink.2.html) documentation for more detail.
     * @param {string} path
     * @return {Promise<void>}
     */
    async unlink(path) {
        return await protocol.unlink(this.server, path);
    }

    /**
     * Asynchronously writes data to a file, replacing the file if it already exists.
     * @param {string|FileHandle} file - Filename or `FileHandle` that support writing.
     * @param {string|Buffer} data
     * @param {string} [encoding='utf8'] - Data encoding (ignored if data is not a string).
     * @param {string} [flag='w'] - See [File system flags](https://nodejs.org/api/fs.html#file-system-flags).
     * @return {Promise<void>}
     */
    async writeFile(file, data,
                    encoding='utf8', flag='w') {
        let closeAfterWrite = false;
        if (typeof data === 'string')
            data = Buffer.from(data, encoding);

        if (typeof file === 'string') {
            closeAfterWrite = true;
            file = await this.open(file, flag);
        }

        let offset = 0;
        do {
            offset += Number(await file.write(data, {offset}));   // TODO : Changes
        } while (offset < data.byteLength);

        if (closeAfterWrite)
            await file.close;
    }

    disconnect() {
        this.server.disconnect();
    }
}
