// ------------------------------------------Main Features------------------------------------------
// > Main menu
// > Debug Menu
// > Feed (involvesPlayer function)
// > Different gamemodes
// > Simultaneous Games:
// > Top scoring players in each section + top scoring players overall go on to final match

// -----------------------------------Potential future mechanics------------------------------------
// > High Score (Double Double Double Double Double Bogey)
// > Cringe
// > Birds
// > Cult of the Hole
// > Boogey Tournies // High scores win // Boons + Curses
// > (DBB) Double bogey -> Hole in ones
// > (DBC) For all players: Par -> double bogey
// > Shadow games
// > Giant turtle (the course is on a giant turtle)
// > Balls
// > Clubs (both the sticks and the bougie places)
// > Tourny of the Damned (Revive player?)
// > Sainthood
// > Strikes

// ----------------------------------------------Bugs-----------------------------------------------
// There are zero bugs. Glolf is perfect. Glolf is eternal.
//
//==================================================================================================

reports = []
pastReports = -1

function main() {
    
}

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

// saved for posterity
// GLOLF TO DO LIST
// No. of players - no set amount (start w 12)
// Players: name, gender (random adjectives), cringe (chance of total beefitude), dumbassery (choice of stroke type), yeetness (strength), trigonometry (accuracy),
//          bisexuality (curve skill), asexuality (hole-in-one chance), scrappiness (skill in rough areas), charisma (get it in the hole ;3), autism (magic)
// Strokes: drive (max length min accuracy), approach (medium to long range + more accuracy), chip (med-short range), putt (short range)
// Holes: par, roughness, heterosexuality (straightness), thicc (likelihood to go oob), verdancy (easiness to get on the green),
//          obedience (green tameness), quench (water hazards), thirst (sand bunkers)
// Tourney: 18 courses of stroke play, sudden death on tie