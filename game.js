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
var fileName = "map.txt";
var playerArray = new Array();
var barriers = new Array();

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

Grid.prototype.makeBarrier = function() {
	this.passable = false;
	barriers.push(this);
};

Grid.prototype.removeBarrier = function() {
	this.passable = true;
	barriers.remove(barriers.indexOf(this));
};
	

Grid.prototype.remove = function(toRemove) {
	if (this.bodies.indexOf(toRemove) >= 0) this.bodies.splice(this.bodies.indexOf(toRemove),1);
	this.occupants--;
};

/*
500x500
 * | 0  1  2  3  4  5  6  7  8  9  |
 * | 10 11 12 13 14 15 16 17 18 19 |
 * | 20 21 22 23 24 25 26 27 28 29 |
 * | 30 31 32 33 34 35 36 37 38 39 |
 * | 40 41 42 43 44 45 46 47 48 49 |
 * | 50 51 52 53 54 55 56 57 58 59 |
 * | 60 61 62 63 64 65 66 67 68 69 |
 * | 70 71 72 73 74 75 76 77 78 79 |
 * | 80 81 82 83 84 85 86 87 88 89 |
 * | 90 91 92 93 94 95 96 97 98 99 |
Conversion from INDEX X, INDEX Y to Array Index:
	=> X + Y*10
Conversion from coordinates to INDEX X, INDEX Y
	=> (coord.x/50 , coord.y/50)
So total conversion:
	=> coord.x/50 + coord.y/5
*/

var map = [0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,0,0,0,0,0,0,
	   0,0,1,1,0,0,0,0,0,0,
	   0,0,1,1,0,0,0,0,0,0,
	   0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,0,0,0,0,0,0];

function constructGrid() {
	for (var y = 0; y < canvas.height/game.gridSize; y++) {
		for (var x = 0; x < canvas.width/game.gridSize; x++) {
			gridArray.push(new Grid(x*game.gridSize,y*game.gridSize,game.gridSize, true));
		}
	}
	for (var i = 0; i < gridArray.length; i++) if (map[i]==1) {
		gridArray[i].makeBarrier();
	}
};

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
		//parseMap();
		playerArray.push(new Player(canvas.width/2, canvas.height/2));
		playerArray.push(new Player(canvas.width/4, canvas.height/4));
	},

	updateDebug: function() {
		if (playerArray.length != 0) {
			var player = playerArray[0];	
			game.gameText = "<br>" + "Player X: " + player.posX +
					"<br>" + "Player Y: " + player.posY +
					"<br>" + "Des    X: " + player.currentDesX +
					"<br>" + "Des    Y: " + player.currentDesY +
					"<br>" + "FRAME   : " + game.frame;
			document.getElementById("debug").innerHTML = "GAME RUNNING"+game.gameText;
		}
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
		//document.getElementById("other").innerHTML = "{ " + game.mouseLocation.x +" , " + game.mouseLocation.y + " + { " + game.mouseOrigin.x + ", " + game.mouseOrigin.y + "} -> " + game.drawSelection;	
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
	this.corners = [{x:this.posX-this.size, y:this.posY+this.size},{x:this.posX+this.size,y:this.posY+this.size}, {x:this.posX+this.size,y:this.posY-this.size},{x:this.posX-this.size, y:this.posY-this.size}];
	this.vel = 2;
	this.velX = 0;
	this.velY = 0;
	this.circle = false;
	this.mouse = true;
	this.selected = false;
	this.currentGrid = parseInt(this.posX/50,10) + parseInt(this.posY/50,10)*10;
	this.startGrid = this.currentGrid;
	this.newGrid = "";
	this.angle = 0;
	this.angleSin = 0;
	this.angleCos = 1;
	this.deltaAngle = 0;//Hehehe bad coding.
	this.contactSpace = new Array(); //[gridArray[this.currentGrid]];
	gridArray[this.currentGrid].add(this);
	game.square(this.posX, this.posY, this.size, this.size, "#00FF00");
};

Player.prototype.render = function() {
	context.beginPath();
	context.fillStyle = '#00FF00';
	context.moveTo(this.corners[0].x, this.corners[0].y);
	for(var c = 1; c < this.corners.length; c++) context.lineTo(this.corners[c].x, this.corners[c].y);
	context.closePath();
	context.fill();
	if (this.selected) {
		context.beginPath();
		context.lineWidth = 2;
		context.strokeStyle = '#000000';
		context.moveTo(this.corners[0].x, this.corners[0].y);
		for(var c = 1; c < this.corners.length; c++) context.lineTo(this.corners[c].x, this.corners[c].y);
		context.closePath();
		context.stroke();
	}
};

Player.prototype.turnTowardsDest = function(destAngle) {
	destAngle -= this.angle;
	while(destAngle > Math.PI) destAngle -= Math.PI*2;
	while(destAngle < -Math.PI) destAngle += Math.PI*2;
	if(Math.abs(destAngle) < 0.12){
		this.angle += destAngle;
		this.deltaAngle = destAngle;
	}else{
		if(destAngle > 0){
			this.angle += 0.12;
			this.deltaAngle = 0.12;
		}else{
			this.angle -= 0.12;
			this.deltaAngle = -0.12;
		}
	}
	this.angleSin = Math.sin(this.angle);
	this.angleCos = Math.cos(this.angle);
	if(Math.abs(destAngle)<Math.PI/2) return true;
	else{
		this.updateCorners(); // Usually done after we move, but we ain't movin'...
		if(this.checkContact()){
			this.angle -= this.deltaAngle;
			this.angleSin = Math.sin(this.angle);
			this.angleCos = Math.cos(this.angle);
			this.updateCorners();
		}
		return false;
	}
};

Player.prototype.updateCorners = function() {
	var dx = this.angleCos*this.size;
	var dy = this.angleSin*this.size;
	this.corners = [{x:this.posX-dx-dy, y:this.posY+dx-dy},{x:this.posX+dx-dy,y:this.posY+dx+dy}, {x:this.posX+dx+dy,y:this.posY-dx+dy},{x:this.posX-dx+dy, y:this.posY-dx-dy}];
};

Player.prototype.update = function() {
	this.highlightClose();	
	if (!this.circle) {
		this.render();
		game.circle(this.posX, this.posY, 2, '#FF0000');
	} else game.circle(this.posX, this.posY, this.size/2, '#00FF00');
	if (this.mouse) {
		var deltaX = this.currentDesX - this.posX;
		var deltaY = this.currentDesY - this.posY;
		if((deltaX != 0 || deltaY != 0) && this.turnTowardsDest(Math.atan2(deltaY, deltaX))){//todo: Recalculate direction only when necessary
			var dist = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
			if(dist > this.vel){
				this.velX = this.angleCos*this.vel;
				this.velY = this.angleSin*this.vel;
			}else{
				this.velX = this.angleCos*dist;
				this.velY = this.angleSin*dist;
			}
			this.posX += this.velX;
			this.posY += this.velY;
			this.updateCorners();
			if(this.checkContact()){
				this.posX -= this.velX;
				this.posY -= this.velY;
				this.angle -= this.deltaAngle;
				this.angleSin = Math.sin(this.angle);
				this.angleCos = Math.cos(this.angle);
				this.updateCorners();
			}
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
	this.newGrid = parseInt(this.posX/50,10) + parseInt(this.posY/50,10)*10;
	if (this.newGrid != this.currentGrid) {
		gridArray[this.newGrid].add(this);
		gridArray[this.currentGrid].remove(this);
		this.currentGrid = this.newGrid;
	}
	this.highlightClose();
};

Player.prototype.highlightClose = function() {
	gridArray[this.currentGrid].highlight("#000000");
	var inX = (this.posX%game.gridSize);
	var inY = (this.posY%game.gridSize);
	var yComp = parseInt(this.currentGrid/10,10);
	var xComp = this.currentGrid%10;
	/*
	 * | 7 0 1 |
	 * | 6 H 2 |
	 * | 5 4 3 |
	*/
	var indexArray = [(yComp-1)*10+xComp, (yComp-1)*10+xComp+1, this.currentGrid+1, (yComp+1)*10+xComp+1, (yComp+1)*10+xComp, (yComp+1)*10+xComp-1, this.currentGrid-1, (yComp-1)*10+xComp-1];
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
	var a;
	var b;
	for(var c = 0; c < other.corners.length; c++){
		x = other.corners[c].x - this.posX;
		y = other.corners[c].y - this.posY;
		a = this.angleCos*x + this.angleSin*y;
		b = -this.angleCos*y + this.angleSin*x;
		if(Math.abs(a) < this.size && Math.abs(b) < this.size) return true;
	}
	return false;
}

Array.prototype.remove = function(index) {
	this.splice(index,1);
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
	for (var i = 0; i < barriers.length; i++) {
		game.square(barriers[i].initX, barriers[i].initY, barriers[i].incr, barriers[i].incr, "#000000");
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
					playerArray[x].currentDesX = canvas.relMouseCoord(e).x;
					playerArray[x].currentDesY = canvas.relMouseCoord(e).y;
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
