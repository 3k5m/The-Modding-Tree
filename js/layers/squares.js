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

        let cubefire = new Decimal(1)

        if(hasUpgrade('c', 13)) {
            cubefire = new Decimal(12501)
            if (hasUpgrade('s', 21)){
                mult = mult.times(cubefire)
            }
            if (hasUpgrade('s', 23)){
                mult = mult.times(cubefire)
            }
            if (hasUpgrade('s', 24)){
                mult = mult.times(cubefire)
            }
            if (hasUpgrade('s', 25)){
                mult = mult.times(cubefire)
            }
        }else if(hasUpgrade('s', 22)){
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
        if(!hasMilestone('d', 2) && player['l'].points.gte(1e15)) return "which are boosting line gain by " + format(tmp[this.layer].effect) + "." + "<br><small>Your Dimensions hardcap Line amount at e15.</small>"
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
                if(hasUpgrade('c', 13)) return "Multiply square gain by 12500. (Cubed)"
                if(!hasUpgrade('s',22)){
                    return "Multiply square gain by 0.9. Unlocks Extinguisher."
                }else{
                    return "Multiply square gain by 5."
                }
            },
            cost: new Decimal(69),
            unlocked(){
                return hasMilestone('d', 2)
            }
        },
        22: {
            title: "Extinguisher",
            description() {
                if(hasUpgrade('c', 13)) return "Multiply Fire Hazard effects by -125000. (Cubed)"
                return "Multiply Fire Hazard effects by -50."
            },
            cost: new Decimal(696),
            unlocked(){
                return hasUpgrade('s', 21)
            }
        },
        23: {
            title: "Fire Hazard",
            description() {
                if(hasUpgrade('c', 13)) return "Multiply square gain by 12500. (Cubed)"
                if(!hasUpgrade('s',22)){
                    return "Multiply square gain by 0.9."
                }else{
                    return "Multiply square gain by 5."
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
                if(hasUpgrade('c', 13)) return "Multiply square gain by 12500. (Cubed)"
                if(!hasUpgrade('s',22)){
                    return "Multiply square gain by 0.9."
                }else{
                    return "Multiply square gain by 5."
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
                if(hasUpgrade('c', 13)) return "Multiply square gain by 12500. (Cubed)"
                if(!hasUpgrade('s',22)){
                    return "Multiply square gain by 0.9."
                }else{
                    return "Multiply square gain by 5."
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
                return player.points.add(1).pow(0.05)
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
            cost: new Decimal(7e19),
            unlocked(){
                return hasUpgrade('s', 34)
            }
        },
    },
    buyables: {
        11: {
            title: "Papercuts",
            cost(x) {
                let cost = new Decimal(100).times(new Decimal(10).pow(new Decimal(2).plus(new Decimal(0.25).times(x).pow(new Decimal(1).plus(new Decimal(0.1).times(x))))).round())
                if(hasMilestone('d', 2)){
                    //cost = cost.times(new Decimal(100).pow(x).pow(x.times(0.25).plus(1)))
                }
                return cost
            },
            effect() {
                let amt = getBuyableAmount(this.layer, this.id)
                let eff = new Decimal(1).times(new Decimal(2.25).pow(amt))
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
                let cost = new Decimal(1e15).times(new Decimal(10).pow(new Decimal(1).plus(new Decimal(1.75).pow(x))).round())
                if(hasMilestone('d', 2)){
                    //cost = cost.times(new Decimal(100).pow(x).pow(x.times(0.25).plus(1)))
                }
                return cost
            },
            effect() {
                let amt = getBuyableAmount(this.layer, this.id)
                let eff = new Decimal(1).times(new Decimal(3).pow(amt))
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
    },
    passiveGeneration(){
        if(hasMilestone('c',5)) { return 1; }
        return 0;
    }
})
