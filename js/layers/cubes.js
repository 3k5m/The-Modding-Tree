addLayer("c", {
    name: "cubes", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#FAE7B9",
    resetDescription: "Combine squares into ",
    requires() {
        let req = new Decimal(1000000)
        if(player[this.layer].points.lt(1)){
            return req
        }else{
            req = new Decimal(1e8).pow(player[this.layer].points.add(1))
            if (hasUpgrade('mini1', 32)) req = req.pow(new Decimal(1).times(upgradeEffect('mini1', 32)))
            return req
        }
    }, // Can be a function that takes requirement increases into account
    resource: "cubes", // Name of prestige currency
    baseResource: "squares", // Name of resource prestige is based on
    baseAmount() {return player['s'].points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    base: 3,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        //DO NOT USE THIS, USE requires() INSTEAD BECAUSE I MESSED UP FORMULA
        return mult.reciprocate()
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        //DO NOT USE THIS, USE requires() INSTEAD BECAUSE I MESSED UP FORMULA
        return exp
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset for cubes", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasMilestone('d', 2)},
    effect(){
        return new Decimal(player[this.layer].points.pow(1.2).add(1))
    },
    effectDescription() {
        if(hasMilestone('d', 2)){
            return "which are boosting square gain by " + format(tmp[this.layer].effect) + "."
        }else{
            return "which are boosting square gain by " + format(tmp[this.layer].effect) + ". <br><small> You might need another upgrade to progress. </small>"
        }
    },
    canBuyMax() {
        return false;
    },
    milestones: {
        0: {
            requirementDescription: "1 Cubes",
            effectDescription: "Keep a Square milestone per Cube milestone on reset.",
            done() { return player[this.layer].points.gte(new Decimal(1)) }
        },
        1: {
            requirementDescription: "2 Cubes",
            effectDescription: "Automatically purchase first Square buyable, and it costs nothing.",
            done() { return player[this.layer].points.gte(new Decimal(2)) },
            unlocked() {
                return hasMilestone('c', 0)
            }
        },
        2: {
            requirementDescription: "3 Cubes",
            effectDescription: "Unlocks a mini layer and Cube upgrades.",
            done() { 
                if(player[this.layer].points.gte(new Decimal(3))){
                    player["mini1"].unlocked = true
                    return true
                }else{
                    return false
                }
            },
            unlocked() {
                return hasMilestone('c', 1)
            },
            onComplete() {
                player["mini1"].unlocked = true
            }
        },
        3: {
            requirementDescription: "4 Cubes",
            effectDescription: "Automatically purchase second Square buyable, and it costs nothing. Also unlocks a line upgrade. <br><small> Try different Painting upgrades if you get stuck. </small>",
            done() { return player[this.layer].points.gte(new Decimal(4)) },
            unlocked() {
                return hasMilestone('c', 2)
            }
        },
        4: {
            requirementDescription: "5 Cubes",
            effectDescription: "Automatically purchase Square upgrades. Painting upgrades no longer disable each other.",
            done() { return player[this.layer].points.gte(new Decimal(5)) },
            unlocked() {
                return hasMilestone('c', 3)
            }
        },
        5: {
            requirementDescription: "11 Cubes",
            effectDescription: "Gain 100% of Squares on reset every second.",
            done() { return player[this.layer].points.gte(new Decimal(11)) },
            unlocked() {
                return hasMilestone('c', 4)
            }
        },
    },
    upgrades: {
        11: {
            title: "Condense^3",
            description: "Cube Condense effect",
            cost: new Decimal(1),
            unlocked(){
                return hasMilestone('c', 2)
            }
        },
        12: {
            title: "Double Knowledge^3",
            description: "Cube Knowledge and Double effects",
            cost: new Decimal(2),
            unlocked(){
                return hasUpgrade('c', 11)
            }
        },
        13: {
            title: "Fire^3",
            description: "Fire Hazard always positive and cube Extinguisher effects.",
            cost: new Decimal(5),
            unlocked(){
                return hasUpgrade('c', 12)
            }
        },/*
        14: {
            title: "Fracture",
            description: "s",
            cost: new Decimal(9),
            unlocked(){
                return hasMilestone('c', 5)
            }
        },
        15: {
            title: "A",
            description: " does something cool that lets you get to like e200 points or something idk WIP",
            cost: new Decimal(9),
            unlocked(){
                return hasMilestone('c', 5)
            }
        }*/
        /*14: {
            title: "Rubik's Cube",
            description: "Cube Cube effect (WIP)",
            cost: new Decimal(27),
            unlocked(){
                return hasUpgrade('l', 22)
            }
        },*/
    }
})
