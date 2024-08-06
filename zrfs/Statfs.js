/**
 * Represent file system stats.
 * See [statvfs(3)](https://man7.org/linux/man-pages/man3/statvfs.3.html) for more details.
 * Stat objects are not to be created directly using the new keyword.
 * This class doesn't have `type` property like `node:fs`.
 * @property {number|bigint} bavail - Free blocks available to unprivileged user.
 * @property {number|bigint} bfree - Number of free blocks.
 * @property {number|bigint} blocks - Size of fs in f_frsize units.
 * @property {number|bigint} bsize - Filesystem block size.
 * @property {number|bigint} ffree - Number of free inodes.
 * @property {number|bigint} files - Number of inodes.
 *
 * Additionals property not available with `node:fs` :
 * @property {number|bigint} favail - Number of free inodes for unprivileged users.
 * @property {number|bigint} fsid - Filesystem ID.
 * @property {number|bigint} frsize - Fragment size.
 * @property {number|bigint} flag - Mount flags.
 * @property {number|bigint} namemax - Maximum filename length.
 */
module.exports = class StatFs {
    constructor(bavail, bfree, blocks, bsize, ffree, files, favail, fsid, frsize, flag, namemax) {
        this.bavail = bavail;
        this.bfree = bfree;
        this.blocks = blocks;
        this.bsize = bsize;
        this.ffree = ffree;
        this.files = files;
        this.favail = favail;
        this.fsid = fsid;
        this.frsize = frsize;
        this.flag = flag;
        this.namemax = namemax;
    }
}
