class Wildlife {
    static None = new Wildlife("None", "No critters on this hole.", 0x000000, 0)
        static mosqBiteFunc = (func) => {
            return function (worldState, tl, options) {
                const hole = activeHoleOnTimeline(worldState, tl)
                const activePlayers = unsunkPlayers(worldState, hole)
                const randomPlayer = activePlayers.at(chooseFromWeights(activePlayers.map(p => p.juiciness())))
                if (randomPlayer !== undefined && Math.random() < 0.05 * hole.stats.quench)
                    Greedler.queueEvent([ tl, EventMosquitoBite, { "player": randomPlayer, "damage": 0.01 }])

                let out = func.apply(this, arguments)
                return out
            }
        }
    static Mosquito = new Wildlife("Mosquitoes", "Mosquitoes in the skies! Players, hope you brought bug spray.", 0x000000, 1,
        { "strokeType": this.mosqBiteFunc, "strokeOutcome": this.mosqBiteFunc })
    static Komodo = new Wildlife("Komodo Dragons", "Komodo dragons in the shadows. Players, keep your antibiotics handy!", 0x000000, 1, {
        "strokeOutcome": (func) => {
            return function (worldState, tl, options) {
                let [outEdit, outReport] = func.apply(this, arguments)

                const player = activePlayerOnTimeline(worldState, tl)
                const editPlayer = outEdit.players.find(p => p.id == player.id)
                if (Math.random() < 0.03 && !player.mods.includes(Mod.Poisoned) && !editPlayer.ball.sunk) {
                    Greedler.queueEvent([ tl, EventKomodoAttack, { "player": player }])
                }

                return [outEdit, outReport]
            }
        }})
    static Worm = new Wildlife("Sand Worms", "Worms in the sand! Players, be wary of those bunkers.", 0x000000, 1, {
        "strokeOutcome": (func) => {
            return function (worldState, tl, options) {
                let [outEdit, outReport] = func.apply(this, arguments)

                const player = activePlayerOnTimeline(worldState, tl)
                let editPlayer = outEdit.players.find(p => p.id == player.id)

                if (Math.random() < 0.3 && editPlayer.ball.terrain == Terrain.Bunker) {
                    editPlayer.ball.terrain = Terrain.WormPit
                    outReport = `The ball ${player.ball.terrain.leavingText}, flying ${Math.round(editPlayer.ball.distanceJustFlown)} gallons and landing ${Terrain.WormPit.arrivingText}`

                    Greedler.queueEvent([ tl, EventWormBattle, { "player": player }])
                }
                return [outEdit, outReport]
            }
        }})

    static Wildlives = [ Wildlife.None, Wildlife.Mosquito, Wildlife.Komodo, Wildlife.Worm ]

    constructor(name, report, color, weight, eventChanges = {}, apply = (x) => { x.wildlife = this }) {
        this.name = name
        this.report = report
        this.color = color
        this.priority = 2
        this.weight = weight
        this.eventChanges = eventChanges
        this.apply = apply
    }

    modify(type, func) {
        if (this.eventChanges[type] !== undefined) {
            return this.eventChanges[type](func)
        }
        else return func
    }
}

class EventKomodoAttack extends Event {
    type = "komodoAttack"
    depth = "Player"

    defaultEffect(worldState, tl, options) {
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

    defaultEffect(worldState, tl, options) {
        const worldEdit = editOfKillPlayersInTourney(worldState, tl, [options.player])
        const report = `Too slow. The komodos feast on ${options.player.fullName()}.`
        return [worldEdit, report]
    }
}

class EventMosquitoBite extends Event {
    type = "mosquitoBite"
    depth = "Player"

    defaultEffect(worldState, tl, options) {
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

    defaultEffect(worldState, tl, options) {
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