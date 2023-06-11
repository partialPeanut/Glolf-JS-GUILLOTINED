class Greedler {
    static eventQueue = []

    static nextTimeline() {
        return (Onceler.currentWorldState.prevTimeline + 1) % Onceler.currentWorldState.timelines.length
    }
    static nextPhase() {
        let phase = eventQueue.find(q => q[0] === nextTimeline())
        if (phase === undefined) phase = this.nextDefaultPhase()
        return phase
    }
    static nextDefaultPhase() {
        return [nextTimeline(), nextDefaultEventInTimeline(Onceler.currentWorldState, nextTimeline())]
    }
    static nextDefaultPhaseInTimeline(worldState, tl) {
        switch(worldState.timelines[tl]) {
            case Phase.Void:
                return Phase.TourneyStart
            case Phase.TourneyStart:
                return Phase.TourneyConclude
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
            case Phase.TourneyConclude:
                return Phase.Void
        }
    }
}