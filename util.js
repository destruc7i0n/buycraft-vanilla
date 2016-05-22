var version = "1.0.0"; // the plugin version

var request = require("superagent");
var c = require("./config.json");

exports.versionCheck = function(callback) {
    request.get("https://plugin.buycraft.net/versions/vanilla")
        .end(function (err, response) {
        if (err) {
            callback(new Error(err), false);
            return;
        }
        resp = response.body;
        if(resp.version > version) {
            callback(new Error("A new version of Buycraft Vanilla is available. Go to your server panel at https://server.buycraft.net to update."), true);
        }
        callback(null, false);
    });    
}

exports.StoMin = function(ms) {
    return Math.floor(ms / 60);
}

exports.removeDoubles = function(str) { // replace doubles to integers (mc does not support doubles)
    strsplit = str.split(" ");
    for(strr in strsplit) { 
        if(!isNaN(strsplit[strr])) {
            strsplit[strr] = (Math.round(Number(strsplit[strr]))).toString();
        }
    }
    return strsplit.join(" ");    
}

exports.getOnlinePlayers = function(playerString, players) {
    var onlineplayers = [];
    for(player in players) {
        player = players[player];
        if(playerString.indexOf(player.name) == -1) {
            if (c.DEBUG) {
                console.log("[DEBUG] Player " + player.name + " is not currently online. Trying again soon...");
            }
        } else {
            onlineplayers.push(player); // if player online, add to array
        }
    }
    return onlineplayers;
}
