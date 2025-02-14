import { mat4, vec3 } from "gl-matrix";
import Camera from "./camera";
import Shader from "./shader";
import { Color } from "./object3D";
import getIcosphere from "./geometry/icosphere";

const vertexShaderSource = `#version 300 es
in vec4 a_position;
in vec4 a_color;
in vec3 a_normal;
uniform mat4 u_matrix;
out vec4 v_color;
out vec3 v_normal;
void main() {
    gl_Position = u_matrix * a_position;
    v_color = a_color;
    v_normal = mat3(u_matrix) * a_normal;
}`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

in vec3 v_normal;  // Normal from vertex shader
in vec4 v_color;   // Base color from vertex shader

out vec4 FragColor; // Final color output

void main() {
    // Define lighting properties
    vec3 lightDir = normalize(vec3(0.0, 1.0, 0.0)); // Light direction
    vec3 normal = normalize(v_normal); // Normalize the normal vector

    float ambientStrength = 1.0; // Ambient light intensity
    vec3 ambient = v_color.rgb * ambientStrength; // Ambient lighting component

    // Compute diffuse lighting using Lambertian reflectance
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = v_color.rgb * diff;

    // Combine ambient and diffuse lighting
    vec3 finalColor = ambient + diffuse;

    // Output final shaded color
    FragColor = vec4(finalColor, v_color.a);
}`;

function main() {
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);

    const gl = canvas.getContext("webgl2");
    if (!gl) {
        console.error("WebGL2 not supported");
        return;
    }

    const camera = new Camera(Math.PI / 4, canvas.width / canvas.height, 0.1, 10.0);

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (gl) {
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
        camera.updateProjectionMatrix(canvas.width / canvas.height);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
    shader.use();

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 1);

    const color: Color = [1.0, 0.0, 1.0, 1.0]; // Example single color
    const object3D = getIcosphere(gl, 0.5, 3, color); // Adjust subdivisions for desired resolution
    object3D.setAttributes(shader);

    const positions = new Float32Array(object3D.getVertices().flatMap(v => Array.from(v.position)));
    const colors = new Float32Array(object3D.getVertices().flatMap(v => v.color));
    const normals = new Float32Array(object3D.getVertices().flatMap(v => Array.from(v.normal)));

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, object3D.getIndices(), gl.STATIC_DRAW);

    shader.setAttribute("a_position", positionBuffer, 3, gl.FLOAT, false, 0, 0);
    shader.setAttribute("a_color", colorBuffer, 4, gl.FLOAT, false, 0, 0);
    shader.setAttribute("a_normal", normalBuffer, 3, gl.FLOAT, false, 0, 0);

    // Example camera movements
    camera.moveForward(4);
    camera.lookAt(vec3.fromValues(0, 0, 0));

    let previousTime = 0;
    let isWireframe = true; // Toggle this to switch between wireframe and solid rendering

    // Keyboard controls
    window.addEventListener('keydown', (event) => {
        console.log(event.key);
        switch (event.key) {
            case 'w':
                camera.moveForward(0.1);
                break;
            case 's':
                camera.moveBackward(0.1);
                break;
            case 'F1': 
                isWireframe = !isWireframe;
        }
    });

    // Mouse controls
    let isMouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    canvas.addEventListener('mousedown', (event) => {
        isMouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    });

    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
    });

    canvas.addEventListener('mousemove', (event) => {
        if (isMouseDown) {
            const deltaX = event.clientX - lastMouseX;
            const deltaY = event.clientY - lastMouseY;
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;

            camera.rotate(deltaX, deltaY);
        }
    });

    function render(time: number) {
        if (!gl) {
            return;
        }
        const deltaTime = (time - previousTime) * 0.001; // Calculate delta time in seconds
        previousTime = time;

        // Update camera position
        camera.update(deltaTime);

        // Rotate the object
        const rotationSpeed = 0.010; // Adjust this value to control the rotation speed
        object3D.rotate(rotationSpeed * deltaTime, rotationSpeed * deltaTime, rotationSpeed * deltaTime);

        const finalMatrix = camera.getFinalMatrix();
        mat4.multiply(finalMatrix, finalMatrix, object3D.getModelMatrix());

        shader.setUniformMatrix4fv("u_matrix", new Float32Array(finalMatrix));

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        if (isWireframe) {
            gl.drawElements(gl.LINES, object3D.getIndices().length, gl.UNSIGNED_SHORT, 0); // Use gl.LINES for wireframe
        } else {
            gl.drawElements(gl.TRIANGLES, object3D.getIndices().length, gl.UNSIGNED_SHORT, 0); // Use gl.TRIANGLES for solid rendering
        }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();