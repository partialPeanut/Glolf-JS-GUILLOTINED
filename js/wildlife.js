class Wildlife {
    static None = new Wildlife("None", "No critters on this hole.", 0x000000, {})
    static mosqBiteFunc = function(func) {
        return function (worldState, tl, player) {
            const randomPlayer = randomFromArray(unsunkPlayers(worldState, activeCourseOnTimeline(worldState, tl)))
            if (randomPlayer !== undefined && Math.random() < 0.05) Greedler.queueEvent([ tl, EventMosquitoBite, { "player": randomPlayer, "damage": 0.01 }])

            let out = func.apply(this, arguments)
            return out
        }
    }
    static Mosquito = new Wildlife("Mosquitoes", "Mosquitoes in the skies! Players, hope you brought bug spray.", 0x000000,
        { "strokeType": this.mosqBiteFunc, "strokeOutcome": this.mosqBiteFunc })
    static Komodo = new Wildlife("Komodo Dragons", "Komodo dragons in the shadows. Players, keep your antibiotics handy!", 0x000000, {})
    static Worm = new Wildlife("Sand Worms", "Worms in the sand! Players, be wary of those bunkers.", 0x000000, {
        "strokeOutcome": (func) => {
            return function (worldState, tl, player) {
                let out = func.apply(this, arguments)
                if (out.newTerrain == Terrain.Bunker) {
                    out.newTerrain = Terrain.WormPit
                    Greedler.queueEvent([ tl, EventWormBattle, { "player": player }])
                }
                return out
            }
        }})

    static Wildlives = [ Wildlife.None, Wildlife.Mosquito, Wildlife.Komodo, Wildlife.Worm ]

    constructor(name, report, color, eventChanges) {
        this.name = name
        this.report = report
        this.color = color
        this.eventChanges = eventChanges
    }

    modify(type, func) {
        if (this.eventChanges[type] !== undefined) {
            return this.eventChanges[type](func)
        }
        else return func
    }
}