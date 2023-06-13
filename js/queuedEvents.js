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