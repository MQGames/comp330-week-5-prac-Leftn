"use strict";

class gameObject {
    constructor() {
        this._parent = null;
        this._children = [];

        this.translation = [0,0];
        this.rotation = 0;
        this.scale = 1;
    }


    get parent() {
        return this._parent;
    }

    set parent(p) {
        if (this._parent !== null) {
            let index = this._parent._children.indexOf(this);
            this._parent._children.slice(index, 1);
        }

        this._parent = p;

        if (p !== null) {
            p._children.push(this);
        }
    }

    renderSelf(gl, colourUniform) {
        // Empty function to allow pivot game objects to work
    }

    render(gl, worldMatrixUniform, colourUniform, parentMatrix) {
        check(isContext(gl), isUniformLocation(worldMatrixUniform, colourUniform));

        let matrix = parentMatrix;
        matrix = Matrix.multiply(matrix, Matrix.translation(this.translation[0], this.translation[1]));
        matrix = Matrix.multiply(matrix, Matrix.rotation(this.rotation));
        matrix = Matrix.multiply(matrix, Matrix.scale(this.scale, this.scale));
        gl.uniformMatrix3fv(worldMatrixUniform, false, matrix);
        this.renderSelf(gl, colourUniform);
        for (let i = 0; i < this._children.length; i++) {
            this._children[i].render(gl, worldMatrixUniform, colourUniform, matrix);
        }
    }
}