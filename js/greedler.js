class Greedler {
    // The event queue where all non-default events come to hang out
    // All event phases come here in the format [ timeline number, event class, options (optional) ]
    static eventQueue = [
        [0, EventCreatePlayers, { "playerCount": 96 }]
    ]

    // Friends :)
    static queueEvent(eventData) {
        this.eventQueue.push(eventData)
    }
    static queueEventImmediately(eventData) {
        this.eventQueue.unshift(eventData)
    }

    // Honestly looking at this too long makes my head hurt
    static doTimeStep(stuck = false) {
        // tls = how many timelines are there
        // didStep = did any of these timelines actually do anything
        let tls = Onceler.currentWorldState.timelines.length
        let didStep = false

        // If the events are stuck (all of them are waiting) then tell what events to unstick
        let unstick = EventVoid
        const unstickables = [EventHoleFinish, EventCourseFinish, EventCourseReward, EventTourneyFinish]
        if (stuck) unstick = unstickables.find(e => Onceler.currentWorldState.timelines.includes(e))

        // Progress every timeline sequentially in one tick!
        for (let i = 0; i < tls; i++) {
            // This comes into play if there are suddenly less timelines than there were at the beginning of doTimeStep
            if (i >= Onceler.currentWorldState.timelines.length) break
            // God I'm so smart
            // This tries to do the next event in the timeline i, and if it returns true (meaning it actually did a thing) then didStep becomes true
            // Otherwise didStep remains the same
            didStep = this.doNextEventInTimeline(i, unstick) || didStep
        }
        // If nothing did anything then it's stuck! Do this all again but tell the function to unstick em
        if (!didStep) this.doTimeStep(true)
    }

    // Does the next event! :D
    static doNextEventInTimeline(tl, unstick) {
        // Learn what phase should happen next
        let tlPhase = this.nextPhaseInTimeline(tl, unstick)
        // If it should wait, do nothing
        if (tlPhase[1] == EventWait) return false

        // This creates an object of the type of event we want, on the timeline we want
        // Does the event, adds it to onceler, and logs it to the console
        let nextEvent = new tlPhase[1](tlPhase[0])
        nextEvent.formEvent(Onceler.currentWorldState, tlPhase[2])
        Onceler.addEvent(nextEvent)
        console.log(`(${tl}) ${nextEvent.report}`)
        return true
    }

    // Tells Greedler what phase should be next
    static nextPhaseInTimeline(tl, unstick) {
        // Do the one in the queue if there's one in the queue, otherwise do the default one
        let queuePhase = this.eventQueue.find(q => q[0] == tl)
        if (queuePhase !== undefined) {
            removeFromArray(this.eventQueue, queuePhase)
            return queuePhase
        }
        else return this.nextDefaultPhaseInTimeline(Onceler.currentWorldState, tl, unstick)
    }

    // The default one
    static nextDefaultPhaseInTimeline(worldState, tl, unstick) {
        // Some of these will be undefined sometimes, so be careful to only access them in phases where they exist
        const tourney = activeTourney(worldState)
        const course = activeCourseOnTimeline(worldState, tl)
        const hole = activeHoleOnTimeline(worldState, tl)

        switch(worldState.timelines[tl]) {
            // All of these are linear for a while
            case EventVoid:
                return [tl, EventTourneyStart]
            case EventTourneyStart:
                return [tl, EventDivison]

            // Both of these go to course start
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
                // Juuuust in case something's gone horribly wrong (such as, say, a hole having zero players)
                if (unsunkPlayers(worldState, hole).length > 0) return [tl, EventStrokeType]
                else return [tl, EventHoleFinish]
            case EventStrokeType:
                return [tl, EventStrokeOutcome]
            case EventStrokeOutcome:
                // If there's another player who can go after this one, go to stroke type
                // If there's another player who can go before this one, go up top
                // If there's no players who can go, finish the hole

                const oldCP = hole.currentPlayer
                if (hole.players.some((pid, i) => i > oldCP && !getWorldItem(worldState, "players", pid).ball.sunk)) return [tl, EventStrokeType]
                else if (unsunkPlayers(worldState, hole).length > 0) return [tl, EventUpTop]
                else return [tl, EventHoleFinish]

            case EventHoleFinish:
                // Waits until Greedler tells it to go, and then:
                // If there's more holes to do, do another hole
                // If you need to do sudden death, do sudden death
                // If it's not finals, finish the course normally
                // If it is finals, then finish the tourney

                if (unstick != EventHoleFinish) return [tl, EventWait]
                else if (course.holeNumber < tourney.holesPerCourse) return [tl, EventHoleStart]
                else if (course.suddenDeath && course.winners[0].length > 1) return [tl, EventHoleStart, { "suddenDeath": true }]
                else if (course.type != "Finals") return [tl, EventCourseFinish]
                else return [tl, EventTourneyFinish]

            case EventCourseFinish:
                // Waits, and then does course reward for 1st place

                if (unstick != EventCourseFinish) return [tl, EventWait]
                else return [tl, EventCourseReward, { "place": 0 }]
            case EventCourseReward:
                // If you haven't rewarded all the places, reward the next one
                // Otherwise go to multiplication

                const nextPlace = course.currentRewardPlace + 1
                if (nextPlace < tourney.placesRewarded) return [tl, EventCourseReward, { "place": nextPlace }]
                else if (unstick != EventCourseReward) return [tl, EventWait]
                else return [tl, EventMultiplication]
            
            case EventTourneyFinish:
                // Waits, then does tourney reward for first place

                if (unstick != EventTourneyFinish) return [tl, EventWait]
                else return [tl, EventTourneyReward, { "place": 0 }]
            case EventTourneyReward:
                // If you haven't rewarded all the places, reward the next one
                // If players died here, do a memorial
                // Otherwise conclude the tourney

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