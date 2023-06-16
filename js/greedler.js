class Greedler {
    static eventQueue = [
        [0, EventCreatePlayers, { "playerCount": 96 }]
    ]

    static queueEvent(eventData) {
        this.eventQueue.push(eventData)
    }

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
        nextEvent.formEvent(Onceler.currentWorldState, tlPhase[2])
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
        else return this.nextDefaultPhaseInTimeline(Onceler.currentWorldState, tl, stuck)
    }
    static nextDefaultPhaseInTimeline(worldState, tl, stuck = false) {
        const tourney = activeTourney(worldState)
        const course = activeCourseOnTimeline(worldState, tl)
        let tls = worldState.timelines.length
        switch(worldState.timelines[tl]) {
            case EventVoid:
                return [tl, EventTourneyStart]
            case EventTourneyStart:
                return [tl, EventDivison]

            case EventDivison:
                return [tl, EventCourseStart]
            case EventMultiplication:
                return [tl, EventCourseStart]

            case EventCourseStart:
                return [tl, EventWeatherReport]
            case EventWeatherReport:
                return [tl, EventHoleStart]

            case EventHoleStart:
                return [tl, EventWildlifeReport]
            case EventWildlifeReport:
                return [tl, EventUpTop]

            case EventUpTop:
                return [tl, EventStrokeType]
            case EventStrokeType:
                return [tl, EventStrokeOutcome]
            case EventStrokeOutcome:
                const hole = activeHoleOnTimeline(worldState, tl)
                const oldCP = hole.currentPlayer
                if (course.players.some((p, i) => i > oldCP && !getWorldItem(worldState, "players", p).ball.sunk)) return [tl, EventStrokeType]
                else if (course.players.every(p => getWorldItem(worldState, "players", p).ball.sunk)) return [tl, EventHoleFinish]
                else return [tl, EventUpTop]

            case EventHoleFinish:
                let waiting = true
                let thisHoleNumber = course.holeNumber
                for (let i = 0; i < tls; i++) {
                    if (course.holeNumber > thisHoleNumber) waiting = false
                }
                if (waiting && !stuck) return [tl, EventWait]
                else if (thisHoleNumber == tourney.holesPerCourse) {
                    if (tourney.courses.length > 1) return [tl, EventCourseFinish]
                    else return [tl, EventTourneyFinish]
                }
                else return [tl, EventHoleStart]

            case EventCourseFinish:
                if (!stuck) return [tl, EventWait]
                else return [tl, EventCourseReward, { "place": 0 }]
            case EventCourseReward:
                const nextPlace = course.currentRewardPlace + 1
                if (nextPlace >= activeTourney(worldState).placesRewarded) return [tl, EventMultiplication]
                else return [tl, EventCourseReward, { "place": nextPlace }]
            
            case EventTourneyFinish:
                return [tl, EventTourneyReward]

            case EventTourneyReward:
                if (tourney.kia.length > 0) return [tl, EventMemoriam]
                else return [tl, EventTourneyConclude]
            case EventMemoriam:
                return [tl, EventTourneyConclude]

            case EventTourneyConclude:
                return [tl, EventVoid]
        }
    }
}