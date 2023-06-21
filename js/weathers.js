class Weather {
    // Wow, look, nothing
    static Clear = new Weather("Clear", "Sunshine and Rainbows.", 0xFF5555FF, 0)

    // Switches players' turn order and scores!
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
                // 0.5% chance per stroke
                const hole = activeHoleOnTimeline(worldState, tl)
                if (unsunkPlayers(worldState, hole).length >= 2 && Math.random() < 0.005) Greedler.queueEvent([ tl, EventWeatherOversight ])

                let out = func.apply(this, arguments)
                return out
            }
        }})

    // Players go quantum and collapse superpositions, for better or worse
    static Quantum = new Weather("Quantum", "Ups and Downs.", 0xFFFF0000, 1, {
        "upTop": (func) => {
            return function (worldState, tl, options) {
                let [outEdit, outReport] = func.apply(this, arguments)
                const course = activeCourseOnTimeline(worldState, tl)
                let spinEdit = {
                    "courses": [{
                        "id": course.id,
                        "upSpin": !course.upSpin
                    }]
                }
                WorldStateManager.combineEdits(outEdit, spinEdit)

                if (!course.upSpin) outReport += ` The quantum foam is in up-spin.`
                else outReport += ` The quantum foam is in down-spin.`

                return [outEdit, outReport]
            }
        },
        "strokeOutcome": (func) => {
            return function (worldState, tl, options) {
                let [outEdit, outReport] = func.apply(this, arguments)
                let [outEdit2, outReport2] = func.apply(this, arguments)

                const course = activeCourseOnTimeline(worldState, tl)
                const player = activePlayerOnTimeline(worldState, tl)

                let editBall1 = outEdit.players.find(p => p.id == player.id).ball
                let editBall2 = outEdit2.players.find(p => p.id == player.id).ball
                const flip = course.upSpin ? 1 : -1

                if (flip * editBall1.distance > flip * editBall2.distance) {
                    [outEdit, outReport] = [outEdit2, outReport2]
                }
                if (course.upSpin) outReport = `The best of two outcomes is observed. ` + outReport
                else outReport = `The worst of two outcomes is observed. ` + outReport

                return [outEdit, outReport]
            }
        }},
        c => {
            c.weather = Weather.Quantum
            c.upSpin = false
        })

    // Switches players' balls!
    static Tempest = new Weather("Tempest", "Progression and Regression.", 0xFF1281C3, 1, {
        "strokeOutcome": (func) => {
            return function (worldState, tl, options) {
                // 10% chance per stroke
                const hole = activeHoleOnTimeline(worldState, tl)
                if (unsunkPlayers(worldState, hole).length >= 3 && Math.random() < 0.1) Greedler.queueEvent([ tl, EventWeatherTempest ])

                let out = func.apply(this, arguments)
                return out
            }
        }})

    static Weathers = [ Weather.Clear, Weather.Mirage, Weather.Oversight, Weather.Quantum, Weather.Tempest ]

    constructor(name, report, color, weight, eventChanges = {}, apply = (x) => { x.weather = this }) {
        this.name = name
        this.report = report
        this.color = color
        this.priority = 1
        this.weight = weight
        this.eventChanges = eventChanges
        this.apply = apply
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
            }],
            "players": [{
                "id": p1.id,
                "score": p2.score
            },
            {
                "id": p2.id,
                "score": p1.score
            }]
        }

        let report
        if (p1 == p2) report = `Illusions dance. ${p1.fullName()} gets confused.`
        else report = `Illusions dance. ${p1.fullName()} and ${p2.fullName()} confuse their scores.`
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

        const report = `Chaotic winds blow. ${p1.fullName()} and ${p2.fullName()} are tossed to each other's balls.`
        return [worldEdit, report]
    }
}