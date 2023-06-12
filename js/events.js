class Event {
    constructor(tl) {
        this.timeline = tl
    }

    formEvent(worldState) {
        this.calculateEdit(worldState)
        this.report = this.eventReport(worldState)
    }

    calculateEdit(worldState) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": Event
            }
        }
    }
    eventReport(worldState) { return `Nothing happened.` }
}

class EventWait extends Event {
    calculateEdit(worldState) { this.worldEdit = {} }
}

class EventVoid extends Event {
    calculateEdit(worldState) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventVoid
            }
        }
    }
}

class EventCreatePlayers extends Event {
    formEvent(worldState, args) {
        this.calculateEdit(worldState, args)
        this.report = this.eventReport(worldState)
    }

    calculateEdit(worldState, args) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline
            },
            "players": []
        }
        for (let i = 0; i < args[0]; i++) {
            const player = ThingFactory.generateNewPlayer(worldState)
            this.worldEdit.players.push(player)
        }
    }
    eventReport(worldState) {
        const num = this.worldEdit.players.length
        return `${num} players created!`
    }
}

class EventTourneyStart extends Event {
    calculateEdit(worldState) {
        const tourney = ThingFactory.generateNewTourney(worldState)
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventTourneyStart
            },
            "tourneys": [ tourney ],
            "league": {
                "currentTourney": tourney.id
            }
        }
    }
    eventReport(worldState) {
        const tourney = this.worldEdit.tourneys[0]
        return `${tourney.name} has started!`
    }
}

class EventTourneyConclude extends Event {
    calculateEdit(worldState) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventTourneyConclude
            },
            "league": {
                "currentTourney": 0
            }
        }
    }
    eventReport(worldState) {
        const tourney = getWorldItem(worldState, "tourneys", worldState.league.currentTourney)
        return `${tourney.name} has ended.`
    }
}