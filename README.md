# BuyCraft Vanilla
An integration of the BuyCraft API with Vanilla Minecraft Servers using Node.js

## Installation and usage

In your Minecraft server.properties, make sure you have:
```
enable-rcon=true
rcon.password=<your password>
rcon.port=<1-65535>
```

Clone repository onto a server (or download [this](https://github.com/destruc7i0n/buycraft-vanilla/archive/master.zip) onto the server), edit ```config.json``` (see "Configuration" for more info) and change the options, and then, in the repository folder:
```sh
$ cd buycraft-vanilla
$ chmod +x buycraft
$ ./buycraft install
$ ./buycraft start
```

Then to stop: 
```sh
$ ./buycraft stop
```

The log will be at `buycraft.log`, be sure to look at it if something goes wrong.

### Configuration
```js
{
    "BUYCRAFT_API_KEY": "1234", /* Your BuyCraft API Key */
    "INTERVAL_BETWEEN_COMMAND_SENT": 10, /* interval between each command is sent to server */
    "MINECRAFT_SERVER_RCON_IP": "example.com", /* minecraft server ip (make sure you have enabled rcon) */
    "MINECRAFT_SERVER_RCON_PORT": <1-65535>, /* minecraft server rcon port */
    "MINECRAFT_SERVER_RCON_PASSWORD": "<your password>", /* minecraft server rcon password */
    "DEBUG": false /* dev debugging */
}
```

## Upcoming
None.

## Suggestions
If you have any suggestions or feature requests, feel free to add an issue and I will take a look and possibly add it to the "Upcoming" section!

## Thanks
* [minecrafter](https://github.com/minecrafter) for buycraft-js
* [SecretOnline](https://github.com/secretonline) for Rcon reconnecting 
* [M4GNV5](https://github.com/M4GNV5) for various optimizations and the improved Rcon lib

## License

MIT. See `LICENSE`.
