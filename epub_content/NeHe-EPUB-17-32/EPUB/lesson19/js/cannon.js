/**
 *  @author rkwright   /  http://www.geofx.com
 */

var CANNON = { revision: '03' };


CANNON.Cannon = function ( parameters ) {
	
	this.deltaT   = 0.0;
    this.lastT    = 0.0;
    this.mesh     = null;
    this.magazine = [];
    this.active   = [];
    this.xLimit   = 0;
    this.zLimit   = 0;
    this.scene    = null;
    this.gravity  = new THREE.Vector3(0, -0.002, 0);

    GFX.setParameters( this, parameters );

    this.initCannon();
};


CANNON.Cannon.prototype = {

    /**
     * Initialize all the parameters of the cannon
     */
	initCannon: function () {

        var BARREL_RADIUS   = 0.1;
        var BARREL_LENGTH   = 1.0;

        var geometry = new THREE.CylinderGeometry( BARREL_RADIUS * 2.0,
                                                   BARREL_RADIUS * 3.0,
                                                   BARREL_LENGTH,
                                                   32, 1, true);

        var material = new THREE.MeshPhongMaterial( { color : 0xdddddd,
                                                      specular: 0x009900,
                                                      shininess: 30,
                                                      side:THREE.DoubleSide});

        this.mesh = new THREE.Mesh( geometry, material );
    },

    /**
     * Initialize all the trajectory and velocity of the beachball
     */
    initTrajectory: function ( ball ) {

        var MUZZLE_VELOCITY = 0.125;
        var MIN_RHO         = 45.0 * Math.PI / 180.0;
        var DELTA_RHO       = 30.0 * Math.PI / 180.0;

        var rho = MIN_RHO + DELTA_RHO * Math.random();
        var velY = Math.sin(rho) * MUZZLE_VELOCITY;
        var velH = MUZZLE_VELOCITY - velY;

        var theta = Math.PI * 2.0 * Math.random();
        var velX = Math.sin(theta) * velH;
        var velZ = Math.cos(theta) * velH;

        ball.vel.set( velX, velY, velZ);
        ball.loc.set(0,ball.radius, 0);

        ball.mesh.material.opacity = 1;
    },

    /**
     * Fire a new beachball, either by fetching an existing one from the magazine
     * else create a new one
     */
	fireCannon: function() {

        var now = performance.now();
        if ((now - this.lastT) < this.deltaT)
            return;
        this.lastT = now;

        var newBall;
        if (this.magazine.length > 0) {
            newBall = this.magazine.pop();
        }
        else {
            newBall = new BALL.BeachBall( { gravity : this.gravity } );
            this.scene.add( newBall.mesh );
        }

        this.initTrajectory( newBall );

        this.active.push( newBall );
 	},

    /**
     * Update each beachball's location by iterating through the
     * array of active balls,  If transparent, move to the magazine,
     * else make it bounce
     */
    updateBalls: function () {
        for (var i = this.active.length - 1; i >= 0; i--) {

            var ball = this.active[i];

            // if ball is now transparent, move it from active to magazine
            if (ball.mesh.material.opacity <= 0) {
                this.active.splice(i, 1);
                this.magazine.push(ball);
            }
            else {

                ball.update();

                if (ball.loc.y < ball.radius) {

                    // If the ball is still over the floor, make it bounce
                    if (Math.abs(ball.loc.x) <= this.xLimit && Math.abs(ball.loc.z) <= this.zLimit) {
                        ball.vel.y = -ball.vel.y * ball.restitution;
                        ball.loc.y = ball.radius;
                    }
                    else { // reduce the opacity incrementally
                        ball.mesh.material.opacity -= 0.025;
                    }
                }
            }
        }
    },

    /**
     * Just fire the cannon if needed and then update the balls.
     */
    update: function() {
        //console.log(" active: " + this.active.length + " magazine: " + this.magazine.length);

        this.fireCannon();

        this.updateBalls();

    }
};
