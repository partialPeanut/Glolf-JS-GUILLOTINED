// Creates all the things!
class ThingFactory {
    // Keeps track of all ids out there
    static usedIDs = new Set()
    static minID = 100000
    static maxID = 999999

    // Generates a new id
    // Theoretically a bad idea to do it this way, but it'll only create problems if we have close to a million objects
    // So I'm not worried
    static generateNewID() {
        let id = randomInt(this.minID, this.maxID)
        while (this.usedIDs.has(id)) id = randomInt(this.minID, this.maxID)
        this.usedIDs.add(id)
        return id
    }

    // Generates a new player
    static generateNewPlayer(worldState) {
        let id = this.generateNewID()
        // 70% chance to be poor
        // 29% chance to be middle class
        // 1% chance to be upper class
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
            // Function that automatically combines first name, last name, and suffixes, even if any of those change
            // I love jsons
            "fullName": () => {
                if (p.suffixes.length == 0) return `${p.firstName} ${p.lastName}`
                else return `${p.firstName} ${p.lastName} ${p.suffixes.join(" ")}`
            },
            "gender": randomFromArray(p_genders),
            "netWorth": newNetWorth(),
            "mortality": "ALIVE",
            "score": 0,
            // Each player has their very own ball! Wow!
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
            },
            // Function that returns the sum of all stats, yknow, in case we want that kind of thing
            // I used it for mosquitoes
            "juiciness": () => {
                let total = 0
                for (let [k,v] of Object.entries(p.stats)) total += v
                return total
            }
        }

        // Randomly pick and apply mods for the player and ball
        Mod.PlayerMods.filter(m => Math.random() < m.naturalChance).sort((m1,m2) => m1.priority - m2.priority).forEach(m => m.apply(p))
        Mod.BallMods.filter(m => Math.random() < m.naturalChance).sort((m1,m2) => m1.priority - m2.priority).forEach(m => m.apply(p.ball))

        return p
    }

    // Generates a new hole
    static generateNewHole(worldState, players) {
        let id = this.generateNewID()

        // Turns length into par using statistics!! Wow!!
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
            "players": players,
            "wildlife": Wildlife.None,
            "suddenDeath": false,
            "currentPlayer": -1,
            "stats": {
                "roughness": randomGaussian(1, 0.1),
                "heterosexuality": randomGaussian(1, 0.1),
                "thicc": randomGaussian(1, 0.1),
                "verdancy": randomGaussian(1, 0.1),
                "obedience": randomGaussian(1, 0.1),
                "blow": randomGaussian(1, 0.1),
                "quench": randomGaussian(1, 0.1),
                "thirst": randomGaussian(1, 0.1)
            },
            "dimensions": {
                "length": randomReal(1000),
            }
        }
        // These have to be calculated later because they're influenced by the hole's stats which need to be calculated first
        h.dimensions.width = randomGaussian(80,10) * h.stats.thicc,
        h.dimensions.greenRadius = randomGaussian(80,10) * h.stats.verdancy,
        h.dimensions.par = parFromLength(h.dimensions.length)

        // Randomly pick and apply mods for the hole
        Mod.HoleMods.filter(m => Math.random() < m.naturalChance).sort((m1,m2) => m1.priority - m2.priority).forEach(m => m.apply(h))

        return h
    }

    // Generates a course!
    static generateNewCourse(worldState, players, type = "Division", suddenDeath = false, division = "ALL") {
        let id = this.generateNewID()
        let c = {
            "id": id,
            "mods": [],
            "players": players,
            "currentHole": 0,
            "holeNumber": 0,
            "winners": [],
            "currentRewardPlace": 0,
            "type": type,
            "division": division,
            "suddenDeath": suddenDeath,
            // If a default weather isn't given then stuff breaks, this doesn't actually influence anything tho
            "weather": Weather.Tempest
        }

        // Randomly pick and apply mods for the course
        Mod.CourseMods.filter(m => Math.random() < m.naturalChance).sort((m1,m2) => m1.priority - m2.priority).forEach(m => m.apply(c))

        return c
    }

    // New tourney!
    static generateNewTourney(worldState) {
        let id = this.generateNewID()
        function randomLivingPlayers(num) {
            let livingPlayers = worldState.players.filter(p => p.mortality == "ALIVE")
            return chooseNumFromArray(livingPlayers, num)
        }
        let t = {
            "id": id,
            "mods": [],
            // Newer, fancier way of generating a name!
            "name": randomFromArray(t_titles).replaceAll("[N]", randomFromArray(t_nouns)),
            // All these values are hardcoded deafults lol
            // If you wanna change these settings, you change em here
            "sinReward": randomInt(100000, 200000),
            "placesRewarded": 3,
            "numCourses": 4,
            "holesPerCourse": 9,
            "players": randomLivingPlayers(48).map(p => p.id),
            "kia": [],
            "courses": []
        }

        // Randomly pick and apply mods for the tourney
        Mod.TourneyMods.filter(m => Math.random() < m.naturalChance).sort((m1,m2) => m1.priority - m2.priority).forEach(m => m.apply(t))

        return t
    }

    // Cursed function
    // Only used to keep everything in one place, this will always be the same for now
    static generateNewLeague() {
        let l = {
            "mods": [],
            "currentTourney": -1,
            "divisionNames": [
                "RED",
                "GREEN",
                "BLUE",
                "YELLOW",
                "CYAN",
                "MAGENTA",
                "BLACK",
                "WHITE"
            ]
        }

        return l
    }
}