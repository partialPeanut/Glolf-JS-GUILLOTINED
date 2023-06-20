// Clamp a value between a min and a max
function clamp(val, min, max) {
    return val > max ? max : val < min ? min : val;
}

// Return a random real number between min and max
// If only 1 argument, return between 0 and that number
function randomReal(min, max) {
    if (max === undefined) {
        max = min
        min = 0
    }
    return min + Math.random() * (max-min)
}

// Return a random integer between min and max (inclusive)
// If only 1 argument, return between 0 and that number
function randomInt(min, max) {
    if (max === undefined) {
        max = min
        min = 0
    }
    return Math.floor(randomReal(min, max+1))
}

// Return a random real number based on a gaussian curve with mean mean and standard deviation stdev
function randomGaussian(mean=0, stdev=1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}

// Return a random element from an array
function randomFromArray(array) { return array.at(randomInt(array.length-1)) }

// Remove a value from an array
function removeFromArray(array, val) {
    if (array.includes(val)) array.splice(array.indexOf(val), 1)
}

// Remove an array of values from an array
function removeManyFromArray(array, vals) {
    for (let val of vals) removeFromArray(array, val)
}

// Return the average value of an array of numbers
function averageArray(array) {
    const total = array.reduce((total, x) => total += x)
    return total/array.length
}

// Given an array of weights, return a randomly chosen index based on those weights
function chooseFromWeights(array) {
    const totalWeight = array.reduce((total, w) => total += Math.max(0,w))
    let choice = randomReal(totalWeight)
    for ([i, w] of array.entries()) {
        choice -= Math.max(0,w)
        if (choice < 0) return i
    }
    return -1
}

// Return num amount of elements from an array
function chooseNumFromArray(array, num) {
    let arrayCopy = array.slice(0)
    let chosen = []
    if (array.length <= num) return arrayCopy
    else {
        for (let i = 0; i < num; i++) {
            let t = randomFromArray(arrayCopy)
            chosen.push(t)
            removeFromArray(arrayCopy, t)
        }
        return chosen
    }
}

// Return num amount of elements from an array, and remove those elements from the original array
function chooseNumFromArrayAndRemove(array, num) {
    let chosen = []
    if (array.length <= num) return array.slice(0)
    else {
        for (let i = 0; i < num; i++) {
            let t = randomFromArray(array)
            chosen.push(t)
            removeFromArray(array, t)
        }
        return chosen
    }
}

// Given an array of players, pick one based on their autism
function chooseFromAutism(ps) {
    return ps.at(chooseFromWeights(ps.map(p => p.stats.autism)))
}

// Given the worldstate and an array of player ids, pick a player id based on their autism
function chooseIDFromAutism(worldState, pids) {
    return chooseFromAutism(pids.map(pid => getWorldItem(worldState, "players", pid))).id
}

// Given an array of players, pick num amount based on their autism
function chooseNumFromAutism(array, num) {
    let arrayCopy = array.slice(0)
    let chosen = []
    if (array.length <= num) return arrayCopy
    else {
        for (let i = 0; i < num; i++) {
            let t = chooseFromAutism(arrayCopy)
            chosen.push(t)
            removeFromArray(arrayCopy, t)
        }
        return chosen
    }
}

// Translate a number into its bird/bogey representation
function intToBird(num) {
    if (num < -5) return "MegaBird"
    switch(num) {
        case -5: return "Peregrine"
        case -4: return "Condor"
        case -3: return "Albatross"
        case -2: return "Eagle"
        case -1: return "Birdie"
        case 0: return "Par"
        case 1: return "Bogey"
        case 2: return "Double Bogey"
        case 3: return "Triple Bogey"
        case 4: return "OverBogey"
        case 5: return "SuperBogey"
        case 6: return "HyperBogey"
        case 7: return "UltraBogey"
        case 8: return "KiloBogey"
        case 9: return "MegaBogey"
        case 10: return "GigaBogey"
        case 11: return "TeraBogey"
        case 12: return "PetaBogey"
        case 13: return "ExaBogey"
        case 14: return "ZettaBogey"
        case 15: return "YottaBogey"
        case 16: return "FinalBogey"
        default: return "BeyondBogey"
    }
}

// 1 -> 1st, 2 -> 2nd, etc
function nth(num) {
    let end = "th"
    const absnum = Math.abs(num)
    if (![11,12,13].includes(absnum % 100)) {
        if (absnum % 10 == 1) end = "st"
        if (absnum % 10 == 2) end = "nd"
        if (absnum % 10 == 3) end = "rd"
    }
    return `${num}${end}`
}

function playerStatsToString(p) {
    if (!p) {
        let s1 = `
            Name: ERROR
            \r\nGender: null
            \r\nNet Worth: $inful
            \r\nMods: Index out of bounds
            \r\n 
            \r\nCompetence:
            \r\nSmartassery:
            \r\nYeetness:
            \r\nTrigonometry:
            \r\nBisexuality:
            \r\nAsexuality:
            \r\nScrappiness:
            \r\nCharisma:
            \r\nAutism:
        `
        let s2 = `
             
            \r\n 
            \r\n 
            \r\n 
            \r\n 
            \r\nNaN
            \r\nNaN
            \r\nNaN
            \r\nNaN
            \r\nNaN
            \r\nNaN
            \r\nNaN
            \r\nNaN
            \r\nNaN
        `
        let s = [s1,s2]
        return s
    }
    else {
        const player = p
        let s1 = 
            `Name: ${player.fullName()}` + 
            `\r\nGender: ${player.gender}` +
            `\r\nNet Worth: ${Intl.NumberFormat('en-US').format(player.netWorth)} $ins` +
            `\r\nMods: ${player.mods.map(m => m.name).join(", ")}` +
            `\r\n` +
            `\r\nCompetence:` +
            `\r\nSmartassery:` +
            `\r\nYeetness:` +
            `\r\nTrigonometry:` +
            `\r\nBisexuality:` +
            `\r\nAsexuality: ` +
            `\r\nScrappiness:` +
            `\r\nCharisma:` +
            `\r\nAutism:`
        let s2 = `
             
            \r\n 
            \r\n 
            \r\n 
            \r\n 
            \r\n${player.stats.competence.toFixed(2)}
            \r\n${player.stats.smartassery.toFixed(2)}
            \r\n${player.stats.yeetness.toFixed(2)}
            \r\n${player.stats.trigonometry.toFixed(2)}
            \r\n${player.stats.bisexuality.toFixed(2)}
            \r\n${player.stats.asexuality.toFixed(2)}
            \r\n${player.stats.scrappiness.toFixed(2)}
            \r\n${player.stats.charisma.toFixed(2)}
            \r\n${player.stats.autism.toFixed(2)}
        `
        let s = [s1,s2]
        return s
    }
}

// Join an array of words together grammatically (x and y; a, b, and c; etc)
function joinGrammatically(array) {
    if (array.length == 0) return ``
    else if (array.length == 1) return array[0]
    else if (array.length == 2) return array.join(" and ")
    else {
        const last = array.at(-1)
        const allButLast = array.slice(0,-1)
        return `${allButLast.join(", ")}, and ${last}`
    }
}

// Given a worldstate, a type ("players", "tourneys", etc, yes they have to be plural lol), and an id, fetch the item that id belongs to
function getWorldItem(worldState, type, id) {
    return worldState[type].find(t => t.id == id)
}

// Given a worldstate, return the current tourney
function activeTourney(worldState) {
    return getWorldItem(worldState, "tourneys", worldState.league.currentTourney)
}
// Given a worldstate and the number of the timeline it's on, return the current course
function activeCourseOnTimeline(worldState, tl) {
    if (activeTourney(worldState) === undefined) return undefined
    return getWorldItem(worldState, "courses", activeTourney(worldState).courses[tl])
}
// Given a worldstate and the number of the timeline it's on, return the current hole
function activeHoleOnTimeline(worldState, tl) {
    if (activeCourseOnTimeline(worldState, tl) === undefined) return undefined
    return getWorldItem(worldState, "holes", activeCourseOnTimeline(worldState, tl).currentHole)
}
// Given a worldstate, the number of the timeline it's on, and the index that the player is at (ON THE HOLE PLAYERS ARRAY), return the player
function playerOnTimelineAtIndex(worldState, tl, idx) {
    const hole = activeHoleOnTimeline(worldState, tl)
    if (hole === undefined) return undefined
    return getWorldItem(worldState, "players", hole.players.at(idx))
}
// Given a worldstate and the number of the timeline it's on, return the current player
function activePlayerOnTimeline(worldState, tl) {
    const hole = activeHoleOnTimeline(worldState, tl)
    if (hole === undefined) return undefined
    else return playerOnTimelineAtIndex(worldState, tl, hole.currentPlayer)
}

// Returns the world edit of what needs to happen if player is killed in worldstate on timeline number tl
function editOfKillPlayerInTourney(worldState, tl, player) {
    const tourney = activeTourney(worldState)
    const course = activeCourseOnTimeline(worldState, tl)
    const hole = activeHoleOnTimeline(worldState, tl)
    
    let newTourneyPlayers = tourney.players.slice(0)
    let newCoursePlayers = course.players.slice(0)
    let newCourseWinners = course.winners.map(w => w.slice(0))
    let newHolePlayers = hole.players.slice(0)
    removeFromArray(newTourneyPlayers, player.id)
    removeFromArray(newCoursePlayers, player.id)
    removeFromArray(newHolePlayers, player.id)
    for (let ncw of newCourseWinners) {
        removeFromArray(ncw, player.id)
    }
    return {
        "timetravel": {
            "timeline": tl
        },
        "tourneys": [{
            "id": tourney.id,
            "players": newTourneyPlayers,
            "kia": tourney.kia.concat([player.id])
        }],
        "courses": [{
            "id": course.id,
            "players": newCoursePlayers,
            "winners": newCourseWinners
        }],
        "holes": [{
            "id": hole.id,
            "players": newHolePlayers
        }],
        "players": [{
            "id": player.id,
            "mortality": "DEAD"
        }]
    }
}

// Returns the world edit of what needs to happen if every player in players is killed in worldstate on timeline number tl
function editOfKillPlayersInTourney(worldState, tl, players) {
    const tourney = activeTourney(worldState)
    const course = activeCourseOnTimeline(worldState, tl)
    const hole = activeHoleOnTimeline(worldState, tl)
    
    let newTourneyPlayers = tourney.players.slice(0)
    let newCoursePlayers = course.players.slice(0)
    let newCourseWinners = course.winners.map(w => w.slice(0))
    let newHolePlayers = hole.players.slice(0)
    removeManyFromArray(newTourneyPlayers, players.map(p => p.id))
    removeManyFromArray(newCoursePlayers, players.map(p => p.id))
    for (let ncw of newCourseWinners) {
        removeManyFromArray(ncw, players.map(p => p.id))
    }
    removeManyFromArray(newHolePlayers, players.map(p => p.id))
    return {
        "timetravel": {
            "timeline": tl
        },
        "tourneys": [{
            "id": tourney.id,
            "players": newTourneyPlayers,
            "kia": tourney.kia.concat(players.map(p => p.id))
        }],
        "courses": [{
            "id": course.id,
            "players": newCoursePlayers,
            "winners": newCourseWinners
        }],
        "holes": [{
            "id": hole.id,
            "players": newHolePlayers
        }],
        "players": players.map(p => {
            return {
                "id": p.id,
                "mortality": "DEAD"
            }
        })
    }
}

// Returns the world edit of what needs to happen if playerA is replaced with playerB in worldstate on timeline number tl
// This does not mark playerA as killed, just makes playerB take their place in the turn order
function editOfReplacePlayerInTourney(worldState, tl, playerA, playerB) {
    const tourney = activeTourney(worldState)
    const course = activeCourseOnTimeline(worldState, tl)
    const hole = activeHoleOnTimeline(worldState, tl)
    
    return {
        "timetravel": {
            "timeline": tl
        },
        "tourneys": [{
            "id": tourney.id,
            "players": tourney.players.map(pid => pid == playerA.id ? playerB.id : pid)
        }],
        "courses": [{
            "id": course.id,
            "players": course.players.map(pid => pid == playerA.id ? playerB.id : pid),
            "winners": course.winners.map(w => w.map(pid => pid == playerA.id ? playerB.id : pid))
        }],
        "holes": [{
            "id": hole.id,
            "players": hole.players.map(pid => pid == playerA.id ? playerB.id : pid)
        }]
    }
}

// Returns the world edit which removes all mods that need to be removed with the duration given, on timeline number tl
function editOfEndDurations(worldState, tl, duration) {
    let players = []
    let holes = []
    let courses = []
    let tourneys = []
    let leagueMods = []

    // Returns a set of everything from an array with mods removed with the duration given
    function filterAndMap(array) {
        return array.filter(x => x.mods.includes(m => m.duration == duration)).map(x => {
            return {
                "id": x.id,
                "mods": x.mods.filter(m => m.duration != duration)
            }
        })
    }

    const tourney = activeTourney(worldState)
    const course =  activeCourseOnTimeline(worldState, tl)
    const hole =    activeHoleOnTimeline(worldState, tl)
    const player =  activePlayerOnTimeline(worldState, tl)
    switch(duration) {
        case "LEAGUE":
            players =  filterAndMap(worldState.players)
            holes =    filterAndMap(worldState.holes)
            courses =  filterAndMap(worldState.courses)
            tourneys = filterAndMap(worldState.tourneys)
            if (worldState.league.mods.includes(m => m.duration == duration)) {
                leagueMods = worldState.league.mods.filter(m => m.duration != duration)
            }
            break
        case "TOURNEY":
            players = filterAndMap(tourney.players.map(pid => getWorldItem(worldState, "players", pid)))
            courses = filterAndMap(tourney.courses.map(cid => getWorldItem(worldState, "courses", cid)))
            tourneys = filterAndMap([tourney])
            break
        case "COURSE":
            players =  filterAndMap(course.players.map(pid => getWorldItem(worldState, "players", pid)))
            courses =  filterAndMap([course])
            tourneys = filterAndMap([tourney])
            break
        case "HOLE":
            players =  filterAndMap(hole.players.map(pid => getWorldItem(worldState, "players", pid)))
            holes =    filterAndMap([hole])
            courses =  filterAndMap([course])
            tourneys = filterAndMap([tourney])
            break
        case "STROKE":
            players =  filterAndMap([player])
            holes =    filterAndMap([hole])
            courses =  filterAndMap([course])
            tourneys = filterAndMap([tourney])
            break
    }

    let edit = { "timetravel": { "timeline": tl } }
    if (players.length > 0)    edit.players = players
    if (holes.length > 0)      edit.holes = holes
    if (courses.length > 0)    edit.courses = courses
    if (tourneys.length > 0)   edit.tourneys = tourneys
    if (leagueMods.length > 0) edit.league = { "mods": leagueMods }
    return edit
}

// Returns every player on a hole who hasn't sunk it yet
function unsunkPlayers(worldState, hole) {
    return hole.players.map(pid => getWorldItem(worldState, "players", pid)).filter(p => !p.ball.sunk)
}

// Given a worldstate and two player ids, returns the id of the player who is best, based on score and then autism for a tiebreaker
function bestOfPlayers(worldState, pid1, pid2) {
    const p1 = getWorldItem(worldState, "players", pid1)
    const p2 = getWorldItem(worldState, "players", pid2)
    if (p1.score < p2.score) return pid1
    else if (p1.score == p2.score && p1.autism > p2.autism) return pid1
    else return pid2
}

// Takes in the type and depth of an event (i.e. strokeType and Player), the worldstate, number of the timeline, and the defaultEffect function of the event
// It then applies every applicable mod, weather, and wildlife
function modifyFunction(type, depth, worldState, tl, func) {
    const leagueMods =  worldState.league.mods
    const tourneyMods = activeTourney(worldState)              === undefined ? [] : activeTourney(worldState).mods
    const courseMods =  activeCourseOnTimeline(worldState, tl) === undefined ? [] : activeCourseOnTimeline(worldState, tl).mods
    const holeMods =    activeHoleOnTimeline(worldState, tl)   === undefined ? [] : activeHoleOnTimeline(worldState, tl).mods
    const playerMods =  activePlayerOnTimeline(worldState, tl) === undefined ? [] : activePlayerOnTimeline(worldState, tl).mods
    const ballMods =    activePlayerOnTimeline(worldState, tl) === undefined ? [] : activePlayerOnTimeline(worldState, tl).ball.mods

    const weather =     activeCourseOnTimeline(worldState, tl) === undefined ? undefined : activeCourseOnTimeline(worldState, tl).weather
    const wildlife =    activeHoleOnTimeline(worldState, tl)   === undefined ? undefined : activeHoleOnTimeline(worldState, tl).wildlife

    let moddedFunc = func

    let applicableMods = []
    switch (depth) {
        case "Ball":    applicableMods = applicableMods.concat(ballMods)
        case "Player":  applicableMods = applicableMods.concat(playerMods)
        case "Hole":    applicableMods = applicableMods.concat(holeMods)
            if (weather !== undefined) applicableMods.push(weather)
            if (wildlife !== undefined) applicableMods.push(wildlife)
        case "Course":  applicableMods = applicableMods.concat(courseMods)
        case "Tourney": applicableMods = applicableMods.concat(tourneyMods)
        case "League":  applicableMods = applicableMods.concat(leagueMods)
    }
    applicableMods.sort((m1,m2) => m1.priority - m2.priority)

    for (let m of applicableMods) {
        moddedFunc = m.modify(type, moddedFunc)
    }

    return moddedFunc
}