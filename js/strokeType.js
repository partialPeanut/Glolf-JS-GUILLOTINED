class StrokeType {
    static Tee =      new StrokeType("Tee",      [190, 250], [0.05, 0.20], [0.008, 0.08], 0.2, "tees off.")
    static Drive =    new StrokeType("Drive",    [190, 250], [0.04, 0.15], [0.008, 0.08], 0.2, "goes for a drive.")
    static Approach = new StrokeType("Approach", [145, 190], [0.03, 0.1 ], [0.006, 0.06], 0.4, "approaches...")
    static Chip =     new StrokeType("Chip",     [105, 150], [0.02, 0.05], [0.004, 0.04], 0.6, "gears up for a chip.")
    static Putt =     new StrokeType("Putt",     [50,  95 ], [0.01, 0.02], [0.002, 0.02], 1.0, "lines up for a putt.")
    static Nothing =  new StrokeType("Nothing",  [0,0], [0,0], [0,0], 0, "does nothing.")

    static TypesArray = [
        this.Tee,
        this.Drive,
        this.Approach,
        this.Chip,
        this.Putt,
        this.Nothing
    ]

    constructor(name, dist, variance, angle, sinkFactor, message) {
        this.name = name
        this.dist = dist
        this.variance = variance
        this.angle = angle
        this.sinkFactor = sinkFactor
        this.message = message
    }
}