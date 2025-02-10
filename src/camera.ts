import { mat4, vec3 } from "gl-matrix";

class Camera {
    private projectionMatrix: mat4;
    private viewMatrix: mat4;
    private modelMatrix: mat4;
    private position: vec3;
    private target: vec3;
    private up: vec3;


    constructor(fov: number, aspect: number, near: number, far: number) {
        this.projectionMatrix = mat4.create();
        mat4.perspective(this.projectionMatrix, fov, aspect, near, far);

        this.viewMatrix = mat4.create();
        this.modelMatrix = mat4.create();

        this.position = vec3.fromValues(0, 0, 2);
        this.target = vec3.fromValues(0, 0, 0);
        this.up = vec3.fromValues(0, 1, 0);


        this.updateViewMatrix();
    }

    updateViewMatrix() {
        mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
    }

    getFinalMatrix(): mat4 {
        const finalMatrix = mat4.create();
        mat4.multiply(finalMatrix, this.projectionMatrix, this.viewMatrix);
        mat4.multiply(finalMatrix, finalMatrix, this.modelMatrix);
        return finalMatrix;
    }

    setModelMatrix(matrix: mat4) {
        mat4.copy(this.modelMatrix, matrix);
    }

    moveForward(distance: number) {
        const forward = vec3.create();
        vec3.subtract(forward, this.target, this.position);
        vec3.normalize(forward, forward);
        vec3.scale(forward, forward, distance);
        vec3.add(this.position, this.position, forward);
        vec3.add(this.target, this.target, forward);
        this.updateViewMatrix();
    }

    moveBackward(distance: number) {
        this.moveForward(-distance);
    }

    moveLeft(distance: number) {
        const left = vec3.create();
        vec3.cross(left, this.up, vec3.subtract(vec3.create(), this.target, this.position));
        vec3.normalize(left, left);
        vec3.scale(left, left, distance);
        vec3.add(this.position, this.position, left);
        vec3.add(this.target, this.target, left);
        this.updateViewMatrix();
    }

    moveRight(distance: number) {
        this.moveLeft(-distance);
    }

    lookAt(target: vec3) {
        vec3.copy(this.target, target);
        this.updateViewMatrix();
    }
}

export default Camera;