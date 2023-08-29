addLayer('l', {
    name: "lines", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: 'L', // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFFFFF",
    resetDescription: "Create ",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "lines", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    effectDescription() {
        if(player[this.layer].points.gte(1e10) && !hasMilestone('d', 1)){
            return "which aren't boosting any production. <br><small>Your Dimensions hardcap Line amount at e10.</small>"
        }
        if(player[this.layer].points.gte(1e15) && !hasMilestone('d', 2)){
            return "which aren't boosting any production. <br><small>Your Dimensions hardcap Line amount at e15.</small>"
        }
        return "which aren't boosting any production."
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)

        if (hasUpgrade('l', 16)) mult = mult.add(new Decimal(1))
        if (hasMilestone('d', 1)) mult = mult.add(new Decimal(1))

        if (hasUpgrade('l', 13)) mult = mult.times(upgradeEffect('l', 13))
        if (hasUpgrade('l', 14) && !hasMilestone('d', 1)) mult = mult.times(upgradeEffect('l', 14))
        if (hasUpgrade('l', 15) && !hasMilestone('d', 1)) mult = mult.times(upgradeEffect('l', 14)) //squaring the upgrade effect
        if (hasUpgrade('s', 11)) mult = mult.times(new Decimal(1.5))
        if (hasUpgrade('c', 11) && hasUpgrade('s', 11)) mult = mult.times(new Decimal(2.25))
        if (hasUpgrade('s', 34)) mult = mult.times(3)
        if (hasUpgrade('s', 35)) mult = mult.times(10)
        mult = mult.times(tmp['s'].effect);

        if (hasUpgrade('s', 12)) mult = mult.add(new Decimal(5))
        if (hasUpgrade('s', 12) && hasUpgrade('c', 12)) mult = mult.add(new Decimal(125))

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        if (player[this.layer].points.gte(1e10)){
            if (!hasMilestone('d', 1)){
                exp = new Decimal(0)
                player[this.layer].points = new Decimal(1e10)
            }
        }
        if (player[this.layer].points.gte(1e15)){
            if (!hasMilestone('d', 2)){
                exp = new Decimal(0)
                player[this.layer].points = new Decimal(1e15)
            }
        }

        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    branches: ['s', 't'],
    hotkeys: [
        {key: 'l', description: "L: Reset for lines", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasMilestone('d', 0)},
    doReset(layer) {
        let has21 = false
        let has22 = false
        //commented out lines were for the deflation upgrades, now replaced by dimensions
        //if (hasUpgrade('l', 21)) has21 = true
        //if (hasUpgrade('l', 22)) has22 = true
        if (layers[layer].row <= layers[this.layer].row) return;
        const keep = []
        if (hasMilestone('s', 2)) keep.push("upgrades")
        layerDataReset(this.layer, keep)
        //if (!hasUpgrade('l', 21) && has21) player[this.layer].upgrades.push('l', 21)
        //if (!hasUpgrade('l', 22) && has22) player[this.layer].upgrades.push('l', 22)
    },
    upgrades: {
        11: {
            title: "Duplicate",
            description: "Double your point gain.",
            cost: new Decimal(1),
        },
        12: {
            title: "Parallel",
            description: "Increase points gain based on current lines amount.",
            cost: new Decimal(2),
            effect() {
                return player[this.layer].points.add(2).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        13: {
            title: "Sharp",
            description: "Increase lines gain based on points.",
            cost: new Decimal(4),
            effect() {
                return player.points.add(2).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        14: {
            title: "Curves",
            description: "Increase lines gain based on current lines amount. <br><br><b> Inflation Upgrade </b><br>",
            cost: new Decimal(10),
            effect() {
                if(hasUpgrade('l', 15) && !hasMilestone('d', 1)) { return player[this.layer].points.add(1).pow(0.25).pow(2) }
                else if(hasMilestone('d', 1)){ return 1 }
                else { return player[this.layer].points.add(1).pow(0.25) }
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {
                return !hasMilestone('d', 1)
            }
        },
        15: {
            title: "Inflate",
            description: "Square the previous upgrade effect. <br><br><b> Inflation Upgrade </b><br>",
            cost: new Decimal(25),
            unlocked() {
                return !hasMilestone('d', 1)
            }
        },
        21: {
            title: "Ascension",
            description: "Increase squares gain based on lines.",
            cost: new Decimal("1e42"),
            effect() {
                return new Decimal(1).add(player.points.div(1e25).pow(0.15))
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {
                return hasMilestone('d', 1)
            }
        },
        22: {
            title: "Cuboid",
            description: "Increase paintings gain by cubes.",
            cost: new Decimal("1e44"),
            effect() {
                if(hasUpgrade(this.layer, 23)) return new Decimal(1).add(player['c'].points.pow(5))
                return new Decimal(1).add(player['c'].points.pow(3))
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {
                return hasMilestone('c', 3)
            }
        },
        23: {
            title: "Cuboid",
            description: "Increase previous upgrade exponent to 5.",
            cost: new Decimal("1e49"),
            unlocked() {
                return hasMilestone('c', 3)
            }
        },
        //moving the effect to dimensions layer
        /*16: {
            title: "Equipment",
            description: "Increase base line gain by 1.",
            cost: new Decimal(50),
        },*/
        /* Removed these for a new layer
        21: {
            title: "Deflate",
            description: "Remove Line inflate upgrades and resets all resources, but unlocks more features.<br><br> <b>PERMANENT UPGRADE</b>",
            cost: new Decimal("e10"),
            unlocked() {
                return((player[this.layer].points.gte(new Decimal("e9")) && hasMilestone('s', 1)) || hasUpgrade('l', 21))
            },
            onPurchase() {
                player[this.layer].points = new Decimal(0)
                player['s'].points = new Decimal(0)
                player.points = new Decimal(0)
            }
        },
        22: {
            title: "Deflate 2",
            description: "Remove Square inflate upgrades, nerf square and generator effects, and resets all resources, but unlocks more features.<br><br> <b>PERMANENT UPGRADE</b>",
            cost: new Decimal("e20"),
            unlocked() {
                return((player['c'].points.gte(new Decimal("1"))) || hasUpgrade('l', 22))
            },
            onPurchase() {
                player[this.layer].points = new Decimal(0)
                player['s'].points = new Decimal(0)
                player['c'].points = new Decimal(0)
                player.points = new Decimal(0)
                setBuyableAmount('s', 11, new Decimal(0))
            }
        },*/
    },
    passiveGeneration(){
        if(hasMilestone('s',1)) { return 1; }
        return 0;
    }
})