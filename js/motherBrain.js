// Lots of fun functions which I cannot really explain
// The graphs looked nice and I have since forgotten what they do exactly
function curveScrappy(b, s, x)     { return Math.pow(s, Math.pow(b, 6-x)) }
function curveLoggy  (min, max, x) { return (max-min)/2 * (Math.log((x-6+Math.sqrt((x-6)*(x-6)+4))/2)/Math.log(3+Math.sqrt(10))+1) + min }
function curveGaussy (m, sd, x)    { return Math.exp(-(x-m)*(x-m)/(2*sd*sd))/sd }
function curveExpy   (b, z, x)     { return z * Math.pow(b, x*x/8000) }

// Calculates the distances the player would hit the ball with every stroke type and perfect accuracy
// Takes into account yeetness, scrappiness, roughness, terrain, and wind
function calculateBaseDistances(worldState, tl, player) {
    const hole = activeHoleOnTimeline(worldState, tl)
    const terrainFactor = player.ball.terrain.smoothness.map(s => {
        return clamp(curveScrappy(1.2, s/hole.stats.roughness, player.stats.scrappiness), 0.05, 1)
    })

    const windFactor = 1 + (player.ball.past ? -1 : 1) * (1 - hole.stats.blow)

    const dists = StrokeType.TypesArray.map((st, i) => {
        const tf = terrainFactor[i] === undefined ? 1 : terrainFactor[i]
        return curveLoggy(st.dist[0], st.dist[1], player.stats.yeetness) * tf * windFactor
    })
    return dists
}

// Uses dumbassery and distance to find how likely the player is to pick each stroke type
function calculateBaseWeights(worldState, tl, player, dists) {
    let weights = dists.map(d => 4096 * curveGaussy(player.ball.distance, Math.max(curveLoggy(100, 10, player.stats.smartassery), 10), d))
    return weights
}

// Calculates stroke type fully
function calculateStrokeType(worldState, tl, player) {
    // Always tee off the tee
    if (player.ball.terrain === Terrain.Tee) return StrokeType.Tee

    // Probability weights of choosing strokes
    const dists = calculateBaseDistances(worldState, tl, player)
    let weights = calculateBaseWeights(worldState, tl, player, dists)
    // Never tee and cap nothing at ~0.2% chance
    weights[0] = 0
    const biggestWeightThatIsntNothing = weights.slice(0,-1).reduce((max, w) => max > w ? max : w, 0)
    weights[5] = Math.min(weights[5] / Math.max(1, player.stats.competence * player.stats.smartassery), biggestWeightThatIsntNothing * 0.002)

    // If players are too smart, they decide every stroke type is too weak and always pick nothing
    // This tells them to drive if that happens
    if (biggestWeightThatIsntNothing == 0) return StrokeType.Drive
    else return StrokeType.TypesArray.at(chooseFromWeights(weights))
}

// Calculates stroke result (whiff, sink, fly, or nothing)
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
    if (dist >= player.ball.distance && player.ball.terrain != Terrain.Hole) sinkChance = curveExpy(0.3, 0.8, player.ball.distance) * hole.stats.obedience * strokeType.sinkFactor * curveLoggy(0.75, 1.25, player.stats.charisma)

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

// Provides randomness to the base distances. Variance and angle are determined by the stroke type and the player's trigonometry.
function calculateStrokeDistanceAndAngle(worldState, tl, player) {
    const strokeType = player.ball.nextStrokeType
    const baseDist = calculateBaseDistances(worldState, tl, player).at(StrokeType.TypesArray.indexOf(strokeType))
    const variance = clamp(curveLoggy(strokeType.variance[1], strokeType.variance[0], player.stats.trigonometry), 0, 0.9)
    const angle =    clamp(curveLoggy(strokeType.angle[1],    strokeType.angle[0],    player.stats.trigonometry), 0, Math.PI)
    return [baseDist * randomReal(1-variance, 1+variance), randomReal(-angle, angle)]
}

// Calculates the new distance based on distance flown, angle, and previous distance
function calculateNewDistanceToHole(prevDist, dist, angle) {
    return Math.sqrt(prevDist*prevDist + dist*dist - 2 * prevDist * dist * Math.cos(angle))
}

// The terrain after rolling a short distance
function calculatePostRollTerrain(worldState, tl, player, newDist) {
    // Could roll into or out of green
    // If was on tee, now on rough
    // Otherwise stay on the same terrain

    const hole = activeHoleOnTimeline(worldState, tl)
    if (newDist <= hole.stats.greenLength) return Terrain.Green
    else if (player.ball.terrain == Terrain.Tee || player.ball.terrain == Terrain.Green) return Terrain.Rough
    else return player.ball.terrain
}

// The terrain after going a long distance
function calculateNextTerrain(worldState, tl, player, result, newDist, distFlown, angle) {
    switch(result) {
        case "NOTHING": return player.ball.terrain
        case "SINK": return Terrain.Hole
        case "WHIFF": return calculatePostRollTerrain(worldState, tl, player, newDist)
        case "FLY":
            // Landed in the green
            const hole = activeHoleOnTimeline(worldState, tl)
            if (newDist <= hole.dimensions.greenRadius) return Terrain.Green

            // Landed out of bounds
            const sideways = Math.abs(distFlown * Math.sin(angle))
            const wiggleRoom = hole.dimensions.width * (1 + curveLoggy(-1, 1, player.stats.bisexuality) * Math.pow(2, -hole.stats.heterosexuality))
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

// Calculates full outcome
function calculateStrokeOutcome(worldState, tl, player) {
    // Calculate what would happen on fly
    // If nothing, distance and angle are 0
    // If sink, automatically get in the hole
    // If whiff, roll the player's yeetness in a random direction

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