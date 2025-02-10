import { mat4, vec3 } from "gl-matrix";
import Camera from "./camera";

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

    float ambientStrength = 0.2; // Ambient light intensity
    vec3 ambient = v_color.rgb * ambientStrength; // Ambient lighting component

    // Compute diffuse lighting using Lambertian reflectance
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = v_color.rgb * diff;

    // Combine ambient and diffuse lighting
    vec3 finalColor = ambient + diffuse;

    // Output final shaded color
    FragColor = vec4(finalColor, v_color.a);
}`;

interface IVertex {
    position: vec3;
    color: [number, number, number, number];
    normal: vec3;
}

const vertices: IVertex[] = [
    // Front face
    { position: vec3.fromValues(-0.5, -0.5,  0.5), color: [1.0, 0.0, 0.0, 1.0], normal: vec3.fromValues(0, 0, 1) },
    { position: vec3.fromValues( 0.5, -0.5,  0.5), color: [1.0, 0.0, 0.0, 1.0], normal: vec3.fromValues(0, 0, 1) },
    { position: vec3.fromValues( 0.5,  0.5,  0.5), color: [1.0, 0.0, 0.0, 1.0], normal: vec3.fromValues(0, 0, 1) },
    { position: vec3.fromValues(-0.5,  0.5,  0.5), color: [1.0, 0.0, 0.0, 1.0], normal: vec3.fromValues(0, 0, 1) },
    // Back face
    { position: vec3.fromValues(-0.5, -0.5, -0.5), color: [0.0, 1.0, 0.0, 1.0], normal: vec3.fromValues(0, 0, -1) },
    { position: vec3.fromValues( 0.5, -0.5, -0.5), color: [0.0, 1.0, 0.0, 1.0], normal: vec3.fromValues(0, 0, -1) },
    { position: vec3.fromValues( 0.5,  0.5, -0.5), color: [0.0, 1.0, 0.0, 1.0], normal: vec3.fromValues(0, 0, -1) },
    { position: vec3.fromValues(-0.5,  0.5, -0.5), color: [0.0, 1.0, 0.0, 1.0], normal: vec3.fromValues(0, 0, -1) },
    // Top face
    { position: vec3.fromValues(-0.5,  0.5, -0.5), color: [0.0, 0.0, 1.0, 1.0], normal: vec3.fromValues(0, 1, 0) },
    { position: vec3.fromValues( 0.5,  0.5, -0.5), color: [0.0, 0.0, 1.0, 1.0], normal: vec3.fromValues(0, 1, 0) },
    { position: vec3.fromValues( 0.5,  0.5,  0.5), color: [0.0, 0.0, 1.0, 1.0], normal: vec3.fromValues(0, 1, 0) },
    { position: vec3.fromValues(-0.5,  0.5,  0.5), color: [0.0, 0.0, 1.0, 1.0], normal: vec3.fromValues(0, 1, 0) },
    // Bottom face
    { position: vec3.fromValues(-0.5, -0.5, -0.5), color: [1.0, 1.0, 0.0, 1.0], normal: vec3.fromValues(0, -1, 0) },
    { position: vec3.fromValues( 0.5, -0.5, -0.5), color: [1.0, 1.0, 0.0, 1.0], normal: vec3.fromValues(0, -1, 0) },
    { position: vec3.fromValues( 0.5, -0.5,  0.5), color: [1.0, 1.0, 0.0, 1.0], normal: vec3.fromValues(0, -1, 0) },
    { position: vec3.fromValues(-0.5, -0.5,  0.5), color: [1.0, 1.0, 0.0, 1.0], normal: vec3.fromValues(0, -1, 0) },
    // Right face
    { position: vec3.fromValues( 0.5, -0.5, -0.5), color: [1.0, 0.0, 1.0, 1.0], normal: vec3.fromValues(1, 0, 0) },
    { position: vec3.fromValues( 0.5,  0.5, -0.5), color: [1.0, 0.0, 1.0, 1.0], normal: vec3.fromValues(1, 0, 0) },
    { position: vec3.fromValues( 0.5,  0.5,  0.5), color: [1.0, 0.0, 1.0, 1.0], normal: vec3.fromValues(1, 0, 0) },
    { position: vec3.fromValues( 0.5, -0.5,  0.5), color: [1.0, 0.0, 1.0, 1.0], normal: vec3.fromValues(1, 0, 0) },
    // Left face
    { position: vec3.fromValues(-0.5, -0.5, -0.5), color: [0.0, 1.0, 1.0, 1.0], normal: vec3.fromValues(-1, 0, 0) },
    { position: vec3.fromValues(-0.5,  0.5, -0.5), color: [0.0, 1.0, 1.0, 1.0], normal: vec3.fromValues(-1, 0, 0) },
    { position: vec3.fromValues(-0.5,  0.5,  0.5), color: [0.0, 1.0, 1.0, 1.0], normal: vec3.fromValues(-1, 0, 0) },
    { position: vec3.fromValues(-0.5, -0.5,  0.5), color: [0.0, 1.0, 1.0, 1.0], normal: vec3.fromValues(-1, 0, 0) },
];

const indices = new Uint16Array([
    0, 1, 2,  2, 3, 0,  // Front face
    4, 5, 6,  6, 7, 4,  // Back face
    8, 9, 10, 10, 11, 8, // Top face
    12, 13, 14, 14, 15, 12, // Bottom face
    16, 17, 18, 18, 19, 16, // Right face
    20, 21, 22, 22, 23, 20, // Left face
]);

function createShader(gl: WebGL2RenderingContext, type: GLenum, source: string): WebGLShader {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw new Error("Shader compilation failed");
    }
    return shader;
}

function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        throw new Error("Program linking failed");
    }
    return program;
}

function main() {
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);

    const gl = canvas.getContext("webgl2");
    if (!gl) {
        console.error("WebGL2 not supported");
        return;
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (gl) {
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 1);

    const positions = new Float32Array(vertices.flatMap(v => Array.from(v.position)));
    const colors = new Float32Array(vertices.flatMap(v => v.color));
    const normals = new Float32Array(vertices.flatMap(v => Array.from(v.normal)));

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
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    const colorAttributeLocation = gl.getAttribLocation(program, "a_color");
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);

    const normalAttributeLocation = gl.getAttribLocation(program, "a_normal");
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    const matrixLocation = gl.getUniformLocation(program, "u_matrix");

    const camera = new Camera(Math.PI / 4, canvas.width / canvas.height, 0.1, 10.0);

    // Example camera movements
    camera.moveForward(4);
    camera.lookAt(vec3.fromValues(0, 0, 0));

    function render(time: number) {
        if (!gl) {
            return;
        }
        time *= 0.001; // Convert time to seconds

        // Create a rotation matrix
        const modelMatrix = mat4.create();
        mat4.rotate(modelMatrix, modelMatrix, time, [1, 1, 1]); // Rotate around the Y axis

        // Set the model matrix in the camera
        camera.setModelMatrix(modelMatrix);

        const finalMatrix = camera.getFinalMatrix();

        gl.uniformMatrix4fv(matrixLocation, false, finalMatrix);

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();