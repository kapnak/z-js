module.exports = {
    errno: {
        1: {code: 'EPERM', message: 'Operation not permitted'},
        2: {code: 'ENOENT', message: 'No such file or directory'},
        3: {code: 'ESRCH', message: 'No such process'},
        4: {code: 'EINTR', message: 'Interrupted system call'},
        5: {code: 'EIO', message: 'Input/output error'},
        6: {code: 'ENXIO', message: 'Device not configured'},
        7: {code: 'E2BIG', message: 'Argument list too long'},
        8: {code: 'ENOEXEC', message: 'Exec format error'},
        9: {code: 'EBADF', message: 'Bad file descriptor'},
        10: {code: 'ECHILD', message: 'No child processes'},
        11: {code: 'EDEADLK', message: 'Resource deadlock avoided'},
        12: {code: 'ENOMEM', message: 'Cannot allocate memory'},
        13: {code: 'EACCES', message: 'Permission denied'},
        14: {code: 'EFAULT', message: 'Bad address'},
        16: {code: 'EBUSY', message: 'Device / Resource busy'},
        17: {code: 'EEXIST', message: 'File exists'},
        18: {code: 'EXDEV', message: 'Cross-device link'},
        19: {code: 'ENODEV', message: 'Operation not supported by device'},
        20: {code: 'ENOTDIR', message: 'Not a directory'},
        21: {code: 'EISDIR', message: 'Is a directory'},
        22: {code: 'EINVAL', message: 'Invalid argument'},
        23: {code: 'ENFILE', message: 'Too many open files in system'},
        24: {code: 'EMFILE', message: 'Too many open files'},
        25: {code: 'ENOTTY', message: 'Inappropriate ioctl for device'},
        26: {code: 'ETXTBSY', message: 'Text file busy'},
        27: {code: 'EFBIG', message: 'File too large'},
        28: {code: 'ENOSPC', message: 'No space left on device'},
        29: {code: 'ESPIPE', message: 'Illegal seek'},
        30: {code: 'EROFS', message: 'Read-only file system'},
        31: {code: 'EMLINK', message: 'Too many links'},
        32: {code: 'EPIPE', message: 'Broken pipe'},
        62: {code: 'ELOOP', message: 'Too many levels of symbolic links'},
        63: {code: 'ENAMETOOLONG', message: 'File name too long'},
        89: {code: 'ECANCELED', message: 'Operation canceled'}
    },
    stat: {
        S_IFMT   : 0o170000,   //bit mask for the file type bit fields
        S_IFSOCK : 0o140000,   //socket
        S_IFLNK  : 0o120000,   //symbolic link
        S_IFREG  : 0o100000,   //regular file
        S_IFBLK  : 0o060000,   //block device
        S_IFDIR  : 0o040000,   //directory
        S_IFCHR  : 0o020000,   //character device
        S_IFIFO  : 0o010000   //FIFO
    },
    errnoCode: {
        EPERM   : 1,       // Operation not permitted
        ENOENT  : 2,       // No such file or directory
        ESRCH   : 3,       // No such process
        EINTR   : 4,       // Interrupted system call
        EIO     : 5,       // Input/output error
        ENXIO   : 6,       // Device not configured
        E2BIG   : 7,       // Argument list too long
        ENOEXEC : 8,       // Exec format error
        EBADF   : 9,       // Bad file descriptor
        ECHILD  : 10,      // No child processes
        EDEADLK : 11,      // Resource deadlock avoided
        ENOMEM  : 12,      // Cannot allocate memory
        EACCES  : 13,      // Permission denied
        EFAULT  : 14,      // Bad address
        EBUSY   : 16,      // Device / Resource busy
        EEXIST  : 17,      // File exists
        EXDEV   : 18,      // Cross-device link
        ENODEV  : 19,      // Operation not supported by device
        ENOTDIR : 20,      // Not a directory
        EISDIR  : 21,      // Is a directory
        EINVAL  : 22,      // Invalid argument
        ENFILE  : 23,      // Too many open files in system
        EMFILE  : 24,      // Too many open files
        ENOTTY  : 25,      // Inappropriate ioctl for device
        ETXTBSY : 26,      // Text file busy
        EFBIG   : 27,      // File too large
        ENOSPC  : 28,      // No space left on device
        ESPIPE  : 29,      // Illegal seek
        EROFS   : 30,      // Read-only file system
        EMLINK  : 31,      // Too many links
        EPIPE   : 32,      // Broken pipe
        ELOOP   : 62,      // Too many levels of symbolic links
        ENAMETOOLONG : 63, // File name too long
        ECANCELED : 89     // Operation canceled
    }
};
