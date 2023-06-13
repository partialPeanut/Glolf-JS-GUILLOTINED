class Mod {
    static Aggressive =   new Mod("AGRO", 0, { 
            "strokeOutcome": (func) => {
                let oldFunc = func
                return function (worldState, tl, player) {
                    // Do stroke as normal
                    let out = oldFunc.apply(this, arguments)

                    // Get all nearby players (within player's yeetness)
                    const nearbyPlayers = activeCourseOnTimeline(worldState, tl).players.filter(pid => {
                        if (player.id == pid) return false
                        const otherBall = getWorldItem(worldState, "players", pid).ball
                        if (otherBall.past != (out.distanceFlown > player.ball.distance ? !player.ball.past : player.ball.past)) return false
                        return Math.abs(otherBall.distance - out.distanceToHole) <= player.stats.yeetness
                    }).map(pid => getWorldItem(worldState, "players", pid))

                    // If there are nearby players, 20% chance to hit a random one
                    if (nearbyPlayers.length > 0 && Math.random() < 0.2) {
                        Greedler.queueEvent([tl, EventAggression, { "atkPlayer": player, "defPlayer": randomFromArray(nearbyPlayers) }])
                    }

                    return out
                }
            }})
    static SemiAquatic =  new Mod("AQUA", 1, {
            "strokeOutcome": (func) => {
                let oldFunc = func
                return function (worldState, tl, player) {
                    let out = oldFunc.apply(this, arguments)
                    if (out.newTerrain == Terrain.WaterHazard) out.newTerrain = Terrain.WaterFloat
                    return out
                }
            }})
    
    static Entangled =    new Mod("ENTG", 0, {})
    static Harmonized =   new Mod("HRMZ", 2, {
        "strokeOutcome": (func) => {
            let oldFunc = func
            return function (worldState, tl, player) {
                let out = oldFunc.apply(this, arguments)
                if (player.ball.stroke == 0) {
                    let out2 = oldFunc.apply(this, arguments)
                    if (out.newTerrain.oob) return out2
                    else if (out2.newTerrain.oob) return out
                    else return out.distanceToHole < out2.distanceToHole ? out : out2
                }
                return out
            }
        }})
    static Poisoned =     new Mod("PSND", 0, {})
    
    static Coastal =      new Mod("CSTL", 0, {},
        function(h) {
            let newHole = h
            newHole.stats.quench *= 2
            newHole.stats.thirst *= 2
            return newHole
        })
    static Swampland =    new Mod("SWMP", 0, {})
    
    static CharityMatch = new Mod("CHRT", 0, {})
    
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