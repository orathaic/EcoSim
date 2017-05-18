"use strict";
var Canvas = {};

Canvas.init = function () {
	this.webGL = Canvas.initWebGL( document.getElementById("Canvas") );
	if(!this.webGL) {console.log('error initialising webGL'); return;}

	this.squareVertexPositionBuffer = this.initBuffers(this.webGL);
	this.initShaders(this.webGL);
    this.webGL.enable(this.webGL.DEPTH_TEST);

    this.mvMatrix = mat4.create();
    this.pMatrix = mat4.create();

    this.webGL.clearColor(0.1, 0.1, 0.1, 1.0);
    this.webGL.enable(this.webGL.DEPTH_TEST);

    this.drawScene(this.webGL, this.pMatrix, this.mvMatrix);
}

Canvas.initWebGL = function (canvasEl){
	var gl = null;

	// Try to grab the standard context. If it fails, fallback to experimental.
	gl = canvasEl.getContext('webgl') || canvasEl.getContext('experimental-webgl');

	if (!gl) {
		console.log('Unable to initialize WebGL. Your browser may not support it.');
		  }
	// If we don't have a GL context, give up now
	if(!gl) {return false;} 

	gl.clearColor(0.1, 0.1, 0.1, 1.0);

	return gl
}

Canvas.initBuffers = function (gl) {

	var squareVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	
	var vertices = [
		1.0,  1.0,  0.0,
		-1.0, 1.0,  0.0,
		1.0,  -1.0, 0.0,
		-1.0, -1.0, 0.0
	];
	  
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;

	return squareVertexPositionBuffer;
}
Canvas.initShaders = function (gl){
	var fragmentShader = this.getShader(gl, 'shader-fs');
	var vertexShader = this.getShader(gl, 'shader-vs');

	// Create the shader program
	gl.shaderProgram = gl.createProgram();

	gl.attachShader(gl.shaderProgram, vertexShader);
	gl.attachShader(gl.shaderProgram, fragmentShader);
	gl.linkProgram(gl.shaderProgram);

	// If creating the shader program failed, alert
	if (!gl.getProgramParameter(gl.shaderProgram, gl.LINK_STATUS)) {
	console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(gl.shaderProgram));
	}

	gl.useProgram(gl.shaderProgram);

	var vertexPositionAttribute = gl.getAttribLocation(gl.shaderProgram, 'aVertexPosition');
	gl.enableVertexAttribArray(vertexPositionAttribute);
}
//	var horizAspect = 480.0/640.0;

Canvas.getShader = function (gl, id, type) {
	var shaderScript, theSource, currentChild, shader, shaderType;
	  
	shaderScript = document.getElementById(id);
  
	if (!shaderScript) {
		return null;
	}
	  
	theSource = shaderScript.import.body.textContent;

	if (!type) {
		if (shaderScript.type == 'x-shader/x-fragment') {
		  type = gl.FRAGMENT_SHADER;
		} else if (shaderScript.type == 'x-shader/x-vertex') {
		  type = gl.VERTEX_SHADER;
		} else { 
		  // Unknown shader type
		  return null;
		}
	  }
	shader = gl.createShader(type);
	gl.shaderSource(shader, theSource);

	// Compile the shader program
	gl.compileShader(shader);  

	// See if it compiled successfully
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
		console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));  
		gl.deleteShader(shader);
		return null;  
	}

	return shader;
}

Canvas.resizeContext = function (gl) {
	var canvas =  document.getElementById("Canvas"); 
	gl.viewport(0, 0, canvas.width, canvas.height);
}

Canvas.drawScene = function (gl, pMatrix, mvMatrix) {

	gl.viewport(0, 0, 800, 640);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	mat4.perspective(45, 800 / 640, 0.1, 100.0, pMatrix);
	mat4.identity(mvMatrix);

	mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);
 
	gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexPositionBuffer);
	gl.vertexAttribPointer(gl.shaderProgram.vertexPositionAttribute, this.squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	Canvas.setMatrixUniforms(gl, Canvas.pMatrix, Canvas.mvMatrix);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.squareVertexPositionBuffer.numItems);


}

Canvas.setMatrixUniforms = function (gl, pMatrix, mvMatrix) {
        gl.uniformMatrix4fv(gl.shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(gl.shaderProgram.mvMatrixUniform, false, mvMatrix);
    }

Canvas.redraw = function (Creatures) {
	
/*	var c = document.getElementById("Canvas");
	var glctx = c.getContext("webgl");*/
	
/*		for(var i =0, l =Creatures.length; i < l; i++)
		 { // Draw loop
			Creature = Creatures[i];
			ctx.beginPath();
			ctx.arc(Creature.x,Creature.y,Math.max(Creature.energy,1)/20,0,6.283185307179586); // 6.283185307179586 is 2 * Math.PI 
			ctx.fillStyle = Creature.type;
			ctx.fill();
		 }
*/
}

Canvas.drawCommunity = function (community) {
	var c = document.getElementById("Canvas")
	var ctx = c.getContext("2d")
	ctx.beginPath()
	ctx.moveTo(community.lowerBound,community.leftBound)
	ctx.lineTo(community.upperBound,community.leftBound)
	ctx.lineTo(community.upperBound,community.rightBound)
	ctx.lineTo(community.lowerBound,community.rightBound)
	ctx.lineTo(community.lowerBound,community.leftBound)
	ctx.strokeStyle = "Yellow"
	ctx.stroke()
}
Canvas.drawCommunities = function (neighbourhood) {
	for(var i = 0, l = neighbourhood.length; i < l; i++) {Canvas.drawCommunity(neighbourhood[i])}
}
