var canvas = document.getElementById("background");
var context= canvas.getContext("2d");

var keyArray = [0, 0, 0, 0, 0, 0, 0];
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
	//this.adjustedX = this.initX;
	//this.adjustedY = this.initY;
	this.incr = incr;
	this.occupants = 0;
	this.bodies = new Array();
	//This next part is only relevant for unpassable grids
	this.corners = [{x:this.initX, y:this.initY+this.incr},{x:this.initX+this.incr,y:this.initY+this.incr}, {x:this.initX+this.incr,y:this.initY},{x:this.initX, y:this.initX}];
};

Grid.prototype.checkContactSub = function(other){
	var x;
	var y;
	var a;
	var b;
	for(var c = 0; c < other.corners.length; c++){
		x = other.corners[c].x - (this.initX+this.incr/2);
		y = other.corners[c].y - (this.initY+this.incr/2);
		if(Math.abs(x) < (this.incr/2) && Math.abs(y) < (this.incr/2)) return true;
	}
	return false;
}

Grid.prototype.highlight = function(color) {
	context.globalAlpha = 0.2;
	game.square(this.initX-game.topLeftX, this.initY-game.topLeftY, this.incr, this.incr, color);
	//game.square(this.adjustedX, this.adjustedY, this.incr, this.incr, color);
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
	=> X + Y*20
Conversion from coordinates to INDEX X, INDEX Y
	=> (coord.x/50 , coord.y/50)
So total conversion:
	=> coord.x/50 + coord.y/5
*/

var map = [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	   0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

function constructGrid() {
	for (var y = 0; y < game.mapWidth/game.gridSize; y++) {
		for (var x = 0; x < game.mapHeight/game.gridSize; x++) {
			gridArray.push(new Grid(x*game.gridSize,y*game.gridSize,game.gridSize, true));
		}
	}
	for (var i = 0; i < gridArray.length; i++) if (map[i]==1) gridArray[i].makeBarrier();
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
	topLeftX: 0,
	topLeftY: 0,
	mapWidth: 1000,
	mapHeight: 1000,
	gameWidth: 500,
	gameHeight: 500,
	zoomReference: {x:250, y:250},
	unitChangeX: 0,
	unitChangeY: 0,
	//clickStart: 0,
	//clickEnd: 0,
	
	addPlayer: function() {
		var p = new Player(Math.random()*canvas.width, Math.random()*canvas.height);
		p.update();
		while(p.checkContact() || !gridArray[p.currentGrid].passable){
			gridArray[p.currentGrid].remove(p);
			p = new Player(Math.random()*canvas.width, Math.random()*canvas.height);
			p.update();
		}
		playerArray.push(p);
	},
	
	start: function() {
		constructGrid();
		started = true;
		//parseMap();
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
		x1 = x1 + game.topLeftX;
		x2 = x2 + game.topLeftX;
		y1 = y1 + game.topLeftY;
		y2 = y2 + game.topLeftY;
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
		game.unitChangeX = 0;
		game.unitChangeY = 0;
		if (keyArray[5]==1 || keyArray[6]==1) {
			game.unitChangeX = (game.zoomReference.x*0.01)/(game.zoomLevel*(game.zoomLevel+0.01));
			game.unitChangeY = (game.zoomReference.y*0.01)/(game.zoomLevel*(game.zoomLevel+0.01));
			
			game.unitChangeX = Math.round(game.unitChangeX*100)/100;
			game.unitChangeY = Math.round(game.unitChangeY*100)/100;
		}
		
		if (keyArray[1]==1 && (game.topLeftY + game.gameHeight) < game.mapHeight) game.topLeftY+=2;
	    if (keyArray[0]==1 && game.topLeftY > 0) game.topLeftY-=2;
	    if (keyArray[3]==1 && game.topLeftX > 0) game.topLeftX-=2;
	    if (keyArray[2]==1 && (game.topLeftX + game.gameWidth) < game.mapWidth) game.topLeftX+=2;
	    if (keyArray[5]==1 && game.zoomLevel < 10) {
			//Zoom in
			game.zoomLevel += 0.01;
			game.topLeftX += game.unitChangeX;
			game.topLeftY += game.unitChangeY;
		} else if (keyArray[6]==1 && game.zoomLevel > 0) {
			//Zoom out
			game.zoomLevel -= 0.01;
			game.topLeftX -= game.unitChangeX;
			game.topLeftY -= game.unitChangeY;
		}
	    
		maintainZoom(game.unitChangeX, game.unitChangeY);
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
		document.getElementById("coord").innerHTML =  "{ " + game.topLeftX +" , " + game.topLeftY + "}: " + game.zoomLevel;
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
	//this.adjustedX = this.posX;
	//this.adjustedY = this.posY;
	this.tempDesX = posX;
	this.tempDesY = posY;
	this.size = 2+Math.random()*8;
	this.corners = [{x:this.posX-this.size, y:this.posY+this.size},{x:this.posX+this.size,y:this.posY+this.size}, {x:this.posX+this.size,y:this.posY-this.size},{x:this.posX-this.size, y:this.posY-this.size}];
	this.vel = 12/this.size;
	this.velX = 0;
	this.velY = 0;
	this.circle = false;
	this.mouse = true;
	this.selected = false;
	this.currentGrid = parseInt(this.posX/50,10) + parseInt(this.posY/50,10)*20;
//	this.startGrid = this.currentGrid;
	this.newGrid = "";
	this.angle = 0;
	this.angleSin = 0;
	this.angleCos = 1;
	this.deltaAngle = 0;//Hehehe bad coding.
//	this.reverse = false;
	this.contactSpace = new Array(); //[gridArray[this.currentGrid]];
	gridArray[this.currentGrid].add(this);
	game.square(this.posX, this.posY, this.size, this.size, "#00FF00");
};

Player.prototype.render = function() {
	context.beginPath();
	context.fillStyle = '#00FF00';
	context.moveTo(this.corners[0].x-game.topLeftX, this.corners[0].y-game.topLeftY);
	for(var c = 1; c < this.corners.length; c++) context.lineTo(this.corners[c].x-game.topLeftX, this.corners[c].y-game.topLeftY);
	context.closePath();
	context.fill();
	if (this.selected) {
		context.beginPath();
		context.lineWidth = 2;
		context.strokeStyle = '#000000';
		context.moveTo(this.corners[0].x-game.topLeftX, this.corners[0].y-game.topLeftY);
		for(var c = 1; c < this.corners.length; c++) context.lineTo(this.corners[c].x-game.topLeftX, this.corners[c].y-game.topLeftY);
		context.closePath();
		context.stroke();
	}
};

Player.prototype.turn = function(angle){
	this.angle += angle;
	while(this.angle > Math.PI*2) this.angle -= Math.PI*2;
	while(this.angle < -Math.PI*2) this.angle += Math.PI*2;
	this.angleCos = Math.cos(this.angle);
	this.angleSin = Math.sin(this.angle);
}

Player.prototype.turnTowardsDest = function(destAngle) {
	destAngle -= this.angle;
	while(destAngle > Math.PI) destAngle -= Math.PI*2;
	while(destAngle < -Math.PI) destAngle += Math.PI*2;
	if(Math.abs(destAngle) < 0.12){
		this.turn(destAngle);
		this.deltaAngle = destAngle;
	}else{
		if(destAngle > 0){
			this.turn(0.12);
			this.deltaAngle = 0.12;
		}else{
			this.turn(-0.12);
			this.deltaAngle = -0.12;
		}
	}
	return Math.abs(destAngle)<Math.PI/2;
};

Player.prototype.updateCorners = function() {
	var dx = this.angleCos*this.size;
	var dy = this.angleSin*this.size;
	this.corners = [{x:this.posX-dx-dy, y:this.posY+dx-dy},{x:this.posX+dx-dy,y:this.posY+dx+dy}, {x:this.posX+dx+dy,y:this.posY-dx+dy},{x:this.posX-dx+dy, y:this.posY-dx-dy}];
};

Player.prototype.update = function() {
	this.newGrid = parseInt((this.posX)/50,10) + parseInt((this.posY)/50,10)*20;
	if (this.newGrid != this.currentGrid) {
		gridArray[this.newGrid].add(this);
		gridArray[this.currentGrid].remove(this);
		this.currentGrid = this.newGrid;
	}
	this.highlightClose();	
	//if (!this.circle) {
		this.render();
		game.circle(this.posX-game.topLeftX+game.unitChangeX, this.posY-game.topLeftY+game.unitChangeY, 2*game.zoomLevel, '#FF0000');
	//} else game.circle(this.posX, this.posY, this.size/2, '#00FF00');
	
	if (this.mouse) {
/*		if(this.confused){
			this.turn(this.deltaAngle);
			var vel = this.reverse?-this.vel/2:this.vel/2;
			this.velX = this.angleCos*vel;
			this.velY = this.angleSin*vel;
			this.posX += this.velX;
			this.posY += this.velY;
			this.updateCorners();
			if(this.checkContact()){
				this.posX -= this.velX;
				this.posY -= this.velY;
				this.turn(-this.deltaAngle);
				this.updateCorners();
				this.deltaAngle = 0;
			}
			this.confused--;
		}else{*/
			var deltaX = this.tempDesX - this.posX;
			var deltaY = this.tempDesY - this.posY;
			if(Math.abs(deltaX)>this.size || Math.abs(deltaY)>this.size){//todo: Recalculate direction only when necessary
				var dist = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
				var vel = dist > this.vel ? this.vel : dist*dist/this.vel;
				if(!this.turnTowardsDest(Math.atan2(deltaY, deltaX))) vel = -vel;
				this.velX = this.angleCos*vel;
				this.velY = this.angleSin*vel;
				this.posX += this.velX;
				this.posY += this.velY;
				this.updateCorners();
				if(this.checkContact()){
					this.posX -= this.velX;
					this.posY -= this.velY;
					this.turn(-this.deltaAngle);
					//this.deltaAngle = this.deltaAngle>0 ? -0.12 : 0.12;
					this.updateCorners();
					//this.reverse = vel>0;
					if(this.tempDesX != this.currentDesX || this.tempDesY != this.currentDesY){
						this.tempDesX = this.currentDesX;
						this.tempDesY = this.currentDesY;
					}else{
						this.tempDesX = this.posX + Math.random()*6*this.size-3*this.size;
						this.tempDesY = this.posY + Math.random()*6*this.size-3*this.size;
					}
				}
			}else if(this.tempDesX != this.currentDesX || this.tempDesY != this.currentDesY){
				this.tempDesY = this.currentDesY;
				this.tempDesX = this.currentDesX;
			}
		//}
	} else {
		/*if (keyArray[0]==1) this.posY--;
		if (keyArray[1]==1) this.posY++;
		if (keyArray[2]==1) this.posX++;
		if (keyArray[3]==1) this.posX--;*/
	}
	
	if (keyArray[4]==1) {
		this.mouse = !this.mouse;
		keyArray[4]=0;
	}
};

Player.prototype.highlightClose = function() {
	gridArray[this.currentGrid].highlight("#000000");
	var inX = (this.posX%game.gridSize);
	var inY = (this.posY%game.gridSize);
	var yComp = parseInt(this.currentGrid/20,10);
	var xComp = this.currentGrid%20;
	/*
	 * | 7 0 1 |
	 * | 6 H 2 |
	 * | 5 4 3 |
	*/
	var indexArray = [(yComp-1)*20+xComp, (yComp-1)*20+xComp+1, this.currentGrid+1, (yComp+1)*20+xComp+1, (yComp+1)*20+xComp, (yComp+1)*20+xComp-1, this.currentGrid-1, (yComp-1)*20+xComp-1];
	var i = 0;
	var j = 0;
	var k = 0;

	if (inX >= 25 && inY >= 25) {
		i = 2;
		j = 3;
		k = 4;
		if (indexArray[i] > -1 && indexArray[i] < 400) gridArray[indexArray[i]].highlight("#ff0000");
		if (indexArray[j] > -1 && indexArray[j] < 400) gridArray[indexArray[j]].highlight("#ff0000");
		if (indexArray[k] > -1 && indexArray[k] < 400) gridArray[indexArray[k]].highlight("#ff0000");
	} else if (inX >= 25 && inY < 25) {
		i = 0;
		j = 1;
		k = 2;
		if (indexArray[i] > -1 && indexArray[i] < 400) gridArray[indexArray[i]].highlight("#ff0000");
		if (indexArray[j] > -1 && indexArray[j] < 400) gridArray[indexArray[j]].highlight("#ff0000");
		if (indexArray[k] > -1 && indexArray[k] < 400) gridArray[indexArray[k]].highlight("#ff0000");
	} else if (inX < 25 && inY >= 25) {
		i = 6;
		j = 5;
		k = 4;
		if (indexArray[i] > -1 && indexArray[i] < 400) gridArray[indexArray[i]].highlight("#ff0000");
		if (indexArray[j] > -1 && indexArray[j] < 400) gridArray[indexArray[j]].highlight("#ff0000");
		if (indexArray[k] > -1 && indexArray[k] < 400) gridArray[indexArray[k]].highlight("#ff0000");
	} else if (inX < 25 && inY < 25) {
		i = 0;
		j = 7;
		k = 6;
		if (indexArray[i] > -1 && indexArray[i] < 400) gridArray[indexArray[i]].highlight("#ff0000");
		if (indexArray[j] > -1 && indexArray[j] < 400) gridArray[indexArray[j]].highlight("#ff0000");
		if (indexArray[k] > -1 && indexArray[k] < 400) gridArray[indexArray[k]].highlight("#ff0000");
	}
	while (this.contactSpace.length > 0) this.contactSpace.pop();
	this.contactSpace.push(this.newGrid);
	if(gridArray[indexArray[i]])
		this.contactSpace.push(indexArray[i]);
	if(gridArray[indexArray[j]])
		this.contactSpace.push(indexArray[j]);
	if(gridArray[indexArray[k]])
		this.contactSpace.push(indexArray[k]);
};

Player.prototype.checkContact = function() {
	var check = false;
	var string = "";
	var contactBodies = new Array();
	for (var x = 0; x < this.contactSpace.length; x++) {
		var c = this.contactSpace[x];
		if (c == this.currentGrid && gridArray[c].passable == true) {
			for (var i = 0; i < gridArray[c].bodies.length; i++) {
				if (gridArray[c].bodies[i] != this) {
					check = true;
					contactBodies.push(gridArray[c].bodies[i]);
				}
			}
		} else if (c != this.currentGrid && gridArray[c].passable == true){
			for (var i = 0; i < gridArray[c].bodies.length; i++) {
				check = true;
				contactBodies.push(gridArray[c].bodies[i]);
			}
		} else if (c != this.currentGrid && gridArray[c].passable == false){
			check = true;
			/* 
				This is bad. But it should work.
				I'm adding a grid to an array that usually
				only contains players
			*/
			contactBodies.push(gridArray[c]);
		}
		string += this.contactSpace[x] + ": " + gridArray[c].occupants + ", ";
	}
	//if (this.startGrid == 55) document.getElementById("coord").innerHTML = string;
	var x;
	var y;
	this.circle = check;
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
function maintainZoom(changeX, changeY) {
	game.circle(250, 250, 2, '#FF0000');
	
	var newWinSize = game.windowSize * game.zoomLevel;
	var modifiedStartX = game.topLeftX - game.gridSize*Math.floor(game.topLeftX/game.gridSize);
	var modifiedStartY = game.topLeftY - game.gridSize*Math.floor(game.topLeftY/game.gridSize);
	if (changeY != 0) document.getElementById("moredebug").innerHTML = "";
	//alert(modifiedStartX);
	for (var i = 0; i < canvas.width+game.gridSize; i += game.gridSize*game.zoomLevel) {
		//Calculate Zoom Displacement
		var zoomAdditionY = 0;
		var zoomAdditionX = 0;
		if (i-modifiedStartY < game.zoomReference.y) zoomAdditionY = -1*changeY;
		else if (i-modifiedStartY > game.zoomReference.y) zoomAdditionY = changeY;
		//else if (i-modifiedStartY+changeY == game.zoomReference.y) alert("TEST");
		
		if (i-modifiedStartX < game.zoomReference.x) zoomAdditionX = -1*changeX;
		else if (i-modifiedStartX > game.zoomReference.x) zoomAdditionX = changeX;
		
		context.beginPath();
		context.moveTo(0,i-modifiedStartY+zoomAdditionY);
		context.lineTo(canvas.width, i-modifiedStartY+zoomAdditionY);
		context.stroke();
		context.beginPath();
		context.moveTo(i-modifiedStartX+zoomAdditionX,0);
		context.lineTo(i-modifiedStartX+zoomAdditionX, canvas.width);
		context.stroke();
		if (zoomAdditionY != 0) {
			document.getElementById("moredebug").innerHTML += i + ": " + zoomAdditionX + ", " + zoomAdditionY + " !! " + modifiedStartX + ", " + modifiedStartY + "<br/>";
			document.getElementById("moredebug").innerHTML += i + ": " + (i-modifiedStartY) + ", " + (i-modifiedStartX) + "<br/>";
		}
	}
	for (var i = 0; i < barriers.length; i++) {
		game.square(barriers[i].initX-game.topLeftX, barriers[i].initY-game.topLeftY, barriers[i].incr, barriers[i].incr, "#000000");
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
					//document.getElementById("coord").innerHTML = canvas.relMouseCoord(e).x;
					playerArray[x].currentDesX = canvas.relMouseCoord(e).x+game.topLeftX;
					playerArray[x].currentDesY = canvas.relMouseCoord(e).y+game.topLeftY;
					playerArray[x].tempDesX = canvas.relMouseCoord(e).x+game.topLeftX;
					playerArray[x].tempDesY = canvas.relMouseCoord(e).y+game.topLeftY;
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

	if(e.keyCode == 32 && game.started) game.addPlayer();

	if (e.keyCode == 87) keyArray[0]=1;		//W
	else if (e.keyCode == 83) keyArray[1]=1;	//S
	else if (e.keyCode == 68) keyArray[2]=1;	//D
	else if (e.keyCode == 65) keyArray[3]=1;	//A
	else if (e.keyCode == 49) keyArray[4]=1;	//1
	else if (e.keyCode == 81) keyArray[5]=1;    //Q (Zoom in)
	else if (e.keyCode == 69) keyArray[6]=1;    //E (Zoom out)
};
function processKeyUp(e) {
	if (e.keyCode == 87) keyArray[0]=0;
	else if (e.keyCode == 83) keyArray[1]=0;
	else if (e.keyCode == 68) keyArray[2]=0;
	else if (e.keyCode == 65) keyArray[3]=0; 
	else if (e.keyCode == 81) keyArray[5]=0;    //Q (Zoom in)
	else if (e.keyCode == 69) keyArray[6]=0;    //E (Zoom out)
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
/*game.start();
game.started = true;*/
game.update();
