class Event {
    constructor(tl) {
        this.timeline = tl
    }

    formEvent(worldState) {
        this.calculateEdit(worldState)
        this.report = this.eventReport(worldState)
    }

    calculateEdit(worldState) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": Event
            }
        }
    }
    eventReport(worldState) { return `---` }
}

class EventWait extends Event {
    calculateEdit(worldState) { this.worldEdit = {} }
}

class EventVoid extends Event {
    calculateEdit(worldState) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventVoid
            }
        }
    }
}

class EventCreatePlayers extends Event {
    formEvent(worldState, args) {
        this.calculateEdit(worldState, args)
        this.report = this.eventReport(worldState)
    }

    calculateEdit(worldState, args) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline
            },
            "players": []
        }
        for (let i = 0; i < args[0]; i++) {
            const player = ThingFactory.generateNewPlayer(worldState)
            this.worldEdit.players.push(player)
        }
    }
    eventReport(worldState) {
        const num = this.worldEdit.players.length
        return `Contracts signed. ${num} players rise from the ground.`
    }
}

class EventTourneyStart extends Event {
    calculateEdit(worldState) {
        const tourney = ThingFactory.generateNewTourney(worldState)
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventTourneyStart
            },
            "tourneys": [ tourney ],
            "league": {
                "currentTourney": tourney.id
            }
        }
    }
    eventReport(worldState) {
        const tourney = this.worldEdit.tourneys[0]
        return `Wlecome to ${tourney.name}!\n
                ${tourney.players.length} players, ${tourney.numCourses} divisions with ${tourney.holesPerCourse} holes each, and up to ${tourney.sinReward} $ins up for grabs!\n
                GLOLF!! BY ANY MEANS NECESSARY.`
    }
}

class EventDivison extends Event {
    calculateEdit(worldState) {
        const tourney = activeTourney(worldState)
        let playersLeft = tourney.players.slice(0)
        let playersPerCourse = Math.floor(tourney.players.length/tourney.numCourses)

        const newCourses = []
        for (let i = 0; i < tourney.numCourses-1; i++) {
            newCourses.push(ThingFactory.generateNewCourse(worldState, worldState.league.divisionNames[i], chooseNumFromArrayAndRemove(playersLeft, playersPerCourse)))
        }
        newCourses.push(ThingFactory.generateNewCourse(worldState, worldState.league.divisionNames[tourney.numCourses-1], playersLeft))

        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline
            },
            "timelines": newCourses.map(c => EventDivison),
            "courses": newCourses,
            "tourneys": [{
                "id": tourney.id,
                "courses": newCourses.map(c => c.id)
            }]
        }
    }
    eventReport(worldState) { return `The players are divided.` }
}

class EventMultiplication extends Event {
    calculateEdit(worldState) {
        const tourney = activeTourney(worldState)

        let finalists = []
        function bestOfUnchosenPlayers(pid1, pid2) {
            if (finalists.includes(pid1)) return pid2
            else if (finalists.includes(pid2)) return pid1
            else return bestOfPlayers(worldState, pid1, pid2)
        }

        // Top 2 in each division
        for (let cid of tourney.courses) {
            let course = getWorldItem(worldState, "courses", cid)
            for (let i = 0; i < 2; i++) {
                let fin = course.players.reduce(bestOfUnchosenPlayers, course.players[0])
                finalists.push(fin)
            }
        }

        // Rest of top players
        let numFinalists = Math.floor(tourney.players.length/tourney.numCourses)
        for (let i = finalists.length; i < numFinalists; i++) {
            let fin = tourney.players.reduce(unchosenBestOf, tourney.players[0])
            finalists.push(fin)
        }

        const finalCourse = ThingFactory.generateNewCourse(worldState, "FINALS", finalists)

        this.worldEdit = {
            "timetravel": {
                "timeline": 0
            },
            "timelines": [ EventMultiplication ],
            "courses": [ finalCourse ],
            "tourneys": [{
                "id": tourney.id,
                "courses": [ finalCourse.id ]
            }]
        }
    }
    eventReport(worldState) {
        const thisCourse = this.worldEdit.courses[0]
        return `The champions converge. ${thisCourse.players.length} players advance.`
    }
}

class EventCourseStart extends Event {
    calculateEdit(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventCourseStart
            },
            "players": course.players.map(pid => { return {
                "id": pid,
                "score": 0
            }})
        }
    }
    eventReport(worldState) {
        const thisCourse = activeCourseOnTimeline(worldState, this.timeline)
        return `Division ${thisCourse.division} begins its course!`
    }
}

class EventWeatherReport extends Event {
    calculateEdit(worldState) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventWeatherReport
            }
        }
    }
    eventReport(worldState) {
        const thisCourse = activeCourseOnTimeline(worldState, this.timeline)
        return `This course's weather report predicts: ${thisCourse.weather}!`
    }
}

class EventHoleStart extends Event {
    calculateEdit(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)
        const hole = ThingFactory.generateNewHole(worldState)
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventHoleStart
            },
            "holes": [ hole ],
            "courses": [{
                "id": course.id,
                "currentHole": hole.id,
                "holeNumber": course.holeNumber+1
            }],
            "players": course.players.map(pid => { return {
                "id": pid,
                "ball": {
                    "sunk": false,
                    "stroke": 0,
                    "distance": hole.dimensions.length
                }
            }})
        }
    }
    eventReport(worldState) {
        return `Next up: Hole Number ${this.worldEdit.courses[0].holeNumber}.`
    }
}

class EventWildlifeReport extends Event {
    calculateEdit(worldState) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventWildlifeReport
            }
        }
    }
    eventReport(worldState) {
        const thisHole = activeHoleOnTimeline(worldState, this.timeline)
        return `Wildlife Report: ${thisHole.wildlife}!`
    }
}

class EventUpTop extends Event {
    calculateEdit(worldState) {
        const hole = activeHoleOnTimeline(worldState, this.timeline)
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventUpTop
            },
            "holes": [{
                "id": hole.id,
                "currentPlayer": -1
            }]
        }
    }
    eventReport(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)
        return `The cycle begins anew.`
    }
}

class EventStrokeType extends Event {
    calculateEdit(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)
        const hole = activeHoleOnTimeline(worldState, this.timeline)
        const oldCP = hole.currentPlayer
        let newCP = course.players.findIndex((p, i) => i > oldCP && !getWorldItem(worldState, "players", p).ball.sunk)
        const player = playerOnTimelineAtIndex(worldState, this.timeline, newCP)

        let strokeType = calculateStrokeType(worldState, this.timeline, player)

        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventStrokeType
            },
            "holes": [{
                "id": hole.id,
                "currentPlayer": newCP
            }],
            "players": [{
                "id": player.id,
                "ball": {
                    "nextStrokeType": strokeType
                }
            }]
        }
    }
    eventReport(worldState) {
        const player = playerOnTimelineAtIndex(worldState, this.timeline, this.worldEdit.holes[0].currentPlayer)
        const newBall = this.worldEdit.players[0].ball
        return `${player.fullName()} ${newBall.nextStrokeType.message}`
    }
}

class EventStrokeOutcome extends Event {
    calculateEdit(worldState) {
        const player = activePlayerOnTimeline(worldState, this.timeline)
        this.outcome = calculateStrokeOutcome(worldState, this.timeline, player)

        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventStrokeOutcome
            },
            "players": [{
                "id": player.id,
                "ball": {
                    "sunk": this.outcome.result == "SINK",
                    "stroke": this.outcome.result == "NOTHING" ? player.ball.stroke : player.ball.stroke+1,
                    "past": this.outcome.distanceFlown > player.ball.distance && !this.outcome.newTerrain.oob ? !player.ball.past : player.ball.past,
                    "distance": this.outcome.newTerrain.oob ? player.ball.distance : this.outcome.distanceToHole,
                    "distanceJustFlown": this.outcome.distanceFlown,
                    "terrain": this.outcome.newTerrain.oob ? player.ball.terrain : this.outcome.newTerrain
                }
            }]
        }
    }
    eventReport(worldState) {
        const hole = activeHoleOnTimeline(worldState, this.timeline)
        const player = activePlayerOnTimeline(worldState, this.timeline)
        const newBall = this.worldEdit.players[0].ball
        switch(this.outcome.result) {
            case "SINK":
                if (newBall.stroke == 1) return `Hole in one!!`
                else return `They sink it for a ${intToBird(newBall.stroke - hole.dimensions.par)}.`
            case "FLY":
                if (player.ball.terrain == this.outcome.newTerrain) return `The ball flies ${Math.round(this.outcome.distanceFlown)} gallons, staying ${this.outcome.newTerrain.arrivingText}`
                else return `The ball ${player.ball.terrain.leavingText}, flying ${Math.round(this.outcome.distanceFlown)} gallons and landing ${this.outcome.newTerrain.arrivingText}`
            case "WHIFF":
                return `They barely tap the ball!`
            case "NOTHING":
                return `Nothing happens.`
        }
    }
}

class EventHoleFinish extends Event {
    calculateEdit(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventHoleFinish
            },
            "courses": [{
                "id": course.id,
                "currentHole": 0
            }],
            "players": course.players.map(pid => {
                const player = getWorldItem(worldState, "players", pid)
                return {
                    "id": pid,
                    "score": player.score + player.ball.stroke
                }
            })
        }
    }
    eventReport(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)
        return `That was Hole Number ${course.holeNumber}.`
    }
}

class EventCourseFinish extends Event {
    calculateEdit(worldState) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventCourseFinish
            }
        }
    }
    eventReport(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)
        const topPlayer = getWorldItem(worldState, "players", course.players.reduce((pid1,pid2) => bestOfPlayers(worldState,pid1,pid2), course.players[0]))

        return `Division ${course.division} has concluded its course. Congratulations to the divison leader: ${topPlayer.fullName()}!!`
    }
}

class EventCourseReward extends Event {
    calculateEdit(worldState) {
        let winners = []
        function bestOfUnchosenPlayers(pid1, pid2) {
            if (winners.includes(pid1)) return pid2
            else if (winners.includes(pid2)) return pid1
            else return bestOfPlayers(worldState, pid1, pid2)
        }

        const course = activeCourseOnTimeline(worldState, this.timeline)
        for (let i = 0; i < 3; i++) {
            let wid = course.players.reduce(bestOfUnchosenPlayers, course.players[0])
            winners.push(wid)
        }
        this.winners = winners

        const tourney = activeTourney(worldState)
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventCourseReward
            },
            "players": this.winners.map((wid, i) => {
                const player = getWorldItem(worldState, "players", wid)
                return {
                    "id": wid,
                    "netWorth": player.netWorth + Math.floor(Math.pow(2, -1-i) * tourney.sinReward)
                }
            })
        }
    }
    eventReport(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)
        let text = ``
        for (let [i,w] of this.winners.entries()) {
            const player = getWorldItem(worldState, "players", w)
            if (i != 0) text += `\n`
            text += `For coming ${i+1}th place, ${player.fullName()} receives ${this.worldEdit.players[i].netWorth - player.netWorth} $ins!`
        }
        return text
    }
}

class EventTourneyFinish extends Event {
    calculateEdit(worldState) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventTourneyFinish
            }
        }
    }
    eventReport(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)
        const topPlayer = getWorldItem(worldState, "players", course.players.reduce((pid1,pid2) => bestOfPlayers(worldState, pid1, pid2), course.players[0]))

        return `The tournament is over!! Congratulations to the winner: ${topPlayer.fullName()}!!`
    }
}

class EventTourneyReward extends Event {
    calculateEdit(worldState) {
        let winners = []
        function bestOfUnchosenPlayers(pid1, pid2) {
            if (winners.includes(pid1)) return pid2
            else if (winners.includes(pid2)) return pid1
            else return bestOfPlayers(worldState, pid1, pid2)
        }
        
        const course = activeCourseOnTimeline(worldState, this.timeline)
        for (let i = 0; i < 3; i++) {
            let wid = course.players.reduce(bestOfUnchosenPlayers, course.players[0])
            winners.push(wid)
        }

        this.winners = winners

        const tourney = activeTourney(worldState)
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventTourneyReward
            },
            "players": this.winners.map((wid, i) => {
                const player = getWorldItem(worldState, "players", wid)
                return {
                    "id": wid,
                    "netWorth": player.netWorth + Math.floor(Math.pow(2, -i) * tourney.sinReward)
                }
            })
        }
    }
    eventReport(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)
        let text = ``
        for (let [i,w] of this.winners.entries()) {
            const player = getWorldItem(worldState, "players", w)
            if (i != 0) text += `\n`
            text += `For coming ${i+1}th place, ${player.fullName()} receives ${this.worldEdit.players[i].netWorth - player.netWorth} $ins!`
        }
        return text
    }
}

class EventMemoriam extends Event {
    calculateEdit(worldState) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventMemoriam
            }
        }
    }
    eventReport(worldState) {
        const tourney = activeTourney(worldState)
        return `${tourney.name} has ended.`
    }
}

class EventTourneyConclude extends Event {
    calculateEdit(worldState) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventTourneyConclude
            },
            "league": {
                "currentTourney": 0
            }
        }
    }
    eventReport(worldState) {
        const tourney = activeTourney(worldState)
        return `${tourney.name} has concluded.`
    }
}