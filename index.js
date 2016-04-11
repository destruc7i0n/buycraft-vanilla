"use strict";
var BuycraftAPI = require("buycraft-js");
var Rcon = require("./rcon.js");
var c = require("./config.json");
var debug = c.DEBUG;
var client = new BuycraftAPI(c.BUYCRAFT_API_KEY); // connect to BuyCraft
var rclient = new Rcon(c.MINECRAFT_SERVER_RCON_IP, c.MINECRAFT_SERVER_RCON_PORT); // connect to Rcon
var maininfo, player, players, onlineplayers, playercount, commands, command, commandcount, finalcommand, finalcommandsplit, finalcommandd;

// first check to make sure key works
client.information(function(err, r) {
    if(err) {
        console.log("[ERROR] " + err);
        process.exit(1);
    } else {
        rclient.auth(c.MINECRAFT_SERVER_RCON_PASSWORD, function(err){
            checkDue();
        });
    }
});

function checkDue() {
    client.duePlayers(function(err, info) { // get due players list from BuyCraft API
        maininfo = info;
        if(err) {
            console.log("[ERROR] Got error: " + err);
        } else {
            if(maininfo.players.length == 0) { // if no players, wait for the amount of time specified in API
                setTimeout(checkDue, maininfo.meta.next_check * 1000);
                if(debug) {
                    console.log("[DEBUG] Waiting for " + maininfo.meta.next_check + " seconds (" + + Math.floor(maininfo.meta.next_check / 60) + " minutes) until next check.");
                }
            } else {
                players = maininfo.players;                
                onlineplayers = [];

                rclient.command("list", function(err, resp){ // check if all players are online
                    for(player in players) {
                        player = players[player];
                        if(resp.indexOf(player.name) == -1) {
                            if (debug) {
                                console.log("[DEBUG] Player " + player.name + " is not currently online. Trying again soon...");
                            }
                        } else {
                            onlineplayers.push(player); // if player online, add to array
                        }
                    }
                    
                    players = onlineplayers;
                    playercount = players.length;
                    nextPlayer(0);
                    
                    function nextPlayer(n) { // if players online, loop through them 
                        if(n >= players.length) { // done with this cycle
                            setTimeout(checkDue, maininfo.meta.next_check * 1000);
                            if(debug) {
                                console.log("[DEBUG] Waiting for " + maininfo.meta.next_check + " seconds (" + + Math.floor(maininfo.meta.next_check / 60) + " minutes) until next check.");
                            }
                            return;
                        }
                        var player = players[n];

                        function runLoop() {
                            client.getOnlineCommands(player.id, function(err, online) { // get players' commands
                                if(!err) {
                                    if(online.commands.length !== 0) {
                                        commands = online.commands;
                                        commandcount = commands.length;
                                        runCommands(0);

                                        function runCommands(i) {
                                            if(i >= commands.length) {
                                                nextPlayer(n + 1);
                                                return;
                                            }
                                            finalcommand = commands[i].command;
                                            finalcommandsplit = finalcommand.split(" ");
                                            for(finalcommandd in finalcommandsplit) { // replace doubles to integers (mc does not support doubles)
                                                if(!isNaN(finalcommandsplit[finalcommandd])) {
                                                    finalcommandsplit[finalcommandd] = (Math.round(Number(finalcommandsplit[finalcommandd]))).toString();
                                                }
                                            }
                                            finalcommand = finalcommandsplit.join(" ");
                                            finalcommand = finalcommand.replace("{name}", player.name); // replace name with player name

                                            rclient.command(finalcommand, function(err, resp) {
                                                console.log("[INFO] Processed command " + commands[i].id + " ( " + finalcommand + " ) by " + player.name + ".");
                                                client.deleteCommands([commands[i].id], function(err, bool) { // delete command from BuyCraft
                                                    if(!err && debug) {
                                                        console.log("[DEBUG] Deleted command "+commands[i].id+".");
                                                    }
                                                    
                                                    commandcount--;
                                                    
                                                    if(commandcount == 0) { // if no more commands, remove one from the amount of players left to iterate over
                                                        playercount--;
                                                    }                                                                                                        
                                                    
                                                    if(commandcount > 0) {
                                                        setTimeout(runCommands.bind(null, i + 1), c.INTERVAL_BETWEEN_COMMAND_SENT * 1000); // set timeout for next command
                                                    } else {
                                                        runCommands(i + 1); // just run again to cancel
                                                    }

                                                });                                             
                                            }); // send command to server via rcon
                                        }
                                    } else {
                                        if(debug) {
                                            console.log("[DEBUG] No commands found."); // this should never happen
                                        }
                                    }
                                } else {
                                    console.log("[ERROR] " + err);
                                }
                            });
                        }

                        if(playercount > 0 && playercount !== players.length) { // make sure not first command to be executed and there is more than one player
                            setTimeout(runLoop, c.INTERVAL_BETWEEN_COMMAND_SENT * 1000); // set timeout for next command
                        } else {
                            runLoop(); // just run again to cancel
                        }

                    };                    
                });                    
                
            }
        }
    });
}
