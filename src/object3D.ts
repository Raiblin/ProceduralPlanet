import { mat4, vec3 } from "gl-matrix";
import Shader from "./shader";

export type Color = [number, number, number, number];

export interface Vertex {
    position: vec3;
    color: Color;
    normal: vec3;
}

export default class Object3D {
  private vertices: Vertex[];
  private indices: Uint16Array;
  private position: vec3;
  private rotation: vec3;
  private modelMatrix: mat4;
  private gl: WebGL2RenderingContext;
  private positionBuffer: WebGLBuffer | null;
  private colorBuffer: WebGLBuffer | null;
  private normalBuffer: WebGLBuffer | null;
  private indexBuffer: WebGLBuffer | null;

  constructor(gl: WebGL2RenderingContext, vertices: Vertex[], indices: Uint16Array) {
    this.gl = gl;
    this.vertices = vertices;
    this.indices = indices;
    this.position = vec3.create();
    this.rotation = vec3.create();
    this.modelMatrix = mat4.create();
    this.positionBuffer = null;
    this.colorBuffer = null;
    this.normalBuffer = null;
    this.indexBuffer = null;
    this.createBuffers();
  }

  private createBuffers() {
    const positions = new Float32Array(this.vertices.flatMap(v => Array.from(v.position)));
    const colors = new Float32Array(this.vertices.flatMap(v => v.color));
    const normals = new Float32Array(this.vertices.flatMap(v => Array.from(v.normal)));

    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

    this.colorBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, colors, this.gl.STATIC_DRAW);

    this.normalBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, normals, this.gl.STATIC_DRAW);

    this.indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices, this.gl.STATIC_DRAW);
  }

  setAttributes(shader: Shader) {
    if (this.positionBuffer) {
      shader.setAttribute("a_position", this.positionBuffer, 3, this.gl.FLOAT, false, 0, 0);
    }
    if (this.colorBuffer) {
      shader.setAttribute("a_color", this.colorBuffer, 4, this.gl.FLOAT, false, 0, 0);
    }
    if (this.normalBuffer) {
      shader.setAttribute("a_normal", this.normalBuffer, 3, this.gl.FLOAT, false, 0, 0);
    }
  }

  setPosition(x: number, y: number, z: number) {
    vec3.set(this.position, x, y, z);
    this.updateModelMatrix();
  }

  getPosition(): vec3 {
    return this.position;
  }

  setRotation(x: number, y: number, z: number) {
    vec3.set(this.rotation, x, y, z);
    this.updateModelMatrix();
  }

  getRotation(): vec3 {
    return this.rotation;
  }

  move(x: number, y: number, z: number) {
    vec3.add(this.position, this.position, vec3.fromValues(x, y, z));
    this.updateModelMatrix();
  }

  rotate(x: number, y: number, z: number) {
    vec3.add(this.rotation, this.rotation, vec3.fromValues(x, y, z));
    this.updateModelMatrix();
  }

  private updateModelMatrix() {
    mat4.identity(this.modelMatrix);
    mat4.translate(this.modelMatrix, this.modelMatrix, this.position);
    mat4.rotateX(this.modelMatrix, this.modelMatrix, this.rotation[0]);
    mat4.rotateY(this.modelMatrix, this.modelMatrix, this.rotation[1]);
    mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.rotation[2]);
  }

  getModelMatrix(): mat4 {
    return this.modelMatrix;
  }

  getVertices(): Vertex[] {
    return this.vertices;
  }

  getIndices(): Uint16Array {
    return this.indices;
  }
}