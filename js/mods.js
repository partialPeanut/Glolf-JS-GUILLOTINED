class Mod {
    static Aggressive = new Mod("AGRO", 0, {
            "strokeOutcome": (func) => {
                return function (worldState, tl, player) {
                    // Do stroke as normal
                    let out = func.apply(this, arguments)

                    // Get all nearby players (within player's yeetness)
                    const course = activeCourseOnTimeline(worldState, tl)
                    const nearbyPlayers = unsunkPlayers(worldState, course).filter(p => {
                        if (player == p) return false
                        if (p.ball.past != (out.distanceFlown > player.ball.distance ? !player.ball.past : player.ball.past)) return false
                        return Math.abs(p.ball.distance - out.distanceToHole) <= player.stats.yeetness
                    })

                    // If there are nearby players, 20% chance to hit a random one
                    if (nearbyPlayers.length > 0 && Math.random() < 0.2) {
                        Greedler.queueEvent([tl, EventAggression, { "atkPlayer": player, "defPlayer": randomFromArray(nearbyPlayers) }])
                    }

                    return out
                }
            }})
    static SemiAquatic = new Mod("AQUA", 1, {
            "strokeOutcome": (func) => {
                return function (worldState, tl, player) {
                    let out = func.apply(this, arguments)
                    if (out.newTerrain == Terrain.WaterHazard) out.newTerrain = Terrain.WaterFloat
                    return out
                }
            }})
    
    static Entangled = new Mod("ENTG", 0, {})
    static Harmonized = new Mod("HRMZ", 2, {
            "strokeOutcome": (func) => {
                return function (worldState, tl, player) {
                    let out = func.apply(this, arguments)
                    if (player.ball.stroke == 0) {
                        let out2 = func.apply(this, arguments)
                        if (out.newTerrain.oob) return out2
                        else if (out2.newTerrain.oob) return out
                        else return out.distanceToHole < out2.distanceToHole ? out : out2
                    }
                    return out
                }
            }})
    static Poisoned = new Mod("PSND", 0, {})
    
    static Coastal = new Mod("CSTL", 0, {},
            function(h) {
                let newHole = h
                newHole.stats.quench *= 2
                newHole.stats.thirst *= 2
                return newHole
            })
    static Swampland = new Mod("SWMP", 0, {})
    
    static CharityMatch = new Mod("CHRT", 0, {
            "tourneyStarted": (func) => {
                return function () {
                    Greedler.queueEvent([ 0, EventTourneyDonate ])
                    let out = func.apply(this)
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

    constructor(name, priority, eventChanges, mutation) {
        this.name = name
        this.priority = priority
        this.eventChanges = eventChanges
        this.mutation = mutation
    }

    modify(type, func) {
        if (this.eventChanges[type] !== undefined) {
            return this.eventChanges[type](func)
        }
        else return func
    }

    mutate(x) {
        if (this.mutation === undefined) return x
        else return this.mutation(x)
    }
}