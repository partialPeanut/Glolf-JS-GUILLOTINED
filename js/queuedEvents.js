class EventCreatePlayers extends Event {
    type = "createPlayers"
    depth = "League"

    calculateEdit(worldState, tl, options) {
        let worldEdit = {
            "timetravel": {
                "timeline": tl
            },
            "players": []
        }
        for (let i = 0; i < options.playerCount; i++) {
            const player = ThingFactory.generateNewPlayer(worldState)
            worldEdit.players.push(player)
        }

        const report = `Contracts signed. ${options.playerCount} players rise from the ground.`
        return [worldEdit, report]
    }
}

class EventAggression extends Event {
    type = "aggression"
    depth = "Player"

    calculateEdit(worldState, tl, options) {
        const atkPlayer = options.atkPlayer
        const defPlayer = options.defPlayer

        const newDist = defPlayer.ball.distance + randomReal(1,5) * atkPlayer.stats.yeetness
        const newTerrain = calculatePostRollTerrain(worldState, tl, defPlayer, newDist)

        const worldEdit = {
            "timetravel": {
                "timeline": tl
            },
            "players": [{
                "id": defPlayer.id,
                "ball": {
                    "distance": newDist,
                    "terrain": newTerrain
                }
            }]
        }

        const report = `${atkPlayer.fullName()}'s ball hits ${defPlayer.fullName()}'s ball away from the hole!`
        return [worldEdit, report]
    }
}

class EventKomodoAttack extends Event {
    type = "komodoAttack"
    depth = "Player"

    calculateEdit(worldState, tl, options) {
        const player = options.player
        const hole = activeHoleOnTimeline(worldState, tl)

        const counters = hole.dimensions.par + Math.floor(curveLoggy(0, 4, player.stats.scrappiness))
        const poisonedPlayer = {
            "id": player.id,
            "mods": player.mods,
            "stats": player.stats
        }
        Mod.Poisoned.apply(poisonedPlayer, counters)

        const worldEdit = {
            "timetravel": {
                "timeline": tl
            },
            "players": [ poisonedPlayer ]
        }

        const report = `${player.fullName()} is attacked my komodo dragons and is poisoned!`
        return [worldEdit, report]
    }
}

class EventKomodoKill extends Event {
    type = "komodoKill"
    depth = "Player"

    calculateEdit(worldState, tl, options) {
        const worldEdit = editOfKillPlayerInTourney(worldState, tl, options.player)
        const report = `Too slow. The komodos feast on ${options.player.fullName()}.`
        return [worldEdit, report]
    }
}

class EventMosquitoBite extends Event {
    type = "mosquitoBite"
    depth = "Player"

    calculateEdit(worldState, tl, options) {
        const player = options.player
        const randomStat = randomFromArray(Object.keys(player.stats))
        let modifiedStats = JSON.parse(JSON.stringify(player.stats))
        modifiedStats[randomStat] -= options.damage

        const worldEdit = {
            "timetravel": {
                "timeline": tl
            },
            "players": [{
                "id": player.id,
                "stats": modifiedStats
            }]
        }

        const report = `${player.fullName()} is bitten by mosquitoes and loses ${options.damage} ${randomStat}.`
        return [worldEdit, report]
    }
}

class EventWormBattle extends Event {
    type = "wormBattle"
    depth = "Player"

    calculateEdit(worldState, tl, options) {
        const hole = activeHoleOnTimeline(worldState, tl)
        const player = options.player
        const wonBattle = Math.random() < curveLoggy(0, 1, player.stats.scrappiness)

        let worldEdit, report
        if (wonBattle) {
            worldEdit = {
                "timetravel": {
                    "timeline": tl
                },
                "players": [{
                    "id": player.id,
                    "ball": {
                        "sunk": true,
                        "distance": 0,
                        "terrain": Terrain.Hole
                    }
                }]
            }

            report = `${player.fullName()} knocks the worm unconscious! The ball rolls into the wormhole for a ` +
                     `${player.ball.stroke == 1 ? "hole in one!" : intToBird(player.ball.stroke - hole.dimensions.par)}!`
        }
        else {
            worldEdit = {
                "timetravel": {
                    "timeline": tl
                },
                "players": [{
                    "id": player.id,
                    "ball": {
                        "sunk": false,
                        "distance": hole.dimensions.length,
                        "terrain": Terrain.Tee
                    }
                }]
            }

            report = `${player.fullName()}'s ball is eaten by the worm! They'll have to start at the beginning.`
        }

        return [worldEdit, report]
    }
}

class EventTourneyDonate extends Event {
    type = "tourneyDonate"
    depth = "Tourney"

    calculateEdit(worldState, tl) {
        const tourney = activeTourney(worldState)
        const totalSins = tourney.players.reduce((total, pid) => total + getWorldItem(worldState, "players", pid).netWorth, 0)
        const donation = Math.floor(0.2 * totalSins / tourney.players.length)

        const worldEdit = {
            "timetravel": {
                "timeline": tl
            },
            "players": tourney.players.map(pid => {
                return {
                    "id": pid,
                    "netWorth": getWorldItem(worldState, "players", pid).netWorth - donation
                }
            })
        }

        const report = `Hearts swell! Kindness overflowing! Each player atones for ${donation.toLocaleString()} $ins.`
        return [worldEdit, report]
    }
}