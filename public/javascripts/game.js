var Shooter = function () {
	var scope = this;
	
	d3.xml('/images/explosion.svg', function (xml) {
		scope.explosion = xml.documentElement;

		scope.initCanvas();
		scope.initThemeSwitcher();
		scope.initBackground();
		scope.initDimensions();
		scope.addCannon();

		scope.initScore();
		scope.initTimer();
		scope.initDestroyedCounter();
		scope.initAccuracy();
		scope.initHealthbar();
		
		d3.select('button').on('click', function () {
			scope.start();

			d3.select('.game-over').remove();

			d3.select('.modal')
				.transition()
				.duration(600)
					.style('height', '0px')
					.style('opacity', 0.1);
		});
	});

	scope.start = function () {
		var healthBar,
			healthLabel;

		scope.T = 3200;
		scope.hits = 0;
		scope.fired = 0;

		scope.initScore();
		scope.initTimer();
		scope.initDestroyedCounter();
		scope.initAccuracy();

		scope.timerIntervalId = setInterval(function () {
			var value;

			scope.updateCounter(scope.timer, 1);
			value = scope.timer.attr('value');

			if (value % 5 === 0) {
				scope.T -= 50;
			}

			value = parseInt(scope.healthContaner.attr('health'), 10);
			if (value + 1 < 370) {
				scope.updateHealth(-1);
			}

		}, 1000);

		scope.healthContaner.attr('health', 370)
		healthBar = scope.healthContaner.select('.bar-health');

		if (!healthBar.node()) {
			healthBar = scope.healthContaner
				.append('rect')
				.classed('bar-health', true)
				.attr('y', 10)
				.attr('rx', 2)
				.attr('ry', 2)
				.attr('height', 20);
		}

		healthBar
			.attr('width', 0)
			.transition()
			.duration(600)
				.attr('width', 370)
				.style('fill', '#1ECD97');

		healthLabel = scope.healthContaner.select('.label');

		if (!healthLabel.node()) {
			healthLabel = scope.healthContaner.append('text')
				.classed('label', true)
				.attr('x', 185)
				.attr('y', 25);
		}

		healthLabel.text('100%');

		scope.addEnemy();
		scope.scheduleNewEnemy();
	};

	scope.gameover = function () {
		clearInterval(scope.gameIntervalId);
		clearInterval(scope.timerIntervalId)

		scope.canvas.append('text')
			.text('Game Over')
			.classed('game-over', true)
			.attr('x', scope.width / 2)
			.attr('y', scope.height / 3)
			.transition()
			.duration(3000)
				.style('opacity', 1)
				.style('font-size', 45);
		
		scope.game.selectAll('g')
			.transition()
			.duration(2000)
			.each(function () {
				var node = d3.select(this);

				clearInterval(node.attr('intervalId'));
				clearTimeout(node.attr('killSwitchId'));
			})
			.style('opacity', 0)
			.remove();

		d3.select('.modal')
			.transition()
			.duration(600)
				.style('height', '320px')
				.style('opacity', 1);
	};

	scope.initCanvas = function () {
		scope.canvas = d3.select('.container')
			.append('svg')
			.classed('main', true)
			.attr('width', '100%')
			.attr('height', '100%');

		scope.background = scope.canvas
			.append('g')
			.classed('background', true);
		
		scope.game = scope.canvas
			.append('g')
			.classed('game', true);
	};

	scope.initDimensions = function () {
		var clientRect = scope.canvas
			.node().getBoundingClientRect();
		
		scope.width = clientRect.width;
		scope.height = clientRect.height;
	};

	scope.initBackground = function () {
		setInterval(function () {
			var x = Math.floor(Math.random() * scope.width);

			scope.background
				.append('circle')
				.classed('bg-circle', true)
				.attr('r', 1)
				.attr('cx', x)
				.attr('cy', 0)
					.transition()
					.duration(10000)
						.ease('linear')
						.attr('cx', x)
						.attr('cy', scope.height)
						.remove();
		}, 500);
	};

	scope.initThemeSwitcher = function () {
		d3.select('.color-theme').on('click', function () {
			var container = d3.select('.container');

			if (container.classed('dark')) {
				container.classed('dark', false);
			} else {
				container.classed('dark', true);
			}
		});
	};

	scope.initScore = function () {
		scope.score = scope.initCounter('score');
	};

	scope.updateScore = function (value) {
		scope.updateCounter(scope.score, value);
	};

	scope.initTimer = function () {
		scope.timer = scope.initCounter('timer');
	};

	scope.initDestroyedCounter = function () {
		scope.destroyed = scope.initCounter('destroyed');
	};

	scope.updateDestroyedCounter = function () {
		scope.updateCounter(scope.destroyed, 1);	
	};

	scope.initAccuracy = function () {
		scope.hits = 0;
		scope.fired = 0;
		scope.accuracy = scope.initCounter('accuracy');
	};

	scope.updateAccuracy = function (params) {
		if (params.fire) {
			scope.fired++;
		} else {
			scope.hits++;
		}

		scope.updateCounter(scope.accuracy);
	};

	scope.initHealthbar = function () {
		scope.healthContaner = d3.select('.healthbar svg')
			.attr('health', 370);

		scope.healthContaner.append('rect')
			.classed('bar-background', true)
			.attr('y', 10)
			.attr('rx', 2)
			.attr('ry', 2)
			.attr('width', 370)
			.attr('height', 20);
	};

	scope.updateHealth = function (damage) {
		var health,
			percentage;

		health = this.healthContaner.attr('health');
		health -= damage;

		if (health < 0) {
			health = 0;
			scope.gameover();
		}

		percentage = d3.round(health / 370 * 100);

		this.healthContaner.attr('health', health);

		this.healthContaner
			.select('.bar-health')
			.transition()
			.duration(600)
				.attr('width', health)
				.style('fill', function () {
					var red = '#d9534f',
						orange = '#f0ad4e',
						green = '#1ECD97';

					if (percentage > 60) {
						return green;
					} else if (percentage > 25) {
						return orange;
					} else {
						return red;
					}
				});

		this.healthContaner
			.select('.label')
			.text(percentage + '%');
	};

	scope.initCounter = function (id) {
		var counter = d3.select('#' + id + ' svg');

		var text = counter
			.attr('value', 0)
			.selectAll('text')
			.data([{ value: 0, id: 0} ], function (d) {
				return d.id;
			});

		text
			.transition()
			.duration(200)
			.text(function (d) { return d.value; })
			.attr('y', 20)
			.attr('x', function(d, i) { return i * 12; })
			.style('fill-opacity', 1);

		// ENTER
		text.enter().append('text')
			.attr('dy', '.35em')
			.attr('y', -10)
			.attr('x', function(d, i) { return i * 12; })
			.style('fill-opacity', 1e-6)
			.text(function(d) { return d.value; })
			.transition()
			.duration(200)
			.attr('y', 20)
			.style('fill-opacity', 1);

		// EXIT
		text.exit()
			.transition()
			.duration(200)
			.attr('y', 50)
			.style('fill-opacity', 1e-6)
			.remove();

		return counter;
	};

	scope.updateCounter = function (counter, increment) {
		var currVal,
			newVal,
			currValStr,
			newValStr,
			destroyed,
			data,
			text;

		if (increment) {
			currValStr = counter.attr('value');
			currVal = parseInt(currValStr);

			newVal = currVal + increment;
			newValStr = newVal.toString();

			counter.attr('value', newVal);
		} else {
			newValStr = d3.round(scope.hits / scope.fired * 100) + '%';
		}

		data = newValStr.split('').map(function (value, i) {
			return {
				value: value,
				id: i + '-' + value
			};
		});

		text = counter.selectAll('text')
			.data(data, function (d) {
				return d.id;
			});

		// UPDATE
		text
		   .transition()
		     .duration(200)
		     .text(function (d) { return d.value; })
		     .attr('y', 20)
		     .attr('x', function(d, i) { return i * 12; })
		     .style('fill-opacity', 1);

		// ENTER
		text.enter().append('text')
			.attr('dy', '.35em')
			.attr('y', -10)
			.attr('x', function(d, i) { return i * 12; })
			.style('fill-opacity', 1e-6)
			.text(function(d) { return d.value; })
			.transition()
			.duration(200)
				.attr('y', 20)
				.style('fill-opacity', 1);

		// EXIT
		text.exit()
			.transition()
			.duration(200)
				.attr('y', 50)
				.style('fill-opacity', 1e-6)
				.remove();
	};

	scope.addCannon = function () {
		new Cannon({ shooter: scope });
	};

	scope.addEnemy = function () {
		new Enemy({ shooter: scope });
	};

	scope.scheduleNewEnemy = function () {
		scope.gameIntervalId = setTimeout(function () {
			scope.addEnemy();
			scope.scheduleNewEnemy();
		}, scope.T);
	};
	
};