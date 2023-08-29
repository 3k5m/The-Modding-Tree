addLayer("t", {
    name: "squares", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#FF0000",
    resetDescription: "Combine lines into ",
    requires: new Decimal(10000), // Can be a function that takes requirement increases into account
    resource: "triangles", // Name of prestige currency
    baseResource: "lines", // Name of resource prestige is based on
    baseAmount() {return player['l'].points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    //base: 2, only use base if static layer type
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        "buyables",
        "upgrades",
        "milestones"
    ],
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        return exp
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: [],
    hotkeys: [
        {key: 't', description: "T: Reset for triangles", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasMilestone('d', 3)},
    effect(){
        let base = player[this.layer].points
        let eff = new Decimal(1)
        return eff
    },
    effectDescription() {
        return "which aren't boosting any production."
    },
    doReset(layer) {
        if (layers[layer].row <= layers[this.layer].row) return;
        const keep = []
        layerDataReset(this.layer, keep)
    },
    /*canBuyMax() {
        if(hasMilestone('s', 0)) return true;
        else return false;
    },*/
    milestones: {
    },
    upgrades: {
        35: {
            title: "test",
            description: "does literally nothing.",
            cost: new Decimal(1),
        },
    },
    buyables: {
    },
    automate() {
    }
})
