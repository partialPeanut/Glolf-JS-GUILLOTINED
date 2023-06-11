class WorldStateManager {
    static nullWorldState = {
        "players": {},
        "holes": {},
        "courses": {},
        "tourneys": {},
        "league": {
            "currentTourney": 0
        }
    }

    static causeEdit(worldState, worldEdit) {
        for (const type of worldEdit) {
            for (const id of worldEdit[type]) {
                if (worldState[type][id] == null) {
                    worldState[type][id] = worldEdit[type][id]
                }
                else {
                    Object.entries(worldEdit[type][id]).forEach((key,val) => {
                        worldState[type][id][key] = val;
                    })
                }
            }
        }
    }
}