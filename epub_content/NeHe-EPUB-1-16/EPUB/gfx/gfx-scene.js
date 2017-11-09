/**
 *  @author rkwright   /  http://www.geofx.com
 */

var GFX = { revision: '03' };

//some constants
	var    	X_AXIS = 0;
	var    	Y_AXIS = 1;
	var    	Z_AXIS = 2;
	
GFX.Scene = function ( parameters ) {
	
	this.scene = null;
	this.renderer = null;
    this.containerID = null;
    this.shadowMapEnabled = false;
    this.alphaBuffer = false;

    this.clearColor = 0x000000;
    this.autoClear = true;

	this.canvasWidth = 0;
	this.canvasHeight = 0;

	this.defaultCamera = true;
    this.cameras = [];
    // just a proxy for backwards compatibility
    this.camera = undefined;
    // these are the default values that can be overridden by the user
    this.perspective = true;
    this.fov = 45;
    this.near = 0.01;
    this.far = 1000;
	this.cameraPos = [0,20,40];
    this.orthoSize = 1;

	this.controls = false;
	this.orbitControls = [];

	this.displayStats = false;
	this.fpStats = null;
    this.msStats = null;
    this.mbStats = null;

	this.defaultLights = true;
	this.ambientLights = [];
	this.directionalLights = [];
	this.pointLights = [];
	this.hemisphereLights = [];
	this.spotLights = [];

	this.axesHeight = 0;
	
	this.floorRepeat = 0;
	this.floorX      = 0;
	this.floorZ      = 0;
    this.floorImage  = null;
	
	this.fogType = 'none';	// else 'linear' or 'exponential' 
	this.fogDensity = 0;
	this.fogColor = 0xffffff;
	this.fogNear = 0.015;
	this.fogFar = 100;

    GFX.setParameters( this, parameters );

    this.initialize();
};

// the scene's parameters from the values JSON object
// lifted from MrDoob's implementation in three.three-js
GFX.setParameters = function( object, values ) {

    if ( values === undefined ) return;

    for ( var key in values ) {

        var newValue = values[ key ];

        if ( newValue === undefined ) {
            console.warn( "GFX: '" + key + "' parameter is undefined." );
            continue;
        }

        if ( key in object ) {
            var currentValue = object[key];

            if (currentValue instanceof THREE.Color) {
                currentValue.set(newValue);
            }
            else if (currentValue instanceof THREE.Vector3 && newValue instanceof THREE.Vector3) {
                currentValue.copy(newValue);
            }
            else if (key === 'overdraw') {
                // ensure overdraw is backwards-compatible with legacy boolean type
                object[key] = Number(newValue);
            }
            else if (currentValue instanceof Array) {
                object[key] = newValue.slice();
            }
            else {
                object[key] = newValue;
            }
        }
    }
};

GFX.Scene.prototype = {

	initialize: function () {
		if (this.scene !== null) {
			console.error("GFXScene initialize called twice!");
			return;
		}
		// Check whether the browser supports WebGL. 
		if ( !Detector.webgl ) Detector.addGetWebGLMessage();
	
		// Create the scene, in which all objects are stored (e. g. camera, lights, geometries, ...)
		this.scene = new THREE.Scene();

		this.addFog();
		
		// If the user didn't supply a fixed size for the window,
		// get the size of the inner window (content area)
		if (this.canvasHeight === 0) {
			this.canvasWidth = window.innerWidth;
			this.canvasHeight = window.innerHeight;

            var _self = this;

			// add an event listener to handle changing the size of the window
			window.addEventListener('resize', function() {
                _self.canvasWidth  = window.innerWidth;
                _self.canvasHeight = window.innerHeight;
                var aspect = _self.canvasWidth / _self.canvasHeight;

                if (_self.perspective === true ) {
                    _self.cameras[0].aspect = aspect;
                } else {
                    var w2 = _self.orthoSize * aspect / 2;
                    var h2 = _self.orthoSize / 2;

                    _self.cameras[0].left   = -w2;
                    _self.cameras[0].right  = w2;
                    _self.cameras[0].top    = h2;
                    _self.cameras[0].bottom = -h2;
                }

                _self.cameras[0].updateProjectionMatrix();
                _self.renderer.setSize( _self.canvasWidth, _self.canvasHeight );
            });
		}
	
		// if the caller supplied the container elm ID try to find it
		var container;
		if (this.containerID !== null && typeof this.containerID !== 'undefined')
			container = document.getElementById(this.containerID);
		
		// couldn't find it, so create it ourselves
		if (container === null || typeof container === 'undefined') {
			container = document.createElement( 'div' );
			document.body.appendChild( container );
		}
		else {
			this.canvasWidth = container.clientWidth;
			this.canvasHeight = container.clientHeight;
		}
	
		// allocate the THREE.three-js renderer
		this.renderer = new THREE.WebGLRenderer({antialias:true, alpha: this.alphaBuffer});
		this.renderer.autoClear = this.autoClear;

        // set up the camera
        if (this.defaultCamera === true)
            this.setDefaultCamera();

        // Set the background color of the renderer to black or the user-defined color, with full opacity
		this.renderer.setClearColor(new THREE.Color( this.clearColor ), 1);

		if (this.shadowMapEnabled === true )
		    this.renderer.shadowMap.enabled = true;

		// Set the renderers size to the content areas size
		this.renderer.setSize(this.canvasWidth, this.canvasHeight);
	
		// Get the DIV element from the HTML document by its ID and append the renderer's DOM object
		container.appendChild(this.renderer.domElement);

		// if the user hasn't set defaultLights to false, then set them up
		if (this.defaultLights === true)
		    this.setDefaultLights();

		// request the orbitControls be created and enabled
		// add the controls
		//if (this.controls === true && this.renderer !== null)
		//    this.setDefaultControls();
		
		if ( this.axesHeight !== 0 )
			this.drawAxes(this.axesHeight);
		
		if (this.floorRepeat !== 0)
			this.addFloor(this.floorRepeat);

        // set up the stats window(s) if requested
		this.setupStats( container );
	},

	add: function ( obj ) {
		this.scene.add(obj);
	},

	remove: function ( obj ) {
		this.scene.remove(obj);
	},

    /**
     * Render the scene. Map the 3D world to the 2D screen.
     */
    renderScene: function( camera ) {

        if ( this.cameras.length < 1 )
            return;

        if (camera === undefined ) {

            for ( var i=0; i<this.cameras.length; i++ )
                this.renderer.render(this.scene, this.cameras[i]);
        }
        else {

            this.renderer.render( this.scene, camera );
        }

        this.updateControls();
        this.updateStats();
    },

	/**
	 * Set up the camera for the scene.  Perspective or Orthographic
	 */
	setDefaultCamera: function ( jsonObj ) {

	    if (this.cameras.length > 0)
	        this.cameras.pop();

	    if ( jsonObj === undefined ) {
            var newObj = {
                perspective: this.perspective,
                cameraPos: this.cameraPos,
                fov: this.fov,
                near: this.near,
                far: this.far
            };
            return this.addCamera(newObj, 0);
        }

	    return this.addCamera( jsonObj, 0 );
    },

    addCamera: function ( jsonObj, index ) {
	    // assign the current/default global values to the local values
	    var perspective = this.perspective;
	    var cameraPos   = this.cameraPos;
        var fov         = this.fov;
        var near        = this.near;
        var far         = this.far;
        var orthoSize   = this.orthoSize;

        if (jsonObj !== null && jsonObj !== undefined ) {
            if (jsonObj.perspective !== undefined)
                perspective = jsonObj.perspective;

            cameraPos   = jsonObj.cameraPos || this.camerPos;
            fov         = jsonObj.fov || this.fov;
            near        = jsonObj.near || this.near;
            far         = jsonObj.far || this.far;
            orthoSize   = jsonObj.orthoSize || this.orthoSize;
        }

        var camera;
        var aspect = this.canvasWidth / this.canvasHeight;
        if (perspective === true) {
            camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        }
        else {
            var w2 = orthoSize * aspect / 2;
            var h2 = orthoSize / 2;
            camera = new THREE.OrthographicCamera( -w2, w2, h2, -h2, 0.01, 1000);
        }

        camera.updateProjectionMatrix();
        camera.position.set(cameraPos[0], cameraPos[1], cameraPos[2]);

        camera.lookAt(this.scene.position);

        if ( index === undefined )
            this.cameras.push( camera );
        else
            this.cameras.splice(0, 0, camera);

        this.scene.add(camera);

        if (this.controls === true && this.renderer !== null) {
            this.orbitControls[this.cameras.length-1] = new THREE.OrbitControls(camera, this.renderer.domElement);
        }

        // set the "default" camera if not already done
        if (this.camera === undefined)
            this.camera = camera;

        return camera;
    },

    getCamera: function ( index ){
	    if (this.cameras.length < 1 || index < 0 || index >= this.cameras.length)
	        return null;

	    if ( index === undefined )
            return this.cameras[0];
        else
            return this.cameras[index];
    },

    setDefaultControls: function() {

        if (this.cameras.length > 0)
            this.addControls( this.cameras[0] );
    },

    addControls: function ( camera ) {

        if (camera !== null && typeof camera !== 'undefined') {
            this.orbitControls.push( new THREE.OrbitControls(camera, this.renderer.domElement) );
        }
    },

    updateControls: function () {

        for ( var i=0; i<this.orbitControls.length; i++ ) {
            this.orbitControls[i].update();
        }
    },

    /**
     * If the user doesn't want to set custom lights, just allocate some defaults
     */
    setDefaultLights: function () {
        // Ambient light has no direction, it illuminates every object with the same
        // intensity. If only ambient light is used, no shading effects will occur.
        var ambLight = new THREE.AmbientLight(0xc0c0c0, 0.75);
        this.scene.add( ambLight );
        this.ambientLights.push( ambLight);

        // Directional light has a source and shines in all directions, like the sun.
        // This behaviour creates shading effects.
        var dirLight = new THREE.DirectionalLight(0xc0c0c0, 0.5);
        dirLight.position.set(5, 20, 12);
        this.scene.add( dirLight );
        this.directionalLights.push( dirLight );

        var pointLight = new THREE.PointLight(0xc0c0c0, 0.5 );
        pointLight.position.set(-15, 20, 12);
        this.scene.add( pointLight );
        this.pointLights.push( pointLight );
    },

    getDefaultLight: function ( type ) {
       if ( type.indexOf("directional") !== -1 && this.directionalLights.length > 0 ) {
           return this.directionalLights[0];
       }
       else
           return undefined;
    },

    /**
	 * Add one or more lights to the current scene.  If the JSON object is null,
	 * then the default lights are used.
	 *
     * All lights support color and intensity
	 * Supported types of light and their parameters are
	 * 	AmbientLight
     *  DirectionalLight
     *    castShadow
     *    position
     *    target
     *  HemisphereLight
     *    castShadow
     *    position
     *    color   (of the sky)
     *    groundColor
     *  PointLight
     *    castShadow
     *    position
     *    decay
     *    power
     *  SpotLight
     *    distance
     *    angle
     *    penumbra
     *    decay
     *
     * @param type
     * @param values
     */
    addLight: function ( type, values ) {

        var light;
        var color = this.getLightProp('color', values, 0xffffff);
        var intensity = this.getLightProp ('intensity', values, 1);
        var castShadow = this.getLightProp('castShadow', values, false);
        var debug = this.getLightProp('debug', values, false);
        var distance = this.getLightProp('distance', values, 100);
        var decay;

        if (type === 'ambient') {
            light = new THREE.AmbientLight( color, intensity );
            this.ambientLights.push( light );
        }
        else {
            var pos = this.getLightProp('position', values, [0, 10, 0]);

            if (type === 'directional') {
                var target = this.getLightProp('target', values, undefined);
                light = new THREE.DirectionalLight(color, intensity);
                if (this.shadowMapEnabled === true) {
                    light.shadow.mapSize.x = 2048;
                    light.shadow.mapSize.y = 2048;
                    light.shadow.camera.left = -20;
                    light.shadow.camera.bottom = -20;
                    light.shadow.camera.right = 20;
                    light.shadow.camera.top = 20;
                }

                this.directionalLights.push(light);
           }
            else if (type === 'point') {
                distance = this.getLightProp('distance', values, 0);
                decay = this.getLightProp('decay', values, 1);
                light = new THREE.PointLight(color, intensity, distance, decay);
                this.pointLights.push(light);
            }
            else if (type === 'hemisphere') {
                var groundColor = this.getLightProp('groundColor', values, 0x000000);
                light = new THREE.HemisphereLight(color, groundColor, intensity);
                this.hemisphereLights.push(light);
             }
            else if (type === 'spotlight') {
                var angle = this.getLightProp('angle', values, Math.PI/3);
                var penumbra = this.getLightProp('penumbra', values, 0);
                distance = this.getLightProp('distance', values, 0);
                decay = this.getLightProp('decay', values, 1);
                light = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
                this.spotLights.push(light);
            }
            else {
                console.error("Unknown type of light: " + type);
                return undefined;
            }

            light.position.set(pos[0], pos[1], pos[2]);
            light.castShadow = castShadow;
            if (debug === true) {
                var helper = new THREE.CameraHelper( light.shadow.camera );
                this.scene.add( helper );
                //light.shadowCameraVisible = true;
            }
        }

        this.scene.add( light );

        return light;
    },

    getLightProp: function ( prop, values, def ) {
        var value = values[ prop ];
        return ( value === undefined ) ? def : value;
    },

    /**
	 * Remove all the lights currently created for the scene
     */
	clearAllLights: function () {

	    this.clearLights( this.ambientLights );
        this.clearLights( this.directionalLights );
        this.clearLights( this.pointLights );
        this.clearLights( this.spotLights );
        this.clearLights( this.hemisphereLights );
    },

    /**
     * Remove all the lights from the specified array
     */
    clearLights : function ( lightArray ) {

        while (lightArray.length > 0) {
            this.scene.remove(lightArray.pop());
        }
    },

    setupStats: function( container ) {
        var pos = 0;
        if (this.displayStats === false)
            return;

        if (this.displayStats === true || this.displayStats.indexOf("fps") !== -1) {
            this.fpStats = new Stats();
            this.fpStats.showPanel(0);
            this.fpStats.dom.style.left = pos + 'px';
            pos += 80;
            container.appendChild( this.fpStats.dom );
        }

        if (typeof this.displayStats === 'string' && this.displayStats.indexOf("ms") !== -1) {
            this.msStats = new Stats();
            this.msStats.showPanel(1);
            //this.msStats.domElement.style.position = 'absolute';
            //this.msStats.domElement.style.bottom = '0px';
            this.msStats.dom.style.left = pos + 'px';
            pos += 80;
            //this.msStats.domElement.style.zIndex = 100;
            container.appendChild( this.msStats.dom );
        }

        if (typeof this.displayStats === 'string' && this.displayStats.indexOf("mb") !== -1) {
            this.mbStats = new Stats();
            this.mbStats.showPanel(2);
            this.mbStats.dom.style.left = pos + '80px';
            container.appendChild( this.mbStats.dom );
        }
    },

    updateStats: function() {
        if (this.fpStats !== null && typeof this.fpStats !== 'undefined')
            this.fpStats.update();
        if (this.msStats !== null && typeof this.msStats !== 'undefined')
            this.msStats.update();
        if (this.mbStats !== null && typeof this.mbStats !== 'undefined')
            this.mbStats.update();
    },

	addFog: function( values ) {
		
		if ( values !== undefined ) {

			for ( var key in values ) {
				
				var newValue = values[ key ];
		
				if ( newValue === undefined ) {
					console.warn( "Fog parameter '" + key + "' parameter is undefined." );
					continue;
				}
		
				if ( key === 'fogType' )
					this.fogType = newValue;
				else if ( key === 'fogDensity' )
					this.fogDensity = newValue;
				else if ( key === 'fogColor' )
					this.fogColor = newValue;
				else if ( key === 'fogNear' )
					this.fogNear = newValue;
				else if ( key === 'fogFar' )
					this.fogFar = newValue;
			}
		}
				
		if (this.fogType === 'exponential')
			this.scene.fog = new THREE.FogExp2(this.fogColor, this.fogDensity );
		else if (this.fogType === 'linear')
			this.scene.fog = new THREE.Fog( this.fogColor, this.fogNear, this.fogFar );
		else
			this.scene.fog = null;
	},
	
	addFloor: function( floorRepeat ) {

		if (this.floorRepeat === 0)
			this.floorRepeat = floorRepeat;

		// note: 4x4 checker-board pattern scaled so that each square is 25 by 25 pixels.
        var image = this.floorImage === null ? '../images/checkerboard.jpg' : this.floorImage;
		var texture = new THREE.ImageUtils.loadTexture( image );
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( this.floorRepeat, this.floorRepeat );
		
		// DoubleSide: render texture on both sides of mesh
		var floorMaterial = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );
        var width = this.floorX === 0 ? 10 : this.floorX;
        var height = this.floorZ === 0 ? 10 : this.floorZ;

        var floorGeometry = new THREE.PlaneGeometry(width, height, 1, 1);
		var floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.position.y = 0.0;
		floor.rotation.x = Math.PI / 2;
        floor.receiveShadow = this.shadowMapEnabled;
		this.scene.add(floor);
	},
	
	drawAxis: function( axis, axisColor, axisHeight ) {
		var		AXIS_RADIUS   =	axisHeight/200.0;
		var		AXIS_HEIGHT   =	axisHeight;
		var		AXIS_STEP     =	axisHeight/20.0;
		var    	AXIS_SEGMENTS = 32;
		var		AXIS_GRAY     = 0x777777;
		var		AXIS_WHITE    = 0xEEEEEE;
		var     curColor;

		//console.log("drawAxis " + axis + " ht: " +  AXIS_HEIGHT + ", " + AXIS_STEP + " color: " + axisColor);
	
		for ( var i=0; i<(AXIS_HEIGHT/AXIS_STEP); i++ )
		{
			//console.log("loop " +  i);
			
			var pos = -AXIS_HEIGHT / 2 + i * AXIS_STEP;
	
			if ((i & 1) === 0)
				curColor = axisColor;
			else if (pos < 0)
				curColor = AXIS_GRAY;
			else
				curColor = AXIS_WHITE;
			
			//console.log(i + " pos: " + pos + " color: " + curColor);
			
			var geometry = new THREE.CylinderGeometry( AXIS_RADIUS, AXIS_RADIUS, AXIS_STEP, AXIS_SEGMENTS ); 
			var material = new THREE.MeshLambertMaterial( { color: curColor } ); 
			var cylinder = new THREE.Mesh( geometry, material ); 
			
			pos += AXIS_STEP/2.0;
			if (axis === X_AXIS)
			{
				cylinder.position.x = pos;
				cylinder.rotation.z = Math.PI/2;
			}
			else if (axis === Y_AXIS)
			{
				cylinder.rotation.y = Math.PI/2;
				cylinder.position.y = pos;
			}
			else
			{	
				cylinder.position.z = pos;
				cylinder.rotation.x = Math.PI/2;
			}
			
			this.scene.add( cylinder );
		}
	},

	drawAxes: function( height ) {
	
		this.drawAxis(X_AXIS, 0xff0000, height);
		this.drawAxis(Y_AXIS, 0x00ff00, height);
		this.drawAxis(Z_AXIS, 0x0000ff, height);
	}
};
