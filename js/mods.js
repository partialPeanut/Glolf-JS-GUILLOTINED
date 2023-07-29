class Mod {
    // Mod that makes players' balls collide
    static Aggressive = new Mod("AGRO", 0.1, 0, "LEAGUE", {
            "strokeOutcome": (func) => {
                return function (worldState, tl, options) {
                    // Do stroke as normal
                    let [outEdit, outReport] = func.apply(this, arguments)
                    const player = activePlayerOnTimeline(worldState, tl)
                    let editPlayer = outEdit.players.find(p => p.id == player.id)

                    // Get all nearby players (within player's yeetness)
                    const hole = activeHoleOnTimeline(worldState, tl)
                    const nearbyPlayers = unsunkPlayers(worldState, hole).filter(p => {
                        if (player == p) return false
                        return ballDist(p.ball, editPlayer.ball) <= player.stats.yeetness
                    })

                    // If there are nearby players, 20% chance to hit a random one
                    if (nearbyPlayers.length > 0 && Math.random() < 0.2) {
                        Greedler.queueEvent([tl, EventAggression, { "atkPlayer": player, "defPlayer": randomFromArray(nearbyPlayers) }])
                    }

                    return [outEdit, outReport]
                }
            }})
    // Mod that lets players float on water
    static SemiAquatic = new Mod("AQUA", 0.1, 1, "LEAGUE", {
            "strokeOutcome": (func) => {
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
    // Mod that makes the player harmonized if they get quantum squid
    static Entangled = new Mod("ENTG", 0, 0, "LEAGUE", {},
        (player, options) => {
            // options = { "direction": "UP" or "DOWN", "otherself": pid }
            player.mods.push(Mod.Entangled)
            player.suffixes.push(options.direction)
            player.entangledSpin = options.direction
            player.entangledOtherself = options.otherself
        },
        player => {
            removeFromArray(player.mods, Mod.Entangled)
            removeFromArray(player.suffixes, player.entangledSpin)
            player.entangledSpin = undefined
            player.entangledOtherself = undefined
        })
    // Mod that lets the player choose the best hit of two on their first stroke
        static detangled(spin) {
            return (func) => {
                return function (worldState, tl, options) {
                    let [outEdit, outReport] = func.apply(this, arguments)

                    const player = activePlayerOnTimeline(worldState, tl)
                    if (player.ball.stroke == 0) {
                        let [outEdit2, outReport2] = func.apply(this, arguments)
                        const player = activePlayerOnTimeline(worldState, tl)
                        let editBall1 = outEdit.players.find(p => p.id == player.id).ball
                        let editBall2 = outEdit2.players.find(p => p.id == player.id).ball

                        let flip
                        if (spin = "UP")   flip = 1
                        if (spin = "DOWN") flip = -1

                        if (flip * editBall1.distance > flip * editBall2.distance) {
                            [outEdit, outReport] = [outEdit2, outReport2]
                        }
                        if (flip > 0) outReport = `Worlds harmonize. The best of two outcomes is observed. ` + outReport
                        if (flip < 0) outReport = `Worlds deharmonize. The worst of two outcomes is observed. ` + outReport
                    }

                    return [outEdit, outReport]
                }
            }
        }
    static Discordant = new Mod("DSCD", 0, 2, "LEAGUE", { "strokeOutcome": Mod.detangled("DOWN") })
    static Harmonized = new Mod("HRMZ", 0, 2, "LEAGUE", { "strokeOutcome": Mod.detangled("UP") })

    // They see you. Everything is Fine.
    static Overseen = new Mod("OVSN", 0, 0, "TOURNEY")
    // Ticks down to death by komodo dragon unless they escape by sinking it
    static Poisoned = new Mod("PSND", 0, 0, "HOLE", {
        "strokeOutcome": (func) => {
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
    // Ticks down until death by Death in sudden death
    static SuddenlyDying = new Mod("DYIN", 0, 2, "HOLE", {
        "strokeOutcome": (func) => {
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

    // Triple the sand, triple the water. Absolute hell.
    static Coastal = new Mod("CSTL", 0.1, 0, "LEAGUE", {},
        h => {
            h.mods.push(Mod.Coastal)
            h.stats.quench *= 3
            h.stats.thirst *= 3
        })
    // 1.5 times the water, a 75% chance of mosquitoes, and mosquitoes are 5 times as dangerous. Also hell.
    static Swampland = new Mod("SWMP", 0.1, 0, "LEAGUE", {
        "wildlifeReport": (func) => {
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
        "mosquitoBite": (func) => {
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
    // Once the first player sinks it, everyone has two turns until Death takes them. Suddenly.
    static SuddenDeath = new Mod("SUDN", 0, 0, "LEAGUE", {
        "strokeOutcome": (func) => {
            return function (worldState, tl, options) {
                let [outEdit, outReport] = func.apply(this, arguments)

                const course = activeCourseOnTimeline(worldState, tl)
                const hole = activeHoleOnTimeline(worldState, tl)
                const player = activePlayerOnTimeline(worldState, tl)
                let editPlayer = outEdit.players.find(p => p.id == player.id)

                const otherUnsunkPlayers = unsunkPlayers(worldState, hole).filter(p => p.id != player.id)

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
    
    // Makes the sin reward negative, and causes all players to donate to charity at the beginning of the tourney
    static CharityMatch = new Mod("CHRT", 0.1, 0, "LEAGUE", {
        "tourneyStart": (func) => {
            return function (worldState, options) {
                Greedler.queueEvent([ tl, EventTourneyDonate ])
                let out = func.apply(this, arguments)
                return out
            }
        }},
        t => {
            t.mods.push(Mod.CharityMatch)
            t.sinReward *= -1
        })

    // Viva la resistance
        static guillotineCutoffPoint = 500000
        static globalGuillotineCheck = (func) => {
            return function (worldState, tl, options) {
                let [outEdit, outReport] = func.apply(this, arguments)

                const tooRich = Mod.guillotineCutoffPoint
                let theRich = outEdit.players.filter(p => p.netWorth > tooRich).map(p => p.id)
                let theOtherRich = worldState.players.filter(p => !outEdit.players.map(p => p.id).includes(p.id) && p.netWorth > tooRich).map(p => p.id)
                theRich = theRich.concat(theOtherRich)
                if (theRich.length > 0) Greedler.queueEvent([tl, EventGuillotine, { "theRich": theRich }])

                return [outEdit, outReport]
            }
        }
        static localGuillotineCheck = (func) => {
            return function (worldState, tl, options) {
                let [outEdit, outReport] = func.apply(this, arguments)

                const tooRich = Mod.guillotineCutoffPoint
                let theRich = outEdit.players.filter(p => p.netWorth > tooRich).map(p => p.id)
                if (theRich.length > 0) Greedler.queueEvent([tl, EventGuillotine, { "theRich": theRich }])

                return [outEdit, outReport]
            }
        }
    static MaximumWage = new Mod("MXWG", 1, 0, "LEAGUE", {
        "createPlayers": this.globalGuillotineCheck, "tourneyReward": this.globalGuillotineCheck,
        "guillotine": this.localGuillotineCheck, "weatherOversight": this.localGuillotineCheck, "courseReward": this.localGuillotineCheck
    })
    
    // Lists of all the mods for all the types of things
    // Techincally any mod can apply to anything but watch out! For consequences
    static BallMods =    []
    static PlayerMods =  [ Mod.Aggressive, Mod.SemiAquatic, Mod.Entangled, Mod.Harmonized, Mod.Overseen, Mod.Poisoned, Mod.SuddenlyDying ]
    static HoleMods =    [ Mod.Coastal, Mod.Swampland, Mod.SuddenDeath ]
    static CourseMods =  []
    static TourneyMods = [ Mod.CharityMatch ]
    static LeagueMods =  [ Mod.MaximumWage ]
    
    // Natural chance = the chance it's naturally added to a thing on thing creation
    // Priority = the order it's applied, smallest first (weather = 1 and wildlife = 2)
    // Duration = the length of time it stays on until removed
    // Event changes = the ways the mod affects other events
    // Apply/remove = what happens when it's applied/removed
    // Event changes, apply, and remove are all optional
    constructor(name, naturalChance, priority, duration, eventChanges = {}, apply = (x) => { x.mods.push(this) }, remove = (x) => { removeFromArray(x.mods, this) }) {
        this.name = name
        this.naturalChance = naturalChance
        this.priority = priority
        this.duration = duration
        this.eventChanges = eventChanges
        this.apply = apply
        this.remove = remove
    }

    // Modifies a function based on its type
    // If the mod doesn't affect this type, then don't change it
    modify(type, func) {
        if (this.eventChanges[type] !== undefined) {
            return this.eventChanges[type](func)
        }
        else return func
    }
}

// What happens when a player gets aggressive
class EventAggression extends Event {
    type = "aggression"
    depth = "Player"

    defaultEffect(worldState, tl, options) {
        const atkPlayer = options.atkPlayer
        const defPlayer = options.defPlayer

        // Whack em 1-5 * yeetness away from the hole
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

// OFF WITH THEIR HEADS!
class EventGuillotine extends Event {
    type = "guillotine"
    depth = "League"

    defaultEffect(worldState, tl, options) {
        const theRich = options.theRich.map(rid => getWorldItem(worldState, "players", rid))
        const theNotRich = worldState.players.filter(p => p.mortality == "ALIVE" && p.netWorth < Mod.guillotineCutoffPoint && !options.theRich.includes(p.id))
        const tourney = activeTourney(worldState)

        const totalSins = theRich.reduce((total, r) => total + r.netWorth, 0)
        const redistribution = Math.floor(totalSins / theNotRich.length)
        const leftOver = totalSins - (redistribution * theNotRich.length)

        let worldEdit = {
            "timetravel": {
                "timeline": tl
            },
            "players": theRich.map(r => { return {
                "id": r.id,
                "mortality": "DEAD",
                "netWorth": 0
            }}).concat(theNotRich.map(p => { return {
                "id": p.id,
                "netWorth": p.netWorth + redistribution
            }}))
        }
        if (tourney !== undefined) {
            for (let i = 0; i < tourney.courses.length; i++) {
                const richHere = theRich.filter(r => activeCourseOnTimeline(worldState, i).players.includes(r.id))
                if (richHere.length > 0) {
                    const cEdit = editOfKillPlayersInTourney(worldState, i, richHere)
                    WorldStateManager.combineEdits(worldEdit, cEdit)
                }
            }
            worldEdit.timetravel = {
                "timeline": tl
            }
        }

        const report = `It is time to topple the bourgeoisie. The League has been weighed down by their sins.` +
                       `\n${joinGrammatically(theRich.map(r => r.fullName()))} will face the guillotine.` +
                       `\nTheir wealth will be redistributed.`
        return [worldEdit, report]
    }
}