class Event {
    constructor(worldState, tl) {
        this.phase = Phase.Void
        this.timeline = tl
        calculateEdit(worldState)
    }

    calculateEdit(worldState) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": this.phase
            }
        }
    }
    eventReport() { return `Nothing happened.` }
}

class EventTourneyStart extends Event {
    constructor(worldState, tl) {
        this.phase = Phase.TourneyStart
        this.timeline = tl
        calculateEdit(worldState)
    }

    calculateEdit(worldState) {
        const [id, tourney] = ThingFactory.generateNewTourney(worldState)

        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": this.phase
            },
            "tourneys": {},
            "league": {
                "currentTourney": id
            }
        }
        this.worldEdit.tourneys[id] = tourney
    }
    eventReport() { return `Nothing happened.` }
}

class EventTourneyConclude extends Event {
    constructor(worldState, tl) {
        this.phase = Phase.TourneyConclude
        this.timeline = tl
        calculateEdit(worldState)
    }

    calculateEdit(worldState) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": this.phase
            },
            "league": {
                "currentTourney": 0
            }
        }
    }
    eventReport() { return `Nothing happened.` }
}