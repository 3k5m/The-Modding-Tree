addLayer('l', {
    name: "lines", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: 'L', // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFFFFF",
    resetDescription: "Draw ",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "lines", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (hasUpgrade('l', 13)) mult = mult.times(upgradeEffect('l', 13))
        if (hasUpgrade('l', 14) && !hasUpgrade('l', 21)) mult = mult.times(upgradeEffect('l', 14))
        if (hasUpgrade('l', 15) && !hasUpgrade('l', 21)) mult = mult.times(upgradeEffect('l', 14)) //squaring the upgrade effect
        if (hasUpgrade('s', 11)) mult = mult.times(new Decimal(1.5))
        mult = mult.times(tmp['s'].effect);
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        if (hasUpgrade('l', 21)) exp = exp.add(new Decimal(0.1))
        if (hasUpgrade('l', 22)) exp = exp.add(new Decimal(0.1))
        if (hasUpgrade('s', 12)) exp = exp.add(new Decimal(0.05))
        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: 'l', description: "L: Reset for lines", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    doReset(layer) {
        let has21 = false
        if (hasUpgrade('l', 21)) has21 = true
        if (hasUpgrade('l', 22)) has22 = true
        if (layers[layer].row <= layers[this.layer].row) return;
        const keep = []
        if (hasMilestone('s', 2)) keep.push("upgrades")
        layerDataReset(this.layer, keep)
        if (!hasUpgrade('l', 21) && has21) player[this.layer].upgrades.push('l', 21)
        if (!hasUpgrade('l', 22) && has22) player[this.layer].upgrades.push('l', 22)
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
                return player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        13: {
            title: "Sharp",
            description: "Increase lines gain based on points.",
            cost: new Decimal(4),
            effect() {
                return player.points.add(1).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        14: {
            title: "Curves",
            description: "Increase lines gain based on current lines amount.",
            cost: new Decimal(10),
            effect() {
                if(hasUpgrade('l', 15) && !hasUpgrade('l', 21)) { return player[this.layer].points.add(1).pow(0.25).pow(2) }
                else if(hasUpgrade('l', 21)){ return 1 }
                else { return player[this.layer].points.add(1).pow(0.25) }
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {
                return !hasUpgrade('l', 21)
            }
        },
        15: {
            title: "Inflate",
            description: "Square the previous upgrade effect.",
            cost: new Decimal(25),
            unlocked() {
                return !hasUpgrade('l', 21)
            }
        },
        21: {
            title: "Deflate",
            description: "Remove Line inflate upgrades and resets all resources, but unlocks square features and increases line gain exponent by 0.1<br><br> <b>PERMANENT UPGRADE</b>",
            cost: new Decimal("e14814814"),
            unlocked() {
                return((player[this.layer].points.gte(new Decimal("e10000")) && hasMilestone('s', 1)) || hasUpgrade('l', 21))
            },
            onPurchase() {
                player[this.layer].points = new Decimal(0)
                player['s'].points = new Decimal(0)
                player.points = new Decimal(0)
            }
        },
        22: {
            title: "Deflate 2",
            description: "Remove Square inflate upgrade, nerf square and generators, and resets all resources, but unlocks square and cube features and increases line gain exponent by 0.1<br><br> <b>PERMANENT UPGRADE</b>",
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
        },
    },
    passiveGeneration(){
        if(hasMilestone('s',1)) { return 1; }
        return 0;
    }
}),
addLayer("s", {
    name: "squares", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#FAF2DF",
    resetDescription: "Combine lines into ",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "squares", // Name of prestige currency
    baseResource: "lines", // Name of resource prestige is based on
    baseAmount() {return player['l'].points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    //base: 2, only use base if static layer type
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (hasUpgrade('s', 13)) mult = mult.times(upgradeEffect('s', 13))
        mult = mult.times(tmp['c'].effect);
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: 's', description: "T: Reset for squares", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    effect(){
        let eff = new Decimal(player[this.layer].points.pow(new Decimal(1.05))).add(1)
        if(hasUpgrade('s', 15)) eff = eff.times(new Decimal(2))
        if(hasUpgrade('l', 22)) eff = eff.sqrt()
        if(hasUpgrade('l', 21)) return eff
        else return 1
    },
    effectDescription() {
        if(hasUpgrade('l', 21)) return "which are boosting line gain by " + format(tmp[this.layer].effect)
        else return "which aren't boosting any production. <br><small> You might need another upgrade to progress. </small>"
    },
    doReset(layer) {
        if (layers[layer].row <= layers[this.layer].row) return;
        const keep = []
        layerDataReset(this.layer, keep)
        
        player[this.layer].milestones.push('s', 4)

        for(let loopi=0;loopi<5;loopi++){
            if(hasMilestone('c', loopi)){
                //its i+1 because unused 0th milestone
                player[this.layer].milestones.push('s', loopi+1)
                // debug stuff console.log("debug loopi" + loopi)
            }
        }
    },
    /*canBuyMax() {
        if(hasMilestone('s', 0)) return true;
        else return false;
    },*/
    milestones: {
        //only use buymax if static layer
        /*0: {
            requirementDescription: "1 square",
            effectDescription: "You can buy max squares.",
            done() { return player[this.layer].points.gte(new Decimal(1)) || hasMilestone('c', 0) }
        },*/
        1: {
            requirementDescription: "1 Square",
            effectDescription: "Gain 100% of line gain every second.",
            done() { return player[this.layer].points.gte(new Decimal(1)) }
        },
        2: {
            requirementDescription: "100 Squares",
            effectDescription: "Keep line upgrades on reset.",
            done() { 
                if(hasUpgrade('l', 21)) {
                    return player[this.layer].points.gte(new Decimal(100))
                } else {
                    return false
                }
            },
            unlocked(){
                return hasUpgrade('l', 21)
            }
        },
        3: {
            requirementDescription: "10,000 Squares",
            effectDescription: "Unlock a buyable.",
            done() { 
                if(hasUpgrade('l', 21)) {
                    return player[this.layer].points.gte(new Decimal(10000))
                } else {
                    return false
                }
            },
            unlocked(){
                return hasUpgrade('l', 21)
            }
        },
        4: {
            requirementDescription: "1,000,000 Squares",
            effectDescription: "Unlocks a new reset layer.",
            done() { 
                if(hasUpgrade('l', 21)) {
                    return player[this.layer].points.gte(new Decimal(1000000))
                } else {
                    return false
                }
            },
            unlocked(){
                return hasUpgrade('l', 21)
            }
        },
    },
    upgrades: {
        11: {
            title: "Condense",
            description: "Increase line gain by 1.5 times.",
            cost: new Decimal(3),
            unlocked(){
                return hasUpgrade('l', 21)
            }
        },
        12: {
            title: "Knowledge",
            description: "Increase line gain exponent by 0.05.",
            cost: new Decimal(15),
            unlocked(){
                return hasUpgrade('l', 21)
            }
        },
        13: {
            title: "Expand",
            description: "Increase square gain by current square amount.",
            cost: new Decimal(30),
            effect() {
                if(hasUpgrade('l', 22)){ return 1 }

                let eff = new Decimal(0.1)
                if(hasUpgrade('s', 14)) { eff = eff.add(new Decimal(0.05)) }
                return player[this.layer].points.add(1).pow(eff)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked(){
                return hasUpgrade('l', 21) && !hasUpgrade('l', 22)
            }
        },
        14: {
            title: "Inflate (again)",
            description: "Increase previous upgrade effect exponent by 0.05.",
            cost: new Decimal(150),
            unlocked(){
                return hasUpgrade('l', 21) && !hasUpgrade('l', 22)
            }
        },
        15: {
            title: "Double",
            description: "Increase Square base by 1.",
            cost: new Decimal(300),
            unlocked(){
                return hasUpgrade('l', 21)
            }
        },
    },
    buyables: {
        11: {
            title: "Generators",
            cost(x) {
                let cost = new Decimal(1000).pow(new Decimal(1).plus(new Decimal(0.25).times(x))).round()
                if(hasUpgrade('l', 22)){
                    cost = cost.times(new Decimal(100).pow(x).pow(x.times(0.25).plus(1)))
                }
                return cost
            },
            effect() {
                let amt = getBuyableAmount(this.layer, this.id)
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
                return hasMilestone('s', 3)
            }
        },
    }
}),
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
    requires: new Decimal(1000000), // Can be a function that takes requirement increases into account
    resource: "cubes", // Name of prestige currency
    baseResource: "squares", // Name of resource prestige is based on
    baseAmount() {return player['s'].points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    base: 3,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset for cubes", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasMilestone('s', 4) || hasMilestone('c', 0)},
    effect(){
        return new Decimal(player[this.layer].points.pow(1.2).add(1))
    },
    effectDescription() {
        if(hasUpgrade('l', 22)){
            return "which are boosting square gain by " + format(tmp[this.layer].effect)
        }else{
            return "which are boosting square gain by " + format(tmp[this.layer].effect) + " <br><small> You might need another upgrade to progress. </small>"
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
    }
})