addLayer("t", {
    name: "tesseracts", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#FAE39B",
    resetDescription: "Combine cubes into ",
    requires() {
        let req = new Decimal(10).pow(player[this.layer].points.add(new Decimal(1)))
        return req
    }, // Can be a function that takes requirement increases into account
    resource: "tesseracts", // Name of prestige currency
    baseResource: "cubes", // Name of resource prestige is based on
    baseAmount() {return player['c'].points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0, // Prestige currency exponent
    base: 1,
    canBuyMax() {
        return false;
    },
    getResetGain() {
        return new Decimal(1)
    },
    getNextAt() {
        return this.requires()
    },
    canReset() {
        return this.baseAmount().gte(this.requires())
    },
    prestigeButtonText() {
        return "Combine cubes into Tesseracts. <br> <br> Req: " + format(this.requires()) + " cubes"
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "t", description: "T: Reset for tesseracts", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasMilestone('d', 3)},
    effect(){
        return new Decimal(player[this.layer].points.pow(2.2).add(9))
    },
    effectDescription() {
        return "which are boosting Line, Square, and Cube gain by " + format(tmp[this.layer].effect) + "."
    },
    milestones: {
        0: {
            requirementDescription: "1 Tesseract",
            effectDescription: "Unlocks bulk purchase for cubes. (WIP)",
            done() { return player[this.layer].points.gte(new Decimal(1)) }
        },
    },
    upgrades: {
    }
})
