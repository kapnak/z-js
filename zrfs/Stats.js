const constants = require('./constants');

const isWindows = process.platform === 'win32';

/**
 * Check if `mode` have `property`.
 * @param {number|bigint} mode
 * @param {number|bigint} property
 * @return {boolean}
 */
function checkModeProperty(mode, property) {
    if (isWindows && (property === constants.stat.S_IFIFO ||
        property === constants.stat.S_IFBLK ||
        property === constants.stat.S_IFSOCK))        // Properties unavailable on Windows.
        return false;

    return ((mode & BigInt(constants.stat.S_IFMT))) === BigInt(property);
}

/**
 * A <Stats> object provides information about a file.
 * Objects returned from stat(), lstat(), fstat()
 * Stat objects are not to be created directly using the new keyword.
 * Not that ZRFS don't implement nlink, uid, gid and times* properties.
 *
 * @property {number|bigint} dev - The numeric identifier of the device containing the file.
 * @property {number|bigint} ino - The file system specific "Inode" number for the file.
 * @property {number|bigint} mode - A bit-field describing the file type and the ZRFS acl permission of the user making
 * the request.
 * @property {number|bigint} size - The size of the file in bytes. If the server file system does not support getting
 * the size of the file, this will be 0.
 * @property {number|bigint} blksize - The file system block size for i/o operations.
 * @property {number|bigint} blocks - The number of blocks allocated for this file.
 */
module.exports = class Stats {
    constructor(dev, ino, mode, size, blksize, blocks) {
        this.dev = dev;
        this.ino = ino;
        this.mode = mode;
        this.size = size;
        this.blksize = blksize;
        this.blocks = blocks;
    }

    /**
     * Returns `true` if the <fs.Stats> object describes a block device.
     * @return {boolean}
     */
    isBlockDevice() {
        return checkModeProperty(this.mode, constants.stat.S_IFBLK);
    }

    /**
     * Returns `true` if the <fs.Stats> object describes a character device.
     * @return {boolean}
     */
    isCharacterDevice() {
        return checkModeProperty(this.mode, constants.stat.S_IFCHR);
    }

    /**
     * Returns `true` if the <fs.Stats> object describes a file system directory.
     * @return {boolean}
     */
    isDirectory() {
        return checkModeProperty(this.mode, constants.stat.S_IFDIR);
    }

    /**
     * Returns `true` if the <fs.Stats> object describes a first-in-first-out (FIFO) pipe.
     * @return {boolean}
     */
    isFIFO() {
        return checkModeProperty(this.mode, constants.stat.S_IFIFO);
    }

    /**
     * Returns `true` if the <fs.Stats> object describes a regular file.
     * @return {boolean}
     */
    isFile() {
        return checkModeProperty(this.mode, constants.stat.S_IFREG);
    }

    /**
     * Returns `true` if the <fs.Stats> object describes a socket.
     * @return {boolean}
     */
    isSocket() {
        return checkModeProperty(this.mode, constants.stat.S_IFSOCK);
    }

    /**
     * Returns `true` if the <fs.Stats> object describes a symbolic link.
     * @return {boolean}
     */
    isSymbolicLink() {
        return checkModeProperty(this.mode, constants.stat.S_IFLNK);
    }
}
