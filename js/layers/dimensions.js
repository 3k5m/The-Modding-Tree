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
        let dimensionRequirements = ["10", "1e6", "1e9", "1e600", "e1e6", "e1e7", "e1e8"]
        for(i=0;i<dimensionRequirements.length;i++){
            if(player[this.layer].points.equals(i)){
                //for some reason all reqs are multiplied by 2, so just /2 the intended req here
                // note: idk wtf above means, TODO: check what that means??? - 2024-08
                // checked, pretty sure it was for a different layer type like normal/static. since this is custom layer we don't
                // need to worry about that
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
        return this.requires()
    },
    /*nextatDisp() {
        return format(getNextAt)
    },
    canReset() {
        return player.points.gte(player[this.layer].getNextAt)
    },*/
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
            effectDescription: "<b>Unlocks:</b>Unlocks a new layer (Squares)<br><b>Effects:</b>Remove line inflation upgrades, increase Line hardcap to e15, and increase base line gain by number of dimensions.",
            done() { return player[this.layer].points.gte(new Decimal(2)) },
            unlocked() {
                return hasMilestone('d', 0)
            }
        },
        2: {
            requirementDescription: "The Third Dimension",
            effectDescription: "<b>Unlocks:</b>Unlocks a new layer (Cubes)<br><b>Effects:</b>Remove square inflation upgrades, increase Line hardcap to e200, and increase base square gain by number of dimensions.",
            done() { return player[this.layer].points.gte(new Decimal(3)) },
            unlocked() {
                return hasMilestone('d', 1)
            }
        },
        3: {
            requirementDescription: "The Fourth Dimension",
            effectDescription: "<b>Unlocks:</b>Unlocks a new layer (Tesseracts).<br><b>Effects:</b>Remove cube inflation upgrade, remove Line hardcap, and square roots cube requirements.",
            done() { return player[this.layer].points.gte(new Decimal(4)) },
            unlocked() {
                return hasMilestone('d', 2)
            }
        },
        4: {
            requirementDescription: "The Fifth Dimension",
            effectDescription: "<b>Unlocks:</b>Unlocks a new layer (Penteracts).<br><b>Effects:</b>Unknown.",
            done() { return player[this.layer].points.gte(new Decimal(5)) },
            unlocked() {
                return hasMilestone('d', 3)
            }
        },
    }
})
