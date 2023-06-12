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

function randomFromArray(array) { return array.at(randomInt(array.length-1)) }