import { Ocean } from "./gpocean.js";

var testCanvas = document.createElement("canvas");
var testContext =
  testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
var webGL = !!(window.WebGLRenderingContext && testContext);
var camera, scene, renderer, orbit, stats, patch, ig;

if (webGL && testContext.getExtension("ANGLE_instanced_arrays")) {
  setup();
  run();
} else {
  var text =
    "Sorry, unable to initialize WebGL and required extensions. https://www.google.com/chrome/browser/";
  var div = document.createElement("div");
  var content = document.createTextNode(text);
  div.appendChild(content);
  div.id = "error";
  document.body.appendChild(div);
}

function setup() {
  var width = window.innerWidth;
  var height = window.innerHeight;
  camera = new THREE.PerspectiveCamera(40, width / height, 1, 1000);
  camera.position.y = 5;
  camera.position.z = 40;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  patch = new Ocean({ dx: 40, dz: 40, px: 32, pz: 16, computeNormals: true });
  // patch.addWave([1, 0.4], 180, 0.07, 0);
  // patch.addWave([1, 0], 70, 0.05, 0);
  // patch.addWave([1, 0.2], 12, 0.1, 0);
  // patch.addWave([1, 0.15], 17, 0.2, 0);
  patch.addWave([1, 0.5], 12, 0.15, 3);
  patch.addWave([1, 0.2], 17, 0.3, 0);
  patch.addWave([1, 0], 70, 0.04, 0);
  patch.addWave([1, 0.3], 170, 0.04, 1);

  ig = new THREE.InstancedBufferGeometry();
  ig.copy(new THREE.CircleBufferGeometry(0.05, 32));
  ig.addAttribute(
    "offset",
    new THREE.InstancedBufferAttribute(patch.vertices, 3)
  );
  ig.addAttribute(
    "normal",
    new THREE.InstancedBufferAttribute(patch.normals, 3)
  );

  var vs = document.getElementById("vertexShader").textContent;
  var fs = document.getElementById("fragmentShader").textContent;
  var material = new THREE.ShaderMaterial({
    uniforms: {
      dlDirection: { value: new THREE.Vector3(0.8, -0.3, 5.0) },
      dlSpecular: { value: new THREE.Vector3(0.8, 1.0, 0.6) },
      fogStart: { value: 40.0 },
      fogEnd: { value: 200.0 },
      fogColor: { value: new THREE.Vector3(0.0, 0.0, 0.0) },
      waveColor1: { value: new THREE.Vector3(66 / 255, 161 / 255, 244 / 255) },
    },
    vertexShader: vs,
    fragmentShader: fs,
  });

  var mesh = new THREE.Mesh(ig, material);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  //renderer.localClippingEnabled = true;
  document.body.appendChild(renderer.domElement);

  //orbit = new THREE.OrbitControls(camera, renderer.domElement);
  //orbit.enableZoom = false;

  //stats = new Stats();
  //stats.domElement.setAttribute("id", "stats");
  //document.body.appendChild(stats.domElement);

  // Add event handlers
  window.addEventListener("resize", onResize, false);
}

var log = false;

function run() {
  //stats.begin();
  patch.evaluate(Date.now() / 1000);
  updateParticles();
  renderer.render(scene, camera);
  //stats.end();
  requestAnimationFrame(run);
}

function updateParticles() {
  ig.attributes.offset.needsUpdate = true;
  ig.attributes.normal.needsUpdate = true;
}

function onResize() {
  var width = window.innerWidth;
  var height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
