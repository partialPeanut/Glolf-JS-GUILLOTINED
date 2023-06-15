class Mod {
    static Aggressive = new Mod("AGRO", 0.1, 0, {
            "strokeOutcome": (tl, func) => {
                return function (worldState, options) {
                    // Do stroke as normal
                    let [outEdit, outReport] = func.apply(this, arguments)
                    const player = activePlayerOnTimeline(worldState, tl)
                    let editPlayer = outEdit.players.find(p => p.id == player.id)

                    // Get all nearby players (within player's yeetness)
                    const course = activeCourseOnTimeline(worldState, tl)
                    const nearbyPlayers = unsunkPlayers(worldState, course).filter(p => {
                        if (player == p) return false
                        if (p.ball.past != editPlayer.ball.past) return false
                        return Math.abs(p.ball.distance - editPlayer.ball.distance) <= player.stats.yeetness
                    })

                    // If there are nearby players, 20% chance to hit a random one
                    if (nearbyPlayers.length > 0 && Math.random() < 0.2) {
                        Greedler.queueEvent([tl, EventAggression, { "atkPlayer": player, "defPlayer": randomFromArray(nearbyPlayers) }])
                    }

                    return [outEdit, outReport]
                }
            }})
    static SemiAquatic = new Mod("AQUA", 0.1, 1, {
            "strokeOutcome": (tl, func) => {
                return function (worldState, options) {
                    let [outEdit, outReport] = func.apply(this, arguments)

                    const player = activePlayerOnTimeline(worldState, tl)
                    let editPlayer = outEdit.players.find(p => p.id == player.id)
                    if (editPlayer.ball.terrainJustLanded == Terrain.WaterHazard) {
                        editPlayer.ball.terrain = Terrain.WaterFloat
                        editPlayer.ball.terrainJustLanded = Terrain.WaterFloat
                    }

                    return [outEdit, outReport]
                }
            }})
    
    static Entangled = new Mod("ENTG", 0, 0, {})
    static Harmonized = new Mod("HRMZ", 0, 2, {
            "strokeOutcome": (tl, func) => {
                return function (worldState, options) {
                    let [outEdit, outReport] = func.apply(this, arguments)

                    const player = activePlayerOnTimeline(worldState, tl)
                    if (player.ball.stroke == 0) {
                        let [outEdit2, outReport2] = func.apply(this, arguments)
                        const player = activePlayerOnTimeline(worldState, tl)
                        let editBall1 = outEdit.players.find(p => p.id == player.id).ball
                        let editBall2 = outEdit2.players.find(p => p.id == player.id).ball

                        if (editBall1.distance > editBall2.distance) {
                            [outEdit, outReport] = [outEdit2, outReport2]
                        }
                        outReport = `Worlds harmonize. The best of two outcomes is chosen. ` + outReport
                    }

                    return [outEdit, outReport]
                }
            }})
    static Poisoned = new Mod("PSND", 0, 0, {})
    
    static Coastal = new Mod("CSTL", 0.1, 0, {},
            function(h) {
                let newHole = h
                newHole.stats.quench *= 2
                newHole.stats.thirst *= 2
                return newHole
            })
    static Swampland = new Mod("SWMP", 0.1, 0, {})
    
    static CharityMatch = new Mod("CHRT", 0.1, 0, {
            "tourneyStarted": (tl, func) => {
                return function (worldState, options) {
                    Greedler.queueEvent([ tl, EventTourneyDonate ])
                    let out = func.apply(this, arguments)
                    return out
                }
            }},
            function(t) {
                let newTourney = t
                newTourney.sinReward *= -1
                return newTourney
            })
    
    static BallMods =    []
    static PlayerMods =  [ Mod.Aggressive, Mod.SemiAquatic, Mod.Entangled, Mod.Harmonized, Mod.Poisoned ]
    static HoleMods =    [ Mod.Coastal, Mod.Swampland ]
    static CourseMods =  []
    static TourneyMods = [ Mod.CharityMatch ]
    static LeagueMods =  []

    constructor(name, naturalChance, priority, eventChanges, mutation) {
        this.name = name
        this.naturalChance = naturalChance
        this.priority = priority
        this.eventChanges = eventChanges
        this.mutation = mutation
    }

    modify(type, tl, func) {
        if (this.eventChanges[type] !== undefined) {
            return this.eventChanges[type](tl, func)
        }
        else return func
    }

    mutate(x) {
        if (this.mutation === undefined) return x
        else return this.mutation(x)
    }
}