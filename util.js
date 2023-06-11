function random(max) {
    return Math.random() * max
}
function random(min, max) {
    return min + random(max-min)
}

function randomInt(max) {
    return Math.floor(random(max+1))
}
function randomInt(min, max) {
    return Math.floor(random(min, max+1))
}