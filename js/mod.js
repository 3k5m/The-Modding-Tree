let modInfo = {
	name: "The Hyperdimensions Tree",
	id: "3ktree1",
	author: "3k5m",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.0.3",
	name: "Deflation 1 Update",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0.1</h3><br>
		- Added 2 layers.<br>
		- First attempt at making a TMT mod!<br>
		<br>
	<h3>v0.0.2</h3><br>
		- Added a new layer<br>
		- Added some more stuff to tesseract layer<br>
		<br>
	<h3>v0.0.3</h3><br>
		- Reworked everything<br>
	<h3>
	`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	if (hasUpgrade('l', 11)) gain = gain.times(2)
	if (hasUpgrade('l', 12)) gain = gain.times(upgradeEffect('l', 12))
	if (getBuyableAmount('s', 11).gte(new Decimal(1))) gain = gain.times(buyableEffect('s', 11))

	gain = gain.times(tmp['mini1'].effect);
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	"Current Endgame: 2 Cubes"
]

// Determines when the game "ends"
function isEndgame() {
	return false //player.points.gte(new Decimal("e280000000"))
}

// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}