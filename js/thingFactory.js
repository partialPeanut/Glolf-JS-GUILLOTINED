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
            "fullName": () => {
                if (p.suffixes.length == 0) return `${p.firstName} ${p.lastName}`
                else return `${p.firstName} ${p.lastName} ${p.suffixes.join(" ")}`
            },
            "gender": randomFromArray(p_genders),
            "netWorth": newNetWorth(),
            "mortality": "ALIVE",
            "score": 0,
            "ball": {
                "mods": [],
                "color": 0xFFFFFF,
                "nextStrokeType": StrokeType.Nothing,
                "stroke": 0,
                "sunk": false,
                "past": false,
                "distance": 0,
                "distanceJustFlown": 0,
                "terrain": Terrain.Tee
            },
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

        Mod.PlayerMods.filter(m => Math.random() < m.naturalChance).sort((m1,m2) => m1.priority - m2.priority).forEach(m => m.apply(p))
        Mod.BallMods.filter(m => Math.random() < m.naturalChance).sort((m1,m2) => m1.priority - m2.priority).forEach(m => m.apply(p.ball))

        return p
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
            "wildlife": Wildlife.None,
            "currentPlayer": -1,
            "succblow": 0,
            "stats": {
                "roughness": randomGaussian(1, 0.1),
                "heterosexuality": randomGaussian(1, 0.1),
                "thicc": randomGaussian(1, 0.1),
                "verdancy": randomGaussian(1, 0.1),
                "obedience": randomGaussian(1, 0.1),
                "quench": randomGaussian(1, 0.1),
                "thirst": randomGaussian(1, 0.1)
            },
            "dimensions": {
                "length": randomReal(1000),
            }
        }
        h.dimensions.width = randomGaussian(100,10) * h.stats.thicc,
        h.dimensions.greenRadius = randomGaussian(100,10) * h.stats.verdancy,
        h.dimensions.par = parFromLength(h.dimensions.length)

        Mod.HoleMods.filter(m => Math.random() < m.naturalChance).sort((m1,m2) => m1.priority - m2.priority).forEach(m => m.apply(h))

        return h
    }

    static generateNewCourse(worldState, division, players) {
        let id = this.generateNewID()
        let c = {
            "id": id,
            "mods": [],
            "players": players,
            "currentHole": 0,
            "holeNumber": 0,
            "division": division,
            "weather": Weather.Tempest
        }

        Mod.CourseMods.filter(m => Math.random() < m.naturalChance).sort((m1,m2) => m1.priority - m2.priority).forEach(m => m.apply(c))

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
            "placesRewarded": 3,
            "numCourses": 4,
            "holesPerCourse": 1,
            "players": randomLivingPlayers(48).map(p => p.id),
            "kia": [],
            "courses": []
        }

        Mod.TourneyMods.filter(m => Math.random() < m.naturalChance).sort((m1,m2) => m1.priority - m2.priority).forEach(m => m.apply(t))

        return t
    }
}