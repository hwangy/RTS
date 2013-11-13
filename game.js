var canvas = document.getElementById("background");
var context= canvas.getContext("2d");

var keyArray = [0, 0, 0, 0, 0];
var gridArray = new Array();
/*
	Where 0 = 87/W
	Where 1 = 83/S
	Where 2 = 68/D
	Where 3 = 65/A
	Where 4 = 49/1
*/
var playerArray = new Array();

function Grid(initX,initY,incr, passable) {
	this.passable = passable
	this.initX = initX;
	this.initY = initY;
	this.finalX = initX + incr;
	this.finalY = initY + incr;
	this.incr = incr;
	this.occupants = 0;
	this.bodies = new Array();
};

Grid.prototype.highlight = function(color) {
	context.globalAlpha = 0.2;
	game.square(this.initX, this.initY, this.incr, this.incr, color);
	context.globalAlpha = 1;
};

Grid.prototype.add = function(toAdd) {
	if (this.bodies.indexOf(toAdd) < 0) this.bodies.push(toAdd);
	this.occupants++;
};

Grid.prototype.remove = function(toRemove) {
	if (this.bodies.indexOf(toRemove) >= 0) this.bodies.splice(this.bodies.indexOf(toRemove),1);
	this.occupants--;
};

/*
500x500
 * | 0  10 20 30 40 50 60 70 80 90 |
 * | 1  11 21 31 41 51 61 71 81 91 |
 * | 2  12 22 32 42 52 62 72 82 92 |
 * | 3  13 23 33 43 53 63 73 83 93 |
 * | 4  14 24 34 44 54 64 74 84 94 |
 * | 5  15 25 35 45 55 65 75 85 95 |
 * | 6  16 26 36 46 56 66 76 86 96 |
 * | 7  17 27 37 47 57 67 77 87 97 |
 * | 8  18 28 38 48 58 68 78 88 98 | 
 * | 9  19 29 39 49 59 69 79 89 99 |
Conversion from INDEX X, INDEX Y to Array Index:
	=> X*10 + Y
Conversion from coordinates to INDEX X, INDEX Y
	=> (coord.x/50 , coord.y/50)
So total conversion:
	=> coord.x/5 + coord.y/50
*/
function constructGrid() {
	for (var x = 0; x < canvas.width/game.gridSize; x++) {
		for (var y = 0; y < canvas.height/game.gridSize; y++) {
			gridArray.push(new Grid(x*game.gridSize,y*game.gridSize,game.gridSize));
		}
	}
}

game = {
	windowSize: canvas.width,
	gridSize: 50,
	zoomLevel: 1,	
	drawSelection: false,
	mouseOrigin: {x:-100, y:-100},
	mouseLocation: {x:0, y:0},
	gameText: "",
	fps: 60,
	started: false,
	frame: 0,
	//clickStart: 0,
	//clickEnd: 0,
	
	start: function() {
		started = true;
		constructGrid();
		playerArray.push(new Player(canvas.width/2, canvas.height/2));
		playerArray.push(new Player(canvas.width/4, canvas.height/4));
	},

	updateDebug: function() {
		player = playerArray[0];	
		game.gameText = "<br>" + "Player X: " + player.posX +
				"<br>" + "Player Y: " + player.posY +
				"<br>" + "Des    X: " + player.currentDesX +
				"<br>" + "Des    Y: " + player.currentDesY +
				"<br>" + "FRAME   : " + game.frame;
		document.getElementById("debug").innerHTML = "GAME RUNNING"+game.gameText;
	},

	square: function(x, y, width, height, color) {
		context.beginPath();
		context.fillStyle = color;
		context.fillRect(x,y, width, height);
	},

	circle: function(x, y, radius, color) {
		//game.clear();
		context.beginPath();
		context.fillStyle = color;
		context.arc(x,y,radius, 0,2*Math.PI, false);
		context.fill();
	},

	clear: function() {		
		game.square(0,0,canvas.width, canvas.width, "#FFFFFF");
		context.rect(0,0,canvas.width, canvas.width);
		context.lineWidth = 2;
		context.strokeStyle = '#000000';
		context.stroke();
	},

	selectUnits: function(sCoord, eCoord) {
		var x1;
		var y1;
		var x2;
		var y2;
		if (sCoord.x > eCoord.x) {
			x1 = eCoord.x;
			x2 = sCoord.x
		}else{
			x2 = eCoord.x;
			x1 = sCoord.x;
		}
		if (sCoord.y > eCoord.y) {
			y1 = eCoord.y;
			y2 = sCoord.y
		}else{
			y2 = eCoord.y;
			y1 = sCoord.y;
		}
		for (var i = 0; i < playerArray.length; i++) {
			if ((playerArray[i].posX >= x1 && playerArray[i].posX + playerArray[i].size < x2) && (playerArray[i].posY >= y1 && playerArray[i].posY + playerArray[i].size < y2)) {
				playerArray[i].selected = true;
			} else {
				playerArray[i].selected = false;
			}
		}
	},

	update: function() {
		game.clear();
		maintainZoom();
		if (game.drawSelection) {
			context.globalAlpha = 0.1;
			var deltaX = game.mouseLocation.x - game.mouseOrigin.x;
			var deltaY = game.mouseLocation.y - game.mouseOrigin.y;
			game.square(game.mouseOrigin.x, game.mouseOrigin.y, deltaX, deltaY, "#000000");
			context.globalAlpha = 1;
		}
		for (var i =0; i<playerArray.length; i++) {
			playerArray[i].update();
		}
		if (game.mouseOrigin.x != -100 && game.mouseOrigin.y != -100) {
			var time = new Date().getTime();
			if (time - game.clickStart > 250 || (game.mouseLocation.x-game.mouseOrigin.x)*(game.mouseLocation.y-game.mouseOrigin.y)>500) game.selectUnits(game.mouseOrigin, game.mouseLocation);
		}
		game.updateDebug();
		document.getElementById("other").innerHTML = "{ " + game.mouseLocation.x +" , " + game.mouseLocation.y + " + { " + game.mouseOrigin.x + ", " + game.mouseOrigin.y + "} -> " + game.drawSelection;	
		game.frame++;
		setTimeout(game.update, 1000/game.fps);
	}
		
};

function Player(posX, posY) {
	this.currentDesX = posX;
	this.currentDesY = posY;
	this.posX = this.currentDesX;
	this.posY = this.currentDesY;
	this.size = 15;
	this.corners = [{x:this.posX, y:this.posY},{x:this.posX+this.size,y:this.posY}, {x:this.posX+this.size,y:this.posY+this.size},{x:this.posX, y:this.posY+this.size}];
	this.vel = 2;
	this.velX = 0;
	this.velY = 0;
	this.circle = false;
	this.mouse = true;
	this.selected = false;
	this.currentGrid = parseInt((this.posX+this.size/2)/50,10)*10 + parseInt((this.posY+this.size/2)/50,10);
	this.startGrid = this.currentGrid;
	this.newGrid = "";
	this.contactSpace = new Array(); //[gridArray[this.currentGrid]];
	gridArray[this.currentGrid].add(this);
	game.square(this.posX, this.posY, this.size, this.size, "#00FF00");
};

Player.prototype.update = function() {
	this.highlightClose();	
	if (!this.circle) {
		game.square(this.posX, this.posY, this.size, this.size, '#00FF00');
		if (this.selected) {
			context.rect(this.posX, this.posY, this.size, this.size);
			context.lineWidth = 2;
			context.strokeStyle = '#000000';
			context.stroke();
		}
		game.circle(this.posX+this.size/2, this.posY+this.size/2, 2, '#FF0000');
	} else game.circle(this.posX, this.posY, this.size/2, '#00FF00');
	if (this.mouse) {
		var deltaX = this.currentDesX - this.posX;
		var deltaY = this.currentDesY - this.posY;
		if(deltaX != 0 || deltaY != 0){//todo: Recalculate direction only when necessary
			var dist = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
			if(dist > this.vel){
				this.velX = deltaX/dist*this.vel;
				this.velY = deltaY/dist*this.vel;
			}else{
				this.velX = deltaX;
				this.velY = deltaY;
			}
			this.posX += this.velX;
			this.posY += this.velY;
			if(this.checkContact()){
				this.posX -= this.velX;
				this.posY -= this.velY;
			}else this.corners = [{x:this.posX, y:this.posY},{x:this.posX+this.size,y:this.posY}, {x:this.posX+this.size,y:this.posY+this.size},{x:this.posX, y:this.posY+this.size}];
		}
	} else {
		if (keyArray[0]==1) this.posY--;
		if (keyArray[1]==1) this.posY++;
		if (keyArray[2]==1) this.posX++;
		if (keyArray[3]==1) this.posX--;
	}
	
	if (keyArray[4]==1) {
		this.mouse = !this.mouse;
		keyArray[4]=0;
	}
	this.newGrid = parseInt((this.posX+this.size/2)/50,10)*10 + parseInt((this.posY+this.size/2)/50,10);
	if (this.newGrid != this.currentGrid) {
		gridArray[this.newGrid].add(this);
		gridArray[this.currentGrid].remove(this);
		this.currentGrid = this.newGrid;
	}
	this.highlightClose();
};

Player.prototype.highlightClose = function() {
	gridArray[this.currentGrid].highlight("#000000");
	var inX = ((this.posX+this.size/2)%game.gridSize);
	var inY = ((this.posY+this.size/2)%game.gridSize);
	var yComp = this.currentGrid%10;
	var xComp = parseInt(this.currentGrid/10,10);
	/*
	 * | 7 0 1 |
	 * | 6 H 2 |
	 * | 5 4 3 |
	*/
	var indexArray = [this.currentGrid-1, (xComp+1)*10+(yComp-1), (xComp+1)*10+yComp, (xComp+1)*10+yComp+1, this.currentGrid+1, (xComp-1)*10+yComp+1, (xComp-1)*10+yComp, (xComp-1)*10+(yComp-1)];
	var i = 0;
	var j = 0;
	var k = 0;

	if (inX >= 25 && inY >= 25) {
		i = 2;
		j = 3;
		k = 4;
		if (indexArray[i] > -1 && indexArray[i] < 100) gridArray[indexArray[i]].highlight("#ff0000");
		if (indexArray[j] > -1 && indexArray[j] < 100) gridArray[indexArray[j]].highlight("#ff0000");
		if (indexArray[k] > -1 && indexArray[k] < 100) gridArray[indexArray[k]].highlight("#ff0000");
	} else if (inX >= 25 && inY < 25) {
		i = 0;
		j = 1;
		k = 2;
		if (indexArray[i] > -1 && indexArray[i] < 100) gridArray[indexArray[i]].highlight("#ff0000");
		if (indexArray[j] > -1 && indexArray[j] < 100) gridArray[indexArray[j]].highlight("#ff0000");
		if (indexArray[k] > -1 && indexArray[k] < 100) gridArray[indexArray[k]].highlight("#ff0000");
	} else if (inX < 25 && inY >= 25) {
		i = 6;
		j = 5;
		k = 4;
		if (indexArray[i] > -1 && indexArray[i] < 100) gridArray[indexArray[i]].highlight("#ff0000");
		if (indexArray[j] > -1 && indexArray[j] < 100) gridArray[indexArray[j]].highlight("#ff0000");
		if (indexArray[k] > -1 && indexArray[k] < 100) gridArray[indexArray[k]].highlight("#ff0000");
	} else if (inX < 25 && inY < 25) {
		i = 0;
		j = 7;
		k = 6;
		if (indexArray[i] > -1 && indexArray[i] < 100) gridArray[indexArray[i]].highlight("#ff0000");
		if (indexArray[j] > -1 && indexArray[j] < 100) gridArray[indexArray[j]].highlight("#ff0000");
		if (indexArray[k] > -1 && indexArray[k] < 100) gridArray[indexArray[k]].highlight("#ff0000");
	}
	//if (this.newGrid != this.currentGrid || this.newGrid == this.startGrid) {
		while (this.contactSpace.length > 0) this.contactSpace.pop();
		this.contactSpace.push(this.newGrid);
		this.contactSpace.push(indexArray[i]);
		this.contactSpace.push(indexArray[j]);
		this.contactSpace.push(indexArray[k]);
	//}
};

Player.prototype.checkContact = function() {
	var check = false;
	var string = "";
	var contactBodies = new Array();
	for (var x = 0; x < this.contactSpace.length; x++) {

		var c = this.contactSpace[x];
		if (c == this.currentGrid) {
			for (var i = 0; i < gridArray[c].bodies.length; i++) {
				if (gridArray[c].bodies[i] != this) {
					check = true;
					contactBodies.push(gridArray[c].bodies[i]);
				}
			}
		} else {
			for (var i = 0; i < gridArray[c].bodies.length; i++) {
				check = true;
				contactBodies.push(gridArray[c].bodies[i]);
			}
		}
		string += this.contactSpace[x] + ": " + gridArray[c].occupants + ", ";
	}
	if (this.startGrid == 55) document.getElementById("coord").innerHTML = string;
	var x;
	var y;
	//this.circle = check;
	if (check) {
		for (var i = 0; i < contactBodies.length; i++) {
			if(this.checkContactSub(contactBodies[i]) || contactBodies[i].checkContactSub(this)) return true;
		}
	}
	return false;
};

Player.prototype.checkContactSub = function(other){
	var x;
	var y;
	for(var c = 0; c < other.corners.length; c++){
		x = other.corners[c].x - this.posX - this.size/2;
		y = other.corners[c].y - this.posY - this.size/2;
		if(Math.abs(x) < this.size/2 && Math.abs(y) < this.size/2) return true;
	}
}

Array.prototype.remove = function(index) {
	var newArray = this.slice(0, index);
	var newArray2 = this.slice(index+1, this.length);
	return newArray.concat(newArray2);	
};

/*
 * Intended to be for keeping zoom levels, but
 * it just ended up being for creating the grids for 
 * contact listening. Huh. Should probably do zoom too eventually.
 */
function maintainZoom() {
	var newWinSize = game.windowSize * game.zoomLevel;
	for (var i = 0; i < canvas.width; i += game.gridSize) {
		context.beginPath();
		context.moveTo(0,i);
		context.lineTo(canvas.width, i);
		context.stroke();
		context.beginPath();
		context.moveTo(i, 0);
		context.lineTo(i, canvas.width);
		context.stroke();
	}
};

function processMouse(e) {
	if (e.button == 0) {
		document.getElementById("other").innerHTML = "START";
		game.clickStart = new Date().getTime();
		game.drawSelection = true;
		if (game.mouseOrigin.x == -100 && game.mouseOrigin.y == -100) { 
			/*game.mouseOrigin.x = e.layerX;
			game.mouseOrigin.y = e.layerY;*/
			game.mouseOrigin.x = canvas.relMouseCoord(e).x;
			game.mouseOrigin.y = canvas.relMouseCoord(e).y;
		}
	} else if (e.button == 2) {
		for (var x = 0; x < playerArray.length; x++) playerArray[x].selected = false;
	}
};

function endProcessMouse(e) {
	if (e.button == 0) {
		game.clickEnd = new Date().getTime(); 
		if (game.clickEnd - game.clickStart >= 250 && !(game.mouseLocation.x-game.mouseOrigin.x)*(game.mouseLocation.y-game.mouseOrigin.y)<=500) for (var x = 0; x < playerArray.length; x++) playerArray[x].selected = false;
		game.drawSelection = false;
		if (game.clickEnd - game.clickStart < 250 && (game.mouseLocation.x-game.mouseOrigin.x)*(game.mouseLocation.y-game.mouseOrigin.y)<=500) {
			for (var x = 0; x < playerArray.length; x++) {
				if (playerArray[x].selected) {
					playerArray[x].currentDesX = canvas.relMouseCoord(e).x-playerArray[x].size/2;
					playerArray[x].currentDesY = canvas.relMouseCoord(e).y-playerArray[x].size/2;
				}
			}
		} else {
			game.selectUnits(game.mouseOrigin, game.mouseLocation);
		}
			
		game.mouseOrigin.x = -100;
		game.mouseOrigin.y = -100;
	}
};

function updateLocation(e) {
	/*game.mouseLocation.x = e.layerX;
	game.mouseLocation.y = e.layerY;*/
	game.mouseLocation.x = canvas.relMouseCoord(e).x;
	game.mouseLocation.y = canvas.relMouseCoord(e).y;
};

function processKey(e) {
	if (e.keyCode == 13 && game.started == false) {
		game.start();
		game.started = true;
		game.update();
	}

	if (e.keyCode == 87) keyArray[0]=1;
	else if (e.keyCode == 83) keyArray[1]=1;
	else if (e.keyCode == 68) keyArray[2]=1;
	else if (e.keyCode == 65) keyArray[3]=1;
	else if (e.keyCode == 49) keyArray[4]=1;
};
function processKeyUp(e) {
	if (e.keyCode == 87) keyArray[0]=0;
	else if (e.keyCode == 83) keyArray[1]=0;
	else if (e.keyCode == 68) keyArray[2]=0;
	else if (e.keyCode == 65) keyArray[3]=0; 
};

function relMouseCoord(e) {
	var totalOffsetX = 0;
	var totalOffsetY = 0;
	var canvasX = 0;
	var canvasY = 0;
	var currentElement = this;
	
	while (currentElement = currentElement.offsetParent) {
		totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
		totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
	}
	
	canvasX = e.pageX - totalOffsetX;
	canvasY = e.pageY - totalOffsetY;
	return {x:canvasX, y:canvasY};
};
HTMLCanvasElement.prototype.relMouseCoord = relMouseCoord;

//this.canvas.addEventListener('click', this.directTarget, false);
this.canvas.addEventListener('mousedown', this.processMouse, false);
this.canvas.addEventListener('mouseup', this.endProcessMouse, false);
this.canvas.addEventListener('mousemove', this.updateLocation, false);
addEventListener('keydown', this.processKey, false);

addEventListener('keyup', this.processKeyUp, false);
game.update();
