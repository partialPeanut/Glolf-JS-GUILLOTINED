class ThingFactory {
    static usedIDs = new Set()
    static minID = 100000
    static maxID = 999999

    static generateNewID() {
        let id = randomInt(this.minID, this.maxID)
        while (this.usedIDs.has(id)) id = randomInt(this.minID, this.maxID)
        this.usedIDs.add(id)
        return id
    }

    static generateNewPlayer(worldState) {
        let id = this.generateNewID()
        function newNetWorth() {
            let r = randomReal(0,100)
            if (r < 70)
                return randomInt(-60000, 60000)
            else if (r < 99)
                return randomInt(40000, 300000)
            else
                return randomInt(300000, 600000)
        }
        let p = {
            "id": id,
            "mods": [],
            "firstName": randomFromArray(p_namesfirst),
            "lastName": randomFromArray(p_nameslast),
            "suffixes": [],
            "gender": randomFromArray(p_genders),
            "netWorth": newNetWorth(),
            "mortality": "ALIVE",
            "ball": this.generateNewBall(worldState, id).id,
            "stats": {
                "competence": randomGaussian(6,2),
                "smartassery": randomGaussian(6,2),
                "yeetness": randomGaussian(6,2),
                "trigonometry": randomGaussian(6,2),
                "bisexuality": randomGaussian(6,2),
                "asexuality": randomGaussian(6,2),
                "scrappiness": randomGaussian(6,2),
                "charisma": randomGaussian(6,2),
                "autism": randomGaussian(6,2)
            }
        }
        return p
    }

    static generateNewBall(worldState, playerID) {
        let id = this.generateNewID()
        let b = {
            "id": id,
            "mods": [],
            "player": playerID,
            "color": 0xFFFFFF,
            "placement": {
                "nextStrokeType": "TEE",
                "stroke": 0,
                "sunk": false,
                "past": false,
                "distance": 0,
                "terrain": "TEE"
            }
        }
        return b
    }

    static generateNewHole(worldState) {
        let id = this.generateNewID()

        function parFromLength(len) {
            const plateauPar = 4.1
            const plateauLength = 100
            const dropSlope = -0.0045
            const dropLength = 220
            const riseSlope = 0.0083

            if (len < plateauLength) return Math.floor(plateauPar);
            else if (len < plateauPar + dropLength) return Math.floor(dropSlope*(len-plateauLength) + plateauPar);
            else return Math.floor(riseSlope * (len-plateauPar-dropLength) + (plateauPar + dropSlope*dropLength));
        }

        let h = {
            "id": id,
            "mods": [],
            "wildlife": "WORMS",
            "succblow": 0,
            "stats": {
                "roughness": randomGaussian(1, 0.16),
                "heterosexuality": randomGaussian(1, 0.16),
                "thicc": randomGaussian(1, 0.16),
                "verdancy": randomGaussian(1, 0.16),
                "obedience": randomGaussian(1, 0.16),
                "quench": randomGaussian(1, 0.16),
                "thirst": randomGaussian(1, 0.16)
            },
            "dimensions": {
                "length": randomReal(1000),
            }
        }
        h.dimensions.width = randomGaussian(100,10) * h.stats.thicc,
        h.dimensions.greenRadius = randomGaussian(100,10) * h.stats.verdancy,
        h.dimensions.par = parFromLength(h.dimensions.length)

        return h
    }

    static generateNewCourse(worldState, division, players) {
        let id = this.generateNewID()
        let c = {
            "id": id,
            "mods": [],
            "players": players,
            "holes": [],
            "division": division,
            "weather": "TEMPEST"
        }
        return c
    }

    static generateNewTourney(worldState) {
        let id = this.generateNewID()
        function randomLivingPlayers(num) {
            let livingPlayers = worldState.players.filter(p => p.mortality == "ALIVE")
            return chooseNumFromArray(livingPlayers, num)
        }
        let t = {
            "id": id,
            "mods": [],
            "name": randomFromArray(t_titles).replaceAll("[N]", randomFromArray(t_nouns)),
            "sinReward": randomInt(100000, 200000),
            "numCourses": 4,
            "holesPerCourse": 9,
            "players": randomLivingPlayers(48),
            "courses": []
        }
        return t
    }
}