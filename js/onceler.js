class Onceler {
    static pastEvents = []
    static currentWorldState = WorldStateManager.nullWorldState()

    static worldStateAtEventNumber(num) {
        let ws = WorldStateManager.nullWorldState()
        for (let i = 0; i <= num; i++) {
            WorldStateManager.causeEdit(ws, this.pastEvents[i].worldEdit)
        }
        return ws
    }

    static addEvent(event) {
        this.pastEvents.push(event)
        WorldStateManager.causeEdit(this.currentWorldState, event.worldEdit)
    }

    static mostRecentReports() {
        let reports = []
        for (let i = 0; i < this.currentWorldState.timelines.length; i++) {
            const lastEvent = this.pastEvents.findLast(e => e.timeline == i)
            if (lastEvent !== undefined) reports.push(lastEvent.report)
        }
        return reports
    }
}