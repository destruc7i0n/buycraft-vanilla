"use strict";
var BuycraftAPI = require("buycraft-js");
var Query = require("mcquery");
var Rcon = require("rcon");
var sleep = require("sleep");
var async = require("async");
var c = require("./config.json");
var debug = c.DEBUG;
var client = new BuycraftAPI(c.BUYCRAFT_API_KEY);
var rclient = new Rcon(c.MINECRAFT_SERVER_RCON_IP, c.MINECRAFT_SERVER_RCON_PORT, c.MINECRAFT_SERVER_RCON_PASSWORD); // connect to Rcon
var rconTimeout, maininfo, players;

// first check to make sure key works
client.information(function(err, r){
    if(err){
        console.log("[ERROR] " + err);
        process.exit();
    } else {
        checkDue();
    }
});

rclient.on("auth", function() {
    console.log("[INFO] Authenticated with " + c.MINECRAFT_SERVER_RCON_IP + ":" + c.MINECRAFT_SERVER_RCON_PORT);
}).on("response", function(str) {
    if (debug && str) {
        console.log("[DEBUG] Got response: " + str);
    }
}).on("end", function() {
    console.log("[INFO] Rcon closed!");
}).on("error", function() { // rcon reconnect - thanks to Secret_Online
    if (typeof rconTimeout === 'undefined') {
        rclient.disconnect();
        if(debug) {
            console.log("[DEBUG] Trying to reconnect again in " + c.RCON_RECONNECT_DELAY + " seconds...");
        }        
        rconTimeout = setTimeout(function() {
            rclient.connect();
            rconTimeout = undefined;
        }, c.RCON_RECONNECT_DELAY * 1000);
    }
});

rclient.connect();

function checkDue() {
    var query = new Query(c.MINECRAFT_SERVER_IP, c.MINECRAFT_SERVER_PORT, {timeout: 10000}); // query server for player list
    client.duePlayers(function(err, info) { // get due players list from BuyCraft API
        maininfo = info;
        if (err) {
            console.log("[ERROR] Got error: " + err);
        } else {
            if(maininfo.players.length == 0) { // if no players, wait for the amount of time specified in API
                setTimeout(checkDue, maininfo.meta.next_check * 1000);
                if (debug) {
                    console.log("[DEBUG] Waiting for " + maininfo.meta.next_check + " seconds until next check.");
                }
            } else {
                players = maininfo.players;
                async.each(players, function (player, cb) { // if players, loop through them using async
                    //player = players[player];                    

                    query.connect(function (err) {
                        if (err) {
                            cb(err);
                        } else {     
                            query.full_stat(function(err, stat) {
                                if(stat.player_.indexOf(player.name) > -1) { // check if player is online
                                    client.getOnlineCommands(player.id,function(err, online){ // get players commands
                                        if(!err) {
                                            if(online.commands.length !== 0) { 
                                                commands = online.commands;
                                                for(command in commands) {
                                                    command = commands[command];

                                                    finalcommand = command.command;
                                                    
                                                    finalcommandsplit = finalcommand.split(" ");
 
                                                    for(finalcommandd in finalcommandsplit) { // replace doubles to integers (mc does not support doubles)
                                                        if(!isNaN(finalcommandsplit[finalcommandd])) {
                                                            finalcommandsplit[finalcommandd] = (Math.round(Number(finalcommandsplit[finalcommandd]))).toString(); 
                                                        }
                                                    }
                                                    finalcommand = finalcommandsplit.join(" ");
                                                    
                                                    finalcommand = finalcommand.replace("{name}", player.name); // replace name with player name
                                                    rclient.send(finalcommand); // send command to server via rcon
                                                    console.log("[INFO] Processed command " + command.id + " ( " + finalcommand + " ) by " + player.name + ".");
                                                    client.deleteCommands([command.id], function(err, bool) { // delete command from BuyCraft
                                                        if(!err && debug) {
                                                            console.log("[DEBUG] Deleted command.")
                                                        }
                                                    });
                                                    sleep.sleep(c.INTERVAL_BETWEEN_COMMAND_SENT); //ewwww - I will get rid of this ASAP
                                                }
                                            } else {
                                                if(debug) {
                                                    console.log("[DEBUG] No commands found.");
                                                }
                                            }
                                            cb();
                                        } else {
                                            cb(err);
                                        }                            
                                    });
                                }                                    
                            });                                
                        }
                    }); 
                }, function(err) { // wait for the amount of time specified by API to try again
                    if(err) {
                        setTimeout(checkDue, maininfo.meta.next_check * 1000);
                        console.log("[ERROR] "+err);
                        if (debug) {
                            console.log("[DEBUG] Waiting for " + maininfo.meta.next_check + " seconds until next check.");
                        } 
                    } else {
                        setTimeout(checkDue, maininfo.meta.next_check * 1000);
                        if (debug) {
                            console.log("[DEBUG] Waiting for " + maininfo.meta.next_check + " seconds until next check. Executed commands for " + maininfo.players.length +  " players.");
                        }                         
                    }                     
                }); 
                
            }
        }
    });
}     
