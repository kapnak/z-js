const zprotocol = require('zprotocol-js')
const {connect, host} = require('../src/index');

const address = '192.168.1.1:9999';

(async () => {
    await zprotocol.ready;

    const kp1 = zprotocol.generate_kp();
    const kp2 = zprotocol.generate_kp();

    await host(kp1, {host: '127.0.0.1'});

    const directory = await connect('127.0.0.1', 1501, kp1.pk, {});
    await directory.register(address, kp2);
    const addressRetrieve = await directory.ask(kp2.pk);

    console.log({address, addressRetrieve});
    if (addressRetrieve === address)
        console.log('Test successful.');
    else
        throw Error('The address retrieved is not the address registered.');
})();
