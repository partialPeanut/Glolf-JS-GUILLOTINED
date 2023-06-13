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
        const course = activeCourseOnTimeline(worldState, this.timeline)
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