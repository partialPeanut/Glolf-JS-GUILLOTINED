class Mod {
    static Aggressive = new Mod("AGRO", 0.1, 0, "LEAGUE", {
            "strokeOutcome": (tl, func) => {
                return function (worldState, tl, options) {
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
    static SemiAquatic = new Mod("AQUA", 0.1, 1, "LEAGUE", {
            "strokeOutcome": (tl, func) => {
                return function (worldState, tl, options) {
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
    
    static Entangled = new Mod("ENTG", 0, 0, "LEAGUE", {})
    static Harmonized = new Mod("HRMZ", 0, 2, "LEAGUE", {
            "strokeOutcome": (tl, func) => {
                return function (worldState, tl, options) {
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
    static Overseen = new Mod("OVSN", 0, 0, "TOURNEY", {})
    static Poisoned = new Mod("PSND", 0, 0, "HOLE", {
        "strokeOutcome": (tl, func) => {
            return function (worldState, tl, options) {
                let [outEdit, outReport] = func.apply(this, arguments)
                const player = activePlayerOnTimeline(worldState, tl)
                let editPlayer = outEdit.players.find(p => p.id == player.id)

                if (editPlayer.ball.sunk) {
                    outReport += `\nThe prey escapes, and is cured of poison.`
                    editPlayer.mods = editPlayer.mods === undefined ? player.mods : editPlayer.mods
                    editPlayer.stats = editPlayer.stats === undefined ? player.stats : editPlayer.stats
                    Mod.Poisoned.remove(editPlayer)
                }
                else if (player.poisonCounters > 0) {
                    outReport += `\n${player.poisonCounters} strokes until the predators strike.`
                    editPlayer.poisonCounters = player.poisonCounters-1
                }
                else {
                    outReport += `\nLizards hiss.`

                    const hole = activeHoleOnTimeline(worldState, tl)
                    editPlayer.poisonCounters = hole.dimensions.par + Math.floor(curveLoggy(0, 4, player.stats.scrappiness))

                    Greedler.queueEvent([ tl, EventKomodoKill, { "player": player }])
                }

                return [outEdit, outReport]
            }
        }},
        (player, counters) => {
            player.mods.push(Mod.Poisoned)
            player.poisonCounters = counters
            player.stats.competence -= 4
            player.stats.yeetness -= 2
            player.stats.trigonometry -= 2
        },
        player => {
            removeFromArray(player.mods, Mod.Poisoned)
            player.poisonCounters = undefined
            player.stats.competence += 4
            player.stats.yeetness += 2
            player.stats.trigonometry += 2
        })
        static Poisoned = new Mod("PSND", 0, 0, "HOLE", {
        "strokeOutcome": (tl, func) => {
            return function (worldState, tl, options) {
                let [outEdit, outReport] = func.apply(this, arguments)
                const player = activePlayerOnTimeline(worldState, tl)
                let editPlayer = outEdit.players.find(p => p.id == player.id)

                if (editPlayer.ball.sunk) {
                    outReport += `\nThe prey escapes, and is cured of poison.`
                    editPlayer.mods = editPlayer.mods === undefined ? player.mods : editPlayer.mods
                    editPlayer.stats = editPlayer.stats === undefined ? player.stats : editPlayer.stats
                    Mod.Poisoned.remove(editPlayer)
                }
                else if (player.poisonCounters > 0) {
                    outReport += `\n${player.poisonCounters} strokes until the predators strike.`
                    editPlayer.poisonCounters = player.poisonCounters-1
                }
                else {
                    outReport += `\nLizards hiss.`

                    const hole = activeHoleOnTimeline(worldState, tl)
                    editPlayer.poisonCounters = hole.dimensions.par + Math.floor(curveLoggy(0, 4, player.stats.scrappiness))

                    Greedler.queueEvent([ tl, EventKomodoKill, { "player": player }])
                }

                return [outEdit, outReport]
            }
        }},
        (player, counters) => {
            player.mods.push(Mod.Poisoned)
            player.poisonCounters = counters
            player.stats.competence -= 4
            player.stats.yeetness -= 2
            player.stats.trigonometry -= 2
        },
        player => {
            removeFromArray(player.mods, Mod.Poisoned)
            player.poisonCounters = undefined
            player.stats.competence += 4
            player.stats.yeetness += 2
            player.stats.trigonometry += 2
        })
    static SuddenlyDying = new Mod("DYIN", 0, 2, "HOLE", {
        "strokeOutcome": (tl, func) => {
            return function (worldState, tl, options) {
                let [outEdit, outReport] = func.apply(this, arguments)

                const player = activePlayerOnTimeline(worldState, tl)
                let editPlayer = outEdit.players.find(p => p.id == player.id)

                if (editPlayer.ball.sunk) {
                    outReport += `\nThey escape death.`
                    editPlayer.mods = editPlayer.mods === undefined ? player.mods : editPlayer.mods
                    Mod.SuddenlyDying.remove(editPlayer)
                }
                else if (player.suddenCounters > 0) {
                    outReport += `\nDeath creeps closer. ${player.suddenCounters} strokes remain.`
                    editPlayer.suddenCounters = player.suddenCounters-1
                }
                else {
                    outReport += `\nIt is Time.`
                    editPlayer.suddenCounters = 5

                    Greedler.queueEvent([ tl, EventReaperKill, { "player": player }])
                }

                return [outEdit, outReport]
            }
        }},
        (player, counters) => {
            player.mods.push(Mod.SuddenlyDying)
            player.suddenCounters = counters
        },
        player => {
            removeFromArray(player.mods, Mod.SuddenlyDying)
            player.suddenCounters = undefined
        })


    static Coastal = new Mod("CSTL", 0.1, 0, "LEAGUE", {},
        h => {
            h.mods.push(Mod.Coastal)
            h.stats.quench *= 3
            h.stats.thirst *= 3
        })
    static Swampland = new Mod("SWMP", 0.1, 0, "LEAGUE", {
        "wildlifeReport": (tl, func) => {
            return function (worldState, tl, options) {
                let [outEdit, outReport] = func.apply(this, arguments)

                const hole = activeHoleOnTimeline(worldState, tl)
                let editHole = outEdit.holes.find(h => h.id == hole.id)
                if (Math.random() < 0.75) {
                    editHole.wildlife = Wildlife.Mosquito
                    outReport = `Wildlife Report: Vicious mosquitoes swarm the swamplands!`
                }

                return [outEdit, outReport]
            }
        },
        "mosquitoBite": (tl, func) => {
            return function (worldState, tl, options) {
                options.damage *= 5
                let out = func.apply(this, arguments)
                return out
            }
        }},
        h => {
            h.mods.push(Mod.Swampland)
            h.stats.quench *= 1.5
        })
    static SuddenDeath = new Mod("SUDN", 0, 0, "LEAGUE", {
        "strokeOutcome": (tl, func) => {
            return function (worldState, tl, options) {
                let [outEdit, outReport] = func.apply(this, arguments)

                const course = activeCourseOnTimeline(worldState, tl)
                const player = activePlayerOnTimeline(worldState, tl)
                let editPlayer = outEdit.players.find(p => p.id == player.id)

                const otherUnsunkPlayers = course.winners[0].map(pid => getWorldItem(worldState, "players", pid)).filter(p => !p.ball.sunk && p.id != player.id)

                if (editPlayer.ball.sunk && !player.mods.includes(Mod.SuddenlyDying)) {
                    const reaperTimer = 2
                    for (let op of otherUnsunkPlayers) {
                        if (outEdit.players.includes(p => p.id == op.id)) {
                            let editP = outEdit.players.find(p => p.id == op.id)
                            editP.mods = editP.mods === undefined ? op.mods : editP.mods
                            Mod.SuddenlyDying.apply(editP, reaperTimer)
                        }
                        else {
                            let editP = {
                                "id": op.id,
                                "mods": op.mods
                            }
                            Mod.SuddenlyDying.apply(editP, reaperTimer)
                            outEdit.players.push(editP)
                        }
                    }
                    outReport += `\nDeath approaches.`
                }

                return [outEdit, outReport]
            }
        }},
        h => {
            h.mods.push(Mod.SuddenDeath)
            h.suddenDeath = true
        })
    
    static CharityMatch = new Mod("CHRT", 0.1, 0, "LEAGUE", {
        "tourneyStart": (tl, func) => {
            return function (worldState, options) {
                let out = func.apply(this, arguments)
                return out
            }
        }},
        t => {
            t.mods.push(Mod.CharityMatch)
            t.sinReward *= -1
        })
    
    static BallMods =    []
    static PlayerMods =  [ Mod.Aggressive, Mod.SemiAquatic, Mod.Entangled, Mod.Harmonized, Mod.Overseen, Mod.Poisoned ]
    static HoleMods =    [ Mod.Coastal, Mod.Swampland ]
    static CourseMods =  []
    static TourneyMods = [ Mod.CharityMatch ]
    static LeagueMods =  []

    constructor(name, naturalChance, priority, duration, eventChanges, apply, remove) {
        this.name = name
        this.naturalChance = naturalChance
        this.priority = priority
        this.duration = duration
        this.eventChanges = eventChanges
        this.apply = apply === undefined ? (x) => { x.mods.push(this) } : apply
        this.remove = remove === undefined ? (x) => { removeFromArray(x.mods, this) } : remove
    }

    modify(type, tl, func) {
        if (this.eventChanges[type] !== undefined) {
            return this.eventChanges[type](tl, func)
        }
        else return func
    }
}

class EventAggression extends Event {
    type = "aggression"
    depth = "Player"

    calculateEdit(worldState, tl, options) {
        const atkPlayer = options.atkPlayer
        const defPlayer = options.defPlayer

        const newDist = defPlayer.ball.distance + randomReal(1,5) * atkPlayer.stats.yeetness
        const newTerrain = calculatePostRollTerrain(worldState, tl, defPlayer, newDist)

        const worldEdit = {
            "timetravel": {
                "timeline": tl
            },
            "players": [{
                "id": defPlayer.id,
                "ball": {
                    "distance": newDist,
                    "terrain": newTerrain
                }
            }]
        }

        const report = `${atkPlayer.fullName()}'s ball hits ${defPlayer.fullName()}'s ball away from the hole!`
        return [worldEdit, report]
    }
}