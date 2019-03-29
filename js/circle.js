"use strict";

class Circle extends gameObject{

    /**
    * Construct a polygon representing a unit circle with the specified number of sides and colour
    */
    
    constructor(colour) {
        check(isArray(colour));
        super();
        const nSides = 5;
        this.colour = colour;
        this.points = new Float32Array(nSides * 2);
        const step = ((2.0 * Math.PI)/nSides);
        for (let i = 0; i < nSides; i++) {
            let angle = step * i;
            this.points[2*i] = Math.cos(angle);
            this.points[2*i+1] = Math.sin(angle);
        }

    }

    renderSelf(gl, colourUniform) {
        check(isContext(gl), isUniformLocation(colourUniform));

        // TODO: Write code to render the shape at the origin, in the desired colour
        // Hint: use a TRIANGLE_FAN
//        let matrix = Matrix.trs(0, 0, 0, 1, 1);
//        gl.uniformMatrix3fv(worldMatrixUniform, false, matrix);

        gl.uniform4fv(colourUniform, this.colour);
        gl.bufferData(gl.ARRAY_BUFFER, this.points, gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, this.points.length/2);
    }

}