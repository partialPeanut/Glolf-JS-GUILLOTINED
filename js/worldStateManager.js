class WorldStateManager {
    static nullWorldState() {
        return {
            "timelines": [
                EventVoid
            ],
            "prevTimeline": 0,
            "players": {},
            "balls": {},
            "holes": {},
            "courses": {},
            "tourneys": {},
            "league": {
                "currentTourney": 0
            }
        }
    }

    static causeEdit(worldState, worldEdit) {
        worldState.prevTimeline = worldEdit.timetravel.timeline
        if (worldEdit.timetravel.phase !== undefined) {
            worldState.timelines[worldEdit.timetravel.timeline] = worldEdit.timetravel.phase
        }

        for (const type of Object.keys(worldEdit)) {
            if (type == "timetravel") continue

            if (type == "league") {
                const entries = Object.entries(worldEdit.league)
                for (let [key,val] of entries)  {
                    worldState.league[key] = val;
                }
                continue
            }

            for (const id of Object.keys(worldEdit[type])) {
                if (worldState[type][id] === undefined) {
                    worldState[type][id] = worldEdit[type][id]
                }
                else {
                    const entries = Object.entries(worldEdit[type][id])
                    for (let [key,val] of entries)  {
                        worldState[type][id][key] = val;
                    }
                }
            }
        }
    }
}