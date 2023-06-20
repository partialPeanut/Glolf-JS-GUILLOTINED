class Onceler {
    static pastEvents = []
    static currentWorldState = WorldStateManager.nullWorldState()

    // Calculates the world state at a certain event number, the hard way
    static worldStateAtEventNumber(num) {
        let ws = WorldStateManager.nullWorldState()
        for (let i = 0; i <= num; i++) {
            WorldStateManager.causeEdit(ws, this.pastEvents[i].worldEdit)
        }
        return ws
    }

    // Adds an event to past events and applies the edit to the current world state
    static addEvent(event) {
        this.pastEvents.push(event)
        WorldStateManager.causeEdit(this.currentWorldState, event.worldEdit)
    }

    // Finds the most recent event in a timeline
    static lastEventInTimeline(tl) {
        const lastEvent = this.pastEvents.findLast(e => e.timeline == tl)
        return lastEvent
    }

    // Finds the most recent reports in every current timeline
    static mostRecentReports() {
        let reports = []
        for (let i = 0; i < this.currentWorldState.timelines.length; i++) {
            const lastEvent = this.lastEventInTimeline(i)
            if (lastEvent !== undefined) reports.push(lastEvent.report.replaceAll(`\n`, `\r\n`))
        }
        return reports
    }
}