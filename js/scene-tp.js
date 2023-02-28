if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var renderer = null;
let scene    = null;
let camera   = null;
let cube     = null;

let light = null;

let earthGroup = new THREE.Group();
let moonGroup = new THREE.Group();
let sunGroup = new THREE.Group();
let earth = null;
let moon = null;
let sun = null;

let controls = null;
let curTime  = Date.now();

// This function is called whenever the document is loaded
function init() {
    // Get display canvas
    let canvas = document.getElementById("webglcanvas");
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas,
        antialias: true } );
    // Set the viewport size
    renderer.setSize( canvas.width, canvas.height );
    // Create a new Three.js scene
    scene = new THREE.Scene();
    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height,
        1, 4000 );
    //initialisation camera
    camera.position.y = 10;
    camera.position.z = 15;
    camera.lookAt(0,0,0);

    //Url des textures
    let mapUrlEarth = "images/earth_atmos_2048.jpg";
    let mapUrlMoon = "images/moon_1024.jpg";
    let mapUrlSun = "images/sun_2048.jpg";

    //textures
    let mapEarth = new THREE.TextureLoader().load( mapUrlEarth );
    let mapMoon = new THREE.TextureLoader().load( mapUrlMoon );
    let mapSun = new THREE.TextureLoader().load( mapUrlSun );

    //meshes
    let materialEarth = new THREE.MeshPhongMaterial({ map: mapEarth, specular: 0x111111, });
    let materialMoon = new THREE.MeshPhongMaterial({ map: mapMoon, specular: 0x111111, });
    let materialSun = new THREE.MeshBasicMaterial({ map: mapSun });

    //earth Mesh
    earth = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        materialEarth
    );
    earth.position.set(0,0,-10);

    //moon Mesh
    moon = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 32, 32),
        materialMoon
    );
    moon.position.set(0,1,0);

    //sun Mesh
    sun = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 32, 32),
        materialSun
    );
    //light at sun position
    light = new THREE.PointLight( 0xffffff, 2);
    light.position.set(0,0,0);
    sun.position.set(0,0,0);
    //moon group in earth group
    moonGroup.add(moon);
    earthGroup.add(earth);
    moonGroup.position.set(earth.position.x,earth.position.y,earth.position.z);
    earthGroup.add(moonGroup);
    earthGroup.position.set(0,0,0);
    //earth group in sun group
    sunGroup.add(earthGroup);

    sunGroup.add(sun);
    sunGroup.add(light);
    sunGroup.position.set(0,0,0);
    scene.add(sunGroup);

    // Add background
    let path = "/images/MilkyWay/";
    let format = '.jpg';
    let urls = [
        path + 'posx' + format, path + 'negx' + format,
        path + 'posy' + format, path + 'negy' + format,
        path + 'posz' + format, path + 'negz' + format
    ];
    let textureCube = new THREE.CubeTextureLoader().load(urls);
    textureCube.format = THREE.RGBAFormat;
    scene.background = textureCube;

    // Add OrbitControls
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 20;


    //Shadow on planets
    renderer.shadowMap.enabled = true;
    // rendu coûteux mais plus joli (default: THREE.PCFShadowMap)
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    light.castShadow = true;
    // On peut aussi paramétrer la qualité du calcul
    light.shadow.mapSize.width = 512;  // default
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5;    // default
    light.shadow.camera.far = 50;
    earth.castShadow = true;
    earth.receiveShadow = true;
    moon.castShadow = true;
    moon.receiveShadow = true;
}

// This function is called regularly to update the canvas webgl.
function run() {
    // Ask to call again run
    requestAnimationFrame( run );

    // Render the sceneTp
    render();

    // Calls the animate function if objects or camera should move
    animate();
}

// This function is called regularly to take care of the rendering.
function render() {
    // Render the sceneTp
    renderer.render( scene, camera );
}

// This function is called regularly to update objects.
function animate() {
    // Computes how time has changed since last display
    let now       = Date.now();
    let deltaTime = now - curTime;
    curTime       = now;
    let fracTime  = deltaTime / 1000; // in seconds
    // Now we can move objects, camera, etc.
    let angle = 0.1 * Math.PI * 2 * fracTime*10; // one turn per 10 second.

    earthGroup.rotation.y += angle / 365; // la terre tourne en 365 jours
    earth.rotation.y      += angle; // et en un jour sur elle-même
    moonGroup.rotation.x  += angle / 28; // la lune tourne en 28 jours autour de la terre
    moon.rotation.x       += angle /28; // et en 28 jours aussi sur elle-même pour faire face à la terre

    sun.rotation.x += angle / 26; // le soleil tourne en 26 jours sur lui-même

    controls.update();
}
