module.exports = class Dirent {
    /**
     * A class representing a directory stream.
     * As directory handles are not supported by ZRFS, every directory operations
     * are made with his path.
     * @property {string} path - The directory path.
     * @param remotePeer
     * @param path
     */
    constructor(remotePeer, path) {
        this.remotePeer = remotePeer;
        this.path = path;
    }
    isBlockDevice() {}
    isCharacterDevice() {}
    isDirectory() {}
    isFIFO() {}
    isFile() {}
    isSocket() {}
    isSymbolicLink() {}
    name;
    parentPath;
}
