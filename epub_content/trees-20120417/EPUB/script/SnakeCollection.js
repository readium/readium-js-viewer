SnakeCollection = function() {
	this.canvas = canvas;
	
	this.snakes = [];
}

SnakeCollection.prototype = {
	next: function() {
		n = this.snakes.length;
		for (var s in this.snakes) {
			var snake = this.snakes[s];
			if (this.snakes[s])
				this.snakes[s].next();
		}
	},
	
	add: function(snake) {
		this.snakes.push(snake);
		snake.collection = this;
	},
	
	remove: function(snake) {
		for (var s in this.snakes)
			if (this.snakes[s] === snake)
				this.snakes.splice(s, 1);
	}
}
