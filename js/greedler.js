class Greedler {
    static eventQueue = [
        [0, EventCreatePlayers, 48]
    ]

    static doNextEvent() {
        let tlPhase = this.nextPhase()
        let nextEvent = new tlPhase[1](tlPhase[0])
        nextEvent.formEvent(Onceler.currentWorldState, tlPhase.slice(2))
        Onceler.addEvent(nextEvent)
        console.log(nextEvent.report)
    }
    static nextPhase() {
        let prevTl = Onceler.currentWorldState.prevTimeline
        let tlNum = Onceler.currentWorldState.timelines.length
        for (let i = 1; i <= tlNum; i++) {
            let nextTl = (prevTl + i) % tlNum
            let queuePhase = this.eventQueue.find(q => q[0] == nextTl)
            if (queuePhase !== undefined) {
                removeFromArray(this.eventQueue, queuePhase)
                return queuePhase
            }
            else {
                let nextPhase = this.nextDefaultPhaseInTimeline(Onceler.currentWorldState, nextTl)
                if (nextPhase !== EventWait) return [nextTl, nextPhase]
            }
        }

        // They're all waiting!!
        return [0, this.nextDefaultPhaseInTimeline(Onceler.currentWorldState, 0, true)]
    }
    static nextDefaultPhaseInTimeline(worldState, tl, endwait = false) {
        switch(worldState.timelines[tl]) {
            case EventVoid:
                return EventTourneyStart
            case EventTourneyStart:
                return EventDivison
            case EventDivison:
                return EventTourneyConclude
                /*
            case "Course Start":
                return "Weather Report"
            case "Weather Report":
                return "Hole Setup"
            case "Hole Setup":
                return "Wildlife Report"
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
            case EventTourneyConclude:
                return EventVoid
        }
    }
}