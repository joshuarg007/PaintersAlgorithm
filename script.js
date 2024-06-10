let gl; // Declare a variable to store the WebGL context
let shaderProgram; // Declare a variable to store the shader program
const mat4 = glMatrix.mat4; // Declare a constant to store the mat4 utility functions from glMatrix library
let canvas; // Declare a variable to store the canvas element

function init() {
    canvas = document.getElementById('webgl-canvas'); // Get the canvas element from the DOM
    gl = canvas.getContext('webgl'); // Get the WebGL rendering context from the canvas

    if (!gl) { // Check if WebGL context creation was successful
        console.error('Unable to initialize WebGL. Your browser may not support it.'); // Log an error message if WebGL context creation fails
        return; // Exit the function
    }

    console.log('WebGL context initialized successfully.'); // Log a success message if WebGL context creation is successful

    // Set canvas size to match the screen size
    canvas.width = window.innerWidth; // Set the canvas width to match the window width
    canvas.height = window.innerHeight; // Set the canvas height to match the window height

    // Compile shaders and create shader program
    const fragmentShaderSource = document.getElementById('fragment-shader').textContent; // Get the fragment shader source code from the HTML document
    const vertexShaderSource = document.getElementById('vertex-shader').textContent; // Get the vertex shader source code from the HTML document
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER); // Compile the fragment shader
    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER); // Compile the vertex shader

    if (!fragmentShader || !vertexShader) { // Check if shader compilation was successful
        console.error('Failed to compile shaders.'); // Log an error message if shader compilation fails
        return; // Exit the function
    }

    shaderProgram = createProgram(gl, vertexShader, fragmentShader); // Create the shader program

    if (!shaderProgram) { // Check if shader program creation was successful
        console.error('Failed to create shader program.'); // Log an error message if shader program creation fails
        return; // Exit the function
    }

    console.log('Shader program created successfully.'); // Log a success message if shader program creation is successful

    // Define pyramid vertices
    const pyramidVertices = [ // Define the vertices of a pyramid
        // Base
        0.0, 0.0,  1.0,
       -1.0, 0.0, -1.0,
        1.0, 0.0, -1.0,
    
        // Front face
        0.0, 0.0,  1.0,
        1.0, 0.0, -1.0,
        0.0, 2.0,  0.0,
    
        // Right face
        0.0, 0.0,  1.0,
        0.0, 2.0,  0.0,
       -1.0, 0.0, -1.0,
    
        // Left face
        1.0, 0.0, -1.0,
        0.0, 2.0,  0.0,
       -1.0, 0.0, -1.0,
    ];

    console.log('Pyramid vertices defined.'); // Log a message indicating that pyramid vertices are defined

    // Define pyramid colors
    let pyramidColors = [ // Define an array of colors for the pyramid
        [1.0, 0.0, 0.0, 1.0], // Red
        [0.0, 1.0, 0.0, 1.0], // Green
        [0.0, 0.0, 1.0, 1.0]  // Blue
    ];

    render(pyramidVertices, pyramidColors); // Pass pyramidVertices and pyramidColors to the render function
}

function drawPyramid(position, scale, rotationAngle, projectionMatrix, pyramidVertices, pyramidColors) {
    const modelViewMatrix = mat4.create(); // Create a new mat4 matrix for the model-view transformation

    mat4.translate(modelViewMatrix, modelViewMatrix, position); // Apply translation to the model-view matrix
    mat4.scale(modelViewMatrix, modelViewMatrix, scale); // Apply scaling to the model-view matrix
    mat4.rotateY(modelViewMatrix, modelViewMatrix, glMatrix.glMatrix.toRadian(rotationAngle)); // Apply rotation to the model-view matrix

    const modelViewProjectionMatrix = mat4.create(); // Create a new mat4 matrix for the model-view-projection transformation
    mat4.multiply(modelViewProjectionMatrix, projectionMatrix, modelViewMatrix); // Multiply projection matrix by model-view matrix

    // Use the shader program
    gl.useProgram(shaderProgram); // Use the shader program for rendering

    // Get attribute and uniform locations
    const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'aPosition'); // Get the location of the attribute variable for position
    const colorAttributeLocation = gl.getAttribLocation(shaderProgram, 'aColor'); // Get the location of the attribute variable for color
    const uModelViewProjectionMatrix = gl.getUniformLocation(shaderProgram, 'uModelViewProjectionMatrix'); // Get the location of the uniform variable for the model-view-projection matrix

    // Check if attribute and uniform locations were retrieved successfully
    if (positionAttributeLocation === -1 || colorAttributeLocation === -1 || uModelViewProjectionMatrix === null) {
        console.error('Failed to get attribute or uniform locations.'); // Log an error message if retrieval of attribute or uniform locations fails
        return; // Exit the function
    }

    // Set up position attribute
    const positionBuffer = createBuffer(gl, pyramidVertices); // Create a buffer for the pyramid vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // Bind the buffer to the ARRAY_BUFFER target
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0); // Specify the vertex attributes for position
    gl.enableVertexAttribArray(positionAttributeLocation); // Enable the vertex attribute array for position

    // Pass model view projection matrix
    gl.uniformMatrix4fv(uModelViewProjectionMatrix, false, modelViewProjectionMatrix); // Set the value of the uniform variable for the model-view-projection matrix

    // Draw the pyramid
    gl.drawArrays(gl.TRIANGLES, 0, pyramidVertices.length / 3); // Draw the triangles using the vertices in the buffer
}

function compileShader(gl, source, type) {
    const shader = gl.createShader(type); // Create a new shader object of the specified type
    gl.shaderSource(shader, source); // Set the source code of the shader
    gl.compileShader(shader); // Compile the shader

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { // Check if shader compilation was successful
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader)); // Log an error message if shader compilation fails
        gl.deleteShader(shader); // Delete the shader object
        return null; // Return null to indicate shader compilation failure
    }

    return shader; // Return the compiled shader
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram(); // Create a new shader program object
    gl.attachShader(program, vertexShader); // Attach the vertex shader to the shader program
    gl.attachShader(program, fragmentShader); // Attach the fragment shader to the shader program
    gl.linkProgram(program); // Link the shader program

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { // Check if shader program linking was successful
        console.error('Error linking program:', gl.getProgramInfoLog(program)); // Log an error message if shader program linking fails
        gl.deleteProgram(program); // Delete the shader program object
        return null; // Return null to indicate shader program linking failure
    }

    return program; // Return the linked shader program
}

function createBuffer(gl, data) {
    const buffer = gl.createBuffer(); // Create a new buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer); // Bind the buffer to the ARRAY_BUFFER target
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW); // Fill the buffer with data
    return buffer; // Return the buffer object
}

function render(pyramidVertices, pyramidColors) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear the color and depth buffers

    const projectionMatrix = mat4.create(); // Create a new mat4 matrix for the projection transformation
    mat4.perspective(projectionMatrix, Math.PI / 3, canvas.width / canvas.height, 0.1, 100.0); // Apply perspective projection

    // Draw pyramids with different colors and rotations
    drawPyramid([0.75, 0.6, -5.0], [1.2, 0.6, 1.0], 0, projectionMatrix, pyramidVertices, pyramidColors); // Draw the first pyramid
    drawPyramid([0.0, 0.0, -3.0], [0.7, 0.5, 0.5], 30, projectionMatrix, pyramidVertices, pyramidColors); // Draw the second pyramid
    drawPyramid([1.9, 0.0, -6.0], [1.45, 0.7, 1.25], 60, projectionMatrix, pyramidVertices, pyramidColors); // Draw the third pyramid

    requestAnimationFrame(() => render(pyramidVertices, pyramidColors)); // Request the next animation frame and call the render function recursively
}

document.addEventListener('DOMContentLoaded', init); // Call the init function when the DOM content is loaded
