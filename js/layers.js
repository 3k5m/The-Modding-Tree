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
    branches: ['s'],
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
                return player.points.div(1e25).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
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
        if (hasMilestone('d', 2)) mult = mult.add(new Decimal(1))
        if (hasUpgrade('s', 13)) mult = mult.times(upgradeEffect('s', 13))
        mult = mult.times(tmp['c'].effect);
        if (hasUpgrade('s', 33)) mult = mult.times(upgradeEffect('s', 33))
        if (hasUpgrade('s', 35)) mult = mult.times(10)

        if(hasUpgrade('s', 22)){
            if (hasUpgrade('s', 21)){
                mult = mult.times(6)
            }
            if (hasUpgrade('s', 23)){
                mult = mult.times(6)
            }
            if (hasUpgrade('s', 24)){
                mult = mult.times(6)
            }
            if (hasUpgrade('s', 25)){
                mult = mult.times(6)
            }
        }else{
            if (hasUpgrade('s', 21)){
                mult = mult.times(0.9)
            }
            if (hasUpgrade('s', 23)){
                mult = mult.times(0.9)
            }
            if (hasUpgrade('s', 24)){
                mult = mult.times(0.9)
            }
            if (hasUpgrade('s', 25)){
                mult = mult.times(0.9)
            }
        }
        if (hasUpgrade('l', 21)) mult = mult.times(upgradeEffect('l', 21))
        if(hasUpgrade('s', 31)){ mult = mult.times(10) }
        if(hasUpgrade('s', 32)){ mult = mult.times(10) }

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        return exp
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ['c'],
    hotkeys: [
        {key: 's', description: "S: Reset for squares", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasMilestone('d', 1)},
    effect(){
        let base = player[this.layer].points
        if(hasUpgrade('s', 15)) base = base.times(new Decimal(2))
        if(hasUpgrade('s', 15) && hasUpgrade('c', 12)) base = base.times(new Decimal(4))
        let eff = new Decimal(base.pow(new Decimal(1.05))).add(1)
        if(hasMilestone('d', 2)) eff = eff.sqrt()
        if(hasMilestone('d', 1)) return eff
        else return 1
    },
    effectDescription() {
        if(hasMilestone('d', 1)) return "which are boosting line gain by " + format(tmp[this.layer].effect) + "."
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
                if(hasMilestone('d', 1)) {
                    return player[this.layer].points.gte(new Decimal(100))
                } else {
                    return false
                }
            },
            unlocked(){
                return hasMilestone('s', 1)
            }
        },
        3: {
            requirementDescription: "10,000 Squares",
            effectDescription: "Unlock a buyable.",
            done() { 
                if(hasMilestone('d', 1)) {
                    return player[this.layer].points.gte(new Decimal(10000))
                } else {
                    return false
                }
            },
            unlocked(){
                return hasMilestone('s', 2)
            }
        },
        /* Effect moved to dimensions
        4: {
            requirementDescription: "1,000,000 Squares",
            effectDescription: "Unlocks a new reset layer.",
            done() { 
                if(hasMilestone('d', 1)) {
                    return player[this.layer].points.gte(new Decimal(1000000))
                } else {
                    return false
                }
            },
            unlocked(){
                return hasMilestone('s', 3)
            }
        },*/
        5: {
            requirementDescription: "1e15 Squares",
            effectDescription: "Unlocks another buyable.",
            done() { 
                if(hasMilestone('d', 2)) {
                    return player[this.layer].points.gte(new Decimal(1e15))
                } else {
                    return false
                }
            },
            unlocked(){
                return hasMilestone('d', 2) && hasMilestone('s', 3)
            }
        },
    },
    upgrades: {
        11: {
            title: "Condense",
            description() {
                if(!hasUpgrade('c',11)){
                    return "Multiply line gain by 1.5."
                }else{
                    return "Multiply line gain by 3.375. (Cubed)"
                }
            },
            cost: new Decimal(3),
            unlocked(){
                return hasMilestone('d', 1)
            }
        },
        12: {
            title: "Knowledge",
            description() {
                if(!hasUpgrade('c',12)){
                    return "Multiply line gain by 5."
                }else{
                    return "Multiply line gain by 125. (Cubed)"
                }
            },
            cost: new Decimal(15),
            unlocked(){
                return hasUpgrade('s', 11)
            }
        },
        13: {
            title: "Self Creation",
            description: "Increase square gain by current square amount. <br><br><b> Inflation Upgrade </b><br>",
            cost: new Decimal(30),
            effect() {
                if(hasMilestone('d', 2)){ return 1 }
                let eff = new Decimal(0.1)
                if(hasUpgrade('s', 14)) { eff = eff.add(new Decimal(0.1)) }
                return player[this.layer].points.add(1).pow(eff)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked(){
                return hasUpgrade('s', 12) && !hasMilestone('d', 2)
            }
        },
        14: {
            title: "Inflate (again)",
            description: "Double previous upgrade effect exponent. <br><br><b> Inflation Upgrade </b><br>",
            cost: new Decimal(150),
            unlocked(){
                return hasUpgrade('s', 13) && !hasMilestone('d', 2)
            }
        },
        15: {
            title: "Double",
            description() {
                if(!hasUpgrade('c',12)){
                    return "Multiply Square base by 2."
                }else{
                    return "Multiply Square base by 8. (Cubed)"
                }
            },
            cost: new Decimal(300),
            unlocked(){
                return hasUpgrade('s', 12)
            }
        },
        21: {
            title: "Fire Hazard",
            description() {
                if(!hasUpgrade('s',22)){
                    return "Decrease square gain by 0.1 times."
                }else{
                    return "Increase square gain by 5 times."
                }
            },
            cost: new Decimal(69),
            unlocked(){
                return hasMilestone('d', 2)
            }
        },
        22: {
            title: "Extinguisher",
            description: "Multiply Fire Hazard effects by -50 times.",
            cost: new Decimal(696),
            unlocked(){
                return hasUpgrade('s', 21)
            }
        },
        23: {
            title: "Fire Hazard",
            description() {
                if(!hasUpgrade('s',22)){
                    return "Decrease square gain by 0.1 times."
                }else{
                    return "Increase square gain by 5 times."
                }
            },
            cost: new Decimal(6969),
            unlocked(){
                return hasUpgrade('s', 21)
            }
        },
        24: {
            title: "Fire Hazard",
            description() {
                if(!hasUpgrade('s',22)){
                    return "Decrease square gain by 0.1 times."
                }else{
                    return "Increase square gain by 5 times."
                }
            },
            cost: new Decimal(69696),
            unlocked(){
                return hasUpgrade('s', 23)
            }
        },
        25: {
            title: "Fire Hazard",
            description() {
                if(!hasUpgrade('s',22)){
                    return "Decrease square gain by 0.1 times."
                }else{
                    return "Increase square gain by 5 times."
                }
            },
            cost: new Decimal(696969),
            unlocked(){
                return hasUpgrade('s', 24)
            }
        },
        31: {
            title: "Pyromania",
            description: "Why are there so many fire hazards?? (10x square gain)",
            cost: new Decimal(1e7),
            unlocked(){
                return hasUpgrade('s', 25)
            }
        },
        32: {
            title: "Burning House",
            description: "Looks like the extinguisher wasn't enough... (10x square gain)",
            cost: new Decimal(1e8),
            unlocked(){
                return hasUpgrade('s', 31)
            }
        },
        33: {
            title: "Back to Square One",
            description: "Increase square gain based on points.",
            cost: new Decimal(1e10),
            unlocked(){
                return hasUpgrade('s', 32)
            },
            effect() {
                return player.points.add(1).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        34: {
            title: "Picasso's Triangles",
            description: "Triples line gain.",
            cost: new Decimal(5e13),
            unlocked(){
                return hasUpgrade('s', 33)
            }
        },
        35: {
            title: "The Last Upgrade",
            description: "10x square, line, and points gain.",
            cost: new Decimal(7e21),
            unlocked(){
                return hasUpgrade('s', 34)
            }
        },
    },
    buyables: {
        11: {
            title: "Papercuts",
            cost(x) {
                let cost = new Decimal(100).times(new Decimal(10).pow(new Decimal(1).plus(new Decimal(0.25).times(x))).round())
                if(hasMilestone('d', 2)){
                    //cost = cost.times(new Decimal(100).pow(x).pow(x.times(0.25).plus(1)))
                }
                return cost
            },
            effect() {
                let amt = getBuyableAmount(this.layer, this.id)
                let eff = new Decimal(1).times(new Decimal(1.25).pow(amt)).sqrt()
                if(hasMilestone('d', 2)){
                    //eff = eff.sqrt()
                }
                return eff
            },
            display() {
                if(!hasMilestone('d', 2)) return "Cost: " + format(this.cost()) + " squares <br> Effect: Increases point gain <br> by " + format(this.effect()) + "x"
                else return "Cost: " + format(this.cost()) + " squares <br> Effect: Increases point gain <br> by " + format(this.effect()) + "x"// removed nerf for now -> (Nerfed by 3rd dimension)"
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                if(!hasMilestone('c', 1)){
                    player[this.layer].points = player[this.layer].points.sub(this.cost())
                }
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasMilestone('s', 3)
            }
        },
        12: {
            title: "Shadows",
            cost(x) {
                let cost = new Decimal(1e15).times(new Decimal(10).pow(new Decimal(1).plus(new Decimal(0.25).times(x))).round())
                if(hasMilestone('d', 2)){
                    //cost = cost.times(new Decimal(100).pow(x).pow(x.times(0.25).plus(1)))
                }
                return cost
            },
            effect() {
                let amt = getBuyableAmount(this.layer, this.id)
                let eff = new Decimal(1).times(new Decimal(1.02).pow(amt))
                return eff
            },
            display() {
                return "Cost: " + format(this.cost()) + " squares <br> Effect: Increases points gain <br> by " + format(this.effect()) + "x"
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                if(!hasMilestone('c', 3)){
                    player[this.layer].points = player[this.layer].points.sub(this.cost())
                }
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasMilestone('s', 5)
            }
        },
    },
    automate() {
        if(hasMilestone('c', 1)){
            buyBuyable('s', 11)
        }
        if(hasMilestone('c', 3)){
            buyBuyable('s', 12)
        }
    },
    autoUpgrade() {
        return hasMilestone('c', 4)
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
            effectDescription: "Automatically purchase Papercuts, and they cost nothing.",
            done() { return player[this.layer].points.gte(new Decimal(2)) },
            unlocked() {
                return hasMilestone('c', 0)
            }
        },
        2: {
            requirementDescription: "3 Cubes",
            effectDescription: "Unlocks a mini layer.",
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
            effectDescription: "Automatically purchase Shadows, and they cost nothing. Also unlocks a line upgrade. <br><small> Try different Painting upgrades if you get stuck. </small>",
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
            requirementDescription: "9 Cubes",
            effectDescription: "Unlocks Cube inflation upgrades.",
            done() { return player[this.layer].points.gte(new Decimal(9)) },
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
        /*14: {
            title: "Rubik's Cube",
            description: "Cube Cube effect (WIP)",
            cost: new Decimal(27),
            unlocked(){
                return hasUpgrade('l', 22)
            }
        },*/
    }
}),
addLayer("mini1", {
    name: "paintings", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        gainPerSec: new Decimal(0),
    }},
    color: "#00FFFF",
    resource: "paintings", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    tabFormat: [
        "main-display",
        ["display-text",
            function() { return "You are creating " + format(player[this.layer].gainPerSec) + ' paintings per second.'},
        ],
        "blank",
        "clickables",
        "upgrades"
    ],
    effect(){
        let exp = new Decimal(1.4)
        if(hasUpgrade('mini1', 21)) exp = exp.add(0.15)
        if(hasUpgrade('mini1', 31)) exp = exp.add(0.25)
        let eff = new Decimal(player[this.layer].points.pow(exp).add(1))
        return eff
    },
    effectDescription() {
        return "which are boosting points gain by " + format(tmp[this.layer].effect)
    },
    update(delta){
        let gps = new Decimal(0)
        if(hasUpgrade(this.layer, 11)) gps = gps.add(1)
        if(hasUpgrade(this.layer, 22)) gps = gps.times(2)
        if(hasUpgrade(this.layer, 31)) gps = gps.times(0.5)
        if (hasUpgrade(this.layer, 33)) gps = gps.times(upgradeEffect(this.layer, 33))
        player[this.layer].gainPerSec = gps
        player[this.layer].points = player[this.layer].points.add(gps.times(delta))
    },
    row: "side", // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasMilestone('c', 2)},
    clickables: {
        11: {
            title: "Respec Upgrades",
            display() {
                return "This does not refund your paintings."
            },
            canClick: true,
            onClick() {
                player[this.layer].upgrades = []
            }
        }
    },
    upgrades: {
        11: {
            title: "Become An Artist (11)",
            description: "Create 1 painting per second.",
            cost: new Decimal(0),
            branches: [21, 22]
        },
        21: {
            title: "Creativity (21)",
            description() { 
                if(!hasMilestone('c', 4)) return "Increases painting effect exponent by 0.15. <br> Disables upgrade 22"
                else return "Increases painting effect exponent by 0.15."
            },
            cost: new Decimal(30),
            unlocked() {
                return hasUpgrade(this.layer, 11)
            },
            canAfford() {
                if(hasMilestone('c', 4)) return true
                return !hasUpgrade(this.layer, 22)
            },
            branches: [31, 32]
        },
        22: {
            title: "Art Toolbox (22)",
            description() { 
                if(!hasMilestone('c', 4)) return "Doubles painting creation speed. <br> Disables upgrade 21"
                else return "Doubles painting creation speed."
            },
            cost: new Decimal(30),
            unlocked() {
                return hasUpgrade(this.layer, 11)
            },
            canAfford() {
                if(hasMilestone('c', 4)) return true
                return !hasUpgrade(this.layer, 21)
            },
            branches: [32, 33]
        },
        31: {
            title: "Quality Over Quantity (31)",
            description() { 
                if(!hasMilestone('c', 4)) return "Halves painting gain, increases painting effect exponent by 0.25. <br> Disables upgrades 32 and 33"
                else return "Halves painting gain, increases painting effect exponent by 0.25."
            },
            cost: new Decimal(100),
            unlocked() {
                return hasUpgrade(this.layer, 21) || hasUpgrade(this.layer, 22)
            },
            canAfford() {
                if(hasMilestone('c', 4)) return true
                return !hasUpgrade(this.layer, 32) && !hasUpgrade(this.layer, 33) 
            },
        },
        32: {
            title: "3D Printer (32)",
            description() { 
                if(!hasMilestone('c', 4)) return "Paintings reduce the cube requirement exponent. <br> Disables upgrades 31 and 33"
                else return "Paintings reduce the cube requirement exponent."
            },
            cost: new Decimal(100),
            unlocked() {
                return hasUpgrade(this.layer, 21) || hasUpgrade(this.layer, 22)
            },
            canAfford() {
                if(hasMilestone('c', 4)) return true
                return !hasUpgrade(this.layer, 31) && !hasUpgrade(this.layer, 33) 
            },
            effect() {
                return player[this.layer].points.pow(0.01).reciprocate()
            },
            effectDisplay() { return "^" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },
        33: {
            title: "Inspiration (33)",
            description() { 
                if(!hasMilestone('c', 4)) return "Current amount of paintings boost paintings creation speed. <br> Disables upgrades 31 and 32"
                else return "Current amount of paintings boost paintings creation speed."
            },
            cost: new Decimal(100),
            unlocked() {
                return hasUpgrade(this.layer, 21) || hasUpgrade(this.layer, 22)
            },
            canAfford() {
                if(hasMilestone('c', 4)) return true
                return !hasUpgrade(this.layer, 31) && !hasUpgrade(this.layer, 32) 
            },
            effect() {
                return player[this.layer].points.add(1).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
    },
}),
addLayer("d", {
    name: "dimensions", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#FFD700",
    resetDescription: "Ascend to the next dimension: ",
    requires() {
        let dimensionRequirements = ["10", "1e6", "1e9", "1e10000", "e1e5", "e1e6", "e1e7"]
        for(i=0;i<dimensionRequirements.length;i++){
            if(player[this.layer].points.equals(i)){
                //for some reason all reqs are multiplied by 2, so just /2 the intended req here
                return new Decimal(dimensionRequirements[i])
            }
        }
    }, // Can be a function that takes requirement increases into account
    resource: "dimensions", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0, // Prestige currency exponent
    base: 1,
    row: 10, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    effect(){
        return new Decimal(player[this.layer].points.pow(1.2).add(1))
    },
    canBuyMax() {
        return false;
    },
    getResetGain() {
        return new Decimal(1)
    },
    getNextAt() {
        return player[this.layer].requires
    },
    nextatDisp() {
        return format(getNextAt)
    },
    canReset() {
        return player.points.gte(player[this.layer].getNextAt)
    },
    prestigeButtonText() {
        //removed the part where it put the baseresource as it is mentioned below the prestige button
        return "Ascend into the next dimension. <br> <br> Req: "/* + format(this.baseAmount()) + "/"*/ + format(this.requires()) + " points"
    },
    canReset() {
        return this.baseAmount().gte(this.requires())
    },
    milestones: {
        0: {
            requirementDescription: "The First Dimension",
            effectDescription: "<b>Unlocks:</b>Unlocks a new layer (Lines). Begin generating points.",
            done() { return player[this.layer].points.gte(new Decimal(1)) }
        },
        1: {
            requirementDescription: "The Second Dimension",
            effectDescription: "<b>Unlocks:</b>Unlocks a new layer (Squares)<br><b>Effects:</b>Remove line inflation upgrades, increase Line hardcap to e15, and increase base line gain by 1.",
            done() { return player[this.layer].points.gte(new Decimal(2)) },
            unlocked() {
                return hasMilestone('d', 0)
            }
        },
        2: {
            requirementDescription: "The Third Dimension",
            effectDescription: "<b>Unlocks:</b>Unlocks a new layer (Cubes)<br><b>Effects:</b>Remove square inflation upgrades, increase Line hardcap to e100, and increase base square gain by 1.",
            done() { return player[this.layer].points.gte(new Decimal(3)) },
            unlocked() {
                return hasMilestone('d', 1)
            }
        },
        3: {
            requirementDescription: "The Fourth Dimension",
            effectDescription: "<b>Unlocks:</b>Unlocks a new layer (Tesseracts).<br><b>Effects:</b> (Note: Finishing cube layer then I will rebalance cubes to be normal layer so you won't have more tesseracts than cubes. Then I will be adding tesseracts. )",
            done() { return player[this.layer].points.gte(new Decimal(4)) },
            unlocked() {
                return hasMilestone('d', 2)
            }
        },
    }
})