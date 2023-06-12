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

function getWorldItem(worldState, type, id) {
    return worldState[type].find(t => t.id == id)
}