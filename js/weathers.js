class Weather {
    // Switches players' turn order!
    static Mirage = new Weather("Mirage", "Irrelevance and Falsehoods.", 0xFFEA6BE6, 1, {
        "strokeOutcome": (func) => {
            return function (worldState, tl, options) {
                // 2% chance per stroke
                const hole = activeHoleOnTimeline(worldState, tl)
                if (unsunkPlayers(worldState, hole).length >= 2 && Math.random() < 0.02) Greedler.queueEvent([ tl, EventWeatherMirage ])

                let out = func.apply(this, arguments)
                return out
            }
        }})

    // Something attempts to find Loopholes and terminate Contracts, killing and replacing players.
    static Oversight = new Weather("Oversight", "Everything Is Fine.", 0xFFFF0000, 1, {
        "strokeOutcome": (func) => {
            return function (worldState, tl, options) {
                // 0.3% chance per stroke
                const hole = activeHoleOnTimeline(worldState, tl)
                if (unsunkPlayers(worldState, hole).length >= 2 && Math.random() < 0.003) Greedler.queueEvent([ tl, EventWeatherOversight ])

                let out = func.apply(this, arguments)
                return out
            }
        }})

    // Switches players' balls!
    static Tempest = new Weather("Tempest", "Progression and Regression.", 0xFF1281C3, 1, {
        "strokeOutcome": (func) => {
            return function (worldState, tl, options) {
                // 2% chance per stroke
                const hole = activeHoleOnTimeline(worldState, tl)
                if (unsunkPlayers(worldState, hole).length >= 3 && Math.random() < 0.02) Greedler.queueEvent([ tl, EventWeatherTempest ])

                let out = func.apply(this, arguments)
                return out
            }
        }})

    static Weathers = [ Weather.Mirage, Weather.Oversight, Weather.Tempest ]

    constructor(name, report, color, weight, eventChanges) {
        this.name = name
        this.report = report
        this.color = color
        this.priority = 1
        this.weight = weight
        this.eventChanges = eventChanges
    }

    // See: mods
    modify(type, func) {
        if (this.eventChanges[type] !== undefined) {
            return this.eventChanges[type](func)
        }
        else return func
    }
}

// What happens when mirage goes
class EventWeatherMirage extends Event {
    type = "weatherMirage"
    depth = "Hole"

    defaultEffect(worldState, tl) {
        // Choose two players to swap via autism, could be same person
        const hole = activeHoleOnTimeline(worldState, tl)
        const p1 = chooseFromAutism(unsunkPlayers(worldState, hole))
        const pidx1 = hole.players.indexOf(p1.id)
        const p2 = chooseFromAutism(unsunkPlayers(worldState, hole))
        const pidx2 = hole.players.indexOf(p2.id)

        // Swap em
        const newPlayRay = hole.players.slice(0)
        newPlayRay[pidx1] = p2.id
        newPlayRay[pidx2] = p1.id

        const worldEdit = {
            "timetravel": {
                "timeline": tl
            },
            "holes": [{
                "id": hole.id,
                "players": newPlayRay
            }]
        }

        let report
        if (p1 == p2) report = `Illusions dance. ${p1.fullName()} gets confused.`
        else report = `Illusions dance. ${p1.fullName()} and ${p2.fullName()} confuse their turns.`
        return [worldEdit, report]
    }
}

// Overseeing!
class EventWeatherOversight extends Event {
    type = "weatherOversight"
    depth = "Hole"

    defaultEffect(worldState, tl) {
        // Choose a player via autism
        const hole = activeHoleOnTimeline(worldState, tl)
        const player = chooseFromAutism(unsunkPlayers(worldState, hole))

        let worldEdit, report
        // If a player has Overseen, kill em and replace em
        if (player.mods.includes(Mod.Overseen)) {
            const tourney = activeTourney(worldState)
            
            // The new player inherits the old player's ball
            let newPlayer = ThingFactory.generateNewPlayer(worldState)
            newPlayer.ball = player.ball
            worldEdit = editOfReplacePlayerInTourney(worldState, tl, player, newPlayer)
            worldEdit.tourneys[0].kia = tourney.kia.concat([player.id])
            worldEdit.players = [
                {
                    "id": player.id,
                    "mortality": "DEAD"
                }, newPlayer ]
    
            report = `A Loophole is found. Contract Terminated. ${player.fullName()} rots. ${newPlayer.fullName()} emerges from the ground to take their place.`
        }
        // Otherwise oversee them
        else {
            let overseenPlayer = {
                "id": player.id,
                "mods": player.mods
            }
            Mod.Overseen.apply(overseenPlayer)
    
            worldEdit = {
                "timetravel": {
                    "timeline": tl
                },
                "players": [ overseenPlayer ]
            }
    
            report = `A Loophole is suspected. ${player.fullName()} is being Overseen.`
        }

        return [worldEdit, report]
    }
}

// Tempest woo
class EventWeatherTempest extends Event {
    type = "weatherTempest"
    depth = "Hole"

    // Picks two players and switches their balls
    defaultEffect(worldState, tl) {
        const hole = activeHoleOnTimeline(worldState, tl)
        const [p1, p2] = chooseNumFromAutism(unsunkPlayers(worldState, hole), 2)

        const worldEdit = {
            "timetravel": {
                "timeline": tl
            },
            "players": [{
                "id": p1.id,
                "ball": p2.ball
            },
            {
                "id": p2.id,
                "ball": p1.ball
            }]
        }

        const report = `Chaotic winds blow. ${p1.fullName()} and ${p2.fullName()}'s balls defect to each other's owners.`
        return [worldEdit, report]
    }
}