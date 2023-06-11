class Phase {
    static Void =            new Phase("Void", Event)
    static TourneyStart =    new Phase("Tourney Start", EventTourneyStart)
    static TourneyConclude = new Phase("Tourney Conclude", EventTourneyConclude)

    constructor(name, event) {
        this.name = name
        this.event = event
    }
}