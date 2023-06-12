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

function removeFromArray(array, val) { array.splice(array.indexOf(val), 1) }

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

function getWorldItem(worldState, type, id) {
    return worldState[type].find(t => t.id == id)
}

function activeTourney(worldState) {
    return getWorldItem(worldState, "tourneys", worldState.league.currentTourney)
}
function activeCourseOnTimeline(worldState, tl) {
    return getWorldItem(worldState, "courses", activeTourney(worldState).courses[tl])
}
function activeHoleOnTimeline(worldState, tl) {
    return getWorldItem(worldState, "holes", activeCourseOnTimeline(worldState, tl).currentHole)
}
function activePlayerOnTimeline(worldState, tl) {
    const playerID = activeCourseOnTimeline(worldState, tl).players.at(activeHoleOnTimeline(worldState, tl).currentPlayer)
    const player = getWorldItem(worldState, "players", playerID)
    return player
}