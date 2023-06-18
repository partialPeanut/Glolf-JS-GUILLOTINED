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
            newCourses.push(ThingFactory.generateNewCourse(worldState, chooseNumFromArrayAndRemove(playersLeft, playersPerCourse), "Division", true, worldState.league.divisionNames[i]))
        }
        newCourses.push(ThingFactory.generateNewCourse(worldState, playersLeft, "Division", true, worldState.league.divisionNames[tourney.numCourses-1]))

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

        // All 1st and 2nd in each division
        for (let cid of tourney.courses) {
            let course = getWorldItem(worldState, "courses", cid)
            for (let i = 0; i < 2; i++) {
                finalists = finalists.concat(course.winners[i])
            }
        }

        // Rest of top players
        let numFinalists = Math.floor(tourney.players.length/tourney.numCourses)
        for (let i = finalists.length; i < numFinalists; i++) {
            let fin = tourney.players.reduce(bestOfUnchosenPlayers, tourney.players[0])
            finalists.push(fin)
        }

        const finalCourse = ThingFactory.generateNewCourse(worldState, finalists, "Finals", true)

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

    calculateEdit(worldState, tl, options) {
        const course = activeCourseOnTimeline(worldState, tl)

        const suddenDeath = options === undefined || options.suddenDeath === undefined ? false : options.suddenDeath
        const playingPlayers = suddenDeath ? course.winners[0] : course.players
        const hole = ThingFactory.generateNewHole(worldState, playingPlayers)
        if (suddenDeath) Mod.SuddenDeath.apply(hole)

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

        let report = `Next up: Hole Number ${course.holeNumber+1}.`
        if (suddenDeath) report += ` SUDDEN DEATH!!`
        return [worldEdit, report]
    }
}

class EventWildlifeReport extends Event {
    type = "wildlifeReport"
    depth = "Hole"

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
        const hole = activeHoleOnTimeline(worldState, tl)
        const oldCP = hole.currentPlayer
        const newCP = hole.players.findIndex((pid, i) => i > oldCP && !getWorldItem(worldState, "players", pid).ball.sunk)
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
        
        let worldEdit = editOfEndDurations(worldState, tl, "STROKE")
        let strokeEffect = {
            "timetravel": {
                "timeline": tl,
                "phase": EventStrokeOutcome
            },
            "players": [{
                "id": player.id,
                "ball": newBall
            }]
        }
        WorldStateManager.combineEdits(worldEdit, strokeEffect)

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
        const tourney = activeTourney(worldState)
        const course = activeCourseOnTimeline(worldState, tl)
        const hole = activeHoleOnTimeline(worldState, tl)

        const editPlayers = hole.players.map(pid => {
            const player = getWorldItem(worldState, "players", pid)
            return {
                "id": pid,
                "score": player.score + player.ball.stroke - hole.dimensions.par
            }
        })

        let worldEdit = editOfEndDurations(worldState, tl, "HOLE")
        let holeEndEffect = {
            "timetravel": {
                "timeline": tl,
                "phase": EventHoleFinish
            },
            "players": editPlayers
        }

        let winners = []
        let scores = []

        let sortedPlayers = editPlayers.sort((p1,p2) => p1.score - p2.score)

        for (let i = 0; i < tourney.placesRewarded; i++) {
            let placeScore, placePlayers
            let nextLeader = sortedPlayers.find(p => !scores.includes(p.score))
            if (nextLeader !== undefined) {
                placeScore = nextLeader.score
                placePlayers = sortedPlayers.filter(p => p.score == placeScore).map(p => p.id)
            }
            else {
                placeScore = 1000
                placePlayers = []
            }
            scores.push(placeScore)
            winners.push(placePlayers)
        }

        holeEndEffect.courses = [{
            "id": course.id,
            "winners": winners
        }]

        if (hole.suddenDeath) {
            let survivors = []
            for (let i = 1; i < winners.length; i++) {
                survivors = survivors.concat(winners[i])
            }
            let newWinners = [ winners[0] ]
            if (survivors.length > 0) newWinners.push(survivors)
            for (let i = 1; newWinners.length < tourney.placesRewarded; i++) {
                if (course.winners[i] === undefined) newWinners.push([])
                else newWinners.push(course.winners[i])
            }
            holeEndEffect.courses = [{
                "id": course.id,
                "winners": newWinners
            }]
        }
        WorldStateManager.combineEdits(worldEdit, holeEndEffect)

        let report = `That was Hole Number ${course.holeNumber}.`
        if (hole.suddenDeath) {
            if (winners[0].length == 0) report += ` There were no survivors.`
            else if (winners[0].length == 1) report += ` One player came out on top.`
            else report += ` Sudden death continues.`
        }
        return [worldEdit, report]
    }
}

class EventCourseFinish extends Event {
    type = "courseFinish"
    depth = "Course"

    calculateEdit(worldState, tl) {
        const course = activeCourseOnTimeline(worldState, tl)

        let worldEdit = editOfEndDurations(worldState, tl, "COURSE")
        let courseEndEffect = {
            "timetravel": {
                "timeline": tl,
                "phase": EventCourseFinish
            }
        }
        WorldStateManager.combineEdits(worldEdit, courseEndEffect)

        const topPlayer = getWorldItem(worldState, "players", course.winners[0].reduce((pid1,pid2) => bestOfPlayers(worldState,pid1,pid2), course.winners[0][0]))
        const report = `Division ${course.division} has concluded its course. Congratulations to the divison leader: ${topPlayer.fullName()}!!`
        return [worldEdit, report]
    }
}

class EventCourseReward extends Event {
    type = "courseReward"
    depth = "Course"

    calculateEdit(worldState, tl, options) {
        const tourney = activeTourney(worldState)
        const course = activeCourseOnTimeline(worldState, tl)

        const placeWinners = course.winners[options.place].map(wid => getWorldItem(worldState, "players", wid))
        const placeReward = placeWinners.length > 0 ? Math.floor(Math.pow(2, -1-options.place) * tourney.sinReward / placeWinners.length) : 0
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
                "phase": EventCourseReward
            },
            "courses": [{
                "id": course.id,
                "currentRewardPlace": options.place
            }],
            "players": placeWinners.map(w => {
                return {
                    "id": w.id,
                    "netWorth": w.netWorth + placeReward
                }
            })
        }

        let report
        if (placeWinners.length == 0) report = `There were no ${nth(options.place+1)} place leaders...`
        else if (placeWinners.length > 1) report = `The ${nth(options.place+1)} place leaders recieve ${placeReward.toLocaleString()} $ins each: ${joinGrammatically(placeWinners.map(p => p.fullName()))}!`
        else report = `The ${nth(options.place+1)} place leader recieves ${placeReward.toLocaleString()} $ins: ${placeWinners[0].fullName()}!`
        return [worldEdit, report]
    }
}

class EventTourneyFinish extends Event {
    type = "tourneyFinish"
    depth = "Tourney"

    calculateEdit(worldState, tl) {
        let worldEdit = editOfEndDurations(worldState, tl, "TOURNEY")
        let tourneyEndEffect = {
            "timetravel": {
                "timeline": tl,
                "phase": EventTourneyFinish
            }
        }
        WorldStateManager.combineEdits(worldEdit, tourneyEndEffect)

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

        const tourney = activeTourney(worldState)
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
                "phase": EventTourneyReward
            },
            "players": winners.map((wid, i) => {
                const player = getWorldItem(worldState, "players", wid)
                return {
                    "id": wid,
                    "netWorth": player.netWorth + Math.floor(Math.pow(2, -i) * tourney.sinReward)
                }
            })
        }

        let report = ``
        for (let [i,w] of winners.entries()) {
            const player = getWorldItem(worldState, "players", w)
            if (i != 0) report += `\n`
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
                      ` May they ace forever in the All Holes Halls.`
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