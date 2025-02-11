export default class Shader {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;

  constructor(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string) {
      this.gl = gl;
      const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSource);
      const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentSource);
      this.program = this.createProgram(vertexShader, fragmentShader);
  }

  private createShader(type: GLenum, source: string): WebGLShader {
      const shader = this.gl.createShader(type)!;
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);
      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
          console.error(this.gl.getShaderInfoLog(shader));
          this.gl.deleteShader(shader);
          throw new Error("Shader compilation failed");
      }
      return shader;
  }

  private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
      const program = this.gl.createProgram()!;
      this.gl.attachShader(program, vertexShader);
      this.gl.attachShader(program, fragmentShader);
      this.gl.linkProgram(program);
      if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
          console.error(this.gl.getProgramInfoLog(program));
          this.gl.deleteProgram(program);
          throw new Error("Program linking failed");
      }
      return program;
  }

  use() {
      this.gl.useProgram(this.program);
  }

  setUniformMatrix4fv(name: string, matrix: Float32Array) {
      const location = this.gl.getUniformLocation(this.program, name);
      this.gl.uniformMatrix4fv(location, false, matrix);
  }

  setAttribute(name: string, buffer: WebGLBuffer, size: number, type: GLenum, normalize: boolean, stride: number, offset: number) {
      const location = this.gl.getAttribLocation(this.program, name);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
      this.gl.vertexAttribPointer(location, size, type, normalize, stride, offset);
      this.gl.enableVertexAttribArray(location);
  }
}

export const vertexShaderSource = `#version 300 es
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

export const fragmentShaderSource = `#version 300 es
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