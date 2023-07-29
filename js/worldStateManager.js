// Manages the editing of world states!
class WorldStateManager {
    // This is the default world state
    // The big bang
    // Genesis
    // The beginning of all things
    // All hail
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
            "league": ThingFactory.generateNewLeague()
        }
    }

    // Applies a world edit to a world state
    static causeEdit(worldState, worldEdit) {
        // Sets the prev timeline number to the one given by 'timetravel'
        // Also updates the timeline phase if applicable
        worldState.prevTimeline = worldEdit.timetravel.timeline
        if (worldEdit.timetravel.phase !== undefined) {
            worldState.timelines[worldEdit.timetravel.timeline] = worldEdit.timetravel.phase
        }

        // Look through every object in the edit
        for (const type of Object.keys(worldEdit)) {
            // We already covered timetravel
            if (type == "timetravel") continue

            // If we're changing the timelines, we're setting it to what the edit gives us
            // This makes it easier to do divisions or multiplications of timelines
            if (type == "timelines") {
                worldState.timelines = worldEdit.timelines
                continue
            }

            // There's only one league, so handle it accordingly
            if (type == "league") {
                const entries = Object.entries(worldEdit.league)
                for (let [key,val] of entries)  {
                    worldState.league[key] = val;
                }
                continue
            }

            // This is for all the arrays of things
            // In this block of code, each thing is called 'thing'
            // They're also called things in ThingFactory
            // It's consistent and makes sense I swear
            for (const thing of worldEdit[type]) {
                // Try and find a pre-existing thing with this id
                let wsMatch = worldState[type].find(t => t.id == thing.id)
                // If there's no pre-existing thing with that id, the thing must be new! Welcome!
                if (wsMatch === undefined)
                    worldState[type].push(thing)
                // Remove it if it should be removed (This should almost NEVER happen, this means deleting it from all worlds living or dead!!)
                else if (thing.remove == true)
                    removeFromArray(worldState[type], wsMatch)
                // If there is a pre-existing thing, update it with all the new values
                else {
                    const entries = Object.entries(thing)
                    for (let [key,val] of entries)  {
                        if (key == "ball") {
                            let newBall = {}
                            const oldBallStuff = Object.entries(wsMatch.ball)
                            const newBallStuff = Object.entries(thing.ball)
                            for (let [bkey,bval] of oldBallStuff) newBall[bkey] = bval;
                            for (let [bkey,bval] of newBallStuff) newBall[bkey] = bval;
                            wsMatch.ball = newBall
                        }
                        else if (val === undefined) delete(wsMatch[key])
                        else wsMatch[key] = val;
                    }
                }
            }
        }
    }

    // Combines two edits together! Very similar to causeEdit but slightly different in ways I won't bore you with
    static combineEdits(oldEdit, worldEdit) {
        for (const type of Object.keys(worldEdit)) {
            if (type == "timetravel") {
                const entries = Object.entries(worldEdit.timetravel)
                for (let [key,val] of entries)  {
                    oldEdit.timetravel[key] = val;
                }
                continue
            }

            if (type == "timelines") {
                oldEdit.timelines = worldEdit.timelines
                continue
            }

            if (type == "league") {
                const entries = Object.entries(worldEdit.league)
                for (let [key,val] of entries)  {
                    oldEdit.league[key] = val;
                }
                continue
            }

            for (const thing of worldEdit[type]) {
                if (oldEdit[type] === undefined) {
                    oldEdit[type] = worldEdit[type]
                    continue
                }

                let wsMatch = oldEdit[type].find(t => t.id == thing.id)
                if (wsMatch === undefined)
                    oldEdit[type].push(thing)
                else if (thing.remove == true)
                    removeFromArray(oldEdit[type], wsMatch)
                else {
                    const entries = Object.entries(thing)
                    for (let [key,val] of entries)  {
                        if (key == "ball") {
                            let newBall = {}
                            const oldBallStuff = Object.entries(wsMatch.ball)
                            const newBallStuff = Object.entries(thing.ball)
                            for (let [bkey,bval] of oldBallStuff) newBall[bkey] = bval;
                            for (let [bkey,bval] of newBallStuff) newBall[bkey] = bval;
                            wsMatch.ball = newBall
                        }
                        else if (val === undefined) delete(wsMatch[key])
                        else wsMatch[key] = val;
                    }
                }
            }
        }
    }
}