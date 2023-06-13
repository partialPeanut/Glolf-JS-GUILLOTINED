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

function removeFromArray(array, val) { if (array.includes(val)) array.splice(array.indexOf(val), 1) }

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
    if (activeCourseOnTimeline(worldState, tl) === undefined) return undefined
    const playerID = activeCourseOnTimeline(worldState, tl).players.at(idx)
    const player = getWorldItem(worldState, "players", playerID)
    return player
}
function activePlayerOnTimeline(worldState, tl) {
    if (activeHoleOnTimeline(worldState, tl) === undefined) return undefined
    else return playerOnTimelineAtIndex(worldState, tl, activeHoleOnTimeline(worldState, tl).currentPlayer)
}

function bestOfPlayers(worldState, pid1, pid2) {
    const p1 = getWorldItem(worldState, "players", pid1)
    const p2 = getWorldItem(worldState, "players", pid2)
    if (p1.score < p2.score) return pid1
    else if (p1.score == p2.score && p1.autism > p2.autism) return pid1
    else return pid2
}

function modifyFunction(type, depth, worldState, tl, func) {
    let leagueMods =  worldState.league.mods
    let tourneyMods = activeTourney(worldState)              === undefined ? [] : activeTourney(worldState).mods
    let courseMods =  activeCourseOnTimeline(worldState, tl) === undefined ? [] : activeCourseOnTimeline(worldState, tl).mods
    let holeMods =    activeHoleOnTimeline(worldState, tl)   === undefined ? [] : activeHoleOnTimeline(worldState, tl).mods
    let playerMods =  activePlayerOnTimeline(worldState, tl) === undefined ? [] : activePlayerOnTimeline(worldState, tl).mods
    let ballMods =    activePlayerOnTimeline(worldState, tl) === undefined ? [] : activePlayerOnTimeline(worldState, tl).ball.mods

    let applicableMods = []
    if (depth == "League")  applicableMods = leagueMods
    if (depth == "Tourney") applicableMods = leagueMods.concat(tourneyMods)
    if (depth == "Course")  applicableMods = leagueMods.concat(tourneyMods, courseMods)
    if (depth == "Hole")    applicableMods = leagueMods.concat(tourneyMods, courseMods, holeMods)
    if (depth == "Player")  applicableMods = leagueMods.concat(tourneyMods, courseMods, holeMods, playerMods)
    if (depth == "Ball")    applicableMods = leagueMods.concat(tourneyMods, courseMods, holeMods, playerMods, ballMods)
    applicableMods.sort((m1,m2) => m1.priority - m2.priority)

    let moddedFunc = func
    for (let m of applicableMods) {
        moddedFunc = m.modify(type, moddedFunc)
    }
    return moddedFunc
}