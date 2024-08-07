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
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= layers["c"].row) return;
        layerDataReset(this.layer);
    },
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
        if(hasUpgrade('l', 22)) gps = gps.times(upgradeEffect('l', 22))
        
        //cube inflation
        if(hasUpgrade('c', 15)) gps = gps.pow(new Decimal(3))
        
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
                let eff = player[this.layer].points.pow(0.01).reciprocate()
                if(eff.lte(0.85)){
                    //console.log(new Decimal(0.85).sub(player[this.layer].points.pow(0.01).pow(0.2).sub(1)))
                    eff = new Decimal(0.85).sub(player[this.layer].points.pow(0.01).pow(0.2).sub(1))
                }
                if(eff.lte(0.8)){
                    //console.log(new Decimal(0.85).sub(player[this.layer].points.pow(0.01).pow(0.2).pow(0.2).sub(1)))
                    eff = new Decimal(0.8).sub(player[this.layer].points.pow(0.01).pow(0.2).pow(0.2).sub(1))
                }
                return eff
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
})
