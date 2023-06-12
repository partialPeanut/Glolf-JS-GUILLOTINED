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
                ${tourney.players.length} players, ${tourney.numCourses} divisions with ${tourney.holesPerCourse} holes each, and ${tourney.sinReward} $ins up for grabs!\n
                GLOLF!! BY ANY MEANS NECESSARY.`
    }
}

class EventDivison extends Event {
    calculateEdit(worldState) {
        const tourney = activeTourney(worldState)
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
            "timelines": newCourses.map(c => EventDivison),
            "courses": newCourses,
            "tourneys": [{
                "id": tourney.id,
                "courses": newCourses.map(c => c.id)
            }]
        }
    }
    eventReport(worldState) { return `The players are divided.` }
}

class EventMultiplication extends Event {
    calculateEdit(worldState) {
        const tourney = activeTourney(worldState)
        const finalCourse = ThingFactory.generateNewCourse(worldState, "FINALS", tourney.players)

        this.worldEdit = {
            "timetravel": {
                "timeline": 0
            },
            "timelines": [ EventMultiplication ],
            "courses": [ finalCourse ],
            "tourneys": [{
                "id": tourney.id,
                "courses": [ finalCourse.id ]
            }]
        }
    }
    eventReport(worldState) {
        const thisCourse = this.worldEdit.courses[0]
        return `The champions converge. ${thisCourse.players.length} players advance.`
    }
}

class EventCourseStart extends Event {
    calculateEdit(worldState) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventCourseStart
            }
        }
    }
    eventReport(worldState) {
        const thisCourse = activeCourseOnTimeline(worldState, this.timeline)
        return `Division ${thisCourse.division} begins its course!`
    }
}

class EventWeatherReport extends Event {
    calculateEdit(worldState) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventWeatherReport
            }
        }
    }
    eventReport(worldState) {
        const thisCourse = activeCourseOnTimeline(worldState, this.timeline)
        return `This course's weather report predicts: ${thisCourse.weather}!`
    }
}

class EventHoleStart extends Event {
    calculateEdit(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)
        const hole = ThingFactory.generateNewHole(worldState)
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventHoleStart
            },
            "holes": [ hole ],
            "courses": [{
                "id": course.id,
                "currentHole": hole.id,
                "holeNumber": course.holeNumber+1
            }]
        }
    }
    eventReport(worldState) {
        return `Next up: Hole Number ${this.worldEdit.courses[0].holeNumber}.`
    }
}

class EventWildlifeReport extends Event {
    calculateEdit(worldState) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventWildlifeReport
            }
        }
    }
    eventReport(worldState) {
        const thisHole = activeHoleOnTimeline(worldState, this.timeline)
        return `Wildlife Report: ${thisHole.wildlife}!`
    }
}

class EventUpTop extends Event {
    calculateEdit(worldState) {
        const hole = activeHoleOnTimeline(worldState, this.timeline)
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventUpTop
            },
            "holes": [{
                "id": hole.id,
                "currentPlayer": -1
            }]
        }
    }
    eventReport(worldState) { return `The cycle begins anew.` }
}

class EventStrokeType extends Event {
    calculateEdit(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)
        const hole = activeHoleOnTimeline(worldState, this.timeline)
        const oldCP = hole.currentPlayer
        let newCP = course.players.slice(oldCP+1).findIndex(p => !getWorldItem(worldState, "players", p).ball.sunk)

        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventStrokeType
            },
            "holes": [{
                "id": hole.id,
                "currentPlayer": newCP
            }]
        }
    }
    eventReport(worldState) {
        const cpi = this.worldEdit.holes[0].currentPlayer
        return `The ${cpi}th player tees.`
    }
}

class EventStrokeOutcome extends Event {
    calculateEdit(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)
        const hole = activeHoleOnTimeline(worldState, this.timeline)
        const player = activePlayerOnTimeline(worldState, this.timeline)

        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventStrokeOutcome
            }
        }
    }
    eventReport(worldState) {
        const player = activePlayerOnTimeline(worldState, this.timeline)
        return `${player.fullName()} does a big hit!!`
    }
}

class EventHoleFinish extends Event {
    calculateEdit(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventHoleFinish
            },
            "courses": [{
                "id": course.id,
                "currentHole": 0
            }]
        }
    }
    eventReport(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)
        return `That was Hole Number ${course.holeNumber}.`
    }
}

class EventCourseFinish extends Event {
    calculateEdit(worldState) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventCourseFinish
            }
        }
    }
    eventReport(worldState) {
        const thisCourse = activeCourseOnTimeline(worldState, this.timeline)
        return `Division ${thisCourse.division} has concluded its course.`
    }
}

class EventTourneyFinish extends Event {
    calculateEdit(worldState) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventTourneyFinish
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