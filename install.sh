secretKey=""
rconIP="127.0.0.1"
rconPort=25575
rconPass=""

function printSeparator() {
    echo "------------"
}

if [ ! which node > /dev/null ]; then 
    echo "Please follow the instructions in README to install node first"
    exit 1
fi

printSeparator
echo "Thank you for using the BuyCraft Vanilla installer!"
echo "Before we can complete the installation, we need to ask you some questions"
echo "These questions will help configure BuyCraft Vanilla so that you can get to using it"
printSeparator

echo -n "Enter your BuyCraft secret key: "
read secretKey
echo -n "Enter the Minecraft server's RCON IP [127.0.0.1]: "
read temp
if [ "${temp}" != "" ]; then
    rconIP=${temp}
fi
echo -n "Enter the Minecraft server's RCON port [25575]: "
read temp
if [ "${temp}" != "" ]; then
    rconPort=${temp}
fi
echo -n "Enter the Minecraft server's RCON password: "
stty -echo
read -s rconPass
stty echo
echo
printSeparator

json=$(printf '{"BUYCRAFT_API_KEY":"%s", "INTERVAL_BETWEEN_COMMAND_SENT": 10, "MINECRAFT_SERVER_RCON_IP": "%s", "MINECRAFT_SERVER_RCON_PORT": %i, "MINECRAFT_SERVER_RCON_PASSWORD": "%s"}\n' "$secretKey" "$rconIP" $rconPort "$rconPass")

if [ ! -d "node_modules" ]; then
    echo "Installing node modules..."
    npm install
    npm install forever -g
fi

echo "Writing config to file..."
echo ${json} | python -m json.tool > config.json
echo "Done! Simply start up Vanilla BuyCraft using"
echo "    ./buycraft start"
printSeparator
