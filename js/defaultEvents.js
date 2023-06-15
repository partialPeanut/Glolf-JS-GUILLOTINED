class Event {
    type = "event"
    depth = "League"

    constructor(tl) {
        this.timeline = tl
    }

    formEvent(worldState, options) {
        let moddedEvent = this.calculateEdit
        moddedEvent = modifyFunction(this.type, this.depth, worldState, this.timeline, this.calculateEdit)
        const wr = moddedEvent(worldState, this.timeline, options)
        this.worldEdit = wr[0]
        this.report = wr[1]
    }

    calculateEdit(worldState, tl, options) {
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
                "phase": Event
            }
        }
        const report = `---`
        return [worldEdit, report]
    }
}

class EventWait extends Event {
    type = "wait"
    depth = "League"

    calculateEdit(worldState, tl) {
        return [{}, `---`]
    }
}

class EventVoid extends Event {
    type = "void"
    depth = "League"

    calculateEdit(worldState, tl) {
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
                "phase": EventVoid
            }
        }
        const report = `---`
        return [worldEdit, report]
    }
}

class EventTourneyStart extends Event {
    type = "tourneyStart"
    depth = "League"

    calculateEdit(worldState, tl) {
        const tourney = ThingFactory.generateNewTourney(worldState)
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
                "phase": EventTourneyStart
            },
            "tourneys": [ tourney ],
            "league": {
                "currentTourney": tourney.id
            }
        }

        const report =
            `Wlecome to ${tourney.name}!` +
            `\n${tourney.players.length} players, ${tourney.numCourses} divisions with ${tourney.holesPerCourse} holes each, and up to ${tourney.sinReward.toLocaleString()} $ins up for grabs!` +
            `\nGLOLF!! BY ANY MEANS NECESSARY.`
        return [worldEdit, report]
    }
}

class EventDivison extends Event {
    type = "division"
    depth = "Tourney"

    calculateEdit(worldState, tl) {
        const tourney = activeTourney(worldState)
        let playersLeft = tourney.players.slice(0)
        let playersPerCourse = Math.floor(tourney.players.length/tourney.numCourses)

        const newCourses = []
        for (let i = 0; i < tourney.numCourses-1; i++) {
            newCourses.push(ThingFactory.generateNewCourse(worldState, worldState.league.divisionNames[i], chooseNumFromArrayAndRemove(playersLeft, playersPerCourse)))
        }
        newCourses.push(ThingFactory.generateNewCourse(worldState, worldState.league.divisionNames[tourney.numCourses-1], playersLeft))

        const worldEdit = {
            "timetravel": {
                "timeline": tl
            },
            "timelines": newCourses.map(c => EventDivison),
            "courses": newCourses,
            "tourneys": [{
                "id": tourney.id,
                "courses": newCourses.map(c => c.id)
            }]
        }

        const report = `The players are divided.`
        return [worldEdit, report]
    }
}

class EventMultiplication extends Event {
    type = "multiplication"
    depth = "Tourney"

    calculateEdit(worldState, tl) {
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
            let fin = tourney.players.reduce(bestOfUnchosenPlayers, tourney.players[0])
            finalists.push(fin)
        }

        const finalCourse = ThingFactory.generateNewCourse(worldState, "FINALS", finalists)

        const worldEdit = {
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

        const report = `The champions converge. ${finalCourse.players.length} players advance.`
        return [worldEdit, report]
    }
}

class EventCourseStart extends Event {
    type = "courseStart"
    depth = "Course"

    calculateEdit(worldState, tl) {
        const course = activeCourseOnTimeline(worldState, tl)
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
                "phase": EventCourseStart
            },
            "players": course.players.map(pid => { return {
                "id": pid,
                "score": 0
            }})
        }

        const report = `Division ${course.division} begins its course!`
        return [worldEdit, report]
    }
}

class EventWeatherReport extends Event {
    type = "weatherReport"
    depth = "Course"

    calculateEdit(worldState, tl) {
        const course = activeCourseOnTimeline(worldState, tl)
        const chosenWeather = randomFromArray(Weather.Weathers)
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
                "phase": EventWeatherReport
            },
            "courses": [{
                "id": course.id,
                "weather": chosenWeather
            }]
        }

        const report = `This course's weather report predicts: ${chosenWeather.report}`
        return [worldEdit, report]
    }
}

class EventHoleStart extends Event {
    type = "holeStart"
    depth = "Course"

    calculateEdit(worldState, tl) {
        const course = activeCourseOnTimeline(worldState, tl)
        const hole = ThingFactory.generateNewHole(worldState)
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
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
                    "distance": hole.dimensions.length,
                    "terrain": Terrain.Tee
                }
            }})
        }

        const report = `Next up: Hole Number ${course.holeNumber+1}.`
        return [worldEdit, report]
    }
}

class EventWildlifeReport extends Event {
    type = "wildlifeReport"
    depth = "Course"

    calculateEdit(worldState, tl) {
        const hole = activeHoleOnTimeline(worldState, tl)
        const chosenWildlife = randomFromArray(Wildlife.Wildlives)
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
                "phase": EventWildlifeReport
            },
            "holes": [{
                "id": hole.id,
                "wildlife": chosenWildlife
            }]
        }

        const report = `Wildlife Report: ${chosenWildlife.report}`
        return [worldEdit, report]
    }
}

class EventUpTop extends Event {
    type = "upTop"
    depth = "Hole"

    calculateEdit(worldState, tl) {
        const hole = activeHoleOnTimeline(worldState, tl)
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
                "phase": EventUpTop
            },
            "holes": [{
                "id": hole.id,
                "currentPlayer": -1
            }]
        }

        const report = `The cycle begins anew.`
        return [worldEdit, report]
    }
}

class EventStrokeType extends Event {
    type = "strokeType"
    depth = "Ball"

    calculateEdit(worldState, tl) {
        const course = activeCourseOnTimeline(worldState, tl)
        const hole = activeHoleOnTimeline(worldState, tl)
        const oldCP = hole.currentPlayer
        const newCP = course.players.findIndex((p, i) => i > oldCP && !getWorldItem(worldState, "players", p).ball.sunk)
        const player = playerOnTimelineAtIndex(worldState, tl, newCP)

        const type = calculateStrokeType(worldState, tl, player)
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
                "phase": EventStrokeType
            },
            "holes": [{
                "id": hole.id,
                "currentPlayer": newCP
            }],
            "players": [{
                "id": player.id,
                "ball": {
                    "nextStrokeType": type
                }
            }]
        }

        const report = `${player.fullName()} ${type.message}`
        return [worldEdit, report]
    }
}

class EventStrokeOutcome extends Event {
    type = "strokeOutcome"
    depth = "Ball"

    calculateEdit(worldState, tl) {
        const hole = activeHoleOnTimeline(worldState, tl)
        const player = activePlayerOnTimeline(worldState, tl)
        
        const outcome = calculateStrokeOutcome(worldState, tl, player)
        const newBall = {
            "sunk": outcome.result == "SINK",
            "stroke": outcome.result == "NOTHING" ? player.ball.stroke : player.ball.stroke+1,
            "past": outcome.distanceFlown > player.ball.distance && !outcome.newTerrain.oob ? !player.ball.past : player.ball.past,
            "distance": outcome.newTerrain.oob ? player.ball.distance : outcome.distanceToHole,
            "distanceJustFlown": outcome.distanceFlown,
            "terrain": outcome.newTerrain.oob ? player.ball.terrain : outcome.newTerrain,
            "terrainJustLanded": outcome.newTerrain
        }
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
                "phase": EventStrokeOutcome
            },
            "players": [{
                "id": player.id,
                "ball": newBall
            }]
        }

        let report = `Nothing happens.`
        switch(outcome.result) {
            case "SINK":
                if (newBall.stroke == 1) report = `Hole in one!!`
                else report = `They sink it for a ${intToBird(newBall.stroke - hole.dimensions.par)}.`
                break
            case "FLY":
                if (player.ball.terrain == outcome.newTerrain) report = `The ball flies ${Math.round(outcome.distanceFlown)} gallons, staying ${outcome.newTerrain.arrivingText}`
                else report = `The ball ${player.ball.terrain.leavingText}, flying ${Math.round(outcome.distanceFlown)} gallons and landing ${outcome.newTerrain.arrivingText}`
                break
            case "WHIFF":
                report = `They barely tap the ball!`
                break
        }
        return [worldEdit, report]
    }
}

class EventHoleFinish extends Event {
    type = "holeFinish"
    depth = "Hole"

    calculateEdit(worldState, tl) {
        const course = activeCourseOnTimeline(worldState, tl)
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
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

        const report = `That was Hole Number ${course.holeNumber}.`
        return [worldEdit, report]
    }
}

class EventCourseFinish extends Event {
    type = "courseFinish"
    depth = "Course"

    calculateEdit(worldState, tl) {
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
                "phase": EventCourseFinish
            }
        }

        const course = activeCourseOnTimeline(worldState, tl)
        const topPlayer = getWorldItem(worldState, "players", course.players.reduce((pid1,pid2) => bestOfPlayers(worldState,pid1,pid2), course.players[0]))
        const report = `Division ${course.division} has concluded its course. Congratulations to the divison leader: ${topPlayer.fullName()}!!`
        return [worldEdit, report]
    }
}

class EventCourseReward extends Event {
    type = "courseReward"
    depth = "Course"

    calculateEdit(worldState, tl, options) {
        let winners = []
        let scores = []

        const tourney = activeTourney(worldState)
        const course = activeCourseOnTimeline(worldState, tl)
        let sortedPlayers = course.players.map(pid => getWorldItem(worldState, "players", pid)).sort((p1,p2) => p1.score - p2.score)

        for (let i = 0; i < tourney.placesRewarded; i++) {
            let placeScore = sortedPlayers.find(p => !scores.includes(p.score)).score
            let placePlayers = sortedPlayers.filter(p => p.score == placeScore)
            scores.push(placeScore)
            winners.push(placePlayers)
        }

        this.place = options.place
        const placeWinners = winners[this.place]
        const placeReward = Math.floor(Math.pow(2, -1-this.place) * tourney.sinReward)
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
                "phase": EventCourseReward
            },
            "players": placeWinners.map(w => {
                return {
                    "id": w.id,
                    "netWorth": w.netWorth + placeReward
                }
            })
        }

        const report = `The ${nth(this.place+1)} place leader${placeWinners.length > 1 ? `s` : ``} recieve ${placeReward} $ins each: ${joinGrammatically(placeWinners.map(p => p.fullName()))}`
        return [worldEdit, report]
    }
}

class EventTourneyFinish extends Event {
    type = "tourneyFinish"
    depth = "Tourney"

    calculateEdit(worldState, tl) {
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
                "phase": EventTourneyFinish
            }
        }

        const course = activeCourseOnTimeline(worldState, tl)
        const topPlayer = getWorldItem(worldState, "players", course.players.reduce((pid1,pid2) => bestOfPlayers(worldState, pid1, pid2), course.players[0]))
        const report = `The tournament is over!! Congratulations to the winner: ${topPlayer.fullName()}!!`
        return [worldEdit, report]
    }
}

class EventTourneyReward extends Event {
    type = "tourneyReward"
    depth = "Tourney"

    calculateEdit(worldState, tl) {
        let winners = []
        function bestOfUnchosenPlayers(pid1, pid2) {
            if (winners.includes(pid1)) return pid2
            else if (winners.includes(pid2)) return pid1
            else return bestOfPlayers(worldState, pid1, pid2)
        }
        
        const course = activeCourseOnTimeline(worldState, tl)
        for (let i = 0; i < 3; i++) {
            let wid = course.players.reduce(bestOfUnchosenPlayers, course.players[0])
            winners.push(wid)
        }

        this.winners = winners

        const tourney = activeTourney(worldState)
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
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

        let report = ``
        for (let [i,w] of this.winners.entries()) {
            const player = getWorldItem(worldState, "players", w)
            if (i != 0) this.report += `\n`
            report += `For coming ${i+1}th place, ${player.fullName()} receives ${(worldEdit.players[i].netWorth - player.netWorth).toLocaleString()} $ins!`
        }
        return [worldEdit, report]
    }
}

class EventMemoriam extends Event {
    type = "memoriam"
    depth = "Tourney"

    calculateEdit(worldState, tl) {
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
                "phase": EventMemoriam
            }
        }

        const tourney = activeTourney(worldState)
        const report = `We dedicated this tournament to those lost to Death's clutches: ${joinGrammatically(tourney.kia.map(pid => getWorldItem(worldState, "players", pid).fullName()))}.` + 
            `May they ace forever in the All Holes Halls.`
        return [worldEdit, report]
    }
}

class EventTourneyConclude extends Event {
    type = "tourneyConclude"
    depth = "Tourney"

    calculateEdit(worldState, tl) {
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
                "phase": EventTourneyConclude
            },
            "league": {
                "currentTourney": 0
            }
        }

        const tourney = activeTourney(worldState)
        const report = `${tourney.name} has concluded.`
        return [worldEdit, report]
    }
}