// global variables
var renderer, controls, scene, camera, sound;
var oakTrees = [], keys = [], poplarTrees = [];
var levelOne = true, perspective = true, movementEnabled = false, isCollision = false;
var numOfKeys = 1, lives = 2;
// constants
const numOfOakTrees = 15, numOfPoplarTrees = 10

// Function to reset the game enivronment and state back to the start
function restartGame() {
    if (scene) {
        // Remove every Mesh from the scene
        while (scene.children.find((c) => c.type == "Mesh")) {
            const mesh = scene.children.find((c) => c.type == "Mesh");
            scene.remove(mesh);
        }
        // Remove every other object from the scene
        while (scene.children.find((c) => c.type == "Group")) {
            const group = scene.children.find((c) => c.type == "Group");
            scene.remove(group);
        }
    }
    createGame();
}

// Function that creates skybox (playing environment) of the game
function createSkybox() {
    // make skybox using images of each face of cube
    let materialArray = [];
    let texture_5 = new THREE.TextureLoader().load('./assets/skybox5.png');
    let texture_1 = new THREE.TextureLoader().load('./assets/skybox1.png');
    let texture_2 = new THREE.TextureLoader().load('./assets/skybox2.png');
    let texture_4 = new THREE.TextureLoader().load('./assets/skybox4.png');
    let texture_6 = new THREE.TextureLoader().load('./assets/skybox6.png');
    let texture_3 = new THREE.TextureLoader().load('./assets/skybox3.png');

    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_5 }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_1 }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_2 }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_4 }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_6 }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_3 }));

    for(let i=0;i<6;i++){
        materialArray[i].side = THREE.BackSide;
    }

    let skyboxGeo = new THREE.BoxGeometry(100,100,100);
    let skybox = new THREE.Mesh(skyboxGeo, materialArray);
    scene.add(skybox);
}

// Function to create and display all game components in the scene
function createModels(fileName,modelName,modelArray,rotate,scaleFactor,y) {
    const loader = new THREE.GLTFLoader();
    loader.load( fileName, object => {
        const unit = object.scene.children[0];
        do {
            var x = Math.random() * 39 - 20;
            var z = Math.random() * 39 - 20;
        } while ((x > -3 && x < 3) || (z > -3 && z < 3));
        unit.position.set(x,y,z);
        unit.scale.set(scaleFactor,scaleFactor,scaleFactor);
        unit.name = modelName;
        if (rotate === true){
            var rotation = Math.random() * 4;
            unit.rotation.x = Math.PI / rotation;
        }
        modelArray.push(unit)
        scene.add( unit );
    }, undefined, function ( error ) {
        console.error( error );
    });
}

// Function to set up scene with all the game components, skybox and the floor
function createGame() {
    keys = [];
    oakTrees = [];
    poplarTrees = [];
    if (levelOne === true) {
        document.getElementById("level").innerHTML = 'Level: 1';
    } else {
        document.getElementById("level").innerHTML = 'Level: 2';
    }

    createSkybox();

    // insert own Blender model - the golden key
    for ( let i = 0; i < numOfKeys; i ++ ) {
        createModels('./assets/goldenKey.glb',`key${i}`,keys,true,0.25,0.5);
    }

    // add multiple oak trees
    for ( let i = 0; i < numOfOakTrees; i ++ ) {
        createModels('./assets/Oak_Tree.glb',`tree${i}`,oakTrees,false,2,-2);
    }
    // add multiple poplar trees
    for ( let i = 0; i < numOfPoplarTrees; i ++ ) {
        createModels('./assets/Poplar_Tree.glb',`firTree${i}`,poplarTrees,false,2,-2);
    }

    // create a cube (player) and add to scene
    var cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff2255});
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 0, 0);
    cube.name = 'cube';
    scene.add(cube);

    //floor
    var groundPlane = new THREE.PlaneGeometry(40, 40);
    var groundMat = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        map: new THREE.TextureLoader().load("./assets/grasslight-big.jpg")
    });
    groundMat.map.wrapS = groundMat.map.wrapT = THREE.RepeatWrapping;
    groundMat.map.repeat.set(10, 10);

    var physMesh = new THREE.Mesh(groundPlane, groundMat);
    physMesh.rotation.x = -0.5 * Math.PI;
    physMesh.receiveShadow = true;
    physMesh.position.y = -2;
    scene.add(physMesh);
}

// Initial function to set up the sound, scene, camera and lighting
function init() {
    sound = undefined;
    // create a scene, that will hold all the elements such as objects, cameras and lights.
    scene = new THREE.Scene();

    // create a camera, which defines where is being looked at.
    camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 1, 1000);
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    // create controls and set rotate and pan mouse keys
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        RIGHT: THREE.MOUSE.PAN
    }

    //create two light sources
    var dirLight = new THREE.DirectionalLight();
    dirLight.position.set(25, 23, 15);
    scene.add(dirLight);

    var dirLight2 = new THREE.DirectionalLight();
    dirLight2.position.set(-25, 23, 15);
    scene.add(dirLight2);


    // position and point the camera to the focal point of the scene
    camera.position.set(15, 16, 13);
    controls.update();
    camera.lookAt(scene.position);
    

    // add the output of the renderer to the html element
    document.body.appendChild(renderer.domElement);

    // create an AudioListener for sound and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add( listener );

    // create a global audio source
    sound = new THREE.Audio( listener );

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load( './assets/backgroundmusic.mp3', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop( true );
        sound.setVolume( 0.5 );
        sound.play();
    });

    // create rest of the game components
    createGame();

    // call the render function to update game state
    render();
}

// Function to detect player movement and change game state based on user interaction
function onKeyDown(e) {
    var key = e.which && e.which || e.keyCode();
    var moveDistance = 0.15;
    var cube = scene.getObjectByName('cube');
    if (movementEnabled === true) {
        if (key == '37' && cube.position.x - moveDistance > -20 && cube.position.x - moveDistance < 20) {
            // left arrow
            cube.position.x -= moveDistance;
        } else if (key == '38'&& cube.position.z - moveDistance > -20 && cube.position.z - moveDistance < 20) {
            // up arrow
            cube.position.z -= moveDistance;
        } else if (key == '39'&& cube.position.x + moveDistance > -20 && cube.position.x + moveDistance < 20) {
            // right arrow
            cube.position.x += moveDistance;
        } else if (key == '40'&& cube.position.z + moveDistance > -20 && cube.position.z + moveDistance < 20) {
            // down arrow
            cube.position.z += moveDistance;
        } 
    }
}

// Function to compute if two objects are intersecting
function computeBoundingBoxes(obj1,obj2){
    var res = false;
    obj1.geometry.computeBoundingBox();
    obj1.updateMatrixWorld();
    var box1 = obj1.geometry.boundingBox.clone();
    box1.applyMatrix4(obj1.matrixWorld);
    obj2.geometry.computeBoundingBox();
    obj2.updateMatrixWorld();
    var box2 = obj2.geometry.boundingBox.clone();
    box2.applyMatrix4(obj2.matrixWorld);
    if (box1.intersectsBox(box2) === true) {
        res = true;
    }
    return res;
}

// Function to perform collision detection between two objects
function detectCollision(obj1,obj2,complex,_callback){
    isCollision = false;
    if (complex === true){
        obj2.traverse( function ( child ) {
            if ( child.isMesh ) {
                isCollision = computeBoundingBoxes(obj1,child);
            }
        });
    } else {
        isCollision = computeBoundingBoxes(obj1,obj2);
    }
    _callback();
}

// Function update what information and displays are shown on the page
function showGameInfo(mainId,subId,maintext,subtext,blockerId,pageId,styleType) {
    document.getElementById(mainId).innerHTML = maintext;
    document.getElementById(subId).innerHTML = subtext;
    if (styleType === 'visibility'){
        pageId.style.visibility = 'visible';
        blockerId.style.visibility = 'visible';
    } else {
        pageId.style.display = '';
        blockerId.style.display = '';
    }
    movementEnabled = false;
}

// Function to check if tree meshes collide with the player (cube) or with the key placement(s)
function checkTreeCollision(treeArray,cube) {
    for (let i=0;i<treeArray.length;i++){
        if (treeArray[i]){
            detectCollision(cube,treeArray[i],true,function() {
                if (isCollision === true && movementEnabled === true) {
                    if (lives > 0){
                        document.getElementById("lives").innerHTML = `Lives: ${lives}`;
                        lives -= 1;
                        cube.position.set(0, 0, 0);
                    } else {
                        document.getElementById("lives").innerHTML = 'Lives: 0';
                        showGameInfo('game-over-main-text','game-over-sub-text','GAME OVER','You hit 3 trees and lost all your lives!',gameoverblocker,gameover,'visibility');
                    }
                }
            });
            for (let i=0;i<keys.length;i++){
                if (keys[i]) {
                    detectCollision(keys[i],treeArray[i],true,function() {
                        if (isCollision === true && treeArray == oakTrees) {
                            scene.remove(scene.getObjectByName(`tree${i}`));
                            treeArray.splice(i,1);
                        }
                        else if (isCollision === true && treeArray == poplarTrees) {
                            scene.remove(scene.getObjectByName(`firTree${i}`));
                            treeArray.splice(i,1);
                        }
                    });
                }
            }
        }
    }    
}

// Function to update game state depending on changes and interactions made by user
function render() {
    var cube = scene.getObjectByName('cube');
    for (let i=0;i<keys.length;i++){
        detectCollision(cube,keys[i],false,function() {
            if (isCollision === true && movementEnabled === true) {
                scene.remove(scene.getObjectByName(`key${i}`));
                keys.splice(i,1);
                numOfKeys -= 1;
                document.getElementById("keys").innerHTML = `Keys Left: ${numOfKeys}`;
            }
        });
        if (keys.length === 0 && levelOne === true){
            showGameInfo('start-game-text','start-game-sub-text','LEVEL PASSED - You found the key!','Click to go to the next level',instructionsblocker,instructions,'display');
            levelOne = false;
            numOfKeys = 2;
            document.getElementById("keys").innerHTML = `Keys Left: ${numOfKeys}`;
            restartGame();
        } else if (keys.length === 0 && levelOne === false)  {
            showGameInfo('game-over-main-text','game-over-sub-text','LEVEL PASSED - You found the keys!','Well done - You have finished all the levels!',gameoverblocker,gameover,'visibility');
        }
    }
    checkTreeCollision(oakTrees,cube);    
    checkTreeCollision(poplarTrees,cube); 
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
}

// calls the init function when the window is done loading
window.onload = init;

// When user mouse clicks the screen, instructions are hidden and game scene is shown
window.addEventListener("keydown", onKeyDown, false);
instructions.addEventListener( 'click', function () {
    instructions.style.display = 'none';
    instructionsblocker.style.display = 'none';
    movementEnabled = true;
});

// Heads-Up Display (HUD) elements and their functions:
document.getElementById("unmute").addEventListener("click", unmute);
document.getElementById("mute").addEventListener("click", mute);
document.getElementById("camera").addEventListener("click", changeCameraView);
document.getElementById("instructionsbtn").addEventListener("click", showInstructions);

// Sound functions:
function mute() {
    sound.pause();
}
function unmute() {
    sound.pause();
    sound.play();
}

// Change camera views by toggling between the top-down view and perspective view
function changeCameraView() {
    if (perspective === true) {
        camera.position.set(0.00002549508977272482, 25.495097567951184, 1.9936912652480415e-8);
        document.getElementById("camera").innerHTML = "Perspective View";
        perspective = false;
    } else {
        camera.position.set(15, 16, 13);
        document.getElementById("camera").innerHTML = "Top Down View";
        perspective = true;
    }
}

// Pop-up alert that can be accessed at any point of game from HUD bar
function showInstructions() {
    alert("Use the arrow keys to navigate the pink cube to collect all the keys in the forest.\n"
    + "Avoid bumping into any trees as you only have 3 lives to complete all the levels! \n"
    + "As you finish each level, one extra key will be added to the next level.\n"
    + "You must collect all the keys to finish a level before you run out of lives.\n \n"
    + "Use the 'Top Down View' button to toggle between camera views.\n"
    + "Use the 'mute' and 'unmute' buttons to manage the music.\n"
    + "Use the left mouse to rotate your game view and the right mouse to pan the camera.\n"
    + "Scroll or pinch in/out to zoom the camera.\n"
    + "The display bar at the top will keep you updated about your game. \n\n"
    + "Click 'OK' to continue playing.\nGOOD LUCK!!");
}