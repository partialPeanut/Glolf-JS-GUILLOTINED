class Wildlife {
    static None = new Wildlife("None", "No critters on this hole.", 0x000000, {})
        static mosqBiteFunc = (tl, func) => {
            return function (worldState, tl, options) {
                const randomPlayer = randomFromArray(unsunkPlayers(worldState, activeCourseOnTimeline(worldState, tl)))
                if (randomPlayer !== undefined && Math.random() < 0.05 * activeHoleOnTimeline(worldState, tl).stats.quench)
                    Greedler.queueEvent([ tl, EventMosquitoBite, { "player": randomPlayer, "damage": 0.01 }])

                let out = func.apply(this, arguments)
                return out
            }
        }
    static Mosquito = new Wildlife("Mosquitoes", "Mosquitoes in the skies! Players, hope you brought bug spray.", 0x000000,
        { "strokeType": this.mosqBiteFunc, "strokeOutcome": this.mosqBiteFunc })
    static Komodo = new Wildlife("Komodo Dragons", "Komodo dragons in the shadows. Players, keep your antibiotics handy!", 0x000000, {
        "strokeOutcome": (tl, func) => {
            return function (worldState, tl, options) {
                let [outEdit, outReport] = func.apply(this, arguments)

                const player = activePlayerOnTimeline(worldState, tl)
                const editPlayer = outEdit.players.find(p => p.id == player.id)
                if (Math.random() < 0.2 && !player.mods.includes(Mod.Poisoned) && !editPlayer.ball.sunk) {
                    Greedler.queueEvent([ tl, EventKomodoAttack, { "player": player }])
                }

                return [outEdit, outReport]
            }
        }})
    static Worm = new Wildlife("Sand Worms", "Worms in the sand! Players, be wary of those bunkers.", 0x000000, {
        "strokeOutcome": (tl, func) => {
            return function (worldState, tl, options) {
                let [outEdit, outReport] = func.apply(this, arguments)
                const player = activePlayerOnTimeline(worldState, tl)
                let editPlayer = outEdit.players.find(p => p.id == player.id)
                if (editPlayer.ball.terrain == Terrain.Bunker) {
                    editPlayer.ball.terrain = Terrain.WormPit
                    Greedler.queueEvent([ tl, EventWormBattle, { "player": player }])
                }
                return [outEdit, outReport]
            }
        }})

    static Wildlives = [ Wildlife.None, Wildlife.Mosquito, Wildlife.Komodo, Wildlife.Worm ]

    constructor(name, report, color, eventChanges) {
        this.name = name
        this.report = report
        this.color = color
        this.priority = 2
        this.eventChanges = eventChanges
    }

    modify(type, tl, func) {
        if (this.eventChanges[type] !== undefined) {
            return this.eventChanges[type](tl, func)
        }
        else return func
    }
}