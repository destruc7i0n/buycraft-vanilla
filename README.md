# BuyCraft Vanilla
An integration of the BuyCraft API with Vanilla Minecraft Servers using Node.js

## Installation and usage

In your Minecraft server.properties, make sure you have:
```
enable-rcon=true
rcon.password=<your password>
rcon.port=<1-65535>
enable-query=true
query.port=<1-65535>
```

Clone repository onto a server, edit ```config.json``` (see below for more info) and change any options, and then, in the repository folder:
```sh
$ npm install
$ node index.js
```

### Configuration
```js
{
    "BUYCRAFT_API_KEY": "1234", /* Your BuyCraft API Key */
    "INTERVAL_BETWEEN_COMMAND_SENT": 10, /* interval between each command is sent to server */
    "MINECRAFT_SERVER_RCON_IP": "example.com", /* minecraft server ip (make sure you have enabled rcon) */
    "MINECRAFT_SERVER_RCON_PORT": <1-65535>, /* minecraft server rcon port */
    "MINECRAFT_SERVER_RCON_PASSWORD": "<your password>", /* minecraft server rcon password */
    "MINECRAFT_SERVER_IP": "mcpwn.net", /* minecraft server ip (not rcon) */
    "MINECRAFT_SERVER_PORT": 25565, /* minecraft server port (no rcon) */
    "RCON_RECONNECT_DELAY": 10, /* how mant seconds before trying to reconnect to rcon */
    "DEBUG": true /* dev debugging */
}
```

## Upcoming
* Removal of `sleep` package

## Suggestions
If you have any suggestions or feature requests, feel free to add an issue and I will take a look and possibly add it to the "Upcoming" section!

## Thanks
* [minecrafter](https://github.com/hydrabolt) for buycraft-js
* [SecretOnline](https://github.com/secretonline) for Rcon reconnecting

## License

ISC. See `LICENSE`.
