function curveScrappy(b, x, s)     { return Math.pow(x, Math.pow(b, 6-s)) }
function curveLoggy  (min, max, x) { return (max-min)/2 * (Math.log((x-6+Math.sqrt((x-6)*(x-6)+4))/2)/Math.log(3+Math.sqrt(10))+1) + min }
function curveGaussy (m, sd, x)    { return Math.exp(-(x-m)*(x-m)/(2*sd*sd))/sd }
function curveExpy   (x, b, z)     { return z * Math.pow(b, x*x/8000) }

function calculateBaseDistances(worldState, tl, player) {
    const hole = activeHoleOnTimeline(worldState, tl)
    const terrainFactor = player.ball.terrain.smoothness.map(s => {
        return clamp(curveScrappy(1.2, s/hole.stats.roughness, player.stats.scrappiness), 0.05, 1)
    })

    const windFactor = 1 + (player.ball.past ? -1 : 1) * hole.succblow

    const dists = StrokeType.TypesArray.map((st, i) => {
        const tf = terrainFactor[i] === undefined ? 1 : terrainFactor[i]
        return curveLoggy(st.dist[0], st.dist[1], player.stats.yeetness) * tf * windFactor
    })
    return dists
}

function calculateBaseWeights(worldState, tl, player, dists) {
    let weights = dists.map(d => 4096 * curveGaussy(player.ball.distance, 200 / Math.max(player.stats.smartassery, 1), d))
    const biggestWeight = weights.reduce((max, w) => max > w ? max : w, 1e-100)
    // Normalized
    return weights.map(w => w/biggestWeight)
}

function calculateStrokeType(worldState, tl, player) {
    // Always tee off the tee
    if (player.ball.terrain === Terrain.Tee) return StrokeType.Tee

    // Probability weights of choosing strokes
    const dists = calculateBaseDistances(worldState, tl, player)
    let weights = calculateBaseWeights(worldState, tl, player, dists)
    weights[0] = 0
    // Cap nothing at ~0.2% chance
    const biggestWeightThatIsntNothing = weights.slice(0,-1).reduce((max, w) => max > w ? max : w, 0)
    weights[5] = Math.min(weights[5] / Math.max(1, player.stats.competence * player.stats.smartassery), biggestWeightThatIsntNothing * 0.002)

    if (biggestWeightThatIsntNothing == 0) return StrokeType.Drive
    else return StrokeType.TypesArray.at(chooseFromWeights(weights))
}

function calculateStrokeResult(worldState, tl, player, dist) {
    const strokeType = player.ball.nextStrokeType
    if (strokeType === StrokeType.Nothing) return "NOTHING"
    
    // Check for ace
    if (player.ball.stroke == 0) {
      const aceChance = curveLoggy(0.005, 0.015, player.stats.asexuality)
      if (Math.random() < aceChance) return "SINK"
    }
    
    // Calculate chance of sinking
    const hole = activeHoleOnTimeline(worldState, tl)
    let sinkChance = 0
    if (dist >= player.ball.distance && player.ball.terrain != Terrain.Hole) sinkChance = curveExpy(player.ball.distance, 0.3, 0.8) * hole.stats.obedience * strokeType.sinkFactor * curveLoggy(0.75, 1.25, player.stats.charisma)

    // Whiff, Sink, Fly
    const weights = [
        curveLoggy(0.015, 0.005, player.stats.competence),
        sinkChance,
        1
    ]
    switch (chooseFromWeights(weights)) {
        case 0: return "WHIFF"
        case 1: return "SINK"
        case 2: return "FLY"
        default: return "NOTHING"
    }
}

function calculateStrokeDistanceAndAngle(worldState, tl, player) {
    const strokeType = player.ball.nextStrokeType
    const baseDist = calculateBaseDistances(worldState, tl, player).at(StrokeType.TypesArray.indexOf(strokeType))
    const variance = clamp(curveLoggy(strokeType.variance[1], strokeType.variance[0], player.stats.trigonometry), 0, 0.9)
    const angle =    clamp(curveLoggy(strokeType.angle[1],    strokeType.angle[0],    player.stats.trigonometry), 0, Math.PI)
    return [baseDist * randomReal(1-variance, 1+variance), randomReal(-angle, angle)]
}

function calculateStrokeOutcome(worldState, tl, player) {
    const hole = activeHoleOnTimeline(worldState, tl)

    let [d,a] = calculateStrokeDistanceAndAngle(worldState, tl, player)
    const result = calculateStrokeResult(worldState, tl, player, d)
    switch(result) {
        case "NOTHING":
            [d,a] = [0,0]
            break
        case "SINK":
            [d,a] = [player.ball.distance, 0]
            break
        case "WHIFF":
            [d,a] = [Math.max(1,player.stats.yeetness), randomReal(-Math.PI, Math.PI)]
            break
    }

    const newDist = calculateNewDistanceToHole(player.ball.distance, d, a)
    const newTerrain = calculateNextTerrain(worldState, tl, player, result, newDist, d, a)
    return {
        "result": result,
        "distanceFlown": d,
        "distanceToHole": newDist,
        "newTerrain": newTerrain
    }
}

function calculateNewDistanceToHole(prevDist, dist, angle) {
    return Math.sqrt(prevDist*prevDist + dist*dist - 2 * prevDist * dist * Math.cos(angle))
}

function calculatePostRollTerrain(worldState, tl, player, newDist) {
    const hole = activeHoleOnTimeline(worldState, tl)
    if (newDist <= hole.stats.greenLength) return Terrain.Green
    else if (player.ball.terrain == Terrain.Tee || player.ball.terrain == Terrain.Green) return Terrain.Rough
    else return player.ball.terrain
}

function calculateNextTerrain(worldState, tl, player, result, newDist, distFlown, angle) {
    switch(result) {
        case "NOTHING": return player.ball.terrain
        case "SINK": return Terrain.Hole
        case "WHIFF": return calculatePostRollTerrain(worldState, tl, player, newDist)
        case "FLY":
            // Landed in the green
            const hole = activeHoleOnTimeline(worldState, tl)
            if (newDist <= hole.dimensions.greenRadius) return Terrain.Green

            // Probability of landing out of bounds
            const sideways = Math.abs(distFlown * Math.sin(angle))
            const wiggleRoom = hole.dimensions.width * (1 + curveLoggy(-1, 1, player.stats.bisexuality) * Math.pow(2,-hole.stats.heterosexuality)/4)
            if (sideways > wiggleRoom) return Terrain.OutOfBounds

            // Rough, whz, bnk
            const weights = [
                1,
                hole.stats.quench * curveLoggy(0.10, 0.01, player.stats.trigonometry),
                hole.stats.thirst * curveLoggy(0.10, 0.01, player.stats.trigonometry)
            ]
            switch (chooseFromWeights(weights)) {
                case 0: return Terrain.Rough
                case 1: return Terrain.WaterHazard
                case 2: return Terrain.Bunker
                default: return Terrain.OutOfBounds
            }
    }
}