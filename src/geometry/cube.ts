import { vec3 } from "gl-matrix";
import Object3D, { Color, Vertex } from "../object3D";

function createVertices(length: number, width: number, height: number, color: Color | [Color, Color, Color, Color, Color, Color]): Vertex[] {
    const halfLength = length / 2;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const colors = Array.isArray(color[0]) ? color : Array(6).fill(color);

    return [
        // Front face
        { position: vec3.fromValues(-halfWidth, -halfHeight,  halfLength), color: colors[0], normal: vec3.fromValues(0, 0, 1) },
        { position: vec3.fromValues( halfWidth, -halfHeight,  halfLength), color: colors[0], normal: vec3.fromValues(0, 0, 1) },
        { position: vec3.fromValues( halfWidth,  halfHeight,  halfLength), color: colors[0], normal: vec3.fromValues(0, 0, 1) },
        { position: vec3.fromValues(-halfWidth,  halfHeight,  halfLength), color: colors[0], normal: vec3.fromValues(0, 0, 1) },
        // Back face
        { position: vec3.fromValues(-halfWidth, -halfHeight, -halfLength), color: colors[1], normal: vec3.fromValues(0, 0, -1) },
        { position: vec3.fromValues( halfWidth, -halfHeight, -halfLength), color: colors[1], normal: vec3.fromValues(0, 0, -1) },
        { position: vec3.fromValues( halfWidth,  halfHeight, -halfLength), color: colors[1], normal: vec3.fromValues(0, 0, -1) },
        { position: vec3.fromValues(-halfWidth,  halfHeight, -halfLength), color: colors[1], normal: vec3.fromValues(0, 0, -1) },
        // Top face
        { position: vec3.fromValues(-halfWidth,  halfHeight, -halfLength), color: colors[2], normal: vec3.fromValues(0, 1, 0) },
        { position: vec3.fromValues( halfWidth,  halfHeight, -halfLength), color: colors[2], normal: vec3.fromValues(0, 1, 0) },
        { position: vec3.fromValues( halfWidth,  halfHeight,  halfLength), color: colors[2], normal: vec3.fromValues(0, 1, 0) },
        { position: vec3.fromValues(-halfWidth,  halfHeight,  halfLength), color: colors[2], normal: vec3.fromValues(0, 1, 0) },
        // Bottom face
        { position: vec3.fromValues(-halfWidth, -halfHeight, -halfLength), color: colors[3], normal: vec3.fromValues(0, -1, 0) },
        { position: vec3.fromValues( halfWidth, -halfHeight, -halfLength), color: colors[3], normal: vec3.fromValues(0, -1, 0) },
        { position: vec3.fromValues( halfWidth, -halfHeight,  halfLength), color: colors[3], normal: vec3.fromValues(0, -1, 0) },
        { position: vec3.fromValues(-halfWidth, -halfHeight,  halfLength), color: colors[3], normal: vec3.fromValues(0, -1, 0) },
        // Right face
        { position: vec3.fromValues( halfWidth, -halfHeight, -halfLength), color: colors[4], normal: vec3.fromValues(1, 0, 0) },
        { position: vec3.fromValues( halfWidth,  halfHeight, -halfLength), color: colors[4], normal: vec3.fromValues(1, 0, 0) },
        { position: vec3.fromValues( halfWidth,  halfHeight,  halfLength), color: colors[4], normal: vec3.fromValues(1, 0, 0) },
        { position: vec3.fromValues( halfWidth, -halfHeight,  halfLength), color: colors[4], normal: vec3.fromValues(1, 0, 0) },
        // Left face
        { position: vec3.fromValues(-halfWidth, -halfHeight, -halfLength), color: colors[5], normal: vec3.fromValues(-1, 0, 0) },
        { position: vec3.fromValues(-halfWidth,  halfHeight, -halfLength), color: colors[5], normal: vec3.fromValues(-1, 0, 0) },
        { position: vec3.fromValues(-halfWidth,  halfHeight,  halfLength), color: colors[5], normal: vec3.fromValues(-1, 0, 0) },
        { position: vec3.fromValues(-halfWidth, -halfHeight,  halfLength), color: colors[5], normal: vec3.fromValues(-1, 0, 0) },
    ];
}

const indices = new Uint16Array([
    0, 1, 2,  2, 3, 0,  // Front face
    4, 5, 6,  6, 7, 4,  // Back face
    8, 9, 10, 10, 11, 8, // Top face
    12, 13, 14, 14, 15, 12, // Bottom face
    16, 17, 18, 18, 19, 16, // Right face
    20, 21, 22, 22, 23, 20, // Left face
]);

export default function getCube(gl: WebGL2RenderingContext, length: number, width: number, height: number, color: Color | [Color, Color, Color, Color, Color, Color]) {
    const vertices = createVertices(length, width, height, color);
    return new Object3D(gl, vertices, indices);
}