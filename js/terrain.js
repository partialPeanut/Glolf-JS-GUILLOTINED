class Terrain {
    static OutOfBounds = new Terrain("goes back in bounds",    "out of bounds.",            0xFF005000, [ 0,0,0,0,0 ], true)
    static WormPit     = new Terrain("escapes the worm pit",   "in a sand worm's pit!",     0xFFFFC107, [ 0,0,0,0,0 ], false)
    static WaterHazard = new Terrain("goes back in bounds",    "in a water hazard.",        0xFF03A9F4, [ 0,0,0,0,0 ], true)
    static Hole        = new Terrain("jumps out of the hole",  "in the hole.",              0xFFA0A0A0, [ 0,0,0,0,0 ], false)
    static Tee         = new Terrain("leaves the tee",         "perfectly on a tee.",       0xFFA0A0A0, [ 1.2, 1.0, 0.8, 0.6, 0.1 ], false)
    static Rough       = new Terrain("jumps from the rough",   "in the rough.",             0xFF007800, [ 0.0, 0.9, 0.9, 0.8, 0.6 ], false)
    static Green       = new Terrain("leaves the green",       "in the green.",             0xFF00A000, [ 0.0, 1.0, 1.0, 1.0, 1.0 ], false)
    static Bunker      = new Terrain("leaves the sand bunker", "in a sand bunker.",         0xFFFFC107, [ 0.0, 0.2, 0.2, 0.6, 0.1 ], false)
    static WaterFloat  = new Terrain("splashes away",          "safely in a water hazard.", 0xFF03A9F4, [ 0.0, 0.1, 0.1, 0.3, 0.1 ], false)

    // Smoothness = the effectiveness of different stroke types on each terrain

    constructor(leavingText, arrivingText, color, smoothness, oob) {
        this.leavingText = leavingText
        this.arrivingText = arrivingText
        this.color = color
        this.smoothness = smoothness
        this.oob = oob
    }
}