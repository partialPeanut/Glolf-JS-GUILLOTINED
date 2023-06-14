class Event {
    constructor(tl) {
        this.timeline = tl
    }

    formEvent(worldState, options) {
        this.calculateEdit(worldState, options)
    }

    calculateEdit(worldState, options) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": Event
            }
        }
        this.report = `---`
    }
}

class EventWait extends Event {
    calculateEdit(worldState) {
        this.worldEdit = {}
        this.report = `---`
    }
}

class EventVoid extends Event {
    calculateEdit(worldState) {
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventVoid
            }
        }
        this.report = `---`
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

        triggerEffects("tourneyStarted", "Tourney", worldState, this.timeline)

        this.report =
            `Wlecome to ${tourney.name}!` +
            `\n${tourney.players.length} players, ${tourney.numCourses} divisions with ${tourney.holesPerCourse} holes each, and up to ${tourney.sinReward.toLocaleString()} $ins up for grabs!` +
            `\nGLOLF!! BY ANY MEANS NECESSARY.`
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

        this.report = `The players are divided.`
    }
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
            let fin = tourney.players.reduce(bestOfUnchosenPlayers, tourney.players[0])
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

        this.report = `The champions converge. ${finalCourse.players.length} players advance.`
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

        this.report = `Division ${course.division} begins its course!`
    }
}

class EventWeatherReport extends Event {
    calculateEdit(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)
        let chosenWeather = randomFromArray(Weather.Weathers)
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventWeatherReport
            },
            "courses": [{
                "id": course.id,
                "weather": chosenWeather
            }]
        }

        this.report = `This course's weather report predicts: ${chosenWeather.report}`
    }
}

class EventHoleStart extends Event {
    calculateEdit(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)

        let createHole = modifyFunction("createHole", "Course", worldState, this.timeline,
            function(ws) { return ThingFactory.generateNewHole(ws) })
        
        const hole = createHole(worldState)

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
                    "distance": hole.dimensions.length,
                    "terrain": Terrain.Tee
                }
            }})
        }

        this.report = `Next up: Hole Number ${course.holeNumber+1}.`
    }
}

class EventWildlifeReport extends Event {
    calculateEdit(worldState) {
        const hole = activeHoleOnTimeline(worldState, this.timeline)
        let chosenWildlife = randomFromArray(Wildlife.Wildlives)
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventWildlifeReport
            },
            "holes": [{
                "id": hole.id,
                "wildlife": chosenWildlife
            }]
        }

        this.report = `Wildlife Report: ${chosenWildlife.report}`
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

        this.report = `The cycle begins anew.`
    }
}

class EventStrokeType extends Event {
    calculateEdit(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)
        const hole = activeHoleOnTimeline(worldState, this.timeline)
        const oldCP = hole.currentPlayer
        let newCP = course.players.findIndex((p, i) => i > oldCP && !getWorldItem(worldState, "players", p).ball.sunk)
        const player = playerOnTimelineAtIndex(worldState, this.timeline, newCP)

        let strokeType = modifyFunction("strokeType", "Player", worldState, this.timeline,
            function(ws, tl, p) { return calculateStrokeType(ws, tl, p) })
    
        let type = strokeType(worldState, this.timeline, player)

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
                    "nextStrokeType": type
                }
            }]
        }

        this.report = `${player.fullName()} ${type.message}`
    }
}

class EventStrokeOutcome extends Event {
    calculateEdit(worldState) {
        const hole = activeHoleOnTimeline(worldState, this.timeline)
        const player = activePlayerOnTimeline(worldState, this.timeline)

        let strokeOutcome = modifyFunction("strokeOutcome", "Ball", worldState, this.timeline,
            function(ws, tl, p) { return calculateStrokeOutcome(ws, tl, p) })
        
        const outcome = strokeOutcome(worldState, this.timeline, player)

        const newBall = {
            "sunk": outcome.result == "SINK",
            "stroke": outcome.result == "NOTHING" ? player.ball.stroke : player.ball.stroke+1,
            "past": outcome.distanceFlown > player.ball.distance && !outcome.newTerrain.oob ? !player.ball.past : player.ball.past,
            "distance": outcome.newTerrain.oob ? player.ball.distance : outcome.distanceToHole,
            "distanceJustFlown": outcome.distanceFlown,
            "terrain": outcome.newTerrain.oob ? player.ball.terrain : outcome.newTerrain
        }
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventStrokeOutcome
            },
            "players": [{
                "id": player.id,
                "ball": newBall
            }]
        }

        switch(outcome.result) {
            case "SINK":
                if (newBall.stroke == 1) this.report = `Hole in one!!`
                else this.report = `They sink it for a ${intToBird(newBall.stroke - hole.dimensions.par)}.`
                break
            case "FLY":
                if (player.ball.terrain == outcome.newTerrain) this.report = `The ball flies ${Math.round(outcome.distanceFlown)} gallons, staying ${outcome.newTerrain.arrivingText}`
                else this.report = `The ball ${player.ball.terrain.leavingText}, flying ${Math.round(outcome.distanceFlown)} gallons and landing ${outcome.newTerrain.arrivingText}`
                break
            case "WHIFF":
                this.report = `They barely tap the ball!`
                break
            case "NOTHING":
                this.report = `Nothing happens.`
                break
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

        this.report = `That was Hole Number ${course.holeNumber}.`
    }
}

class EventCourseFinish extends Event {
    calculateEdit(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventCourseFinish
            }
        }

        const topPlayer = getWorldItem(worldState, "players", course.players.reduce((pid1,pid2) => bestOfPlayers(worldState,pid1,pid2), course.players[0]))
        this.report = `Division ${course.division} has concluded its course. Congratulations to the divison leader: ${topPlayer.fullName()}!!`
    }
}

class EventCourseReward extends Event {
    calculateEdit(worldState, options) {
        let winners = []
        let scores = []

        const tourney = activeTourney(worldState)
        const course = activeCourseOnTimeline(worldState, this.timeline)
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
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventCourseReward
            },
            "players": placeWinners.map(w => {
                return {
                    "id": w.id,
                    "netWorth": w.netWorth + placeReward
                }
            })
        }

        this.report = `The ${nth(this.place+1)} place leader${placeWinners.length > 1 ? `s` : ``} recieve ${placeReward} $ins each: ${joinGrammatically(placeWinners.map(p => p.fullName()))}`
    }
}

class EventTourneyFinish extends Event {
    calculateEdit(worldState) {
        const course = activeCourseOnTimeline(worldState, this.timeline)
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventTourneyFinish
            }
        }

        const topPlayer = getWorldItem(worldState, "players", course.players.reduce((pid1,pid2) => bestOfPlayers(worldState, pid1, pid2), course.players[0]))
        this.report = `The tournament is over!! Congratulations to the winner: ${topPlayer.fullName()}!!`
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

        this.report = ``
        for (let [i,w] of this.winners.entries()) {
            const player = getWorldItem(worldState, "players", w)
            if (i != 0) this.report += `\n`
            this.report += `For coming ${i+1}th place, ${player.fullName()} receives ${(this.worldEdit.players[i].netWorth - player.netWorth).toLocaleString()} $ins!`
        }
    }
}

class EventMemoriam extends Event {
    calculateEdit(worldState) {
        const tourney = activeTourney(worldState)
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventMemoriam
            }
        }

        this.report = `We dedicated this tournament to those lost to Death's clutches: ${joinGrammatically(tourney.kia.map(pid => getWorldItem(worldState, "players", pid).fullName()))}.` + 
            `May they ace forever in the All Holes Halls.`
    }
}

class EventTourneyConclude extends Event {
    calculateEdit(worldState) {
        const tourney = activeTourney(worldState)
        this.worldEdit = {
            "timetravel": {
                "timeline": this.timeline,
                "phase": EventTourneyConclude
            },
            "league": {
                "currentTourney": 0
            }
        }

        this.report = `${tourney.name} has concluded.`
    }
}