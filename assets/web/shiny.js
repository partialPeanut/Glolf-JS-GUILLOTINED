function nextEvent() {
    Greedler.doTimeStep()
    if (reports.length > 0) pastReports = reports.length
    reports = Onceler.mostRecentReports()
    if (reports.length != pastReports) {
        if (reports.length == 1) {
            document.getElementById("feed-displayers").style.gridTemplateColumns = "1fr"
            document.getElementById("feed-displayers").style.gridTemplateRows = "1fr"

            document.getElementById("feed-displayer0").style.display = "block"
            document.getElementById("feed-displayer1").style.display = "none"
            document.getElementById("feed-displayer2").style.display = "none"
            document.getElementById("feed-displayer3").style.display = "none"
            document.getElementById("feed-displayer4").style.display = "none"
        }
        else if (reports.length > 1) {
            document.getElementById("feed-displayers").style.gridTemplateColumns = "1fr 1fr"
            document.getElementById("feed-displayers").style.gridTemplateRows = "1fr 1fr"

            document.getElementById("feed-displayer0").style.display = "none"
            document.getElementById("feed-displayer1").style.display = "block"
            document.getElementById("feed-displayer2").style.display = "block"
            document.getElementById("feed-displayer3").style.display = "block"
            document.getElementById("feed-displayer4").style.display = "block"
        }
    }
    if (reports.length == 1) {
        document.getElementById("feed-displayer0").textContent = reports[0]
    }
    else {       
        document.getElementById("feed-displayer1").textContent = reports[0]
        document.getElementById("feed-displayer2").textContent = reports[1]
        document.getElementById("feed-displayer3").textContent = reports[2]
        document.getElementById("feed-displayer4").textContent = reports[3]
    }
}

function logPastEvents() {
    console.log(Onceler.pastEvents)
}

function logFutureEvents() {
    console.log(Greedler.eventQueue)
}

function logWorldState() {
    console.log(Onceler.currentWorldState)
}