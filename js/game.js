"use strict";

// Shader code

const vertexShaderSource = `
attribute vec4 a_position;
uniform mat3 u_worldMatrix;
uniform mat3 u_viewMatrix;

void main() {
    // convert to homogeneous coordinates 
    vec3 pos = vec3(a_position.xy, 1);

    // multiply by world martix
    pos = u_worldMatrix * pos;

    // multiply by view martix
    pos = u_viewMatrix * pos;

    // output to gl_Position
    gl_Position = vec4(pos.xy,0,1);
}
`;

const fragmentShaderSource = `
precision mediump float;
uniform vec4 u_colour;

void main() {
    // set the fragment colour

    gl_FragColor = u_colour;
}
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

 function resize(canvas) {
    const resolution = window.devicePixelRatio || 1.0;

    const displayWidth = Math.floor(canvas.clientWidth * resolution);
    const displayHeight = Math.floor(canvas.clientHeight * resolution);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        return true;
    }
    else {
        return false;
    }    
}

function main() {

    // === Initialisation ===
    const resolution = 50;

    // get the canvas element & gl rendering 
    const canvas = document.getElementById("c");
    const gl = canvas.getContext("webgl");

    if (gl === null) {
        window.alert("WebGL not supported!");
        return;
    }
    
    // create GLSL shaders, upload the GLSL source, compile the shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program =  createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    // Initialise the shader attributes & uniforms
    const positionAttribute = gl.getAttribLocation(program, "a_position");
    const worldMatrixUniform = gl.getUniformLocation(program, "u_worldMatrix");
    const viewMatrixUniform = gl.getUniformLocation(program, "u_viewMatrix");
    const colourUniform = gl.getUniformLocation(program, "u_colour");

    // Initialise the array buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);
    
    // create a solar system

    const yellow = [1,1,0,1];               // Yellow = Red + Green
    const blue = [0,0,1,1];
    const grey = [0.5, 0.5, 0.5,1];
    const red = [1,0.2,0.2,1];

    const sun = new Circle(yellow);
    const sun_pivot = new gameObject()
    sun_pivot.parent = sun;

    const earth_pivot = new gameObject();
    earth_pivot.parent = sun_pivot;
    earth_pivot.translation = [5, 0];
    earth_pivot.scale = 0.5;

    const earth = new Circle(blue);
    earth.scale = 1;
    earth.translation = [0, 0];
    earth.parent = earth_pivot;

    const moon_pivot = new gameObject();
    moon_pivot.translation = [0, 0];
    moon_pivot.parent = earth_pivot;

    const moon = new Circle(grey);
    moon.scale = 0.3;
    moon.translation = [0, 2];
    moon.parent = moon_pivot;

    const day = 1; //seconds
    const year = 30;
    const month = 10;
    // === Per Frame operations ===

    // update objects in the scene
    let update = function(deltaTime) {
        earth.rotation += Math.PI * 2 * deltaTime/day;
        moon_pivot.rotation += Math.PI * 2 * deltaTime/month;
        sun_pivot.rotation += Math.PI * 2 * deltaTime/year;

    };

    // redraw the scene
    let render = function() {
        // clear the screen
        gl.viewport(0, 0, canvas.width, canvas.height);        
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // scale the view matrix to the canvas size & resolution
        const sx = 2 * resolution / canvas.width;
        const sy = 2 * resolution / canvas.height;
        const viewMatrix = Matrix.scale(sx, sy);
        gl.uniformMatrix3fv(viewMatrixUniform, false, viewMatrix);

        // render everything
        gl.uniformMatrix3fv(worldMatrixUniform, false, Matrix.identity());
        sun.render(gl, worldMatrixUniform, colourUniform, Matrix.identity());
    };

    // animation loop
    let oldTime = 0;
    let animate = function(time) {
        time = time / 1000;
        let deltaTime = time - oldTime;
        oldTime = time;

        resize(canvas);
        update(deltaTime);
        render();

        requestAnimationFrame(animate);
    }

    // start it going
    animate(0);
}    

