// Creates players!
class EventCreatePlayers extends Event {
    type = "createPlayers"
    depth = "League"

    defaultEffect(worldState, tl, options) {
        // options = { "playerCount": num }

        let worldEdit = {
            "timetravel": {
                "timeline": tl
            },
            "players": []
        }
        for (let i = 0; i < options.playerCount; i++) {
            const player = ThingFactory.generateNewPlayer(worldState)
            worldEdit.players.push(player)
        }

        const report = `Contracts signed. ${options.playerCount} players rise from the ground.`
        return [worldEdit, report]
    }
}

// Kills a player via sudden death
class EventReaperKill extends Event {
    type = "reaperKill"
    depth = "Player"

    defaultEffect(worldState, tl, options) {
        // options = { "player": p }

        const worldEdit = editOfKillPlayerInTourney(worldState, tl, options.player)
        const report = `Death takes ${options.player.fullName()}.`
        return [worldEdit, report]
    }
}

// Makes every player donate!
class EventTourneyDonate extends Event {
    type = "tourneyDonate"
    depth = "Tourney"

    defaultEffect(worldState, tl) {
        // 20% of the average sins of everyone in the tourney
        const tourney = activeTourney(worldState)
        const totalSins = tourney.players.reduce((total, pid) => total + getWorldItem(worldState, "players", pid).netWorth, 0)
        const donation = Math.floor(0.2 * totalSins / tourney.players.length)

        const worldEdit = {
            "timetravel": {
                "timeline": tl
            },
            "players": tourney.players.map(pid => {
                return {
                    "id": pid,
                    "netWorth": getWorldItem(worldState, "players", pid).netWorth - donation
                }
            })
        }

        const report = `Hearts swell! Kindness overflowing! Each player atones for ${donation.toLocaleString()} $ins.`
        return [worldEdit, report]
    }
}