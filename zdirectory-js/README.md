# zdirectory-js

This library allow user to use ZDirectory servers.

ZDirectory are used to associate a public key to an address (host / port).

This library doesn't have a server implementation.
But you can make requests to servers (register / ask).

## Usage

```js
const zprotocol = require('zprotocol-js');
const zdirectory = require('zdirectory-js');

(async () => {
    let dir = await zdirectory.connect('127.0.0.1', 1501, 'zav2vcukgxag6vwsbmoyftkidc7km2vp753mhlye26wbmhtjzbga');

    let kp = zprotocol.generate_kp();   // Generate a kp for the purpose of the example.
    
    // Register an address
    await dir.register('203.0.113.0:1234', kp);
    
    // Ask for an address
    let address = await dir.ask(kp.pk);
    
    console.log(address);       // 203.0.113.0:1234
})();
```

## Documentation

### `function connect(host, port, pk, options)`

Return a `Directory` object.
If `options.connect` is not changed to `true` this function will connect / disconnect
of the server for every request (ask/register).
* `host` `<string>`
* `port` `<number>`
* `pk` `<Uint8Array<32>>` `<string>` - The public key or a base 32 representation of it.
* `option` `<object>`
  * `connect` `<boolean>` - **Default: false.** When true, a connection is made and kept else the connection start / end for each request. Default: false.
  * `kp` `<{pk: Uint8Array<32>, sk: Uint8Array<64>}>` - **Default: undefined.** The key pair used to connect to the directory.
* Returns `Promise<Directory>`

### Class: Directory

### `async directory.register(address, local_kp=this.kp, timeout=5)`
Register an address to the directory.
* `address` `<string>` - The address to register.
* `local_kp` `<{pk: Uint8Array<32>, sk: Uint8Array<64>}>` - **Default: this.kp.** The public key will identify the address in the directory.
* `timeout` `<number>` - **Default: 5.** The timeout in seconds.
* Return: `Promise<void>`

### `async directory.ask(pk, timeout=5)`
Get the address associate to the given public key (`pk`).
* `pk` `<Uint8Array<32>>` pk - The public key.
* `timeout` `number` - **Default: 5.** The timeout in seconds. Default: 5.
* Return: `Promise<string>`


## Contact

Don't hesitate to contact me :
> Mail : kapnak.mail@gmail.com  
> Discord : kapnak

Monero (XMR) :
```
444DEqjmWnuiiyuzxAPYwdQgcujJU1UYFAomsdS77wRE9ooPLcmEyqsLtNC11C5bMWPif5gcc7o6gMFXvvQQEbVVN6CNnBT
```
