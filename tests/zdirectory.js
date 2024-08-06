const z = require('..');

const address = '192.168.1.1:9999';

(async () => {
    await z.ready;

    const kp1 = z.generate_kp();
    const kp2 = z.generate_kp();

    await z.directory.host(kp1, {host: '127.0.0.1'});

    const directory = await z.directory.connect('127.0.0.1', 1501, kp1.pk, {});
    await directory.register(address, kp2);
    const addressRetrieve = await directory.ask(kp2.pk);

    console.log({address, addressRetrieve});
    if (addressRetrieve === address)
        console.log('Test successful.');
    else
        throw Error('The address retrieved is not the address registered.');
})();
