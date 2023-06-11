function randomReal(max) { return Math.random() * max }
function randomReal(min, max) { return min + Math.random() * (max-min) }

function randomInt(max) { return Math.floor(randomReal(max+1)) }
function randomInt(min, max) { return Math.floor(randomReal(min, max+1)) }