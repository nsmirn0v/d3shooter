var Enemy = function (params) {
	var scope = this;

	scope.shooter = params.shooter;
	scope.canvas = scope.shooter.canvas;
	scope.game = scope.shooter.game;
	scope.width = scope.shooter.width;
	scope.height = scope.shooter.height;
	scope.explosion = scope.shooter.explosion;

	scope.initEnemy = function () {
		var cxStart = scope.randomX(),
			cxEnd = scope.randomX(),
			data = scope.randomData(),
			t = scope.randomTime(),
			bigR = data.scale * 25,
			smallR = data.scale * 10;

		scope.enemy = scope.game.append('g')
			.classed('enemy ' + data.className, true)
			.attr('lives', data.lives)
			.attr('transform', 'translate(' + [cxStart, -bigR] + ')');
		
		scope.enemy
			.transition()
			.duration(t)
				.ease('linear')
				.attr('transform', 'translate(' + [cxEnd, scope.height + bigR] + ')')
				.remove();

		scope.enemy.append('circle')
			.classed('lg', true)
			.attr('r', bigR);

		scope.enemy.append('circle')
			.classed('sm', true)
			.attr('r', smallR);

		scope.enemy.intervalId = setInterval(function () {
			var r, x, y, width, height, enemyBody, clientRect, rockets;
			
			clientRect = scope.enemy.node().getBoundingClientRect();
			
			x = clientRect.left;
			y = clientRect.top;
			width = clientRect.width;
			height = clientRect.height;

			rockets = scope.canvas.selectAll('.rocket.active')
				.each(function () {
					var rocket = d3.select(this),
						clientRect = rocket.select('.rocket-body').node().getBoundingClientRect();
					
					var lives,
						damage,
						explosion;

					if (clientRect.left >= x &&
						clientRect.left <= x + width &&
						clientRect.top >= y &&
						clientRect.top <= y + height) {

						rocket
							.transition()
							.duration(0);
						
						rocket.remove();

						scope.canvas.append('circle')
							.attr('cx', clientRect.left)
							.attr('cy', clientRect.top)
							.attr('r', '5')
							.style('fill', 'rgba(0,0,0,0.1)')
								.transition()
								.duration(600)
									.attr('r', 35)
									.style('opacity', 0.15)
									.remove();

						explosion = d3.select(scope.explosion).select('#Page-1');

						explosion = scope.canvas.node()
							.appendChild(explosion.node().cloneNode(true));

						explosion = d3.select(explosion);

						explosion
							.attr('transform', 'translate(' +
								[clientRect.left - 10, clientRect.top - 10] +')')
							.style('opacity', 0)
							.transition()
							.duration(200)
								.style('opacity', 1);

						explosion
							.transition()
							.delay(200)
							.duration(500)
								.style('opacity', 0)
								.remove();

						damage = Math.round(Math.random() * 12 + 25);

						scope.canvas.append('text')
							.text(damage)
							.attr('x', clientRect.left + 10)
							.attr('y', clientRect.top - 5)
							.style('font-size', 20)
							.transition()
							.duration(1000)
								.style('opacity', 0)
								.style('font-size', 45)
								.remove();

						scope.shooter.updateScore(damage);
						scope.shooter.updateAccuracy({ hit: true });

						lives = parseInt(scope.enemy.attr('lives'), 10) - damage;
						scope.enemy.attr('lives', lives);

						if (lives <= 0) {
							scope.enemy.transition().duration(0);
							clearInterval(scope.enemy.intervalId);
							clearTimeout(scope.enemy.killSwitchId);

							scope.enemy
								.transition()
								.duration(600)
									.style('opacity', 0.1)
									.remove();

							scope.shooter.updateDestroyedCounter();
						}
					}
				});
		}, 30);

		scope.enemy.killSwitchId = setTimeout(function () {
			var lives = scope.enemy.attr('lives');

			clearInterval(scope.enemy.intervalId);

			if (lives > 0) {
				scope.shooter.updateHealth(lives);
			}
		}, t);

		scope.enemy
			.attr('intervalId', scope.enemy.intervalId)
			.attr('killSwitchId', scope.enemy.killSwitchId);
	};

	/* Helpers */
	scope.randomTime = function () {
		return Math.random() * 15000 + 10000;
	};

	scope.randomData = function () {
		return ENEMIES[Math.floor(Math.random() * 3)];
	};

	scope.randomX = function () {
		return Math.random() * scope.width;
	};

	scope.initEnemy();
};