class Mod {
    static Aggressive =   new Mod("AGRO", 0, {})
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
    
    static Coastal =      new Mod("CSTL", 0, {
        "createHole": (func) => {
            let oldFunc = func
            return function (worldState) {
                let out = oldFunc.apply(this, arguments)
                out.stats.quench *= 2
                out.stats.thirst *= 2
                return out
            }
        }})
    static Swampland =    new Mod("SWMP", 0, {})
    
    static CharityMatch = new Mod("CHRT", 0, {})
    
    static BallMods =    []
    static PlayerMods =  [ Mod.Aggressive, Mod.SemiAquatic, Mod.Entangled, Mod.Harmonized, Mod.Poisoned ]
    static HoleMods =    [ Mod.Coastal, Mod.Swampland ]
    static CourseMods =  [ Mod.Coastal, Mod.Swampland ]
    static TourneyMods = [ Mod.CharityMatch ]
    static LeagueMods =  []

    constructor(name, priority, eventChanges) {
        this.name = name
        this.priority = priority
        this.eventChanges = eventChanges
    }

    modify(type, func) {
        if (this.eventChanges[type] !== undefined) {
            return this.eventChanges[type](func)
        }
        else return func
    }
}