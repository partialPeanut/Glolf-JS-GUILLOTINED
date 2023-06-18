function clamp(val, min, max) {
    return val > max ? max : val < min ? min : val;
}

function randomReal(min, max) {
    if (max === undefined) {
        max = min
        min = 0
    }
    return min + Math.random() * (max-min)
}

function randomInt(min, max) {
    if (max === undefined) {
        max = min
        min = 0
    }
    return Math.floor(randomReal(min, max+1))
}

function randomGaussian(mean=0, stdev=1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}

function randomFromArray(array) { return array.at(randomInt(array.length-1)) }

function removeFromArray(array, val) {
    if (array.includes(val)) array.splice(array.indexOf(val), 1)
}

function removeManyFromArray(array, vals) {
    for (let val of vals) removeFromArray(array, val)
}

function averageArray(array) {
    const total = array.reduce((total, x) => total += x)
    return total/array.length
}

function chooseFromWeights(array) {
    const totalWeight = array.reduce((total, w) => total += w)
    let choice = randomReal(totalWeight)
    for ([i, w] of array.entries()) {
        choice -= w
        if (choice < 0) return i
    }
    return -1
}

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

function getWorldItem(worldState, type, id) {
    return worldState[type].find(t => t.id == id)
}

function activeTourney(worldState) {
    return getWorldItem(worldState, "tourneys", worldState.league.currentTourney)
}
function activeCourseOnTimeline(worldState, tl) {
    if (activeTourney(worldState) === undefined) return undefined
    return getWorldItem(worldState, "courses", activeTourney(worldState).courses[tl])
}
function activeHoleOnTimeline(worldState, tl) {
    if (activeCourseOnTimeline(worldState, tl) === undefined) return undefined
    return getWorldItem(worldState, "holes", activeCourseOnTimeline(worldState, tl).currentHole)
}
function playerOnTimelineAtIndex(worldState, tl, idx) {
    const hole = activeHoleOnTimeline(worldState, tl)
    if (hole === undefined) return undefined

    const player = getWorldItem(worldState, "players", hole.players.at(idx))
    return player
}
function activePlayerOnTimeline(worldState, tl) {
    if (activeHoleOnTimeline(worldState, tl) === undefined) return undefined
    else return playerOnTimelineAtIndex(worldState, tl, activeHoleOnTimeline(worldState, tl).currentPlayer)
}

function editOfKillPlayerInTourney(worldState, tl, player) {
    const tourney = activeTourney(worldState)
    const course = activeCourseOnTimeline(worldState, tl)
    const hole = activeCourseOnTimeline(worldState, tl)
    
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

function editOfKillPlayersInTourney(worldState, tl, players) {
    const tourney = activeTourney(worldState)
    const course = activeCourseOnTimeline(worldState, tl)
    
    let newTourneyPlayers = tourney.players.slice(0)
    let newCoursePlayers = course.players.slice(0)
    let newCourseWinners = course.winners.map(w => w.slice(0))
    removeManyFromArray(newTourneyPlayers, players.map(p => p.id))
    removeManyFromArray(newCoursePlayers, players.map(p => p.id))
    for (let ncw of newCourseWinners) {
        removeManyFromArray(ncw, players.map(p => p.id))
    }
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
        "players": players.map(p => {
            return {
                "id": p.id,
                "mortality": "DEAD"
            }
        })
    }
}

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

function editOfEndDurations(worldState, tl, duration) {
    let players = []
    let holes = []
    let courses = []
    let tourneys = []
    let leagueMods = []

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

function unsunkPlayers(worldState, hole) {
    return hole.players.map(pid => getWorldItem(worldState, "players", pid)).filter(p => !p.ball.sunk)
}

function bestOfPlayers(worldState, pid1, pid2) {
    const p1 = getWorldItem(worldState, "players", pid1)
    const p2 = getWorldItem(worldState, "players", pid2)
    if (p1.score < p2.score) return pid1
    else if (p1.score == p2.score && p1.autism > p2.autism) return pid1
    else return pid2
}

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
        moddedFunc = m.modify(type, tl, moddedFunc)
    }

    return moddedFunc
}