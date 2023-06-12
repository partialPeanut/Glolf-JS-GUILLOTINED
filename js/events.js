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
    eventReport(worldState) { return `---` }
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
        return `Contracts signed. ${num} players rise from the ground.`
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
        return `Wlecome to ${tourney.name}!\n
                ${tourney.players.size} players, ${tourney.numCourses} divisions with ${tourney.holesPerCourse} holes each, and ${tourney.sinReward} $ins up for grabs!\m
                GLOLF!! BY ANY MEANS NECESSARY.`
    }
}

class EventDivison extends Event {
    calculateEdit(worldState) {
        const tourney = getWorldItem(worldState, "tourneys", worldState.league.currentTourney)
        let playersLeft = tourney.players.slice(0)
        let playersPerCourse = Math.floor(tourney.players.length/tourney.numCourses)

        const newCourses = []
        for (let i = 0; i < tourney.numCourses-1; i++) {
            newCourses.push(ThingFactory.generateNewCourse(worldState, worldState.league.divisionNames[i], chooseNumFromArrayAndRemove(playersLeft, playersPerCourse)))
        }
        newCourses.push(ThingFactory.generateNewCourse(worldState, worldState.league.divisionNames[tourney.numCourses-1], playersLeft))

        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline
            },
            "timelines": [
                EventDivison,
                EventDivison,
                EventDivison,
                EventDivison
            ],
            "courses": newCourses,
            "tourneys": [{
                "id": tourney.id,
                "courses": newCourses.map(c => c.id)
            }]
        }
    }
    eventReport(worldState) { return `The players are divided.` }
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