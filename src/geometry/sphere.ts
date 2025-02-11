import { vec3 } from "gl-matrix";
import Object3D, { Color, Vertex } from "../object3D";

function createVertices(radius: number, latitudeBands: number, longitudeBands: number, color: Color): Vertex[] {
    const vertices: Vertex[] = [];

    for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        const theta = latNumber * Math.PI / latitudeBands;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            const phi = longNumber * 2 * Math.PI / longitudeBands;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;
            //const u = 1 - (longNumber / longitudeBands);
            //const v = 1 - (latNumber / latitudeBands);

            const position = vec3.fromValues(radius * x, radius * y, radius * z);
            const normal = vec3.fromValues(x, y, z);
            vertices.push({ position, color, normal });
        }
    }

    return vertices;
}

function createIndices(latitudeBands: number, longitudeBands: number): Uint16Array {
    const indices: number[] = [];

    for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
            const first = (latNumber * (longitudeBands + 1)) + longNumber;
            const second = first + longitudeBands + 1;

            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }

    return new Uint16Array(indices);
}

export default function getSphere(gl: WebGL2RenderingContext, radius: number, latitudeBands: number, longitudeBands: number, color: Color) {
    const vertices = createVertices(radius, latitudeBands, longitudeBands, color);
    const indices = createIndices(latitudeBands, longitudeBands);
    return new Object3D(gl, vertices, indices);
}