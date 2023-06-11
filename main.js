function main() {
    Greedler.doNextEvent()
}

function logPastEvents() {
    Onceler.pastEvents.forEach(e => {
        console.log(e)
    })
}

function logWorldState() {
    console.log(Onceler.currentWorldState)
}