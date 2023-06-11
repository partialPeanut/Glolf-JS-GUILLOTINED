class ThingFactory {
    static usedIDs = new Set()
    static minID = 1000000
    static maxID = 9999999

    static generateNewID() {
        let id = randomInt(minID, maxID)
        while (this.usedIDs.has(id)) id = randomInt(minID, maxID)
        this.usedIDs.add(id)
        return id
    }

    static generateNewPlayer(worldState) {
        let id = generateNewID()
        return [id, {
            "mods": [],
            "firstName": "Bees Bees Bees",
            "lastName": "Chantz",
            "suffixes": [],
            "netWorth": 0,
            "mortality": "ALIVE",
            "ball": this.generateNewBall(worldState, id)[0],
            "stats": {
                "competence": 6,
                "smartassery": 6,
                "yeetness": 6,
                "trigonometry": 6,
                "bisexuality": 6,
                "asexuality": 6,
                "scrappiness": 6,
                "charisma": 6,
                "autism": 6
            }
        }]
    }

    static generateNewBall(worldState, playerID) {
        let id = generateNewID()
        return [id, {
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
        }]
    }

    static generateNewHole(worldState) {
        let id = generateNewID()
        return [id, {
            "mods": [],
            "wildlife": "WORMS",
            "succblow": 0,
            "dimensions": {
                "length": 400,
                "width": 100,
                "greenRadius": 100
            },
            "stats": {
                "par": 4,
                "roughness": 1,
                "heterosexuality": 1,
                "thicc": 1,
                "verdancy": 1,
                "obedience": 1,
                "quench": 1,
                "thirst": 1
            }
        }]
    }

    static generateNewCourse(worldState) {
        let id = generateNewID()
        return [id, {
            "mods": [],
            "players": [],
            "holes": [],
            "weather": "TEMPEST"
        }]
    }

    static generateNewTourney(worldState) {
        let id = generateNewID()
        return [id, {
            "mods": [],
            "name": "Tournament Tourney",
            "sinReward": 0,
            "players": [],
            "courses": []
        }]
    }
}