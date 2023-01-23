addLayer("c", {
    name: "cubes", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFFFFF",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "cubes", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (hasUpgrade('c', 13)) mult = mult.times(upgradeEffect('c', 13))
        if (hasUpgrade('c', 14) && !hasUpgrade('c', 21)) mult = mult.times(upgradeEffect('c', 14))
        if (hasUpgrade('c', 15) && !hasUpgrade('c', 21)) mult = mult.times(upgradeEffect('c', 14)) //squaring the upgrade effect
        if (hasUpgrade('t', 11)) mult = mult.times(new Decimal(1.5))
        mult = mult.times(tmp["t"].effect);
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        if (hasUpgrade('c', 21)) exp = exp.add(new Decimal(0.1))
        if (hasUpgrade('t', 12)) exp = exp.add(new Decimal(0.05))
        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset for cubes", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    doReset(layer) {
        if (layers[layer].row <= layers[this.layer].row) return;
        const keep = []
        if (hasMilestone("t", 1)) keep.push("upgrades")
        layerDataReset(this.layer, keep)
    },
    upgrades: {
        11: {
            title: "Consume",
            description: "Double your point gain.",
            cost: new Decimal(1),
        },
        12: {
            title: "Sharpen",
            description: "Increase points gain based on current cubes amount.",
            cost: new Decimal(2),
            effect() {
                return player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        13: {
            title: "Reverse",
            description: "Increase cubes gain based on points.",
            cost: new Decimal(4),
            effect() {
                return player.points.add(1).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        14: {
            title: "Build",
            description: "Increase cubes gain based on current cubes amount.",
            cost: new Decimal(10),
            effect() {
                if(hasUpgrade('c', 15) && !hasUpgrade('c', 21)) { return player[this.layer].points.add(1).pow(0.25).pow(2) }
                else if(hasUpgrade('c', 21)){ return 1 }
                else { return player[this.layer].points.add(1).pow(0.25) }
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        15: {
            title: "Inflate",
            description: "Square the previous upgrade effect.",
            cost: new Decimal(25),
        },
        21: {
            title: "Explore",
            description: "Remove the previous two upgrades and resets all resources, but unlocks tesseract features and increases cube gain exponent to by 0.1.",
            cost: new Decimal("e14814814"),
            unlocked() {
                return(player[this.layer].points.gte(new Decimal("e10000")) || hasUpgrade('c', 21))
            },
            onPurchase() {
                player[this.layer].points = new Decimal(0)
                player["t"].points = new Decimal(0)
                player.points = new Decimal(0)
            }
        },
    },
    passiveGeneration(){
        if(hasMilestone("t",0)) { return 1; }
        return 0;
    }
}),
addLayer("t", {
    name: "tesseracts", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#FAF2DF",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "tesseracts", // Name of prestige currency
    baseResource: "cubes", // Name of resource prestige is based on
    baseAmount() {return player["c"].points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (hasUpgrade('t', 13)) mult = mult.times(upgradeEffect('t', 13))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "t", description: "T: Reset for tesseracts", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    effect(){
        if(hasUpgrade("c", 21)) return new Decimal(player[this.layer].points.times(new Decimal(2))).add(1)
        else return 1
    },
    effectDescription() {
        if(hasUpgrade("c", 21)) return "which are boosting cube gain by " + format(tmp[this.layer].effect)
        else return "which aren't boosting any production."
    },
    doReset(layer) {
        if (layers[layer].row <= layers[this.layer].row) return;
        const keep = []
        layerDataReset(this.layer, keep)
    },
    milestones: {
        0: {
            requirementDescription: "1 Tesseract",
            effectDescription: "Gain 100% of cube gain every second.",
            done() { return player[this.layer].points.gte(new Decimal(1)) }
        },
        1: {
            requirementDescription: "100 Tesseracts",
            effectDescription: "Keep cube upgrades on reset.",
            done() { return player[this.layer].points.gte(new Decimal(100)) },
        },
        2: {
            requirementDescription: "10,000 Tesseracts",
            effectDescription: "Unlock a buyable.",
            done() { return player[this.layer].points.gte(new Decimal(10000)) },
            unlocked(){
                return hasUpgrade("c", 21)
            }
        },
        3: {
            requirementDescription: "1,000,000 Tesseracts",
            effectDescription: "Unlocks a new reset layer.",
            done() { 
                if(hasUpgrade("c", 21)) {
                    return player[this.layer].points.gte(new Decimal(1000000))
                } else {
                    return false
                }
            },
            unlocked(){
                return hasUpgrade("c", 21)
            }
        },
    },
    upgrades: {
        11: {
            title: "Condense",
            description: "Increase cube gain by 1.5 times.",
            cost: new Decimal(3),
            unlocked(){
                return hasUpgrade("c", 21)
            }
        },
        12: {
            title: "Knowledge",
            description: "Increase cube gain exponent by 0.05.",
            cost: new Decimal(15),
            unlocked(){
                return hasUpgrade("c", 21)
            }
        },
        13: {
            title: "Expand",
            description: "Increase tesseract gain by current tesseract amount.",
            cost: new Decimal(30),
            effect() {
                let eff = new Decimal(0.1)
                if(hasUpgrade("t", 14)) { eff = eff.add(new Decimal(0.05)) }
                return player[this.layer].points.add(1).pow(eff)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked(){
                return hasUpgrade("c", 21)
            }
        },
        14: {
            title: "Inflate (again)",
            description: "Increase previous upgrade effect by 0.05.",
            cost: new Decimal(150),
            unlocked(){
                return hasUpgrade("c", 21)
            }
        },
    },
    buyables: {
        11: {
            title: "Generators",
            cost(x) {
                let cost = new Decimal(1000).pow(new Decimal(1).plus(new Decimal(0.25).times(x))).round()
                return cost
            },
            effect() {
                amt = getBuyableAmount(this.layer, this.id)
                return new Decimal(1).times(new Decimal(1.25).pow(amt))
            },
            display() {
                return "Cost: " + format(this.cost()) + "<br> Effect: Increases point gain <br> by " + format(this.effect()) + "x"
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasMilestone("t", 2)
            }
        },
    }
}),
addLayer("p", {
    name: "penteracts", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#FAE7B9",
    requires: new Decimal(1000000), // Can be a function that takes requirement increases into account
    resource: "penteracts", // Name of prestige currency
    baseResource: "tesseracts", // Name of resource prestige is based on
    baseAmount() {return player["t"].points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for penteracts", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasMilestone("t", 3) || hasMilestone("p", 0)},
    effect(){
        return new Decimal(player[this.layer].points.pow(1.2).add(1))
    },
    effectDescription() {
        return "which are boosting tesseract gain by " + format(tmp[this.layer].effect)
    },
    doReset() {
        layerDataReset("t")
    },
    milestones: {
        0: {
            requirementDescription: "10 Penteracts",
            effectDescription: "Work In Progress",
            done() { return player[this.layer].points.gte(new Decimal(10)) }
        },
    }
})