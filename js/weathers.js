class Weather {
    static Mirage = new Weather("Mirage",  "Irrelevance and Falsehoods.", 0xFFEA6BE6, {
        "strokeOutcome": (func) => {
            return function (worldState, tl, player) {
                const course = activeCourseOnTimeline(worldState, tl)
                if (unsunkPlayers(worldState, course).length >= 2 && Math.random() < 0.05) Greedler.queueEvent([ tl, EventWeatherMirage ])

                let out = func.apply(this, arguments)
                return out
            }
        }})
    static Tempest = new Weather("Tempest", "Progression and Regression.", 0xFF1281C3, {
        "strokeOutcome": (func) => {
            return function (worldState, tl, player) {
                let out = func.apply(this, arguments)

                const course = activeCourseOnTimeline(worldState, tl)
                if (unsunkPlayers(worldState, course).length >= (out.result == "SINK" ? 3 : 2) && Math.random() < 0.05) Greedler.queueEvent([ tl, EventWeatherTempest ])

                return out
            }
        }})

    constructor(name, report, color, eventChanges) {
        this.name = name
        this.report = report
        this.color = color
        this.eventChanges = eventChanges
    }

    modify(type, func) {
        if (this.eventChanges[type] !== undefined) {
            return this.eventChanges[type](func)
        }
        else return func
    }
}

class EventWeatherMirage extends Event {
    calculateEdit(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)
        const p1 = randomFromArray(unsunkPlayers(worldState, course))
        const pidx1 = course.players.indexOf(p1.id)
        const p2 = randomFromArray(unsunkPlayers(worldState, course))
        const pidx2 = course.players.indexOf(p2.id)

        const newPlayRay = course.players.slice(0)
        newPlayRay[pidx1] = p2.id
        newPlayRay[pidx2] = p1.id

        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline
            },
            "courses": [{
                "id": course.id,
                "players": newPlayRay
            }]
        }

        if (p1 == p2) this.report = `Illusions dance. ${p1.fullName()} gets confused.`
        else this.report = `Illusions dance. ${p1.fullName()} and ${p2.fullName()} confuse their turns.`
    }
}

class EventWeatherTempest extends Event {
    calculateEdit(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)
        const [p1, p2] = chooseNumFromArray(unsunkPlayers(worldState, course), 2)

        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline
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

        this.report = `Chaotic winds blow. ${p1.fullName()} and ${p2.fullName()}'s balls defect to each other's owners.`
    }
}