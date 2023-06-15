class WorldStateManager {
    static nullWorldState() {
        return {
            "timelines": [
                EventVoid
            ],
            "prevTimeline": 0,
            "players": [],
            "holes": [],
            "courses": [],
            "tourneys": [],
            "league": {
                "mods": [],
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
                else if (thing.remove == true) {
                    removeFromArray(worldState[type], wsMatch)
                }
                else {
                    const entries = Object.entries(thing)
                    for (let [key,val] of entries)  {
                        if (key == "ball") {
                            const ballstuff = Object.entries(thing.ball)
                            for (let [bkey,bval] of ballstuff)  {
                                wsMatch.ball[bkey] = bval;
                            }
                        }
                        else if (val === undefined) delete(wsMatch[key])
                        else wsMatch[key] = val;
                    }
                }
            }
        }
    }
}