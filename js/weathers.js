class Weather {
    static Mirage = new Weather("Mirage", "Irrelevance and Falsehoods.", 0xFFEA6BE6, {
        "strokeOutcome": (tl, func) => {
            return function (worldState, tl, options) {
                const course = activeCourseOnTimeline(worldState, tl)
                if (unsunkPlayers(worldState, course).length >= 2 && Math.random() < 0.05) Greedler.queueEvent([ tl, EventWeatherMirage ])

                let out = func.apply(this, arguments)
                return out
            }
        }})
    static Oversight = new Weather("Oversight", "Everything Is Fine.", 0xFFFF0000, {
        "strokeOutcome": (tl, func) => {
            return function (worldState, tl, options) {
                const course = activeCourseOnTimeline(worldState, tl)
                if (unsunkPlayers(worldState, course).length >= 2 && Math.random() < 0.005) Greedler.queueEvent([ tl, EventWeatherOversight ])

                let out = func.apply(this, arguments)
                return out
            }
        }})
    static Tempest = new Weather("Tempest", "Progression and Regression.", 0xFF1281C3, {
        "strokeOutcome": (tl, func) => {
            return function (worldState, tl, options) {
                const course = activeCourseOnTimeline(worldState, tl)
                if (unsunkPlayers(worldState, course).length >= 3 && Math.random() < 0.05) Greedler.queueEvent([ tl, EventWeatherTempest ])

                let out = func.apply(this, arguments)
                return out
            }
        }})

    static Weathers = [ Weather.Mirage, Weather.Oversight, Weather.Tempest ]

    constructor(name, report, color, eventChanges) {
        this.name = name
        this.report = report
        this.color = color
        this.priority = 1
        this.eventChanges = eventChanges
    }

    modify(type, tl, func) {
        if (this.eventChanges[type] !== undefined) {
            return this.eventChanges[type](tl, func)
        }
        else return func
    }
}

class EventWeatherMirage extends Event {
    type = "weatherMirage"
    depth = "Hole"

    calculateEdit(worldState, tl) {
        const course = activeCourseOnTimeline(worldState, tl)
        const p1 = randomFromArray(unsunkPlayers(worldState, course))
        const pidx1 = course.players.indexOf(p1.id)
        const p2 = randomFromArray(unsunkPlayers(worldState, course))
        const pidx2 = course.players.indexOf(p2.id)

        const newPlayRay = course.players.slice(0)
        newPlayRay[pidx1] = p2.id
        newPlayRay[pidx2] = p1.id

        const worldEdit = {
            "timetravel": {
                "timeline": tl
            },
            "courses": [{
                "id": course.id,
                "players": newPlayRay
            }]
        }

        let report
        if (p1 == p2) report = `Illusions dance. ${p1.fullName()} gets confused.`
        else report = `Illusions dance. ${p1.fullName()} and ${p2.fullName()} confuse their turns.`
        return [worldEdit, report]
    }
}

class EventWeatherOversight extends Event {
    type = "weatherOversight"
    depth = "Hole"

    calculateEdit(worldState, tl) {
        const course = activeCourseOnTimeline(worldState, tl)
        const player = randomFromArray(unsunkPlayers(worldState, course))

        let worldEdit, report
        if (player.mods.includes(Mod.Overseen)) {
            const tourney = activeTourney(worldState)
            const course = activeCourseOnTimeline(worldState, tl)
            
            let newPlayer = ThingFactory.generateNewPlayer(worldState)
            newPlayer.ball = player.ball
            worldEdit = {
                "timetravel": {
                    "timeline": tl
                },
                "tourneys": [{
                    "id": tourney.id,
                    "players": tourney.players.map(pid => pid == player.id ? newPlayer.id : pid),
                    "kia": tourney.kia.concat([player.id])
                }],
                "courses": [{
                    "id": course.id,
                    "players": course.players.map(pid => pid == player.id ? newPlayer.id : pid)
                }],
                "players": [{
                    "id": player.id,
                    "mortality": "DEAD"
                }, newPlayer ]
            }
    
            report = `A Loophole is found. Contract Terminated. ${player.fullName()} rots. ${newPlayer.fullName()} emerges from the ground to take their place.`
        }
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

class EventWeatherTempest extends Event {
    type = "weatherTempest"
    depth = "Hole"

    calculateEdit(worldState, tl) {
        const course = activeCourseOnTimeline(worldState, tl)
        const [p1, p2] = chooseNumFromArray(unsunkPlayers(worldState, course), 2)

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