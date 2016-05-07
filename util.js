var version = "1.0.0"; // the plugin version

var request = require("superagent");

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
