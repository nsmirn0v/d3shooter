var FIRE	= 32;

var LEFT	= 37;
var RIGHT	= 39;
var UP		= 38;
var DOWN	= 40;

var A		= 65;
var D		= 68;
var W		= 87;
var S		= 83;

var STEP	= 10;
var R_STEP	= 30;

var ANGLE_CONVERSION = {
	0:		90,
	30:		60,
	60:		30,
	90:		0,
	120:	330,
	150:	300,
	180:	270,
	210:	240,
	240:	210,
	270:	180,
	300:	150,
	330:	120
};

var ANGLES = {
	0:		0,
	30:		Math.PI / 6,
	60:		Math.PI / 3,
	90:		Math.PI / 2,
	120:	2 * Math.PI / 3,
	150:	5 * Math.PI / 6,
	180:	Math.PI,
	210:	7 * Math.PI / 6,
	240:	4 * Math.PI / 3,
	270:	3 * Math.PI / 2,
	300:	5 * Math.PI / 3,
	330:	11 * Math.PI / 6
};

var ENEMIES = [{
	scale: 1.5,
	lives: 50,
	className: 'marine'
}, {
	scale: 2,
	lives: 70,
	className: 'purple'
}, {
	scale: 2.5,
	lives: 100,
	className: 'blue'
}];