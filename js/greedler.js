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

        let unstick = EventVoid
        if (stuck) unstick = [EventHoleFinish, EventCourseFinish, EventTourneyFinish].find(e => Onceler.currentWorldState.timelines.includes(e))

        for (let i = 0; i < tls; i++) {
            if (i >= Onceler.currentWorldState.timelines.length) break
            didStep = this.doNextEventInTimeline(i, unstick) || didStep
        }
        if (!didStep) this.doTimeStep(true)
    }
    static doNextEventInTimeline(tl, unstick) {
        let tlPhase = this.nextPhaseInTimeline(tl, unstick)
        if (tlPhase[1] == EventWait) return false

        let nextEvent = new tlPhase[1](tlPhase[0])
        nextEvent.formEvent(Onceler.currentWorldState, tlPhase[2])
        Onceler.addEvent(nextEvent)
        console.log(`(${tl}) ${nextEvent.report}`)
        return true
    }
    static nextPhaseInTimeline(tl, unstick) {
        let queuePhase = this.eventQueue.find(q => q[0] == tl)
        if (queuePhase !== undefined) {
            removeFromArray(this.eventQueue, queuePhase)
            return queuePhase
        }
        else return this.nextDefaultPhaseInTimeline(Onceler.currentWorldState, tl, unstick)
    }
    static nextDefaultPhaseInTimeline(worldState, tl, unstick) {
        const tourney = activeTourney(worldState)
        const course = activeCourseOnTimeline(worldState, tl)
        const hole = activeHoleOnTimeline(worldState, tl)

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
                const oldCP = hole.currentPlayer
                const playingPlayers = hole.suddenDeath ? course.winners[0] : course.players
                if (playingPlayers.some((pid, i) => i > oldCP && !getWorldItem(worldState, "players", pid).ball.sunk)) return [tl, EventStrokeType]
                else if (playingPlayers.every(pid => getWorldItem(worldState, "players", pid).ball.sunk)) return [tl, EventHoleFinish]
                else return [tl, EventUpTop]

            case EventHoleFinish:
                let thisHoleNumber = course.holeNumber

                if (unstick != EventHoleFinish) return [tl, EventWait]
                else if (hole.suddenDeath && course.winners[0].length > 1) {
                    return [tl, EventHoleStart, { "suddenDeath": true }]
                }
                else if (thisHoleNumber >= tourney.holesPerCourse) {
                    if (course.suddenDeath && course.winners[0].length > 1) {
                        return [tl, EventHoleStart, { "suddenDeath": true }]
                    }
                    else if (course.type != "Finals") return [tl, EventCourseFinish]
                    else return [tl, EventTourneyFinish]
                }
                else return [tl, EventHoleStart]

            case EventCourseFinish:
                if (unstick != EventCourseFinish) return [tl, EventWait]
                else return [tl, EventCourseReward, { "place": 0 }]
            case EventCourseReward:
                const nextPlace = course.currentRewardPlace + 1
                if (nextPlace < activeTourney(worldState).placesRewarded) return [tl, EventCourseReward, { "place": nextPlace }]
                else return [tl, EventMultiplication]
            
            case EventTourneyFinish:
                if (unstick != EventTourneyFinish) return [tl, EventWait]
                else return [tl, EventTourneyReward, { "place": 0 }]
            case EventTourneyReward:
                const nextPlaceT = course.currentRewardPlace + 1
                if (nextPlaceT < activeTourney(worldState).placesRewarded) return [tl, EventTourneyReward, { "place": nextPlaceT }]
                else if (tourney.kia.length > 0) return [tl, EventMemoriam]
                else return [tl, EventTourneyConclude]
            case EventMemoriam:
                return [tl, EventTourneyConclude]

            case EventTourneyConclude:
                return [tl, EventVoid]
        }
    }
}