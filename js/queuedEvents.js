class EventCreatePlayers extends Event {
    calculateEdit(worldState, options) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline
            },
            "players": []
        }
        for (let i = 0; i < options.playerCount; i++) {
            const player = ThingFactory.generateNewPlayer(worldState)
            this.worldEdit.players.push(player)
        }

        this.report = `Contracts signed. ${options.playerCount} players rise from the ground.`
    }
}

class EventAggression extends Event {
    calculateEdit(worldState, options) {
        const atkPlayer = options.atkPlayer
        const defPlayer = options.defPlayer

        const newDist = defPlayer.ball.distance + randomReal(1,5) * atkPlayer.stats.yeetness
        const newTerrain = calculatePostRollTerrain(worldState, this.timeline, defPlayer, newDist)

        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline
            },
            "players": [{
                "id": defPlayer.id,
                "ball": {
                    "distance": newDist,
                    "terrain": newTerrain
                }
            }]
        }

        this.report = `${atkPlayer.fullName()}'s ball hits ${defPlayer.fullName()}'s ball away from the hole!`
    }
}

class EventMosquitoBite extends Event {
    calculateEdit(worldState, options) {
        const player = options.player
        const randomStat = randomFromArray(Object.keys(player.stats))
        let modifiedStats = JSON.parse(JSON.stringify(player.stats))
        modifiedStats[randomStat] -= options.damage

        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline
            },
            "players": [{
                "id": player.id,
                "stats": modifiedStats
            }]
        }

        this.report = `${player.fullName()} is bitten by mosquitoes and loses ${options.damage} ${randomStat}.`
    }
}

class EventWormBattle extends Event {
    calculateEdit(worldState, options) {
        const hole = activeHoleOnTimeline(worldState, tl)
        const player = options.player
        const wonBattle = Math.random() < curveLoggy(0, 1, player.stats.scrappiness)

        if (wonBattle) {
            this.worldEdit = {
                "timetravel": {
                    "timeline": this.timeline
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

            this.report = `${player.fullName()} knocks the worm unconscious! The ball rolls into the wormhole for a ` +
                          `${(player.ball.stroke == 1 ? "hole in one!" : intToBird(player.ball.stroke - hole.dimensions.par))}!`
        }
        else {
            this.worldEdit = {
                "timetravel": {
                    "timeline": this.timeline
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

            this.report = `${player.fullName()}'s ball is eaten by the worm! They'll have to start at the beginning.`
        }
    }
}

class EventTourneyDonate extends Event {
    calculateEdit(worldState) {
        const tourney = activeTourney(worldState)
        const totalSins = tourney.players.reduce((total, pid) => total + getWorldItem(worldState, "players", pid).netWorth, 0)
        const donation = Math.floor(0.2 * totalSins / tourney.players.length)

        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline
            },
            "players": tourney.players.map(pid => {
                return {
                    "id": pid,
                    "netWorth": getWorldItem(worldState, "players", pid).netWorth - donation
                }
            })
        }

        this.report = `Hearts swell! Kindness overflowing! Each player atones for ${donations.toLocaleString()} $ins.`
    }
}