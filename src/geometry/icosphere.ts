import { vec3 } from "gl-matrix";
import Object3D, { Color, Vertex } from "../object3D";

function createIcosahedronVertices(radius: number): Vertex[] {
    const t = (1 + Math.sqrt(5)) / 2;

    const vertices: vec3[] = [
        vec3.fromValues(-1,  t,  0),
        vec3.fromValues( 1,  t,  0),
        vec3.fromValues(-1, -t,  0),
        vec3.fromValues( 1, -t,  0),
        vec3.fromValues( 0, -1,  t),
        vec3.fromValues( 0,  1,  t),
        vec3.fromValues( 0, -1, -t),
        vec3.fromValues( 0,  1, -t),
        vec3.fromValues( t,  0, -1),
        vec3.fromValues( t,  0,  1),
        vec3.fromValues(-t,  0, -1),
        vec3.fromValues(-t,  0,  1),
    ];

    return vertices.map(v => {
        vec3.normalize(v, v);
        vec3.scale(v, v, radius);
        return { position: v, color: [1.0, 1.0, 1.0, 1.0], normal: vec3.clone(v) };
    });
}

function createIcosahedronIndices(): Uint16Array {
    return new Uint16Array([
        0, 11, 5,  0, 5, 1,  0, 1, 7,  0, 7, 10,  0, 10, 11,
        1, 5, 9,  5, 11, 4,  11, 10, 2,  10, 7, 6,  7, 1, 8,
        3, 9, 4,  3, 4, 2,  3, 2, 6,  3, 6, 8,  3, 8, 9,
        4, 9, 5,  2, 4, 11,  6, 2, 10,  8, 6, 7,  9, 8, 1,
    ]);
}

function subdivide(vertices: Vertex[], indices: Uint16Array, radius: number): { vertices: Vertex[], indices: Uint16Array } {
    const midPointCache = new Map<string, number>();

    function getMidPointIndex(v1: number, v2: number): number {
        const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
        if (midPointCache.has(key)) {
            return midPointCache.get(key)!;
        }

        const p1 = vertices[v1].position;
        const p2 = vertices[v2].position;
        const midPoint = vec3.create();
        vec3.add(midPoint, p1, p2);
        vec3.scale(midPoint, midPoint, 0.5);
        vec3.normalize(midPoint, midPoint);
        vec3.scale(midPoint, midPoint, radius);

        const newIndex = vertices.length;
        vertices.push({ position: midPoint, color: [1.0, 1.0, 1.0, 1.0], normal: vec3.clone(midPoint) });
        midPointCache.set(key, newIndex);
        return newIndex;
    }

    const newIndices: number[] = [];
    for (let i = 0; i < indices.length; i += 3) {
        const v1 = indices[i];
        const v2 = indices[i + 1];
        const v3 = indices[i + 2];

        const a = getMidPointIndex(v1, v2);
        const b = getMidPointIndex(v2, v3);
        const c = getMidPointIndex(v3, v1);

        newIndices.push(v1, a, c);
        newIndices.push(v2, b, a);
        newIndices.push(v3, c, b);
        newIndices.push(a, b, c);
    }

    return { vertices, indices: new Uint16Array(newIndices) };
}

export default function getIcosphere(gl: WebGL2RenderingContext, radius: number, subdivisions: number, color: Color) {
    let vertices = createIcosahedronVertices(radius);
    let indices = createIcosahedronIndices();

    for (let i = 0; i < subdivisions; i++) {
        ({ vertices, indices } = subdivide(vertices, indices, radius));
    }

    vertices.forEach(v => v.color = color);

    return new Object3D(gl, vertices, indices);
}