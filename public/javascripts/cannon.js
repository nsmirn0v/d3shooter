var Cannon = function (params) {
	var scope = this;

	scope.shooter = params.shooter;
	scope.canvas = scope.shooter.canvas;
	scope.game = scope.shooter.game;
	scope.width = scope.shooter.width;
	scope.height = scope.shooter.height;

	scope.initCannon = function () {
		scope.dx = scope.width / 2;
		scope.dy = scope.height / 2;
		scope.dr = 0;

		scope.rocketId = 1;

		d3.xml('/images/plane.svg', function (xml) {
			var plane,
				bbox;

			plane = d3.select(xml.documentElement).select('#Page-1');
			
			plane = scope.canvas.node()
				.appendChild(plane.node());

			scope.plane = d3.select(plane);
			scope.plane.attr('transform', scope.updatePos());

			bbox = scope.plane.select("#planebody").node().getBBox();

			scope.plane.select("#plane")
				.attr("transform", "translate(" +
					[-bbox.width / 2, -bbox.height / 2] + ")");
		});
	};

	scope.initMouse = function () {
		scope.canvas.on("mousemove", scope.mousemove);
	};

	scope.mousemove = function () {
		var mouse = d3.mouse(this);

		var x,y;

		if (mouse[0] >= scope.dx && mouse[1] <= scope.dy) {
			// 1st quadrant
			x = mouse[0] - scope.dx;
			y = scope.dy - mouse[1];

			scope.quadrant = 1;
			scope.dr = Math.atan(x/y) * 180/Math.PI;
		} else if (mouse[0] < scope.dx && mouse[1] <= scope.dy) {
			// 2nd quadrant
			x = scope.dx - mouse[0];
			y = scope.dy - mouse[1];

			scope.quadrant = 2;
			scope.dr = Math.atan(y/x) * 180/Math.PI + 270;
		} else if (mouse[0] < scope.dx && mouse[1] > scope.dy) {
			// 3nd quadrant
			x = scope.dx - mouse[0];
			y = mouse[1] - scope.dy;

			scope.quadrant = 3;
			scope.dr = Math.atan(x/y) * 180/Math.PI + 180;
		} else {
			// 4nd quadrant
			x = mouse[0] - scope.dx;
			y = mouse[1] - scope.dy;

			scope.quadrant = 4;
			scope.dr = Math.atan(y/x) * 180/Math.PI + 90;
		}

		scope.updatePos();
	};

	/* Hotkeys */
	scope.initHotkeys = function () {
		d3.select("body")
			.on("keydown", scope.keyup);

		d3.select(".main")
			.on("click", scope.fire)
	};

	scope.keyup = function () {
		var event = d3.event,
			code = event.keyCode;

		if (code === LEFT || code === A) {
			event.preventDefault();
			scope.left();
		} else if (code === RIGHT || code === D) {
			event.preventDefault();
			scope.right();
		} else if (code === UP || code === W) {
			event.preventDefault();
			scope.up();
		} else if (code === DOWN || code === S) {
			event.preventDefault();
			scope.down();
		}
	};

	/* Movement + fire */
	scope.fire = function () {
		var mouse,
			rocket,
			clientRect,
			angle,
			dx,
			dy,
			coord;

		mouse = d3.mouse(this);
		coord = scope.warheadCoord();

		scope.canvas.append("circle")
			.attr("r", 10)
			.attr("cx", mouse[0])
			.attr("cy", mouse[1])
			.style("fill", "none")
			.style("stroke", "red")
			.style("stroke-width", 1)
				.transition()
				.duration(700)
					.attr("r", 20)
					.style("stroke-width", 3)
					.style("opacity", 0)
					.remove();

		rocket = scope.plane.select("#rocket-" + scope.rocketId)
			.style("opacity", 0)
			.transition()
			.duration(0)
			.delay(1000)
				.style("opacity", 1);

		scope.rocketId++;
		if (scope.rocketId === 5) {
			scope.rocketId = 1;
		}

		clientRect = rocket.select(".rocket-body").node().getBoundingClientRect();
		angle = scope.convertAngle();
		dx = clientRect.height * Math.cos(angle);
		dy = clientRect.height * Math.sin(angle);

		rocket = scope.game.node()
			.appendChild(rocket.node().cloneNode(true));

		rocket = d3.select(rocket)
			.classed('active', true)
			.style("opacity", 1)

		rocket
			.attr("transform", "translate(" +
				[clientRect.left, clientRect.top] + ") " +
				"rotate(" + [scope.dr, clientRect.width/2, clientRect.height/2] + ")")
			.transition()
			.duration(300)
				.attr("transform", "translate(" + [clientRect.left + dx , clientRect.top - dy] + ")" +
					"rotate(" + [scope.dr, clientRect.width/2, clientRect.height/2] + ")")

		rocket
			.transition()
			.delay(250)
			.duration(coord.speed)
				.ease("quad")
				.attr("transform", "translate(" + [coord.end[0] - clientRect.width/2 , coord.end[1] - clientRect.height/2] + ")" +
					"rotate(" + [scope.dr, clientRect.width/2, clientRect.height/2] + ")")
				.remove();


		rocket.select("#exhaust")
				.transition()
				.delay(250)
				.duration(200)
					.style("opacity", 1);

		scope.shooter.updateAccuracy({ fire: true });
	};

	scope.left = function () {
		if (scope.dx - STEP >= 0) {
			scope.dx -= STEP;
			scope.updatePos();
		}
	};

	scope.right = function () {
		if (scope.dx + STEP <= scope.width) {
			scope.dx += STEP;
			scope.updatePos();
		}
	};

	scope.up = function () {
		if (scope.dy - STEP >= 0) {
			scope.dy -= STEP;
			scope.updatePos();
		}
	};

	scope.down = function () {
		if (scope.dy + STEP <= scope.height) {
			scope.dy += STEP;
			scope.updatePos();
		}
	};

	/* Helpers */
	scope.updatePos = function () {
		scope.plane
			.transition()
			.duration(50)
			.attr("transform", "rotate(" + scope.rotate() + ") " +
				"translate(" + scope.coord() +")");
	};

	scope.coord = function () {
		return [scope.dx, scope.dy];
	};

	scope.rotate = function () {
		return [scope.dr, scope.dx, scope.dy];
	};

	scope.convertAngle = function () {
		return (90 - scope.dr) * Math.PI / 180;
	};

	scope.warheadCoord = function () {
		var angle = scope.convertAngle(),
			l = 35,
			x = l * Math.cos(angle),
			y = l * Math.sin(angle);

		var start,
			end,
			speed,
			opp,
			opp2,
			adj,
			adj2;

		var oppX1, oppX2, oppY1, oppY2,
			adjX1, adjX2, adjY1, adjY2;

		start = [scope.dx + x, scope.dy - y];

		adjX1 = start[0];
		adjY1 = start[1];
		adjX2 = start[0];
		adjY2 = start[1];

		oppX1 = start[0];
		oppY1 = start[1];
		oppX2 = start[0];
		oppY2 = start[1];

		if (scope.quadrant === 1) {
			opp = (scope.width - start[0]) * Math.tan(angle);
			adj = (start[1]) / Math.tan(angle);

			opp2 = adj * Math.tan(angle);
			adj2 = opp / Math.tan(angle);

			if (start[0] + adj <= scope.width && opp2 <= start[1]) {
				opp = opp2;
			} else if (opp > start[1]) {
				opp = opp2;
			} else {
				adj = adj2;
			}

			oppX1 = start[0] + adj - 1;
			oppY1 = start[1];
			oppX2 = start[0] + adj - 1;
			oppY2 = start[1] - opp;

			adjX1 = start[0];
			adjY1 = start[1];
			adjX2 = start[0] + adj - 1;
			adjY2 = start[1];

			speed = opp / Math.sin(angle);
		} else if (scope.quadrant === 4) {
			opp = -(scope.width - start[0]) * Math.tan(angle);
			adj = -(scope.height - start[1]) / Math.tan(angle);

			opp2 = -adj * Math.tan(angle);
			adj2 = -opp / Math.tan(angle);

			if (start[0] + adj <= scope.width && opp2 <= start[1]) {
				opp = opp2;
			} else if (start[0] + adj > scope.width) {
				adj = adj2;
			} else if (start[1] + opp > scope.height) {
				opp = opp2;
			} else {
				adj = adj2;
			}

			oppX1 = start[0] + adj - 1;
			oppY1 = start[1];
			oppX2 = start[0] + adj - 1;
			oppY2 = start[1] + opp;

			adjX1 = start[0];
			adjY1 = start[1];
			adjX2 = start[0] + adj - 1;
			adjY2 = start[1];

			speed = -opp / Math.sin(angle);
		} else if (scope.quadrant === 3) {
			opp = (start[0]) * Math.tan(angle);
			adj = (scope.height - start[1]) / Math.tan(angle);

			opp2 = adj * Math.tan(angle);
			adj2 = opp / Math.tan(angle);
			
			if (opp + start[1] > scope.height) {
				opp = opp2;
			} else {
				adj = adj2;
			}

			oppX1 = start[0] - adj + 1;
			oppY1 = start[1];
			oppX2 = start[0] - adj + 1;
			oppY2 = start[1] + opp;

			adjX1 = start[0];
			adjY1 = start[1];
			adjX2 = start[0] - adj + 1;
			adjY2 = start[1];

			speed = -opp / Math.sin(angle);
		} else {
			opp = -start[0] * Math.tan(angle);
			adj = -start[1] / Math.tan(angle);

			opp2 = -adj * Math.tan(angle);
			adj2 = -opp / Math.tan(angle);
			
			if (opp > start[1]) {
				opp = opp2;
			} else {
				adj = adj2;
			}

			oppX1 = start[0] - adj + 1;
			oppY1 = start[1];
			oppX2 = start[0] - adj + 1;
			oppY2 = start[1] - opp;

			adjX1 = start[0] + 1;
			adjY1 = start[1];
			adjX2 = start[0] - adj + 1;
			adjY2 = start[1];

			speed = opp / Math.sin(angle);
		}

		end = [oppX2, oppY2];

		if (false) {
			scope.canvas.append("circle")
				.attr("r", 3)
				.attr("cx", start[0])
				.attr("cy", start[1])
				.style("fill", "rgba(0,0,0,0.1")
					.transition()
					.duration(300)
						.style("opacity", 0)
						.remove();
			
			var adjacentLine = this.canvas.select(".adjacent");
			if (!adjacentLine.node()) {
				adjacentLine = this.canvas
					.append("line")
					.classed("adjacent", true);
			}

			var oppositeLine = this.canvas.select(".opposite");
			if (!oppositeLine.node()) {
				oppositeLine = this.canvas
					.append("line")
					.classed("opposite", true);
			}

			adjacentLine
				.transition()
				.duration(200)
				.attr("x1", adjX1)
				.attr("y1", adjY1)
				.attr("x2", adjX2)
				.attr("y2", adjY2);

			oppositeLine
				.transition()
				.duration(200)
				.attr("x1", oppX1)
				.attr("y1", oppY1)
				.attr("x2", oppX2)
				.attr("y2", oppY2);
		}

		return {
			start: start,
			end: end,
			speed: speed * 2
		};
	};

	scope.initCannon();
	scope.initMouse();	
	scope.initHotkeys();
};