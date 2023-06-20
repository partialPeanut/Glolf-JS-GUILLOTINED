class StrokeType {
    static Tee =      new StrokeType("Tee",      "tees off.",            [190, 250], [0.05, 0.20], [0.008, 0.08], 0.2)
    static Drive =    new StrokeType("Drive",    "goes for a drive.",    [190, 250], [0.04, 0.15], [0.008, 0.08], 0.2)
    static Approach = new StrokeType("Approach", "approaches...",        [145, 190], [0.03, 0.1 ], [0.006, 0.06], 0.4)
    static Chip =     new StrokeType("Chip",     "gears up for a chip.", [105, 150], [0.02, 0.05], [0.004, 0.04], 0.6)
    static Putt =     new StrokeType("Putt",     "lines up for a putt.", [50,  95 ], [0.01, 0.02], [0.002, 0.02], 1.0)
    static Nothing =  new StrokeType("Nothing",  "does nothing.",        [0,0], [0,0], [0,0], 0)

    static TypesArray = [
        this.Tee,
        this.Drive,
        this.Approach,
        this.Chip,
        this.Putt,
        this.Nothing
    ]

    // Dist = the min and max distances from a hit
    // Variance = the min and max variance multipliers from a hit
    // Angle = the min and max angles from a hit (in radians)
    // Sink factor = the multiplier to the chance it sinks

    constructor(name, message, dist, variance, angle, sinkFactor) {
        this.name = name
        this.dist = dist
        this.variance = variance
        this.angle = angle
        this.sinkFactor = sinkFactor
        this.message = message
    }
}