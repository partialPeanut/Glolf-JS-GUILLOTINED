class Onceler {
    constructor(pastEvents, currentWorldState) {
        this.pastEvents = pastEvents
        this.currentWorldState = currentWorldState
    }

    worldStateAtEvent(num) {
        let ws = WorldStateManager.nullWorldState()
        for (let i = 0; i <= num; i++) {
            WorldStateManager.causeEdit(ws, this.pastEvents[i].worldEdit)
        }
    }
}