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
        mult = mult.times(tmp["t"].effect);
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        if (hasUpgrade('c', 21)) exp = exp.add(new Decimal(0.1))
        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset for cubes", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    doReset() {
        if(hasMilestone('t', 1)){
            layerDataReset(this.layer, ["upgrades"])
        }
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
            title: "Construct",
            description: "Square the previous upgrade effect.",
            cost: new Decimal(25),
        },
        21: {
            title: "Exploration",
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
    color: "#FFF200",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "tesseracts", // Name of prestige currency
    baseResource: "cubes", // Name of resource prestige is based on
    baseAmount() {return player["c"].points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
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
    milestones: {
        0: {
            requirementDescription: "1 Tesseract",
            effectDescription: "Gain 100% of cube gain every second.",
            done() { return player[this.layer].points.gte(new Decimal(1)) }
        },
        1: {
            requirementDescription: "100 Tesseracts",
            effectDescription: "Keep cube upgrades on reset.",
            done() { return player[this.layer].points.gte(new Decimal("e15")) },
        },
    },
    upgrades: {
        11: {
            title: "work in progress (does nothing)",
            description: "multiply your point gain by 1",
            cost: new Decimal(1),
            unlocked(){
                return hasUpgrade("c", 21)
            }
        },
    }
})