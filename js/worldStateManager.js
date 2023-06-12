class WorldStateManager {
    static nullWorldState() {
        return {
            "timelines": [
                EventVoid
            ],
            "prevTimeline": 0,
            "players": [],
            "balls": [],
            "holes": [],
            "courses": [],
            "tourneys": [],
            "league": {
                "currentTourney": 0,
                "divisionNames": [
                    "RED",
                    "GREEN",
                    "BLUE",
                    "YELLOW",
                    "CYAN",
                    "MAGENTA",
                    "BLACK",
                    "WHITE"
                ]
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

            if (type == "timelines") {
                worldState.timelines = worldEdit.timelines
                continue
            }

            if (type == "league") {
                const entries = Object.entries(worldEdit.league)
                for (let [key,val] of entries)  {
                    worldState.league[key] = val;
                }
                continue
            }

            for (const thing of worldEdit[type]) {
                let wsMatch = worldState[type].find(t => t.id == thing.id)
                if (wsMatch === undefined) {
                    worldState[type].push(thing)
                }
                else {
                    const entries = Object.entries(thing)
                    for (let [key,val] of entries)  {
                        wsMatch[key] = val;
                    }
                }
            }
        }
    }
}