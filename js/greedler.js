class Greedler {
    static eventQueue = [
        [0, EventCreatePlayers, 96]
    ]

    static doTimeStep(stuck = false) {
        let tls = Onceler.currentWorldState.timelines.length
        let didStep = false
        for (let i = 0; i < tls; i++) {
            if (i >= Onceler.currentWorldState.timelines.length) break
            didStep = this.doNextEventInTimeline(i, stuck) || didStep
        }
        if (!didStep) this.doTimeStep(true)
    }
    static doNextEventInTimeline(tl, stuck) {
        let tlPhase = this.nextPhaseInTimeline(tl, stuck)
        if (tlPhase[1] == EventWait) return false

        let nextEvent = new tlPhase[1](tlPhase[0])
        nextEvent.formEvent(Onceler.currentWorldState, tlPhase.slice(2))
        Onceler.addEvent(nextEvent)
        console.log(`(${tl}) ${nextEvent.report}`)
        return true
    }
    static nextPhaseInTimeline(tl, stuck) {
        let queuePhase = this.eventQueue.find(q => q[0] == tl)
        if (queuePhase !== undefined) {
            removeFromArray(this.eventQueue, queuePhase)
            return queuePhase
        }
        else return [tl, this.nextDefaultPhaseInTimeline(Onceler.currentWorldState, tl, stuck)]
    }
    static nextDefaultPhaseInTimeline(worldState, tl, stuck = false) {
        let tls = worldState.timelines.length
        switch(worldState.timelines[tl]) {
            case EventVoid:
                return EventTourneyStart
            case EventTourneyStart:
                return EventDivison

            case EventDivison:
                return EventCourseStart
            case EventMultiplication:
                return EventCourseStart

            case EventCourseStart:
                return EventWeatherReport
            case EventWeatherReport:
                return EventHoleStart
            case EventHoleStart:
                return EventWildlifeReport
            case EventWildlifeReport:
                return EventUpTop

            case EventUpTop:
                return EventStrokeType
            case EventStrokeType:
                return EventStrokeOutcome
            case EventStrokeOutcome:
                const course = activeCourseOnTimeline(worldState, tl)
                const hole = activeHoleOnTimeline(worldState, tl)
                const oldCP = hole.currentPlayer
                if (course.players.some((p, i) => i > oldCP && !getWorldItem(worldState, "players", p).ball.sunk)) return EventStrokeType
                else if (course.players.every(p => getWorldItem(worldState, "players", p).ball.sunk)) return EventHoleFinish
                else return EventUpTop

            case EventHoleFinish:
                let waiting = true
                let thisHoleNumber = activeCourseOnTimeline(worldState, tl).holeNumber
                for (let i = 0; i < tls; i++) {
                    if (activeCourseOnTimeline(worldState, i).holeNumber > thisHoleNumber) waiting = false
                }
                if (waiting && !stuck) return EventWait
                else if (thisHoleNumber == activeTourney(worldState).holesPerCourse) return EventCourseFinish
                else return EventHoleStart
                /*
            case "Wildlife Report":
                return "Up Top"
            case "Up Top":
                return "Stroke Type"
            case "Stroke Type":
                return "Stroke Outcome"
            case "Stroke Outcome":
                return "Hole Finish"
            case "Hole Finish":
                return "Course Finish"
            case "Course Finish":
                return "Tourney Finish"
            case "Tourney Finish":
                return "Tourney Reward"
            case "Tourney Reward":
                return "Memoriam"
            case "Memoriam":
                return "Tourney Conclude"
                */
            case EventCourseFinish:
                if (activeTourney(worldState).courses.length > 1 && !stuck) return EventWait
                else if (activeTourney(worldState).courses.length > 1) return EventMultiplication
                else return EventTourneyFinish

            
            case EventTourneyFinish:
                return EventVoid
        }
    }
}