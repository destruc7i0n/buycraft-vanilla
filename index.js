"use strict";
var BuycraftAPI = require("buycraft-js");
var Rcon = require("./lib/rcon.js");
var util = require("./lib/util.js");
var c = require("./config.json");
var debug = c.DEBUG;
var client = new BuycraftAPI(c.BUYCRAFT_API_KEY); // connect to BuyCraft
var maininfo, player, players, onlineplayers, playercount, commands, command, commandcount, finalcommand, finalcommandsplit, finalcommandd, resp;

util.versionCheck(function(err, ver){
    if(err) {
        console.log(err.message);
        process.exit(1);
    }
    // make sure buycraft key works
    client.information(function(err, r) {
        if(err) {
            console.log("[ERROR] " + err);
            process.exit(1);
        } else {            
            checkDue();
        }
    });    
}); // firstly, check the version

function checkDue() {

    client.getOfflineCommands(function(err, cmds) {
        if(!err) {
            if(cmds.commands.length !== 0) {
                var rclient = new Rcon(c.MINECRAFT_SERVER_RCON_IP, c.MINECRAFT_SERVER_RCON_PORT); // create rcon client

                rclient.auth(c.MINECRAFT_SERVER_RCON_PASSWORD, function(err){ // only authenticate when needed                  
                    commands = cmds.commands;
                    commandcount = commands.length;
                    runCommands(0);

                    function runCommands(i) {
                        var thisCommand = commands[i];
                        if(i >= commands.length) {
                            return;
                        }                    
                        finalcommand = util.removeDoubles(thisCommand.command);
                        finalcommand = finalcommand.replace("{name}", player.name); // replace name with player name
                        
                        rclient.command(finalcommand, function(err, resp) {
                            console.log("[INFO] Processed command " + thisCommand.id + " ( " + finalcommand + " ) by " + thisCommand.player.name + ".");
                            client.deleteCommands([thisCommand.id], function(err, bool) { // delete command from BuyCraft
                                if(!err && debug) {
                                    console.log("[DEBUG] Deleted command "+thisCommand.id+".");
                                }

                                commandcount--;

                                if(commandcount == 0) { // if no more commands, remove one from the amount of players left to iterate over
                                    playercount--;
                                }                                                                                                        

                                if(commandcount > 0) {
                                    setTimeout(runCommands.bind(null, i + 1), c.INTERVAL_BETWEEN_COMMAND_SENT * 1000 + thisCommand.conditions.delay * 1000); // set timeout for next command
                                } else {
                                    runCommands(i + 1); // just run again to cancel
                                }

                            });                                        
                        })
                    }
                })
            }
        } else {
            console.log("[ERROR] " + err);
        }
    }) // run offline commands    
    
    client.duePlayers(function(err, info) { // get due players list from BuyCraft API
        maininfo = info;
        if(err) {
            console.log("[ERROR] Got error: " + err); // this will probably only happen is buycraft is down
        } else {
            if(maininfo.players.length == 0) { // if no players, wait for the amount of time specified in API
                setTimeout(checkDue, maininfo.meta.next_check * 1000);
                if(debug) {
                    console.log("[DEBUG] Waiting for " + maininfo.meta.next_check + " seconds (" + util.StoMin(maininfo.meta.next_check) + " minutes) until next check.");
                }
            } else {
                players = maininfo.players;                
                
                var rclient = new Rcon(c.MINECRAFT_SERVER_RCON_IP, c.MINECRAFT_SERVER_RCON_PORT); // create rcon client
                
                rclient.auth(c.MINECRAFT_SERVER_RCON_PASSWORD, function(err){ // only authenticate when needed                    
                    
                    rclient.command("list", function(err, resp){ // check if all players are online
                        onlineplayers = util.getOnlinePlayers(resp, players);

                        players = onlineplayers;
                        playercount = players.length;
                        nextPlayer(0);

                        function nextPlayer(n) { // if players online, loop through them 
                            if(n >= players.length) { // done with this cycle
                                setTimeout(checkDue, maininfo.meta.next_check * 1000);
                                if(debug) {
                                    console.log("[DEBUG] Waiting for " + maininfo.meta.next_check + " seconds (" + util.StoMin(maininfo.meta.next_check) + " minutes) until next check.");
                                }
                                rclient.close(); // close the rcon connection
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
                                                var thisCommand = commands[i];
                                                if(i >= commands.length) {
                                                    nextPlayer(n + 1);
                                                    return;
                                                }
                                                finalcommand = util.removeDoubles(thisCommand.command);
                                                finalcommand = finalcommand.replace("{name}", player.name); // replace name with player name

                                                rclient.command(finalcommand, function(err, resp) {
                                                    console.log("[INFO] Processed command " + thisCommand.id + " ( " + finalcommand + " ) by " + player.name + ".");
                                                    client.deleteCommands([thisCommand.id], function(err, bool) { // delete command from BuyCraft
                                                        if(!err && debug) {
                                                            console.log("[DEBUG] Deleted command "+thisCommand.id+".");
                                                        }

                                                        commandcount--;

                                                        if(commandcount == 0) { // if no more commands, remove one from the amount of players left to iterate over
                                                            playercount--;
                                                        }                                                                                                        

                                                        if(commandcount > 0) {
                                                            setTimeout(runCommands.bind(null, i + 1), c.INTERVAL_BETWEEN_COMMAND_SENT * 1000 + thisCommand.conditions.delay * 1000); // set timeout for next command
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
                }); 

            }
        }
    });
}
