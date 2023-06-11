class Event {
    constructor(worldState, tl) {
        this.timeline = tl
        this.calculateEdit(worldState)
        this.report = this.eventReport()
    }

    calculateEdit(worldState) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": Event
            }
        }
    }
    eventReport() { return `Nothing happened.` }
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

class EventTourneyStart extends Event {
    calculateEdit(worldState) {
        const [id, tourney] = ThingFactory.generateNewTourney(worldState)

        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventTourneyStart
            },
            "tourneys": {},
            "league": {
                "currentTourney": id
            }
        }
        this.worldEdit.tourneys[id] = tourney
    }
    eventReport() { return `Tourney started!` }
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
    eventReport() { return `Tourney ended.` }
}