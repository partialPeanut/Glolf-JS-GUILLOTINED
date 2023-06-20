// The parent class for every Event. Should NEVER be actually used.
class Event {
    // Type is the flag that mods, weathers, and wildlives use to modify the event
    type = "event"
    // Depth is the amount of mods that should be applied to the event
    // This event has depth "League" so only league mods apply to it
    depth = "League"

    // Events always need to know what timeline they are in
    constructor(tl) {
        this.timeline = tl
    }

    // Makes the event calculate its world edit and report, including applicable mods. Only ever done once.
    formEvent(worldState, options) {
        let moddedEvent = this.defaultEffect
        moddedEvent = modifyFunction(this.type, this.depth, worldState, this.timeline, this.defaultEffect)
        const wr = moddedEvent(worldState, this.timeline, options)
        this.worldEdit = wr[0]
        this.report = wr[1]
    }

    // The default effect of the event. Returns both world edit and report as one array
    defaultEffect(worldState, tl, options) {
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

// The event that is given if a timeline is waiting for others to catch up.
// Will not add to records or reports.
class EventWait extends Event {
    type = "wait"
    depth = "League"

    defaultEffect(worldState, tl) {
        return [{}, `---`]
    }
}

// An empty event for empty times (currently appears between tourneys)
class EventVoid extends Event {
    type = "void"
    depth = "League"

    defaultEffect(worldState, tl) {
        const worldEdit = {
            // timetravel tells the Onceler what event just happened. For default events, this should always be the timeline of the event and its own class name.
            // If you don't supply a phase, then the Onceler will pick up where it left off before the event happened.
            "timetravel": {
                "timeline": tl,
                "phase": EventVoid
            }
        }
        const report = `---`
        return [worldEdit, report]
    }
}

// The event that starts a tourney!
class EventTourneyStart extends Event {
    type = "tourneyStart"
    depth = "League"

    defaultEffect(worldState, tl) {
        // Generates a new tourney, adds it to the list of tourneys, and sets the league's current tourney to the new one.
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

// Splits players of a tourney into a set of divisions!
class EventDivison extends Event {
    type = "division"
    depth = "Tourney"

    defaultEffect(worldState, tl) {
        const tourney = activeTourney(worldState)
        let playersLeft = tourney.players.slice(0)
        let playersPerCourse = Math.floor(tourney.players.length/tourney.numCourses)

        // If there are n divisions, create n-1 divisions with 1/nth of the players, and fill the last division with whoever is left.
        // This ensures every player in the tourney gets to play, in case the number is not divisible by n.
        const newCourses = []
        for (let i = 0; i < tourney.numCourses-1; i++) {
            newCourses.push(ThingFactory.generateNewCourse(worldState, chooseNumFromArrayAndRemove(playersLeft, playersPerCourse), "Division", false, worldState.league.divisionNames[i]))
        }
        newCourses.push(ThingFactory.generateNewCourse(worldState, playersLeft, "Division", false, worldState.league.divisionNames[tourney.numCourses-1]))

        // Creates more timelines! Also adds the new courses to the list, and makes them accessible to the tourney
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

// Recombines the players of a tourney into a finals course, combining all timelines into one
class EventMultiplication extends Event {
    type = "multiplication"
    depth = "Tourney"

    defaultEffect(worldState, tl) {
        const tourney = activeTourney(worldState)

        let finalists = []
        function bestOfUnchosenPlayers(pid1, pid2) {
            if (finalists.includes(pid1)) return pid2
            else if (finalists.includes(pid2)) return pid1
            else return bestOfPlayers(worldState, pid1, pid2)
        }

        // Adds all 1st and 2nd place players in each division
        for (let cid of tourney.courses) {
            let course = getWorldItem(worldState, "courses", cid)
            for (let i = 0; i < 2; i++) {
                finalists = finalists.concat(course.winners[i])
            }
        }

        // If there are slots left, adds the rest of the best
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

// Starts a course!
class EventCourseStart extends Event {
    type = "courseStart"
    depth = "Course"

    defaultEffect(worldState, tl) {
        // Resets all players' scores to zero
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

// Reports the weather for a course
class EventWeatherReport extends Event {
    type = "weatherReport"
    depth = "Course"

    defaultEffect(worldState, tl) {
        // Chooses the weather from their weights
        const course = activeCourseOnTimeline(worldState, tl)
        const chosenWeather = Weather.Weathers.at(chooseFromWeights(Weather.Weathers.map(w => w.weight)))
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

// Starts a hole!
class EventHoleStart extends Event {
    type = "holeStart"
    depth = "Course"

    defaultEffect(worldState, tl, options) {
        const course = activeCourseOnTimeline(worldState, tl)

        // Creates the new hole, if it's sudden death then only the tied players should play at this hole
        // Also if it's sudden death, apply the sudden death mod
        const suddenDeath = options === undefined || options.suddenDeath === undefined ? false : options.suddenDeath
        const playingPlayers = suddenDeath ? course.winners[0] : course.players
        const hole = ThingFactory.generateNewHole(worldState, playingPlayers)
        if (suddenDeath) Mod.SuddenDeath.apply(hole)

        // Adds the hole to the list, ties it to the course, and increases the current hole number
        // Also resets all balls to default (not sunk, 0 strokes, the length of the hole away from it, and on the tee)
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

// Reports wildlife for the hole
class EventWildlifeReport extends Event {
    type = "wildlifeReport"
    depth = "Hole"

    defaultEffect(worldState, tl) {
        // Chooses the wildlife based on their weights
        const hole = activeHoleOnTimeline(worldState, tl)
        const chosenWildlife = Wildlife.Wildlives.at(chooseFromWeights(Wildlife.Wildlives.map(w => w.weight)))
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

// Plays every time every player has had a turn
class EventUpTop extends Event {
    type = "upTop"
    depth = "Hole"

    defaultEffect(worldState, tl) {
        // Resets the current player to the top of the list
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

// The player chooses what stroke to do here
class EventStrokeType extends Event {
    type = "strokeType"
    depth = "Ball"

    defaultEffect(worldState, tl) {
        const hole = activeHoleOnTimeline(worldState, tl)
        const oldCP = hole.currentPlayer
        // Finds the next player who isn't finished
        const newCP = hole.players.findIndex((pid, i) => i > oldCP && !getWorldItem(worldState, "players", pid).ball.sunk)
        const player = playerOnTimelineAtIndex(worldState, tl, newCP)

        // Determines what stroke the player should do
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

// Shows what happened to the ball after the stroke
class EventStrokeOutcome extends Event {
    type = "strokeOutcome"
    depth = "Ball"

    defaultEffect(worldState, tl) {
        const hole = activeHoleOnTimeline(worldState, tl)
        const player = activePlayerOnTimeline(worldState, tl)
        
        // Calculates what happened to the ball
        const outcome = calculateStrokeOutcome(worldState, tl, player)
        // Adjusts the ball based on those results
        const newBall = {
            "sunk": outcome.result == "SINK",
            "stroke": outcome.result == "NOTHING" ? player.ball.stroke : player.ball.stroke+1,
            "past": outcome.distanceFlown > player.ball.distance && !outcome.newTerrain.oob ? !player.ball.past : player.ball.past,
            "distance": outcome.newTerrain.oob ? player.ball.distance : outcome.distanceToHole,
            "distanceJustFlown": outcome.distanceFlown,
            "terrain": outcome.newTerrain.oob ? player.ball.terrain : outcome.newTerrain,
            "terrainJustLanded": outcome.newTerrain
        }
        
        // Ends all effects with duration STROKE
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

// It's the end of the hole as we know it
class EventHoleFinish extends Event {
    type = "holeFinish"
    depth = "Hole"

    defaultEffect(worldState, tl) {
        const tourney = activeTourney(worldState)
        const course = activeCourseOnTimeline(worldState, tl)
        const hole = activeHoleOnTimeline(worldState, tl)

        // Adds up the score for every player
        const editPlayers = hole.players.map(pid => {
            const player = getWorldItem(worldState, "players", pid)
            return {
                "id": pid,
                "score": player.score + player.ball.stroke - hole.dimensions.par
            }
        })

        // Ends all effects with duration HOLE
        let worldEdit = editOfEndDurations(worldState, tl, "HOLE")
        let holeEndEffect = {
            "timetravel": {
                "timeline": tl,
                "phase": EventHoleFinish
            },
            "players": editPlayers
        }

        // Determines the current course leaders after this hole
        // This has to be done every hole in case a sudden death is needed
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

        // If after a sudden death round, put the winner(s) in 1st place, the survivors in 2nd place if there are any, and move the rest down to 3rd or later
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
            else report += ` There can only be one winner. Sudden death continues.`
        }
        return [worldEdit, report]
    }
}

// Finishes the course.
class EventCourseFinish extends Event {
    type = "courseFinish"
    depth = "Course"

    defaultEffect(worldState, tl) {
        const course = activeCourseOnTimeline(worldState, tl)

        // Ends all effects with duration COURSE
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

// Displays the nth place leaders of this course and their prize!
class EventCourseReward extends Event {
    type = "courseReward"
    depth = "Course"

    defaultEffect(worldState, tl, options) {
        // options = { "place": x }
        // Where "place" is the place leaders that will be shown

        const tourney = activeTourney(worldState)
        const course = activeCourseOnTimeline(worldState, tl)

        // The array of all the winners at this place
        const placeWinners = course.winners[options.place].map(wid => getWorldItem(worldState, "players", wid))
        // Rewards the players with (r * 2^(-n-1))/p $ins each, where r is the tourney reward, n is the place*, and p is the number of players who have to split that prize
        // So everyone in first splits half the pot, second gets a quarter, etc
        // *1st = 0, 2nd = 1, etc
        const placeReward = placeWinners.length > 0 ? Math.floor(Math.pow(2, -1-options.place) * tourney.sinReward / placeWinners.length) : 0
        // Gives everyone their reward and tells the course that it's given this place their reward already
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

        // Use different grammar depending on the ammount of placers
        let report
        if (placeWinners.length == 0) report = `There were no ${nth(options.place+1)} place leaders...`
        else if (placeWinners.length > 1) report = `The ${nth(options.place+1)} place leaders recieve ${placeReward.toLocaleString()} $ins each: ${joinGrammatically(placeWinners.map(p => p.fullName()))}!`
        else report = `The ${nth(options.place+1)} place leader recieves ${placeReward.toLocaleString()} $ins: ${placeWinners[0].fullName()}!`
        return [worldEdit, report]
    }
}

// The end of the tourney!
class EventTourneyFinish extends Event {
    type = "tourneyFinish"
    depth = "Tourney"

    defaultEffect(worldState, tl) {
        // Ends all effects with duration TOURNEY
        let worldEdit = editOfEndDurations(worldState, tl, "TOURNEY")
        let tourneyEndEffect = {
            "timetravel": {
                "timeline": tl,
                "phase": EventTourneyFinish
            }
        }
        WorldStateManager.combineEdits(worldEdit, tourneyEndEffect)

        // The best players are selected from the last course (finals), not from everyone in the tourney
        const course = activeCourseOnTimeline(worldState, tl)
        const topPlayer = getWorldItem(worldState, "players", course.players.reduce((pid1,pid2) => bestOfPlayers(worldState, pid1, pid2), course.players[0]))
        const report = `The tournament is over!! Congratulations to the winner: ${topPlayer.fullName()}!!`
        return [worldEdit, report]
    }
}

// Reward em big style
class EventTourneyReward extends Event {
    type = "tourneyReward"
    depth = "Tourney"

    defaultEffect(worldState, tl, options) {
        const tourney = activeTourney(worldState)
        const course = activeCourseOnTimeline(worldState, tl)

        // See course reward, except starting at prize/1 instead of prize/2
        // This is the exact same as course reward except with different wording lol
        const placeWinners = course.winners[options.place].map(wid => getWorldItem(worldState, "players", wid))
        const placeReward = placeWinners.length > 0 ? Math.floor(Math.pow(2, -options.place) * tourney.sinReward / placeWinners.length) : 0
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
                "phase": EventTourneyReward
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

        // Use different grammar depending on the ammount of placers, again
        let report
        if (placeWinners.length == 0) report = `There were no ${nth(options.place+1)} place winners...`
        else if (placeWinners.length > 1) report = `The ${nth(options.place+1)} place winners recieve ${placeReward.toLocaleString()} $ins each: ${joinGrammatically(placeWinners.map(p => p.fullName()))}!`
        else report = `The ${nth(options.place+1)} place winner recieves ${placeReward.toLocaleString()} $ins: ${placeWinners[0].fullName()}!`
        return [worldEdit, report]
    }
}

// In case of accident
class EventMemoriam extends Event {
    type = "memoriam"
    depth = "Tourney"

    defaultEffect(worldState, tl) {
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
                "phase": EventMemoriam
            }
        }

        const tourney = activeTourney(worldState)
        const report = `We dedicated this tournament to those lost to Death's clutches: ${joinGrammatically(tourney.kia.map(pid => getWorldItem(worldState, "players", pid).fullName()))}.` + 
                       `\nMay they ace forever in the All Holes Halls.`
        return [worldEdit, report]
    }
}

// Finish the tourney off
class EventTourneyConclude extends Event {
    type = "tourneyConclude"
    depth = "Tourney"

    defaultEffect(worldState, tl) {
        // Sets the current tourney to no tourney
        const worldEdit = {
            "timetravel": {
                "timeline": tl,
                "phase": EventTourneyConclude
            },
            "league": {
                "currentTourney": -1
            }
        }

        const tourney = activeTourney(worldState)
        const report = `${tourney.name} has concluded.`
        return [worldEdit, report]
    }
}