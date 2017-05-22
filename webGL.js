"use strict";
var BufferStore = {}

BufferStore.GetBuffer = function ( shape, number, factor ) {
	if(this[shape] === undefined || this[shape][number] === undefined || this[shape][number][factor] === undefined) return false
	else return this[shape][number][factor]
}

BufferStore.SetBuffer = function ( shape, number, factor, buffer ) {
	if(this[shape] === undefined) this[shape] = []

	if(this[shape][number] === undefined) this[shape][number] = []	
	this[shape][number][factor] = buffer

	return true
}

var Canvas = {};

Canvas.init = function () {
	this.canvasEl = document.getElementById("Canvas")
	this.webGL = Canvas.initWebGL( this.canvasEl );
	if(!this.webGL) {console.log('error initialising webGL'); return;}

	this.initShaders(this.webGL);

    this.mvMatrix = mat4.create();
	this.mvMatrixStack = [];
    this.pMatrix = mat4.create();

//    this.webGL.enable(this.webGL.DEPTH_TEST);

	this.drawScene(Canvas.webGL, Canvas.pMatrix, Canvas.mvMatrix);
	window.requestAnimationFrame(Canvas.tick);
}

Canvas.initWebGL = function (canvasEl){
	var gl = null;

	// Try to grab the standard context. If it fails, fallback to experimental.
	gl = canvasEl.getContext('webgl') || canvasEl.getContext('experimental-webgl');

	if (!gl) {
		console.log('Unable to initialize WebGL. Your browser may not support it.');
		return false;
	// If we don't have a GL context, give up now
		  }
	else {
		gl.viewportWidth = canvasEl.width;
		gl.viewportHeight = canvasEl.height;
		gl.clearColor(0.1, 0.1, 0.1, 1.0);
	
		return gl
	}
}

Canvas.initShaders = function (gl){
	var fragmentShader = this.getShader(gl, 'shader-vs');
	var vertexShader = this.getShader(gl, 'shader-fs');

	// Create the shader program
	this.shaderProgram = gl.createProgram();

	gl.attachShader(this.shaderProgram, vertexShader);
	gl.attachShader(this.shaderProgram, fragmentShader);
	gl.linkProgram(this.shaderProgram);

	// If creating the shader program failed, alert
	if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
	console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(this.shaderProgram));
	}

	gl.useProgram(this.shaderProgram);

    this.shaderProgram.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

    this.shaderProgram.vertexColorAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(this.shaderProgram.vertexColorAttribute);

    this.shaderProgram.pMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uPMatrix");
    this.shaderProgram.mvMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
}

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
//	gl.viewport(0, 0, this.canvasEl.width, this.canvasEl.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//	console.log('in draw Scene')
	for(var i = 0, l = Canvas.Neighbourhood.length; i < l; i++)
	{
		for(var j = 0, m = Canvas.Neighbourhood[i].Plants.length; j < m; j++)
		{ Canvas.draw( gl, Canvas.Neighbourhood[i].Plants[j] ) }

		for(j = 0, m = Canvas.Neighbourhood[i].Herbis.length; j < m; j++)
		{ Canvas.draw( gl, Canvas.Neighbourhood[i].Herbis[j] ) }

		for(j = 0, m = Canvas.Neighbourhood[i].Carnivores.length; j < m; j++)
		{ Canvas.draw( gl, Canvas.Neighbourhood[i].Carnivores[j] ) }
	}
}

Canvas.draw = function (gl, Creature) {
	var diff = 6;
	var vertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);

	var vertices = this.createCircleVertices(diff, Math.max(Creature.energy,2));

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    vertexPositionBuffer.itemSize = 3;
    vertexPositionBuffer.numItems = diff+2;

	this.vertexPositionBuffer = vertexPositionBuffer;

	var vertexColorBuffer = gl.createBuffer();;
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);

	var colours = this.createCircleColours(Creature, diff+2);

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colours), gl.STATIC_DRAW);	  

    vertexColorBuffer.itemSize = 4;
    vertexColorBuffer.numItems = diff+2;

	this.vertexColorBuffer =  vertexColorBuffer;

	mat4.perspective(45, this.canvasEl.width / this.canvasEl.height, 0.1, 100.0, Canvas.pMatrix);
	mat4.identity(Canvas.mvMatrix);

	mat4.translate(Canvas.mvMatrix, [(Creature.x-500)/350, (Creature.y-400)/350, -3.0]);// position
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
	gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer);
	gl.vertexAttribPointer(this.shaderProgram.vertexColorAttribute, this.vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	Canvas.setMatrixUniforms(gl, Canvas.pMatrix, Canvas.mvMatrix);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vertexPositionBuffer.numItems);
}

Canvas.setMatrixUniforms = function (gl, pMatrix, mvMatrix) {
        gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, mvMatrix);
}

Canvas.createCircleVertices = function (num, r)
{	var Vertices
	
	if(Vertices = BufferStore.GetBuffer('CircleVertices', num, r)) return Vertices

	else {
		Vertices = [0.0, 0.0, 0.0];
		for(var i = 0; i <= num; i++)
		{Vertices.push( r/3750*Math.sin(2*Math.PI*i/num), r/3750*Math.cos(2*Math.PI*i/num), 0 )}
		BufferStore.SetBuffer('CircleVertices', num, r, Vertices)
		return Vertices
	}
}

Canvas.createCircleColours = function (Creature, num)
{
	var Colours
	if(Colours = BufferStore.GetBuffer(Creature.type, num, 0)) return Colours

	else {
		Colours = Creature.getColour()
		for(var i = 0; i <= num; i++)
		{Colours.push(0, 0, 0, 0.5)}
		BufferStore.SetBuffer(Creature.type, num, 0, Colours)	
		return Colours;
	}
}

Canvas.drawCommunity = function (community) {
	console.log('Not Implemented.')
	var c = document.getElementById("Canvas")
/*	var ctx = c.getContext("2d")
	ctx.beginPath()
	ctx.moveTo(community.lowerBound,community.leftBound)
	ctx.lineTo(community.upperBound,community.leftBound)
	ctx.lineTo(community.upperBound,community.rightBound)
	ctx.lineTo(community.lowerBound,community.rightBound)
	ctx.lineTo(community.lowerBound,community.leftBound)
	ctx.strokeStyle = "Yellow"
	ctx.stroke()*/
}

Canvas.drawCommunities = function (neighbourhood) {
	console.log('Not implemented in this version.')
	return
	for(var i = 0, l = neighbourhood.length; i < l; i++) {Canvas.drawCommunity(neighbourhood[i])}
}
