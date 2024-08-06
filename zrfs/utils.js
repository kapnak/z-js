const constants = require('node:constants');

function stringToFlags(flags) {
    switch (flags) {
        case 'r'    : return constants.O_RDONLY;
        case 'rs'   : // Fall through.
        case 'sr'   : return constants.O_RDONLY | constants.O_SYNC;
        case 'r+'   : return constants.O_RDWR;
        case 'rs+'  : // Fall through.
        case 'sr+'  : return constants.O_RDWR | constants.O_SYNC;

        case 'w'    : return constants.O_TRUNC | constants.O_CREAT | constants.O_WRONLY;
        case 'wx'   : // Fall through.
        case 'xw'   : return constants.O_TRUNC | constants.O_CREAT | constants.O_WRONLY | constants.O_EXCL;

        case 'w+'   : return constants.O_TRUNC | constants.O_CREAT | constants.O_RDWR;
        case 'wx+'  : // Fall through.
        case 'xw+'  : return constants.O_TRUNC | constants.O_CREAT | constants.O_RDWR | constants.O_EXCL;

        case 'a'    : return constants.O_APPEND | constants.O_CREAT | constants.O_WRONLY;
        case 'ax'   : // Fall through.
        case 'xa'   : return constants.O_APPEND | constants.O_CREAT | constants.O_WRONLY | constants.O_EXCL;
        case 'as'   : // Fall through.
        case 'sa'   : return constants.O_APPEND | constants.O_CREAT | constants.O_WRONLY | constants.O_SYNC;

        case 'a+'   : return constants.O_APPEND | constants.O_CREAT | constants.O_RDWR;
        case 'ax+'  : // Fall through.
        case 'xa+'  : return constants.O_APPEND | constants.O_CREAT | constants.O_RDWR | constants.O_EXCL;
        case 'as+'  : // Fall through.
        case 'sa+'  : return constants.O_APPEND | constants.O_CREAT | constants.O_RDWR | constants.O_SYNC;
    }

    throw new Error(`Invalid flags : '${flags}'.`);
}


/**
 * Set default values from `default` to options if they are not defined.
 * @param {object} options
 * @param {object} default_
 */
function setOptions(options, default_) {
    for (const [key, value] of Object.entries(default_)) {
        if (options[key] === undefined)
            options[key] = value;
    }
}

module.exports = {
    stringToFlags,
    setOptions
};
