function getattrBuild(file) {
    let req;
    if (typeof file === 'number' || typeof file === 'bigint') {
        req = Buffer.alloc(10);    // 1 + FH<8> + '\0'
        req[0] = 11;
        req.writeBigUInt64LE(BigInt(file), 1);
    } else {
        req = Buffer.alloc(10 + file.length);    // 1 + FH<8> + file<length> + '\0'
        req[0] = 11;
        req.write(file, 9);
    }
    return req;
}


function getattrParse(reply) {
    let error = reply.readBigInt64LE();
    if (error !== 0n)
        return {err: error};
    return {
        err: reply.readBigInt64LE(),
        dev: reply.readBigUInt64LE(8),
        ino: reply.readBigUInt64LE(16),
        size: reply.readBigInt64LE(24),
        blksize: reply.readBigUInt64LE(32),
        blocks: reply.readBigInt64LE(40),
        mode: reply.readBigUInt64LE(48)
    }
}


function accessBuild(path) {
    let req = Buffer.alloc(2 + path.length);    // 1 + path<length> + '\0'
    req[0] = 12;
    req.write(path, 1);
    return req;
}


function accessParse(reply) {
    return {err: reply.readBigInt64LE()};
}


function readdirBuild(path) {
    let req = Buffer.alloc(2 + path.length);    // 1 + path<length> + '\0'
    req[0] = 13;
    req.write(path, 1);
    return req;
}


function readdirParse(reply) {
    let error = reply.readBigInt64LE();
    if (error !== 0n)
        return {err: error};

    let dirs = [];
    let offset = 8;
    while ((reply.length - offset) >= 50) {     // One dir entry is minimum 50 bytes.
        let nameIndex = offset + 49;
        dirs.push({
            name: reply.subarray(nameIndex, reply.indexOf('\0', nameIndex)).toString(),
            stat: reply[offset],
            dev: reply.readBigUInt64LE(offset + 1),
            ino: reply.readBigUInt64LE(offset + 9),
            size: reply.readBigInt64LE(offset + 17),
            blksize: reply.readBigUInt64LE(offset + 25),
            blocks: reply.readBigInt64LE(offset + 33),
            mode: reply.readBigUInt64LE(offset + 41)
        });
        offset += 50 + dirs.at(-1).name.length;
    }
    return dirs;
}


function mkdirBuild(path) {
    let req = Buffer.alloc(2 + path.length);    // 1 + path<length> + '\0'
    req[0] = 14;
    req.write(path, 1);
    return req;
}


function mkdirParse(reply) {
    return {err: reply.readBigInt64LE()};
}


function unlinkBuild(path) {
    let req = Buffer.alloc(2 + path.length);    // 1 + path<length> + '\0'
    req[0] = 15;
    req.write(path, 1);
    return req;
}


function unlinkParse(reply) {
    return {err: reply.readBigInt64LE()};
}


function rmdirBuild(path) {
    let req = Buffer.alloc(2 + path.length);    // 1 + path<length> + '\0'
    req[0] = 16;
    req.write(path, 1);
    return req;
}


function rmdirParse(reply) {
    return {err: reply.readBigInt64LE()};
}


function symlinkBuild(from, to) {
    let req = Buffer.alloc(3 + from.length + to.length);    // 1 + from<length> + '\0' + to<length> + '\0'
    req[0] = 17;
    req.write(from, 1);
    req.write(to, 2 + from.length);
    return req;
}


function symlinkParse(reply) {
    return {err: reply.readBigInt64LE()};
}


function renameBuild(from, to) {
    let req = Buffer.alloc(3 + from.length + to.length);    // 1 + from<length> + '\0' + to<length> + '\0'
    req[0] = 18;
    req.write(from, 1);
    req.write(to, 2 + from.length);
    return req;
}


function renameParse(reply) {
    return {err: reply.readBigInt64LE()};
}


function linkBuild(from, to) {
    let req = Buffer.alloc(3 + from.length + to.length);    // 1 + from<length> + '\0' + to<length> + '\0'
    req[0] = 19;
    req.write(from, 1);
    req.write(to, 2 + from.length);
    return req;
}


function linkParse(reply) {
    return {err: reply.readBigInt64LE()};
}


function createBuild(path, flag) {
    let req = Buffer.alloc(10);    // 1 + flag<8> + path<length> + '\0'
    req[0] = 20;
    req.writeBigInt64LE(flag, 1);
    req.write(path, 9);
    return req;
}


function createParse(reply) {
    let error = reply.readBigInt64LE();
    if (error !== 0n)
        return {err: error};
    return {
        err: error,
        fh: reply.readBigInt64LE(8)
    };
}


function openBuild(path, flag) {
    let req = Buffer.alloc(10 + path.length);    // 1 + flag<8> + path<length> + '\0'
    req[0] = 21;
    req.writeBigInt64LE(BigInt(flag), 1);
    req.write(path, 9);
    return req;
}


function openParse(reply) {
    let error = reply.readBigInt64LE();
    if (error !== 0n)
        return {err: error};
    return {
        err: error,
        fd: reply.readBigInt64LE(8)
    };
}


function readBuild(fh, size, offset) {
    let req = Buffer.alloc(25);    // 1 + fh<8> + size<8> + offset<8>
    req[0] = 22;
    req.writeBigInt64LE(BigInt(fh), 1);
    req.writeBigUInt64LE(BigInt(size), 9);
    req.writeBigInt64LE(BigInt(offset), 17);
    return req;
}


function readParse(reply) {
    let error = reply.readBigInt64LE();
    if (error !== 0n)
        return {err: error};
    return {
        err: error,
        buf: reply.subarray(8)
    };
}


function writeBuild(fh, offset, buf, size=buf.length) {
    let req = Buffer.concat([Buffer.alloc(25), buf]);    // 1 + fh<8> + size<8> + offset<8> + buf<length>
    req[0] = 23;
    req.writeBigInt64LE(fh, 1);
    req.writeBigUInt64LE(size, 9);
    req.writeBigInt64LE(offset, 17);
    return req;
}


function writeParse(reply) {
    let value  = reply.readBigInt64LE();
    if (value < 0)
        return {err: -value};
    else
        return {err: 0, bytes: value};
}


function statfsBuild(path) {
    let req = Buffer.alloc(2 + path.length);    // 1 + path<length> + '\0'
    req[0] = 24;
    req.write(path, 1);
    return req;
}


function statfsParse(reply) {
    let error = reply.readBigInt64LE();
    if (error !== 0n)
        return {err: error};
    return {
        err: error,
        bsize:  reply.readBigUInt64LE(8),
        frsize: reply.readBigUInt64LE(16),
        blocks: reply.readBigUInt64LE(24),
        bfree:  reply.readBigUInt64LE(32),
        bavail: reply.readBigUInt64LE(40),
        files:  reply.readBigUInt64LE(48),
        ffree:  reply.readBigUInt64LE(56),
        favail: reply.readBigUInt64LE(64),
        fsid:   reply.readBigUInt64LE(72),
        flag:   reply.readBigUInt64LE(80),
        namemax: reply.readBigUInt64LE(88),
    };
}


function releaseBuild(fh) {
    let req = Buffer.alloc(9);    // 1 + fh<8>
    req[0] = 25;
    req.writeBigInt64LE(BigInt(fh), 1);
    return req;
}


function releaseParse(reply) {
    return {err: reply.readBigInt64LE()};
}


function getpermBuild(path) {
    let req = Buffer.alloc(2 + path.length);    // 1 + path<length> + '\0'
    req[0] = 26;
    req.write(path, 1);
    return req;
}


function getpermParse(reply) {
    let error = reply.readBigInt64LE();
    if (error !== 0n)
        return {err: error};

    let acl = [];
    let offset = 8;
    while ((reply.length + offset) >= 3) {
        let pk_bs32 = reply.subarray(offset, offset + 53);       // PK BS32 LENGTH = 53
        acl.push({
            pk_bs32,
            perm: reply[offset + 53]
        });
        offset += 54;
    }
    return {err: error, acl};
}


function setpermBuild(path, pk_bs32, perm) {
    let req = Buffer.alloc(56 + path.length);    // 1 + perm<1> + pk_bs32<53> + path<length> + '\0'
    req[0] = 27;
    req[1] = perm;
    req.write(pk_bs32, 9);
    req.write(path, 62);
    return req;
}


function setpermParse(reply) {
    return {err: reply.readBigInt64LE()};
}


function truncateBuild(file, length) {
    let req;
    if (typeof file === 'number' || typeof file === 'bigint') {
        req = Buffer.alloc(18);    // 1 + FH<8> + length<8> + '\0'
        req.writeBigUInt64LE(BigInt(file), 1);
    } else {
        req = Buffer.alloc(18 + file.length);    // 1 + FH<8> + length<8> + file<length> + '\0'
        req.write(file, 17);
    }
    req[0] = 28;
    req.writeBigInt64LE(length, 9);
    return req;
}


function truncateParse(reply) {
    return {err: reply.readBigInt64LE()};
}


const methods = [
    'getattr', 'access', 'readdir', 'mkdir', 'unlink', 'rmdir', 'symlink', 'rename', 'link',
    'create', 'open', 'read', 'write', 'statfs', 'release', 'getperm', 'setperm', 'truncate'
];


let attributes = {
    methods,
    getattrBuild,
    getattrParse,
    accessBuild,
    accessParse,
    readdirBuild,
    readdirParse,
    mkdirBuild,
    mkdirParse,
    unlinkBuild,
    unlinkParse,
    rmdirBuild,
    rmdirParse,
    symlinkBuild,
    symlinkParse,
    renameBuild,
    renameParse,
    linkBuild,
    linkParse,
    createBuild,
    createParse,
    openBuild,
    openParse,
    readBuild,
    readParse,
    writeBuild,
    writeParse,
    statfsBuild,
    statfsParse,
    releaseBuild,
    releaseParse,
    getpermBuild,
    getpermParse,
    setpermBuild,
    setpermParse,
    truncateBuild,
    truncateParse
};

const constants = require('./constants');

/**
 * Throw error details if err is not null.
 * @param {Number|BigInt} err - The errno.
 * @param {string} syscall - The name of the call that produce the error.
 * @param args
 */
function throwErrno(err, syscall, ...args) {
    let errno = Number(err);
    if (errno) {
        let code;
        let message;
        if (errno in constants.errno) {
            code = constants.errno[errno].code;
            message = constants.errno[errno].message;
        } else {
            code = '?';
            message = `Unknown error : ${errno}`;
        }

        let error = new Error(`${code}: ${message}, ${syscall} ${args}`);
        error.errno = errno;
        error.code = code;
        error.description = message;
        error.syscall = syscall
        error.args = args;
        throw error;
    }
}


attributes.methods.forEach((name) => {
    attributes[name] = async (remotePeer, ...args) => {
        args = args.map((a) => typeof a === 'number' ? BigInt(a) : a);
        let req = attributes[name + 'Build'](...args);
        let reply = await remotePeer.request(req);
        let res = attributes[name + 'Parse'](reply);
        /*if (res.err !== 0n && throwError)
            throw(res.err);*/
        throwErrno(res.err, name, ...args);
        return res;
    }
});

module.exports = attributes;
