//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)

// Tabs set to 2

/*=====================
  VBObox-Lib.js library: 
  ===================== 
Note that you don't really need 'VBObox' objects for any simple, 
    beginner-level WebGL/OpenGL programs: if all vertices contain exactly 
		the same attributes (e.g. position, color, surface normal), and use 
		the same shader program (e.g. same Vertex Shader and Fragment Shader), 
		then our textbook's simple 'example code' will suffice.
		  
***BUT*** that's rare -- most genuinely useful WebGL/OpenGL programs need 
		different sets of vertices with  different sets of attributes rendered 
		by different shader programs.  THUS a customized VBObox object for each 
		VBO/shader-program pair will help you remember and correctly implement ALL 
		the WebGL/GLSL steps required for a working multi-shader, multi-VBO program.
		
One 'VBObox' object contains all we need for WebGL/OpenGL to render on-screen a 
		set of shapes made from vertices stored in one Vertex Buffer Object (VBO), 
		as drawn by calls to one 'shader program' that runs on your computer's 
		Graphical Processing Unit(GPU), along with changes to values of that shader 
		program's one set of 'uniform' varibles.  
The 'shader program' consists of a Vertex Shader and a Fragment Shader written 
		in GLSL, compiled and linked and ready to execute as a Single-Instruction, 
		Multiple-Data (SIMD) parallel program executed simultaneously by multiple 
		'shader units' on the GPU.  The GPU runs one 'instance' of the Vertex 
		Shader for each vertex in every shape, and one 'instance' of the Fragment 
		Shader for every on-screen pixel covered by any part of any drawing 
		primitive defined by those vertices.
The 'VBO' consists of a 'buffer object' (a memory block reserved in the GPU),
		accessed by the shader program through its 'attribute' variables. Shader's
		'uniform' variable values also get retrieved from GPU memory, but their 
		values can't be changed while the shader program runs.  
		Each VBObox object stores its own 'uniform' values as vars in JavaScript; 
		its 'adjust()'	function computes newly-updated values for these uniform 
		vars and then transfers them to the GPU memory for use by shader program.
EVENTUALLY you should replace 'cuon-matrix-quat03.js' with the free, open-source
   'glmatrix.js' library for vectors, matrices & quaternions: Google it!
		This vector/matrix library is more complete, more widely-used, and runs
		faster than our textbook's 'cuon-matrix-quat03.js' library.  
		--------------------------------------------------------------
		I recommend you use glMatrix.js instead of cuon-matrix-quat03.js
		--------------------------------------------------------------
		for all future WebGL programs. 
You can CONVERT existing cuon-matrix-based programs to glmatrix.js in a very 
    gradual, sensible, testable way:
		--add the glmatrix.js library to an existing cuon-matrix-based program;
			(but don't call any of its functions yet).
		--comment out the glmatrix.js parts (if any) that cause conflicts or in	
			any way disrupt the operation of your program.
		--make just one small local change in your program; find a small, simple,
			easy-to-test portion of your program where you can replace a 
			cuon-matrix object or function call with a glmatrix function call.
			Test; make sure it works. Don't make too large a change: it's hard to fix!
		--Save a copy of this new program as your latest numbered version. Repeat
			the previous step: go on to the next small local change in your program
			and make another replacement of cuon-matrix use with glmatrix use. 
			Test it; make sure it works; save this as your next numbered version.
		--Continue this process until your program no longer uses any cuon-matrix
			library features at all, and no part of glmatrix is commented out.
			Remove cuon-matrix from your library, and now use only glmatrix.

	------------------------------------------------------------------
	VBObox -- A MESSY SET OF CUSTOMIZED OBJECTS--NOT REALLY A 'CLASS'
	------------------------------------------------------------------
As each 'VBObox' object can contain:
  -- a DIFFERENT GLSL shader program, 
  -- a DIFFERENT set of attributes that define a vertex for that shader program, 
  -- a DIFFERENT number of vertices to used to fill the VBOs in GPU memory, and 
  -- a DIFFERENT set of uniforms transferred to GPU memory for shader use.  
  THUS:
		I don't see any easy way to use the exact same object constructors and 
		prototypes for all VBObox objects.  Every additional VBObox objects may vary 
		substantially, so I recommend that you copy and re-name an existing VBObox 
		prototype object, and modify as needed, as shown here. 
		(e.g. to make the VBObox3 object, copy the VBObox2 constructor and 
		all its prototype functions, then modify their contents for VBObox3 
		activities.)

*/

// Written for EECS 351-2,	Intermediate Computer Graphics,
//							Northwestern Univ. EECS Dept., Jack Tumblin
// 2016.05.26 J. Tumblin-- Created; tested on 'TwoVBOs.html' starter code.
// 2017.02.20 J. Tumblin-- updated for EECS 351-1 use for Project C.
// 2018.04.11 J. Tumblin-- minor corrections/renaming for particle systems.
//    --11e: global 'gl' replaced redundant 'myGL' fcn args; 
//    --12: added 'SwitchToMe()' fcn to simplify 'init()' function and to fix 
//      weird subtle errors that sometimes appear when we alternate 'adjust()'
//      and 'draw()' functions of different VBObox objects. CAUSE: found that
//      only the 'draw()' function (and not the 'adjust()' function) made a full
//      changeover from one VBObox to another; thus calls to 'adjust()' for one
//      VBObox could corrupt GPU contents for another.
//      --Created vboStride, vboOffset members to centralize VBO layout in the 
//      constructor function.
//    -- 13 (abandoned) tried to make a 'core' or 'resuable' VBObox object to
//      which we would add on new properties for shaders, uniforms, etc., but
//      I decided there was too little 'common' code that wasn't customized.
//=============================================================================


//=============================================================================
//=============================================================================
function VBObox0() {
//=============================================================================
//=============================================================================
// CONSTRUCTOR for one re-usable 'VBObox0' object that holds all data and fcns
// needed to render vertices from one Vertex Buffer Object (VBO) using one 
// separate shader program (a vertex-shader & fragment-shader pair) and one
// set of 'uniform' variables.

// Constructor goal: 
// Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
// written into code) in all other VBObox functions. Keeping all these (initial)
// values here, in this one coonstrutor function, ensures we can change them 
// easily WITHOUT disrupting any other code, ever!
  
	this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
  'precision highp float;\n' +				// req'd in OpenGL ES if we use 'float'
  //
  'uniform mat4 u_ModelMat0;\n' +
  'attribute vec4 a_Pos0;\n' +
  'attribute vec3 a_Colr0;\n'+
  'varying vec3 v_Colr0;\n' +
  //
  'void main() {\n' +
  '  gl_Position = u_ModelMat0 * a_Pos0;\n' +
  '	 v_Colr0 = a_Colr0;\n' +
  ' }\n';

	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
  'precision mediump float;\n' +
  'varying vec3 v_Colr0;\n' +
  'void main() {\n' +
  '  gl_FragColor = vec4(v_Colr0, 1.0);\n' + 
  '}\n';

  makeGroundGrid();

	this.vboContents = //---------------------------------------------------------
	gndVerts;

	this.vboVerts = 400;						// # of vertices held in 'vboContents' array
	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
	                              // bytes req'd by 1 vboContents array element;
																// (why? used to compute stride and offset 
																// in bytes for vertexAttribPointer() calls)
  this.vboBytes = this.vboContents.length * this.FSIZE;               
                                // total number of bytes stored in vboContents
                                // (#  of floats in vboContents array) * 
                                // (# of bytes/float).
	this.vboStride = this.vboBytes / this.vboVerts; 
	                              // (== # of bytes to store one complete vertex).
	                              // From any attrib in a given vertex in the VBO, 
	                              // move forward by 'vboStride' bytes to arrive 
	                              // at the same attrib for the next vertex. 

	            //----------------------Attribute sizes
  this.vboFcount_a_Pos0 =  4;    // # of floats in the VBO needed to store the
                                // attribute named a_Pos0. (4: x,y,z,w values)
  this.vboFcount_a_Colr0 = 3;   // # of floats for this attrib (r,g,b values) 
  console.assert((this.vboFcount_a_Pos0 +     // check the size of each and
                  this.vboFcount_a_Colr0) *   // every attribute in our VBO
                  this.FSIZE == this.vboStride, // for agreeement with'stride'
                  "Uh oh! VBObox0.vboStride disagrees with attribute-size values!");

              //----------------------Attribute offsets  
	this.vboOffset_a_Pos0 = 0;    // # of bytes from START of vbo to the START
	                              // of 1st a_Pos0 attrib value in vboContents[]
  this.vboOffset_a_Colr0 = this.vboFcount_a_Pos0 * this.FSIZE;    
                                // (4 floats * bytes/float) 
                                // # of bytes from START of vbo to the START
                                // of 1st a_Colr0 attrib value in vboContents[]
	            //-----------------------GPU memory locations:
	this.vboLoc;									// GPU Location for Vertex Buffer Object, 
	                              // returned by gl.createBuffer() function call
	this.shaderLoc;								// GPU Location for compiled Shader-program  
	                            	// set by compile/link of VERT_SRC and FRAG_SRC.
								          //------Attribute locations in our shaders:
	this.a_PosLoc;								// GPU location for 'a_Pos0' attribute
	this.a_ColrLoc;								// GPU location for 'a_Colr0' attribute

	            //---------------------- Uniform locations &values in our shaders
	this.ModelMat = new Matrix4();	// Transforms CVV axes to model axes.
	this.u_ModelMatLoc;							// GPU location for u_ModelMat uniform
}

VBObox0.prototype.init = function() {
//=============================================================================
// Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
// kept in this VBObox. (This function usually called only once, within main()).
// Specifically:
// a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
//  executable 'program' stored and ready to use inside the GPU.  
// b) create a new VBO object in GPU memory and fill it by transferring in all
//  the vertex data held in our Float32array member 'VBOcontents'. 
// c) Find & save the GPU location of all our shaders' attribute-variables and 
//  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
// -------------------
// CAREFUL!  before you can draw pictures using this VBObox contents, 
//  you must call this VBObox object's switchToMe() function too!
//--------------------
// a) Compile,link,upload shaders-----------------------------------------------
	this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }
// CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
//  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}

	gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())

// b) Create VBO on GPU, fill it------------------------------------------------
	this.vboLoc = gl.createBuffer();	
  if (!this.vboLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create VBO in GPU. Bye!'); 
    return;
  }
  // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
  //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
  								this.vboLoc);				  // the ID# the GPU uses for this buffer.

  // Fill the GPU's newly-created VBO object with the vertex data we stored in
  //  our 'vboContents' member (JavaScript Float32Array object).
  //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
  //    use gl.bufferSubData() to modify VBO contents without changing VBO size)
  gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
 					 				this.vboContents, 		// JavaScript Float32Array
  							 	gl.STATIC_DRAW);			// Usage hint.
  //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
  //	(see OpenGL ES specification for more info).  Your choices are:
  //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents rarely or never change.
  //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents may change often as our program runs.
  //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
  // 			times and then discarded; for rapidly supplied & consumed VBOs.

  // c1) Find All Attributes:---------------------------------------------------
  //  Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (for switchToMe(), adjust(), draw(), reload(),etc.)
  this.a_PosLoc = gl.getAttribLocation(this.shaderLoc, 'a_Pos0');
  if(this.a_PosLoc < 0) {
    console.log(this.constructor.name + 
    						'.init() Failed to get GPU location of attribute a_Pos0');
    return -1;	// error exit.
  }
 	this.a_ColrLoc = gl.getAttribLocation(this.shaderLoc, 'a_Colr0');
  if(this.a_ColrLoc < 0) {
    console.log(this.constructor.name + 
    						'.init() failed to get the GPU location of attribute a_Colr0');
    return -1;	// error exit.
  }
  // c2) Find All Uniforms:-----------------------------------------------------
  //Get GPU storage location for each uniform var used in our shader programs: 
	this.u_ModelMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMat0');
  if (!this.u_ModelMatLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_ModelMat1 uniform');
    return;
  }  
}

VBObox0.prototype.switchToMe = function() {
//==============================================================================
// Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
//
// We only do this AFTER we called the init() function, which does the one-time-
// only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
// even then, you are STILL not ready to draw our VBObox's contents onscreen!
// We must also first complete these steps:
//  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
//  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
//  c) tell the GPU to connect the shader program's attributes to that VBO.

// a) select our shader program:
  gl.useProgram(this.shaderLoc);	
//		Each call to useProgram() selects a shader program from the GPU memory,
// but that's all -- it does nothing else!  Any previously used shader program's 
// connections to attributes and uniforms are now invalid, and thus we must now
// establish new connections between our shader program's attributes and the VBO
// we wish to use.  
  
// b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
//  instead connect to our own already-created-&-filled VBO.  This new VBO can 
//    supply values to use as attributes in our newly-selected shader program:
	gl.bindBuffer(gl.ARRAY_BUFFER,	        // GLenum 'target' for this GPU buffer 
										this.vboLoc);			    // the ID# the GPU uses for our VBO.

// c) connect our newly-bound VBO to supply attribute variable values for each
// vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
// this sets up data paths from VBO to our shader units:
  // 	Here's how to use the almost-identical OpenGL version of this function:
	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
  gl.vertexAttribPointer(
		this.a_PosLoc,//index == ID# for the attribute var in your GLSL shader pgm;
		this.vboFcount_a_Pos0,// # of floats used by this attribute: 1,2,3 or 4?
		gl.FLOAT,			// type == what data type did we use for those numbers?
		false,				// isNormalized == are these fixed-point values that we need
									//									normalize before use? true or false
		this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
		              // stored attrib for this vertex to the same stored attrib
		              //  for the next vertex in our VBO.  This is usually the 
									// number of bytes used to store one complete vertex.  If set 
									// to zero, the GPU gets attribute values sequentially from 
									// VBO, starting at 'Offset'.	
									// (Our vertex size in bytes: 4 floats for pos + 3 for color)
		this.vboOffset_a_Pos0);						
		              // Offset == how many bytes from START of buffer to the first
  								// value we will actually use?  (We start with position).
  gl.vertexAttribPointer(this.a_ColrLoc, this.vboFcount_a_Colr0, 
                        gl.FLOAT, false, 
                        this.vboStride, this.vboOffset_a_Colr0);
  							
// --Enable this assignment of each of these attributes to its' VBO source:
  gl.enableVertexAttribArray(this.a_PosLoc);
  gl.enableVertexAttribArray(this.a_ColrLoc);
}

VBObox0.prototype.isReady = function() {
//==============================================================================
// Returns 'true' if our WebGL rendering context ('gl') is ready to render using
// this objects VBO and shader program; else return false.
// see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter

var isOK = true;

  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
    console.log(this.constructor.name + 
    						'.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
      console.log(this.constructor.name + 
  						'.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox0.prototype.adjust = function() {
//==============================================================================
// Update the GPU to newer, current values we now store for 'uniform' vars on 
// the GPU; and (if needed) update each attribute's stride and offset in VBO.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.adjust() call you needed to call this.switchToMe()!!');
  }  
  this.PM = new Matrix4();
  this.VM = new Matrix4();
  var vpAspect = g_canvasID.width /g_canvasID.height;	// this camera: width/height.
  this.PM.setPerspective(30.0-cameraX,vpAspect,1.0,1000.0);
  this.VM.setLookAt(5+cameraYX,0+cameraYY,2,5+cameraYX-Math.cos(Math.PI*cameraAngleY/180)*6*Math.cos(Math.PI*cameraAngleX/180),0+cameraYY+Math.sin(Math.PI*cameraAngleY/180)*6*Math.cos(Math.PI*cameraAngleX/180),-1.5+7*Math.sin(Math.PI*cameraAngleX/180),0,0,1);
  
	// Adjust values for our uniforms,
  //this.ModelMat.setRotate(g_angleNow0, 0, 0, 1);	  // rotate drawing axes,
  //this.ModelMat.translate(0.35, 0, 0);							// then translate them.
  this.ModelMat.setTranslate(0, 0 ,0)
  this.ModelMat.scale(0.05, 0.05, 0.05);							// then translate them.
  mvpMatrix = new Matrix4();
	mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMat);
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatLoc,	// GPU location of the uniform
  										false, 				// use matrix transpose instead?
  										mvpMatrix.elements);	// send data from Javascript.
  // Adjust the attributes' stride and offset (if necessary)
  // (use gl.vertexAttribPointer() calls and gl.enableVertexAttribArray() calls)
}

VBObox0.prototype.draw = function() {
//=============================================================================
// Render current VBObox contents.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.draw() call you needed to call this.switchToMe()!!');
  }  
  // ----------------------------Draw the contents of the currently-bound VBO:
  gl.drawArrays(gl.LINES, 	    // select the drawing primitive to draw,
                  // choices: gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, 
                  //          gl.TRIANGLES, gl.TRIANGLE_STRIP, ...
  								0, 								// location of 1st vertex to draw;
  								this.vboVerts);		// number of vertices to draw on-screen.
}

VBObox0.prototype.reload = function() {
//=============================================================================
// Over-write current values in the GPU inside our already-created VBO: use 
// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
// contents to our VBO without changing any GPU memory allocations.

 gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                  0,                  // byte offset to where data replacement
                                      // begins in the VBO.
 					 				this.vboContents);   // the JS source-data array used to fill VBO

}
/*
VBObox0.prototype.empty = function() {
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}

VBObox0.prototype.restore = function() {
//=============================================================================
// Replace/restore all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}
*/

//=============================================================================
//=============================================================================
function VBObox1() {
//=============================================================================
//=============================================================================
// CONSTRUCTOR for one re-usable 'VBObox1' object that holds all data and fcns
// needed to render vertices from one Vertex Buffer Object (VBO) using one 
// separate shader program (a vertex-shader & fragment-shader pair) and one
// set of 'uniform' variables.

// Constructor goal: 
// Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
// written into code) in all other VBObox functions. Keeping all these (initial)
// values here, in this one coonstrutor function, ensures we can change them 
// easily WITHOUT disrupting any other code, ever!
  
	this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
  'attribute vec4 position;'+
  'attribute vec4 normal;'+
'uniform mat4 projection, modelview, normalMat;'+
'varying vec3 normalInterp;'+
'varying vec3 vertPos;'+
'uniform float Ka;'+   // Ambient reflection coefficient
'uniform float Kd; '+  // Diffuse reflection coefficient
'uniform float Ks; '+  // Specular reflection coefficient
'uniform float shininessVal;'+ // Shininess
'uniform float mode;'+ // 
'uniform float light1;'+ // 
'uniform float light2;'+ // 
// Material color
'uniform vec3 ambientColor;'+
'uniform vec3 diffuseColor;'+
'uniform vec3 specularColor;'+
'uniform vec3 specularColor2;'+
'uniform vec3 lightPos;'+ // Light position
'uniform vec3 lightPos2;'+ // Light position
'varying vec4 color;'+ //color

'void main(){'+
  'vec4 vertPos4 = modelview * position;'+
  'vertPos = vec3(vertPos4) / vertPos4.w;'+
  'normalInterp = vec3(normalMat * vec4(vec3(normal),0.0));'+
  'gl_Position = projection * position;'+

  'vec3 N = normalize(normalInterp);'+
  'vec3 L = normalize(lightPos - vertPos);'+
  'vec3 L2 = normalize(lightPos2 - vertPos);'+
  // Lambert's cosine law
'float lambertian = max(dot(N, L), 0.0);'+
'if(light1 == 1.0){lambertian = 0.0;}'+
'float lambertian2 = max(dot(N, L2), 0.0);'+
'if(light2 == 1.0){lambertian2 = 0.0;}'+
  'float specular = 0.0;'+
  'float specular2 = 0.0;'+
  'if(lambertian > 0.0) {'+ 
    'vec3 R = normalize(reflect(-L, N));  '+    // Reflected light vector
   'vec3 V = normalize(lightPos-vertPos);'+ // Vector to viewer
    'vec3 H = normalize(L + V);'+
    // Compute the specular term
    'if(mode == 0.0){'+
    'float specAngle = dot(R, V);'+
    'specular = pow(specAngle, shininessVal);}'+
    'else{'+
    'float specAngle = dot(H, N);'+
    'specular = pow(specAngle, shininessVal);}'+
  '}if(lambertian2 > 0.0) {'+
    'vec3 R2 = normalize(reflect(-L2, N));  '+    // Reflected light vector
   'vec3 V = normalize(lightPos-vertPos);'+ // Vector to viewer
    'vec3 H2 = normalize(L2 + V);'+
    // Compute the specular term
    'if(mode == 0.0){'+
    'float specAngle2 = dot(R2, V);'+
    'specular2 = pow(specAngle2, shininessVal);}'+
    'else{'+
    'float specAngle2 = dot(H2, N);'+
    'specular2 = pow(specAngle2, shininessVal);}'+
  '}color = vec4(Ka * ambientColor +'+
               'Kd * lambertian * diffuseColor +'+
               'Kd * lambertian2 * diffuseColor * specularColor2 +'+
               'max(Ks * specular2 * specularColor2, 0.0) +'+
               'max(Ks * specular * specularColor,0.0), 1.0);}'
/*
 // SQUARE dots:
	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
  'precision mediump float;\n' +
  'varying vec3 v_Colr1;\n' +
  'void main() {\n' +
  '  gl_FragColor = vec4(v_Colr1, 1.0);\n' +  
  '}\n';
*/
/*
 // ROUND FLAT dots:
	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
  'precision mediump float;\n' +
  'varying vec3 v_Colr1;\n' +
  'void main() {\n' +
  '  float dist = distance(gl_PointCoord, vec2(0.5, 0.5)); \n' + 
  '  if(dist < 0.5) {\n' +
  '    gl_FragColor = vec4(v_Colr1, 1.0);\n' +  
  '    } else {discard;};' +
  '}\n';
*/
 // SHADED, sphere-like dots:
	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
  'precision mediump float;\n' +
//  '#endif GL_ES\n' +
  'varying vec4 color;\n' +
  'void main() {\n' +
  '  gl_FragColor = color;\n' +
  '}\n';

  makeSphere();
	makePyramid();
	makeCylinder();
	makeTorus();
	this.vboContents = new Float32Array(sphVerts.length + pyrVert.length +cylVerts.length+torVerts.length);

	var startI = 0;
	for(var j = 0; j < sphVerts.length; startI++, j++){
		this.vboContents[startI] = sphVerts[j];
	}

	for(var j = 0; j < pyrVert.length; startI++, j++){
		this.vboContents[startI] = pyrVert[j];
	}

	for(var j = 0; j < cylVerts.length; startI++, j++){
		this.vboContents[startI] = cylVerts[j];
	}

	for(var j = 0; j < torVerts.length; startI++, j++){
		this.vboContents[startI] = torVerts[j];
	}

  this.normalContents = new Float32Array(sphVerts.length + pyrVert.length +cylVerts.length+torVerts.length);

  var startN = 0;
	for(var j = 0; j < sphVerts.length; startN++, j++){
		this.normalContents[startN] = sphVerts[j];
	}

	for(var j = 0; j < pyrVert.length; startN++, j++){
		this.normalContents[startN] = pyrNormal[j];
	}

	for(var j = 0; j < cylVerts.length; startN++, j++){
		this.normalContents[startN] = cylNors[j];
	}

	for(var j = 0; j < torVerts.length; startN++, j++){
		this.normalContents[startN] = torNormal[j];
	}
  
	this.vboVerts = 700+12+cylVerts.length/7+torVerts.length/7;							// # of vertices held in 'vboContents' array;
	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;  
	                              // bytes req'd by 1 vboContents array element;
																// (why? used to compute stride and offset 
																// in bytes for vertexAttribPointer() calls)
  this.vboBytes = this.vboContents.length * this.FSIZE;       
                                // (#  of floats in vboContents array) * 
                                // (# of bytes/float).
	this.vboStride = this.vboBytes / this.vboVerts;     
  
	                              // (== # of bytes to store one complete vertex).
	                              // From any attrib in a given vertex in the VBO, 
	                              // move forward by 'vboStride' bytes to arrive 
	                              // at the same attrib for the next vertex.
	                               
	            //----------------------Attribute sizes
  this.vboFcount_a_Pos1 =  4;    // # of floats in the VBO needed to store the
                                // attribute named a_Pos1. (4: x,y,z,w values)
                  
              //----------------------Attribute offsets
	this.vboOffset_a_Pos1 = 0;    //# of bytes from START of vbo to the START
	                              // of 1st a_Pos1 attrib value in vboContents[]

	            //-----------------------GPU memory locations:                                
	this.vboLoc;									// GPU Location for Vertex Buffer Object, 
	                              // returned by gl.createBuffer() function call
	this.shaderLoc;								// GPU Location for compiled Shader-program  
	                            	// set by compile/link of VERT_SRC and FRAG_SRC.
								          //------Attribute locations in our shaders:
	this.a_Pos1Loc;							  // GPU location: shader 'a_Pos1' attribute
	
	            //---------------------- Uniform locations &values in our shaders
	this.ModelMatrix = new Matrix4();	// Transforms CVV axes to model axes.
	this.u_ModelMatrixLoc;						// GPU location for u_ModelMat uniform
  
  this.normalMatrix = new Matrix4();
};


VBObox1.prototype.init = function() {
//==============================================================================
// Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
// kept in this VBObox. (This function usually called only once, within main()).
// Specifically:
// a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
//  executable 'program' stored and ready to use inside the GPU.  
// b) create a new VBO object in GPU memory and fill it by transferring in all
//  the vertex data held in our Float32array member 'VBOcontents'. 
// c) Find & save the GPU location of all our shaders' attribute-variables and 
//  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
// -------------------
// CAREFUL!  before you can draw pictures using this VBObox contents, 
//  you must call this VBObox object's switchToMe() function too!
//--------------------
// a) Compile,link,upload shaders-----------------------------------------------
	this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }
// CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
//  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}

	gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())

// b) Create VBO on GPU, fill it------------------------------------------------
	this.vboLoc = gl.createBuffer();	
  this.normalLoc = gl.createBuffer();	
  if (!this.vboLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create VBO in GPU. Bye!'); 
    return;
  }
  
  // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
  //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
  								this.vboLoc);				  // the ID# the GPU uses for this buffer.
  											
  // Fill the GPU's newly-created VBO object with the vertex data we stored in
  //  our 'vboContents' member (JavaScript Float32Array object).
  //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
  //	 use gl.bufferSubData() to modify VBO contents without changing VBO size)
  gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
 					 				this.vboContents, 		// JavaScript Float32Array
  							 	gl.STATIC_DRAW);			// Usage hint.  
  //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
  //	(see OpenGL ES specification for more info).  Your choices are:
  //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents rarely or never change.
  //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents may change often as our program runs.
  //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
  // 			times and then discarded; for rapidly supplied & consumed VBOs.

// c1) Find All Attributes:-----------------------------------------------------
//  Find & save the GPU location of all our shaders' attribute-variables and 
//  uniform-variables (for switchToMe(), adjust(), draw(), reload(), etc.)
  this.a_Pos1Loc = gl.getAttribLocation(this.shaderLoc, 'position');
  if(this.a_Pos1Loc < 0) {
    console.log(this.constructor.name + 
    						'.init() Failed to get GPU location of attribute a_Pos1');
    return -1;	// error exit.
  }

  this.normal = gl.getAttribLocation(this.shaderLoc, 'normal');
  									// Enable assignment of vertex buffer object's position data
  if (this.normal < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // c2) Find All Uniforms:-----------------------------------------------------
  //Get GPU storage location for each uniform var used in our shader programs: 
 this.u_ModelMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'modelview');
  if (!this.u_ModelMatrixLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_ModelMatrix uniform');
    return;
  }
  this.u_NormalMatrix = gl.getUniformLocation(this.shaderLoc, 'normalMat');
  this.u_MvpMatrix = gl.getUniformLocation(this.shaderLoc, 'projection');
  this.Ka = gl.getUniformLocation(this.shaderLoc, 'Ka');
  this.Kd = gl.getUniformLocation(this.shaderLoc, 'Kd');
  this.Ks = gl.getUniformLocation(this.shaderLoc, 'Ks');
  this.ambientColor = gl.getUniformLocation(this.shaderLoc, 'ambientColor');
  this.diffuseColor = gl.getUniformLocation(this.shaderLoc, 'diffuseColor');
  this.specularColor = gl.getUniformLocation(this.shaderLoc, 'specularColor');
  this.specularColor2 = gl.getUniformLocation(this.shaderLoc, 'specularColor2');
  this.lightPos = gl.getUniformLocation(this.shaderLoc, 'lightPos');
  this.lightPos2 = gl.getUniformLocation(this.shaderLoc, 'lightPos2');
  this.shininessVal = gl.getUniformLocation(this.shaderLoc, 'shininessVal');
  this.mode = gl.getUniformLocation(this.shaderLoc, 'mode');
  this.light1 = gl.getUniformLocation(this.shaderLoc, 'light1');
  this.light2 = gl.getUniformLocation(this.shaderLoc, 'light2');
}

VBObox1.prototype.switchToMe = function (mode,light1,light2,lightPos,ambient,diffuse,specular) {
//==============================================================================
// Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
//
// We only do this AFTER we called the init() function, which does the one-time-
// only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
// even then, you are STILL not ready to draw our VBObox's contents onscreen!
// We must also first complete these steps:
//  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
//  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
//  c) tell the GPU to connect the shader program's attributes to that VBO.

// a) select our shader program:
  gl.useProgram(this.shaderLoc);	
//		Each call to useProgram() selects a shader program from the GPU memory,
// but that's all -- it does nothing else!  Any previously used shader program's 
// connections to attributes and uniforms are now invalid, and thus we must now
// establish new connections between our shader program's attributes and the VBO
// we wish to use.  
  
// b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
//  instead connect to our own already-created-&-filled VBO.  This new VBO can 
//    supply values to use as attributes in our newly-selected shader program:
	gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
										this.vboLoc);			// the ID# the GPU uses for our VBO.

// c) connect our newly-bound VBO to supply attribute variable values for each
// vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
// this sets up data paths from VBO to our shader units:
  // 	Here's how to use the almost-identical OpenGL version of this function:
	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
  gl.vertexAttribPointer(
		this.a_Pos1Loc,//index == ID# for the attribute var in GLSL shader pgm;
		this.vboFcount_a_Pos1, // # of floats used by this attribute: 1,2,3 or 4?
		gl.FLOAT,		  // type == what data type did we use for those numbers?
		false,				// isNormalized == are these fixed-point values that we need
									//									normalize before use? true or false
		this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
		              // stored attrib for this vertex to the same stored attrib
		              //  for the next vertex in our VBO.  This is usually the 
									// number of bytes used to store one complete vertex.  If set 
									// to zero, the GPU gets attribute values sequentially from 
									// VBO, starting at 'Offset'.	
									// (Our vertex size in bytes: 4 floats for pos + 3 for color)
		this.vboOffset_a_Pos1);					
    gl.bindBuffer(gl.ARRAY_BUFFER,this.normalLoc);
    gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
 					 				this.normalContents, 		// JavaScript Float32Array
  							 	gl.STATIC_DRAW);			// Usage hint.  
		              // Offset == how many bytes from START of buffer to the first
  								// value we will actually use?  (we start with position).
  gl.vertexAttribPointer(this.normal, this.vboFcount_a_Pos1,
                         gl.FLOAT, false, 
  						           this.vboStride,  this.vboOffset_a_Pos1);
  //-- Enable this assignment of the attribute to its' VBO source:
  gl.enableVertexAttribArray(this.a_Pos1Loc);
  gl.enableVertexAttribArray(this.normal);
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 1.0);
  gl.uniform1f(this.Ks, 1.0);
  gl.uniform1f(this.shininessVal, 20.0);
  gl.uniform3fv(this.ambientColor, [ambient.Red,ambient.Green,ambient.Blue]);	
  gl.uniform3fv(this.diffuseColor, [diffuse.Red,diffuse.Green,diffuse.Blue]);	
  gl.uniform3fv(this.specularColor, [1.0,1.0,1.0]);	
  gl.uniform3fv(this.specularColor2, [specular.Red,specular.Green,specular.Blue]);	
  gl.uniform1f(this.mode, mode);	
  gl.uniform3fv(this.lightPos2, [lightPos.x,lightPos.y,lightPos.z]);
  gl.uniform1f(this.light1, light1);	
  gl.uniform1f(this.light2, light2);	
	gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
										this.vboLoc);			// the ID# the GPU uses for our VBO.
}

VBObox1.prototype.isReady = function() {
//==============================================================================
// Returns 'true' if our WebGL rendering context ('gl') is ready to render using
// this objects VBO and shader program; else return false.
// see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter

var isOK = true;

  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
    console.log(this.constructor.name + 
    						'.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
      console.log(this.constructor.name + 
  						'.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox1.prototype.adjust = function() {
//==============================================================================
// Update the GPU to newer, current values we now store for 'uniform' vars on 
// the GPU; and (if needed) update each attribute's stride and offset in VBO.

  this.PM = new Matrix4();
  this.VM = new Matrix4();
  var vpAspect = g_canvasID.width /g_canvasID.height;	// this camera: width/height.
  this.PM.setPerspective(30.0-cameraX,vpAspect,1.0,1000.0);
  this.VM.setLookAt(5+cameraYX,0+cameraYY,2,5+cameraYX-Math.cos(Math.PI*cameraAngleY/180)*6*Math.cos(Math.PI*cameraAngleX/180),0+cameraYY+Math.sin(Math.PI*cameraAngleY/180)*6*Math.cos(Math.PI*cameraAngleX/180),-1.5+7*Math.sin(Math.PI*cameraAngleX/180),0,0,1);
  gl.uniform3fv(this.lightPos, [5.0+cameraYX,0.0+cameraYY,2.0]);
  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.adjust() call you needed to call this.switchToMe()!!');
  }
	// Adjust values for our uniforms,
  this.ModelMatrix.setTranslate(0,0,0);	// -spin drawing axes,
  this.ModelMatrix.rotate(g_angleNow1, 0, 0, 1);	// -spin drawing axes,
  this.ModelMatrix.scale(0.5, 0.5, 0.5);						// then translate them.
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
}

VBObox1.prototype.draw = function() {
//=============================================================================
// Send commands to GPU to select and render current VBObox contents.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.draw() call you needed to call this.switchToMe()!!');
  }
  
  // ----------------------------Draw the contents of the currently-bound VBO:
  gl.drawArrays(gl.TRIANGLE_STRIP,		    // select the drawing primitive to draw:
                  // choices: gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, 
                  //          gl.TRIANGLES, gl.TRIANGLE_STRIP,
  							0, 								// location of 1st vertex to draw;
  							700);		// number of vertices to draw on-screen.
  this.ModelMatrix.setTranslate(1, 0, 0.5);  // 'set' means DISCARD old matrix,
  						// (drawing axes centered in CVV), and then make new
  						// drawing axes moved to the lower-left corner of CVV.
  this.ModelMatrix.scale(1,1,-1);							// convert to left-handed coord sys
  																				// to match WebGL display canvas.
  this.ModelMatrix.scale(0.3, 0.3, 0.3);				// Make it smaller.
  this.ModelMatrix.rotate(-90, 1,0,0);				// Make it smaller.
  pushMatrix(this.ModelMatrix);
	this.ModelMatrix.scale(0.4,0.1,1.2);
				// Acts weirdly as rotation amounts get far from 0 degrees.
				// ?why does intuition fail so quickly here?

	//-------------------------------
	// Attempt 3: Quaternions? What will work better?

					// YOUR CODE HERE

	//-------------------------------
	// DRAW 2 TRIANGLES:		Use this matrix to transform & draw
	//						the different set of vertices stored in our VBO:
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 1.0);
  gl.uniform1f(this.Ks, 1.0);
  gl.uniform1f(this.shininessVal, 50.0);
  gl.uniform3fv(this.ambientColor, [0.2,0.2,0.2]);	
  gl.uniform3fv(this.diffuseColor, [0.5,0.5,0.5]);	
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 0,700);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(0,-0.05,0.5);
	this.ModelMatrix.rotate(180, 0, 0, 1);
	this.ModelMatrix.scale(0.3,1,2);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLES, 700,12);
	
	this.ModelMatrix = popMatrix();

	this.ModelMatrix.translate(0,1.1,-0.3);
	this.ModelMatrix.rotate(90*Math.sin(Math.PI*g_angleNow1/180), 0, 1, 0);
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.scale(0.03,1.1,0.03);
	this.ModelMatrix.rotate(90, 1, 0, 0);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 0.1);
  gl.uniform1f(this.Ks, 1.0);
  gl.uniform1f(this.shininessVal, 128.0);
  gl.uniform3fv(this.ambientColor, [0.2,0.2,0.2]);	
  gl.uniform3fv(this.diffuseColor, [0.5,0.5,0.5]);	
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.translate(0,-0.9,-0.5);
	this.ModelMatrix.scale(0.1,10,5);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 1.0);
  gl.uniform1f(this.Ks, 0.3);
  gl.uniform1f(this.shininessVal, 1.0);
  gl.uniform3fv(this.ambientColor, [0.2,0.2,0.2]);	
  gl.uniform3fv(this.diffuseColor, [0.5,0.5,0.5]);	
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLES, 700,12);

	this.ModelMatrix = popMatrix();
	this.ModelMatrix.translate(0,-0.5,-0.4);
	this.ModelMatrix.rotate(90, 1, 0, 0);
	this.ModelMatrix.scale(0.25,0.45,0.45);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 0.1);
  gl.uniform1f(this.Ks, 1.0);
  gl.uniform1f(this.shininessVal, 100.0);
  gl.uniform3fv(this.ambientColor, [0.2,0.2,0.2]);	
  gl.uniform3fv(this.diffuseColor, [0.5,0.5,0.5]);	
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712+cylVerts.length/7,torVerts.length/7);
//======================================submarine======================
	this.ModelMatrix.setTranslate(1.5,-1.5,0);
  this.ModelMatrix.scale(1,1,-1);							// convert to left-handed coord sys
  																				// to match WebGL display canvas.
  this.ModelMatrix.scale(0.3, 0.3, 0.3);				// Make it smaller.
  this.ModelMatrix.rotate(-90, 1,0,0);				// Make it smaller.
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.scale(0.3,0.3,1.5);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 0.5);
  gl.uniform1f(this.Kd, 1.0);
  gl.uniform1f(this.Ks, 1.0);
  gl.uniform3fv(this.ambientColor, [0.2,0.2,0.2]);	
  gl.uniform3fv(this.diffuseColor, [0.3,0.3,0.3]);	
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0,700);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(0,0.4,-0.2);
	this.ModelMatrix.scale(0.15,0.15,0.25);
	this.ModelMatrix.rotate(90, 1, 0, 0);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(0,-0.2,1);
	this.ModelMatrix.rotate(180, 0, 0, 1);
	this.ModelMatrix.scale(0.3,1.5,1.5);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLES, 700,12);
	
	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(0,0.2,1);
	this.ModelMatrix.scale(0.3,1.5,1.5);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLES, 700,12);
	
	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(-0.2,0,1);
	this.ModelMatrix.scale(1.5,0.3,1.5);
	this.ModelMatrix.rotate(90, 0, 0, 1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLES, 700,12);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(0.2,0,1);
	this.ModelMatrix.scale(1.5,0.3,1.5);
	this.ModelMatrix.rotate(-90, 0, 0, 1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLES, 700,12);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(0,0,1.35);
	this.ModelMatrix.rotate(g_angleNow1, 0, 0, 1);
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.scale(0.1,0.1,0.1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(0,0.35,0.1);
	this.ModelMatrix.scale(0.07,0.3,0.01);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(0,-0.35,0.1);
	this.ModelMatrix.scale(0.07,0.3,0.01);
	this.ModelMatrix.rotate(180,0,0,1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(0.35,0,0.1);
	this.ModelMatrix.scale(0.3,0.07,0.01);
	this.ModelMatrix.rotate(90,0,0,1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);

	this.ModelMatrix = popMatrix();

	this.ModelMatrix.translate(-0.35,0,0.1);
	this.ModelMatrix.scale(0.3,0.07,0.01);
	this.ModelMatrix.rotate(-90,0,0,1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);
//========================fishing rod====================================
	this.ModelMatrix.setTranslate(1.5,1.5,0);
  this.ModelMatrix.scale(1,1,-1);							// convert to left-handed coord sys
  																				// to match WebGL display canvas.
  this.ModelMatrix.scale(0.3, 0.3, 0.3);				// Make it smaller.
	this.ModelMatrix.rotate(15,1,0,0);
  this.ModelMatrix.rotate(-90, 1,0,0);				// Make it smaller.
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.scale(0.06,0.06,0.7);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 1.0);
  gl.uniform1f(this.Ks, 1.0);
  gl.uniform1f(this.shininessVal, 30.0);
  gl.uniform3fv(this.ambientColor, [0.3,0.2,0.2]);	
  gl.uniform3fv(this.diffuseColor, [1.0,0.5,0.1]);	
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);
	
	this.ModelMatrix.translate(0,0,-1.5);
	this.ModelMatrix.scale(0.04,0.04,1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 0.1);
  gl.uniform1f(this.Ks, 1.0);
  gl.uniform1f(this.shininessVal, 128.0);
  gl.uniform3fv(this.ambientColor, [0.1,0.1,0.1]);	
  gl.uniform3fv(this.diffuseColor, [0.2,0.2,0.2]);
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);
	
	this.ModelMatrix.translate(0,0,-3.5);
	this.ModelMatrix.scale(0.03,0.03,1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);
	
	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);
	
	this.ModelMatrix.translate(0,-0.65,-4.3);
	this.ModelMatrix.rotate(-105,1,0,0);
	this.ModelMatrix.scale(0.01,0.01,0.7);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 1.0);
  gl.uniform1f(this.Ks, 0.1);
  gl.uniform1f(this.shininessVal, 1.0);
  gl.uniform3fv(this.ambientColor, [0.5,0.5,0.5]);	
  gl.uniform3fv(this.diffuseColor, [1.0,1.0,1.0]);
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);
	
	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);
	
	this.ModelMatrix.translate(0,-1.3,-4.13);
	this.ModelMatrix.scale(0.1,0.1,0.1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 0.7);
  gl.uniform1f(this.Ks, 0.5);
  gl.uniform1f(this.shininessVal, 70.0);
  gl.uniform3fv(this.ambientColor, [0.3,0.0,0.5]);	
  gl.uniform3fv(this.diffuseColor, [0.4,0.0,1.0]);
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0,700);

	this.ModelMatrix = popMatrix();
	
	this.ModelMatrix.translate(0.05,0,-0.5);
	this.ModelMatrix.rotate(-15,1,0,0);
	this.ModelMatrix.rotate(90,0,1,0);
	this.ModelMatrix.rotate(4*g_angleNow1,0,0,1);
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.scale(0.2,0.2,0.02);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 0.1);
  gl.uniform1f(this.Ks, 1.0);
  gl.uniform1f(this.shininessVal, 80.0);
  gl.uniform3fv(this.ambientColor, [0.1,0.1,0.1]);	
  gl.uniform3fv(this.diffuseColor, [0.2,0.2,0.2]);
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);
	
	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.translate(0,0,0.05);
	this.ModelMatrix.scale(0.15,0.15,0.05);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 1.0);
  gl.uniform1f(this.Ks, 0.1);
  gl.uniform1f(this.shininessVal, 1.0);
  gl.uniform3fv(this.ambientColor, [0.5,0.5,0.5]);	
  gl.uniform3fv(this.diffuseColor, [1.0,1.0,1.0]);
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);
	
	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.translate(0,0,0.1);
	this.ModelMatrix.scale(0.2,0.2,0.02);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 0.1);
  gl.uniform1f(this.Ks, 1.0);
  gl.uniform1f(this.shininessVal, 80.0);
  gl.uniform3fv(this.ambientColor, [0.1,0.1,0.1]);	
  gl.uniform3fv(this.diffuseColor, [0.2,0.2,0.2]);
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);
	
	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.translate(0,0,0.1);
	this.ModelMatrix.scale(0.2,0.2,0.02);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);
	
	this.ModelMatrix = popMatrix();
	this.ModelMatrix.translate(0,0.1,0.15);
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.scale(0.05,0.05,0.1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);
	
	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.translate(0,0.07,0.1);
	this.ModelMatrix.rotate(90,1,0,0);
	this.ModelMatrix.scale(0.03,0.03,0.1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);
	
	this.ModelMatrix = popMatrix();
	this.ModelMatrix.translate(0,0.17,0.22);
	this.ModelMatrix.scale(0.05,0.05,0.15);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 1.0);
  gl.uniform1f(this.Ks, 1.0);
  gl.uniform1f(this.shininessVal, 30.0);
  gl.uniform3fv(this.ambientColor, [0.3,0.2,0.2]);	
  gl.uniform3fv(this.diffuseColor, [1.0,0.5,0.1]);	
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);
}


VBObox1.prototype.reload = function() {
//=============================================================================
// Over-write current values in the GPU for our already-created VBO: use 
// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
// contents to our VBO without changing any GPU memory allocations.

 gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                  0,                  // byte offset to where data replacement
                                      // begins in the VBO.
 					 				this.vboContents);   // the JS source-data array used to fill VBO
}

/*
VBObox1.prototype.empty = function() {
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}

VBObox1.prototype.restore = function() {
//=============================================================================
// Replace/restore all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}
*/

//=============================================================================
//=============================================================================
function VBObox2() {
//=============================================================================
//=============================================================================
// CONSTRUCTOR for one re-usable 'VBObox2' object that holds all data and fcns
// needed to render vertices from one Vertex Buffer Object (VBO) using one 
// separate shader program (a vertex-shader & fragment-shader pair) and one
// set of 'uniform' variables.

// Constructor goal: 
// Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
// written into code) in all other VBObox functions. Keeping all these (initial)
// values here, in this one coonstrutor function, ensures we can change them 
// easily WITHOUT disrupting any other code, ever!
  
	this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
'attribute vec4 position;'+
'attribute vec4 normal;'+
'uniform mat4 projection, modelview, normalMat;'+
'varying vec3 normalInterp;'+
'varying vec3 vertPos;'+

'void main(){'+
  'vec4 vertPos4 = modelview * position;'+
  'vertPos = vec3(vertPos4) / vertPos4.w;'+
  'normalInterp = vec3(normalMat * normal);'+
  'gl_Position = projection * position;}'

	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
  'precision mediump float;'+
'varying vec3 normalInterp;'+  // Surface normal
'varying vec3 vertPos;'+       // Vertex position
'uniform float Ka;'+  // Ambient reflection coefficient
'uniform float Kd;'+   // Diffuse reflection coefficient
'uniform float Ks;'+   // Specular reflection coefficient
'uniform float shininessVal;'+ // Shininess
'uniform float mode;'+ // Shininess
'uniform float light1;'+ // Shininess
'uniform float light2;'+ // Shininess
// Material color
'uniform vec3 ambientColor;'+
'uniform vec3 diffuseColor;'+
'uniform vec3 specularColor;'+
'uniform vec3 specularColor2;'+
'uniform vec3 lightPos;'+ // Light position
'uniform vec3 lightPos2;'+ // Light position

'void main() {'+
  'vec3 N = normalize(normalInterp);'+
  'vec3 L = normalize(lightPos - vertPos);'+
  'vec3 L2 = normalize(lightPos2 - vertPos);'+

  // Lambert's cosine law
  'float lambertian = max(dot(N, L), 0.0);'+
  'if(light1 == 1.0){lambertian = 0.0;}'+
  'float lambertian2 = max(dot(N, L2), 0.0);'+
  'if(light2 == 1.0){lambertian2 = 0.0;}'+
  'float specular = 0.0;'+
  'float specular2 = 0.0;'+
  'if(lambertian > 0.0) {'+
    'vec3 R = normalize(reflect(-L, N));'+      // Reflected light vector
    'vec3 V = normalize(lightPos - vertPos);'+ // Vector to viewer
    'vec3 H = normalize(L + V);'+
    // Compute the specular term
    'if(mode == 0.0){'+
    'float specAngle = max(dot(R, V), 0.0);'+
    'specular = pow(specAngle, shininessVal);}'+
    'else{'+
    'float specAngle = max(dot(H, N), 0.0);'+
    'specular = pow(specAngle, shininessVal);}}'+
  'if(lambertian2 > 0.0) {'+
    'vec3 R2 = normalize(reflect(-L2, N));'+      // Reflected light vector
    'vec3 V = normalize(lightPos-vertPos);'+ // Vector to viewer
    'vec3 H2 = normalize(L2 + V);'+
    // Compute the specular term
    'if(mode == 0.0){'+
    'float specAngle2 = max(dot(R2, V), 0.0);'+
    'specular2 = pow(specAngle2, shininessVal);}'+
    'else{'+
    'float specAngle2 = max(dot(H2, N), 0.0);'+
    'specular2 = pow(specAngle2, shininessVal);}}'+
  'gl_FragColor = vec4(Ka * ambientColor +'+
                      'Kd * lambertian * diffuseColor +'+
                      'Kd * lambertian2 * diffuseColor * specularColor2+'+
                      'Ks * specular2 * specularColor2 +'+
                      'Ks * specular * specularColor, 1.0);}'

	makeSphere();
	makePyramid();
	makeCylinder();
	makeTorus();
	this.vboContents = new Float32Array(sphVerts.length + pyrVert.length +cylVerts.length+torVerts.length);

	var startI = 0;
	for(var j = 0; j < sphVerts.length; startI++, j++){
		this.vboContents[startI] = sphVerts[j];
	}

	for(var j = 0; j < pyrVert.length; startI++, j++){
		this.vboContents[startI] = pyrVert[j];
	}

	for(var j = 0; j < cylVerts.length; startI++, j++){
		this.vboContents[startI] = cylVerts[j];
	}

	for(var j = 0; j < torVerts.length; startI++, j++){
		this.vboContents[startI] = torVerts[j];
	}

  this.normalContents = new Float32Array(sphVerts.length + pyrVert.length +cylVerts.length+torVerts.length);

  var startN = 0;
	for(var j = 0; j < sphVerts.length; startN++, j++){
		this.normalContents[startN] = sphVerts[j];
	}

	for(var j = 0; j < pyrVert.length; startN++, j++){
		this.normalContents[startN] = pyrNormal[j];
	}

	for(var j = 0; j < cylVerts.length; startN++, j++){
		this.normalContents[startN] = cylNors[j];
	}

	for(var j = 0; j < torVerts.length; startN++, j++){
		this.normalContents[startN] = torNormal[j];
	}
  
	this.vboVerts = 700+12+cylVerts.length/7+torVerts.length/7;	
	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;  
	                              // bytes req'd by 1 vboContents array element;
																// (why? used to compute stride and offset 
																// in bytes for vertexAttribPointer() calls)
  this.vboBytes = this.vboContents.length * this.FSIZE;               
                                // (#  of floats in vboContents array) * 
                                // (# of bytes/float).
	this.vboStride = this.vboBytes / this.vboVerts;     
	                              // (== # of bytes to store one complete vertex).
	                              // From any attrib in a given vertex in the VBO, 
	                              // move forward by 'vboStride' bytes to arrive 
	                              // at the same attrib for the next vertex.
	                               
	            //----------------------Attribute sizes
  this.vboFcount_a_Pos1 =  4;    // # of floats in the VBO needed to store the
                                // attribute named a_Pos1. (4: x,y,z,w values)
                  
              //----------------------Attribute offsets
	this.vboOffset_a_Pos1 = 0;    //# of bytes from START of vbo to the START
	                              // of 1st a_Pos1 attrib value in vboContents[]

	            //-----------------------GPU memory locations:                                
	this.vboLoc;									// GPU Location for Vertex Buffer Object, 
	                              // returned by gl.createBuffer() function call
	this.shaderLoc;								// GPU Location for compiled Shader-program  
	                            	// set by compile/link of VERT_SRC and FRAG_SRC.
								          //------Attribute locations in our shaders:
	this.a_Pos1Loc;							  // GPU location: shader 'a_Pos1' attribute
	
	            //---------------------- Uniform locations &values in our shaders
	this.ModelMatrix = new Matrix4();	// Transforms CVV axes to model axes.
	this.u_ModelMatrixLoc;						// GPU location for u_ModelMat uniform
  
  this.normalMatrix = new Matrix4();
};


VBObox2.prototype.init = function() {
//=============================================================================
// Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
// kept in this VBObox. (This function usually called only once, within main()).
// Specifically:
// a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
//  executable 'program' stored and ready to use inside the GPU.  
// b) create a new VBO object in GPU memory and fill it by transferring in all
//  the vertex data held in our Float32array member 'VBOcontents'. 
// c) Find & save the GPU location of all our shaders' attribute-variables and 
//  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
// 
// CAREFUL!  before you can draw pictures using this VBObox contents, 
//  you must call this VBObox object's switchToMe() function too!

  // a) Compile,link,upload shaders---------------------------------------------
	this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }
  // CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
  //  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}

	gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())

  // b) Create VBO on GPU, fill it----------------------------------------------
	this.vboLoc = gl.createBuffer();	
  this.normalLoc = gl.createBuffer();	
  if (!this.vboLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create VBO in GPU. Bye!'); 
    return;
  }
  // Specify the purpose of our newly-created VBO.  Your choices are:
  //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
  								this.vboLoc);				// the ID# the GPU uses for this buffer.

  // Fill the GPU's newly-created VBO object with the vertex data we stored in
  //  our 'vboContents' member (JavaScript Float32Array object).
  //  (Recall gl.bufferData() will evoke GPU's memory allocation & managemt: use 
  //		gl.bufferSubData() to modify VBO contents without changing VBO size)
  gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
 					 				this.vboContents, 		// JavaScript Float32Array
  							 	gl.STATIC_DRAW);			// Usage hint.
  //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
  //	(see OpenGL ES specification for more info).  Your choices are:
  //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents rarely or never change.
  //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents may change often as our program runs.
  //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
  // 			times and then discarded; for rapidly supplied & consumed VBOs.

  // c1) Find All Attributes:---------------------------------------------------
  //  Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (for switchToMe(), adjust(), draw(), reload(),etc.)
  this.a_Pos1Loc = gl.getAttribLocation(this.shaderLoc, 'position');
  if(this.a_PositionLoc < 0) {
    console.log(this.constructor.name + 
    						'.init() Failed to get GPU location of attribute a_Position');
    return -1;	// error exit.
  }
  this.normal = gl.getAttribLocation(this.shaderLoc, 'normal');
  									// Enable assignment of vertex buffer object's position data
  if (this.normal < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // c2) Find All Uniforms:-----------------------------------------------------
  //Get GPU storage location for each uniform var used in our shader programs: 
 this.u_ModelMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'modelview');
  if (!this.u_ModelMatrixLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_ModelMatrix uniform');
    return;
  }
  this.u_NormalMatrix = gl.getUniformLocation(this.shaderLoc, 'normalMat');
  this.u_MvpMatrix = gl.getUniformLocation(this.shaderLoc, 'projection');
  this.Ka = gl.getUniformLocation(this.shaderLoc, 'Ka');
  this.Kd = gl.getUniformLocation(this.shaderLoc, 'Kd');
  this.Ks = gl.getUniformLocation(this.shaderLoc, 'Ks');
  this.ambientColor = gl.getUniformLocation(this.shaderLoc, 'ambientColor');
  this.diffuseColor = gl.getUniformLocation(this.shaderLoc, 'diffuseColor');
  this.specularColor = gl.getUniformLocation(this.shaderLoc, 'specularColor');
  this.specularColor2 = gl.getUniformLocation(this.shaderLoc, 'specularColor2');
  this.lightPos = gl.getUniformLocation(this.shaderLoc, 'lightPos');
  this.lightPos2 = gl.getUniformLocation(this.shaderLoc, 'lightPos2');
  this.shininessVal = gl.getUniformLocation(this.shaderLoc, 'shininessVal');
  this.mode = gl.getUniformLocation(this.shaderLoc, 'mode');
  this.light1 = gl.getUniformLocation(this.shaderLoc, 'light1');
  this.light2 = gl.getUniformLocation(this.shaderLoc, 'light2');
}

VBObox2.prototype.switchToMe = function(mode,light1,light2,lightPos,ambient,diffuse,specular) {
//==============================================================================
// Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
//
// We only do this AFTER we called the init() function, which does the one-time-
// only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
// even then, you are STILL not ready to draw our VBObox's contents onscreen!
// We must also first complete these steps:
//  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
//  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
//  c) tell the GPU to connect the shader program's attributes to that VBO.

// a) select our shader program:
  gl.useProgram(this.shaderLoc);
//		Each call to useProgram() selects a shader program from the GPU memory,
// but that's all -- it does nothing else!  Any previously used shader program's 
// connections to attributes and uniforms are now invalid, and thus we must now
// establish new connections between our shader program's attributes and the VBO
// we wish to use.  
  
// b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
//  instead connect to our own already-created-&-filled VBO.  This new VBO can 
//    supply values to use as attributes in our newly-selected shader program:
	gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
										this.vboLoc);			// the ID# the GPU uses for our VBO.

// c) connect our newly-bound VBO to supply attribute variable values for each
// vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
// this sets up data paths from VBO to our shader units:
  // 	Here's how to use the almost-identical OpenGL version of this function:
	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
  gl.vertexAttribPointer(
		this.a_Pos1Loc,//index == ID# for the attribute var in GLSL shader pgm;
		this.vboFcount_a_Pos1, // # of floats used by this attribute: 1,2,3 or 4?
		gl.FLOAT,		  // type == what data type did we use for those numbers?
		false,				// isNormalized == are these fixed-point values that we need
									//									normalize before use? true or false
		this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
		              // stored attrib for this vertex to the same stored attrib
		              //  for the next vertex in our VBO.  This is usually the 
									// number of bytes used to store one complete vertex.  If set 
									// to zero, the GPU gets attribute values sequentially from 
									// VBO, starting at 'Offset'.	 (Our vertex size in bytes: 
									// 4 floats for Position + 3 for Color + 1 for PtSize = 8).
		this.vboOffset_a_Pos1);	
		              // Offset == how many bytes from START of buffer to the first
  								// value we will actually use?  (We start with a_Position).
    gl.bindBuffer(gl.ARRAY_BUFFER,this.normalLoc);
    gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
 					 				this.normalContents, 		// JavaScript Float32Array
  							 	gl.STATIC_DRAW);			// Usage hint.  
		              // Offset == how many bytes from START of buffer to the first
  								// value we will actually use?  (we start with position).
gl.vertexAttribPointer(this.normal, this.vboFcount_a_Pos1,
                         gl.FLOAT, false, 
  						           this.vboStride,  this.vboOffset_a_Pos1);
	gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
										this.vboLoc);			// the ID# the GPU uses for our VBO.
  //-- Enable this assignment of the attribute to its' VBO source:
  gl.enableVertexAttribArray(this.a_Pos1Loc);
  gl.enableVertexAttribArray(this.normal);
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 1.0);
  gl.uniform1f(this.Ks, 1.0);
  gl.uniform1f(this.shininessVal, 100.0);
  gl.uniform3fv(this.ambientColor, [ambient.Red,ambient.Green,ambient.Blue]);	
  gl.uniform3fv(this.diffuseColor, [diffuse.Red,diffuse.Green,diffuse.Blue]);	
  gl.uniform3fv(this.specularColor, [1.0,1.0,1.0]);	
  gl.uniform3fv(this.specularColor2, [specular.Red,specular.Green,specular.Blue]);	
  gl.uniform1f(this.mode, mode);	
  gl.uniform1f(this.light1, light1);	
  gl.uniform1f(this.light2, light2);	
  gl.uniform3fv(this.lightPos2, [lightPos.x,lightPos.y,lightPos.z]);
}

VBObox2.prototype.isReady = function() {
//==============================================================================
// Returns 'true' if our WebGL rendering context ('gl') is ready to render using
// this objects VBO and shader program; else return false.
// see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter

var isOK = true;
  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
    console.log(this.constructor.name + 
    						'.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
      console.log(this.constructor.name + 
  						'.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox2.prototype.adjust = function() {
//=============================================================================
// Update the GPU to newer, current values we now store for 'uniform' vars on 
// the GPU; and (if needed) update the VBO's contents, and (if needed) each 
// attribute's stride and offset in VBO.
  this.PM = new Matrix4();
  this.VM = new Matrix4();
  var vpAspect = g_canvasID.width /g_canvasID.height;	// this camera: width/height.
  this.PM.setPerspective(30.0-cameraX,vpAspect,1.0,1000.0);
  this.VM.setLookAt(5+cameraYX,0+cameraYY,2,5+cameraYX-Math.cos(Math.PI*cameraAngleY/180)*6*Math.cos(Math.PI*cameraAngleX/180),0+cameraYY+Math.sin(Math.PI*cameraAngleY/180)*6*Math.cos(Math.PI*cameraAngleX/180),-1.5+7*Math.sin(Math.PI*cameraAngleX/180),0,0,1);
  gl.uniform3fv(this.lightPos, [5.0+cameraYX,0.0+cameraYY,2.0]);
  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.adjust() call you needed to call this.switchToMe()!!');
  }
	// Adjust values for our uniforms,
  this.ModelMatrix.setTranslate(0,0,0);	// -spin drawing axes,
  this.ModelMatrix.rotate(g_angleNow1, 0, 0, 1);	// -spin drawing axes,
  this.ModelMatrix.scale(0.5, 0.5, 0.5);						// then translate them.
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
}

VBObox2.prototype.draw = function() {
//=============================================================================
// Send commands to GPU to select and render current VBObox contents.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.draw() call you needed to call this.switchToMe()!!');
  }
  
  // ----------------------------Draw the contents of the currently-bound VBO:
  gl.drawArrays(gl.TRIANGLE_STRIP,		    // select the drawing primitive to draw:
                  // choices: gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, 
                  //          gl.TRIANGLES, gl.TRIANGLE_STRIP,
  							0, 								// location of 1st vertex to draw;
  							700);		// number of vertices to draw on-screen.
  this.ModelMatrix.setTranslate(1, 0, 0.5);  // 'set' means DISCARD old matrix,
  						// (drawing axes centered in CVV), and then make new
  						// drawing axes moved to the lower-left corner of CVV.
  this.ModelMatrix.scale(1,1,-1);							// convert to left-handed coord sys
  																				// to match WebGL display canvas.
  this.ModelMatrix.scale(0.3, 0.3, 0.3);				// Make it smaller.
  this.ModelMatrix.rotate(-90, 1,0,0);				// Make it smaller.
  pushMatrix(this.ModelMatrix);
	this.ModelMatrix.scale(0.4,0.1,1.2);
				// Acts weirdly as rotation amounts get far from 0 degrees.
				// ?why does intuition fail so quickly here?

	//-------------------------------
	// Attempt 3: Quaternions? What will work better?

					// YOUR CODE HERE

	//-------------------------------
	// DRAW 2 TRIANGLES:		Use this matrix to transform & draw
	//						the different set of vertices stored in our VBO:
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 1.0);
  gl.uniform1f(this.Ks, 1.0);
  gl.uniform1f(this.shininessVal, 50.0);
  gl.uniform3fv(this.ambientColor, [0.2,0.2,0.2]);	
  gl.uniform3fv(this.diffuseColor, [0.5,0.5,0.5]);	
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 0,700);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(0,-0.05,0.5);
	this.ModelMatrix.rotate(180, 0, 0, 1);
	this.ModelMatrix.scale(0.3,1,2);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLES, 700,12);
	
	this.ModelMatrix = popMatrix();

	this.ModelMatrix.translate(0,1.1,-0.3);
	this.ModelMatrix.rotate(90*Math.sin(Math.PI*g_angleNow1/180), 0, 1, 0);
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.scale(0.03,1.1,0.03);
	this.ModelMatrix.rotate(90, 1, 0, 0);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 0.1);
  gl.uniform1f(this.Ks, 1.0);
  gl.uniform1f(this.shininessVal, 128.0);
  gl.uniform3fv(this.ambientColor, [0.2,0.2,0.2]);	
  gl.uniform3fv(this.diffuseColor, [0.5,0.5,0.5]);	
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.translate(0,-0.9,-0.5);
	this.ModelMatrix.scale(0.1,10,5);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 1.0);
  gl.uniform1f(this.Ks, 0.0);
  gl.uniform1f(this.shininessVal, 1.0);
  gl.uniform3fv(this.ambientColor, [0.2,0.2,0.2]);	
  gl.uniform3fv(this.diffuseColor, [0.5,0.5,0.5]);	
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLES, 700,12);

	this.ModelMatrix = popMatrix();
	this.ModelMatrix.translate(0,-0.5,-0.4);
	this.ModelMatrix.rotate(90, 1, 0, 0);
	this.ModelMatrix.scale(0.25,0.45,0.45);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 0.1);
  gl.uniform1f(this.Ks, 1.0);
  gl.uniform1f(this.shininessVal, 100.0);
  gl.uniform3fv(this.ambientColor, [0.2,0.2,0.2]);	
  gl.uniform3fv(this.diffuseColor, [0.5,0.5,0.5]);	
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712+cylVerts.length/7,torVerts.length/7);
//======================================submarine======================
	this.ModelMatrix.setTranslate(1.5,-1.5,0);
  this.ModelMatrix.scale(1,1,-1);							// convert to left-handed coord sys
  																				// to match WebGL display canvas.
  this.ModelMatrix.scale(0.3, 0.3, 0.3);				// Make it smaller.
  this.ModelMatrix.rotate(-90, 1,0,0);				// Make it smaller.
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.scale(0.3,0.3,1.5);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 0.5);
  gl.uniform1f(this.Kd, 1.0);
  gl.uniform1f(this.Ks, 1.0);
  gl.uniform3fv(this.ambientColor, [0.2,0.2,0.2]);	
  gl.uniform3fv(this.diffuseColor, [0.3,0.3,0.3]);	
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0,700);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(0,0.4,-0.2);
	this.ModelMatrix.scale(0.15,0.15,0.25);
	this.ModelMatrix.rotate(90, 1, 0, 0);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(0,-0.2,1);
	this.ModelMatrix.rotate(180, 0, 0, 1);
	this.ModelMatrix.scale(0.3,1.5,1.5);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLES, 700,12);
	
	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(0,0.2,1);
	this.ModelMatrix.scale(0.3,1.5,1.5);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLES, 700,12);
	
	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(-0.2,0,1);
	this.ModelMatrix.scale(1.5,0.3,1.5);
	this.ModelMatrix.rotate(90, 0, 0, 1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLES, 700,12);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(0.2,0,1);
	this.ModelMatrix.scale(1.5,0.3,1.5);
	this.ModelMatrix.rotate(-90, 0, 0, 1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLES, 700,12);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(0,0,1.35);
	this.ModelMatrix.rotate(g_angleNow1, 0, 0, 1);
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.scale(0.1,0.1,0.1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(0,0.35,0.1);
	this.ModelMatrix.scale(0.07,0.3,0.01);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(0,-0.35,0.1);
	this.ModelMatrix.scale(0.07,0.3,0.01);
	this.ModelMatrix.rotate(180,0,0,1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(0.35,0,0.1);
	this.ModelMatrix.scale(0.3,0.07,0.01);
	this.ModelMatrix.rotate(90,0,0,1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);

	this.ModelMatrix = popMatrix();

	this.ModelMatrix.translate(-0.35,0,0.1);
	this.ModelMatrix.scale(0.3,0.07,0.01);
	this.ModelMatrix.rotate(-90,0,0,1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);
//========================fishing rod====================================
	this.ModelMatrix.setTranslate(1.5,1.5,0);
  this.ModelMatrix.scale(1,1,-1);							// convert to left-handed coord sys
  																				// to match WebGL display canvas.
  this.ModelMatrix.scale(0.3, 0.3, 0.3);				// Make it smaller.
	this.ModelMatrix.rotate(15,1,0,0);
  this.ModelMatrix.rotate(-90, 1,0,0);				// Make it smaller.
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.scale(0.06,0.06,0.7);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 1.0);
  gl.uniform1f(this.Ks, 1.0);
  gl.uniform1f(this.shininessVal, 30.0);
  gl.uniform3fv(this.ambientColor, [0.3,0.2,0.2]);	
  gl.uniform3fv(this.diffuseColor, [1.0,0.5,0.1]);	
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);
	
	this.ModelMatrix.translate(0,0,-1.5);
	this.ModelMatrix.scale(0.04,0.04,1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 0.1);
  gl.uniform1f(this.Ks, 1.0);
  gl.uniform1f(this.shininessVal, 128.0);
  gl.uniform3fv(this.ambientColor, [0.1,0.1,0.1]);	
  gl.uniform3fv(this.diffuseColor, [0.2,0.2,0.2]);
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);

	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);
	
	this.ModelMatrix.translate(0,0,-3.5);
	this.ModelMatrix.scale(0.03,0.03,1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);
	
	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);
	
	this.ModelMatrix.translate(0,-0.65,-4.3);
	this.ModelMatrix.rotate(-105,1,0,0);
	this.ModelMatrix.scale(0.01,0.01,0.7);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 1.0);
  gl.uniform1f(this.Ks, 0.1);
  gl.uniform1f(this.shininessVal, 1.0);
  gl.uniform3fv(this.ambientColor, [0.5,0.5,0.5]);	
  gl.uniform3fv(this.diffuseColor, [1.0,1.0,1.0]);
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);
	
	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);
	
	this.ModelMatrix.translate(0,-1.3,-4.13);
	this.ModelMatrix.scale(0.1,0.1,0.1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 0.7);
  gl.uniform1f(this.Ks, 0.5);
  gl.uniform1f(this.shininessVal, 70.0);
  gl.uniform3fv(this.ambientColor, [0.3,0.0,0.5]);	
  gl.uniform3fv(this.diffuseColor, [0.4,0.0,1.0]);
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0,700);

	this.ModelMatrix = popMatrix();
	
	this.ModelMatrix.translate(0.05,0,-0.5);
	this.ModelMatrix.rotate(-15,1,0,0);
	this.ModelMatrix.rotate(90,0,1,0);
	this.ModelMatrix.rotate(4*g_angleNow1,0,0,1);
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.scale(0.2,0.2,0.02);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 0.1);
  gl.uniform1f(this.Ks, 1.0);
  gl.uniform1f(this.shininessVal, 80.0);
  gl.uniform3fv(this.ambientColor, [0.1,0.1,0.1]);	
  gl.uniform3fv(this.diffuseColor, [0.2,0.2,0.2]);
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);
	
	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.translate(0,0,0.05);
	this.ModelMatrix.scale(0.15,0.15,0.05);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 1.0);
  gl.uniform1f(this.Ks, 0.1);
  gl.uniform1f(this.shininessVal, 1.0);
  gl.uniform3fv(this.ambientColor, [0.5,0.5,0.5]);	
  gl.uniform3fv(this.diffuseColor, [1.0,1.0,1.0]);
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);
	
	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.translate(0,0,0.1);
	this.ModelMatrix.scale(0.2,0.2,0.02);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 0.1);
  gl.uniform1f(this.Ks, 1.0);
  gl.uniform1f(this.shininessVal, 80.0);
  gl.uniform3fv(this.ambientColor, [0.1,0.1,0.1]);	
  gl.uniform3fv(this.diffuseColor, [0.2,0.2,0.2]);
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);
	
	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.translate(0,0,0.1);
	this.ModelMatrix.scale(0.2,0.2,0.02);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);
	
	this.ModelMatrix = popMatrix();
	this.ModelMatrix.translate(0,0.1,0.15);
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.scale(0.05,0.05,0.1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);
	
	this.ModelMatrix = popMatrix();
	pushMatrix(this.ModelMatrix);
	this.ModelMatrix.translate(0,0.07,0.1);
	this.ModelMatrix.rotate(90,1,0,0);
	this.ModelMatrix.scale(0.03,0.03,0.1);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);
	
	this.ModelMatrix = popMatrix();
	this.ModelMatrix.translate(0,0.17,0.22);
	this.ModelMatrix.scale(0.05,0.05,0.15);
  this.mvpMatrix = new Matrix4();
	this.mvpMatrix.set(this.PM).multiply(this.VM).multiply(this.ModelMatrix);
  this.normalMatrix.setInverseOf(this.ModelMatrix);
  this.normalMatrix.transpose();
  gl.uniform1f(this.Ka, 1.0);
  gl.uniform1f(this.Kd, 1.0);
  gl.uniform1f(this.Ks, 1.0);
  gl.uniform1f(this.shininessVal, 30.0);
  gl.uniform3fv(this.ambientColor, [0.3,0.2,0.2]);	
  gl.uniform3fv(this.diffuseColor, [1.0,0.5,0.1]);	
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, 712, cylVerts.length/7);
}

VBObox2.prototype.reload = function() {
//=============================================================================
// Over-write current values in the GPU for our already-created VBO: use 
// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
// 'vboContents' to our VBO, but without changing any GPU memory allocations.
  											
 gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                  0,                  // byte offset to where data replacement
                                      // begins in the VBO.
 					 				this.vboContents);   // the JS source-data array used to fill VBO
}
/*
VBObox2.prototype.empty = function() {
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}

VBObox2.prototype.restore = function() {
//=============================================================================
// Replace/restore all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}
*/

//=============================================================================
//=============================================================================
//=============================================================================

function makeGroundGrid() {
//==============================================================================
// Create a list of vertices that create a large grid of lines in the x,y plane
// centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.

	var xcount = 100;			// # of lines to draw in x,y to make the grid.
	var ycount = 100;		
	var xymax	= 50.0;			// grid size; extends to cover +/-xymax in x and y.
 	var xColr = new Float32Array([0.0, 0.3, 1.0]);	// bright yellow
 	var yColr = new Float32Array([0.0, 0.7, 1.0]);	// bright green.
  var floatsPerVertex = 7;
 	
	// Create an (global) array to hold this ground-plane's vertices:
	gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
						// draw a grid made of xcount+ycount lines; 2 vertices per line.
						
	var xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
	var ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))
	
	// First, step thru x values as we make vertical lines of constant-x:
	for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
		if(v%2==0) {	// put even-numbered vertices at (xnow, -xymax, 0)
			gndVerts[j  ] = -xymax + (v  )*xgap;	// x
			gndVerts[j+1] = -xymax;								// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;									// w.
		}
		else {				// put odd-numbered vertices at (xnow, +xymax, 0).
			gndVerts[j  ] = -xymax + (v-1)*xgap;	// x
			gndVerts[j+1] = xymax;								// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;									// w.
		}
		gndVerts[j+4] = xColr[0];			// red
		gndVerts[j+5] = xColr[1];			// grn
		gndVerts[j+6] = xColr[2];			// blu
	}
	// Second, step thru y values as wqe make horizontal lines of constant-y:
	// (don't re-initialize j--we're adding more vertices to the array)
	for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
		if(v%2==0) {		// put even-numbered vertices at (-xymax, ynow, 0)
			gndVerts[j  ] = -xymax;								// x
			gndVerts[j+1] = -xymax + (v  )*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;									// w.
		}
		else {					// put odd-numbered vertices at (+xymax, ynow, 0).
			gndVerts[j  ] = xymax;								// x
			gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;									// w.
		}
		gndVerts[j+4] = yColr[0];			// red
		gndVerts[j+5] = yColr[1];			// grn
		gndVerts[j+6] = yColr[2];			// blu
	}
}

function makeSphere() {
//==============================================================================
// Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
// equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
// and connect them as a 'stepped spiral' design (see makeCylinder) to build the
// sphere from one triangle strip.
  var slices = 13;		// # of slices of the sphere along the z axis. >=3 req'd
											// (choose odd # or prime# to avoid accidental symmetry)
  var sliceVerts	= 27;	// # of vertices around the top edge of the slice
											// (same number of vertices on bottom of slice, too)
  var topColr = new Float32Array([1.0, 1.0, 0.1]);	// North Pole: light gray
  var equColr = new Float32Array([1.0, 0.5, 0.8]);	// Equator:    bright green
  var equ2Colr = new Float32Array([1.0, 0.3, 0.8]);	// Equator:    bright green
  var botColr = new Float32Array([0.2, 1.0, 0.8]);	// South Pole: brightest gray.
  var sliceAngle = Math.PI/slices;	// lattitude angle spanned by one slice.
  var floatsPerVertex = 7;

	// Create a (global) array to hold this sphere's vertices:
  sphVerts = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them. 
										// each slice requires 2*sliceVerts vertices except 1st and
										// last ones, which require only 2*sliceVerts-1.
										
	// Create dome-shaped top slice of sphere at z=+1
	// s counts slices; v counts vertices; 
	// j counts array elements (vertices * elements per vertex)
	var cos0 = 0.0;					// sines,cosines of slice's top, bottom edge.
	var sin0 = 0.0;
	var cos1 = 0.0;
	var sin1 = 0.0;	
	var j = 0;							// initialize our array index
	var isLast = 0;
	var isFirst = 1;
	for(s=0; s<slices; s++) {	// for each slice of the sphere,
		// find sines & cosines for top and bottom of this slice
		if(s==0) {
			isFirst = 1;	// skip 1st vertex of 1st slice.
			cos0 = 1.0; 	// initialize: start at north pole.
			sin0 = 0.0;
		}
		else {					// otherwise, new top edge == old bottom edge
			isFirst = 0;	
			cos0 = cos1;
			sin0 = sin1;
		}								// & compute sine,cosine for new bottom edge.
		cos1 = Math.cos((s+1)*sliceAngle);
		sin1 = Math.sin((s+1)*sliceAngle);
		// go around the entire slice, generating TRIANGLE_STRIP verts
		// (Note we don't initialize j; grows with each new attrib,vertex, and slice)
		if(s==slices-1) isLast=1;	// skip last vertex of last slice.
		for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) {	
			if(v%2==0)
			{				// put even# vertices at the the slice's top edge
							// (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
							// and thus we can simplify cos(2*PI(v/2*sliceVerts))  
				sphVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts); 	
				sphVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);	
				sphVerts[j+2] = cos0;		
				sphVerts[j+3] = 1.0;			
			}
			else { 	// put odd# vertices around the slice's lower edge;
							// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
							// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
				sphVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);		// x
				sphVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);		// y
				sphVerts[j+2] = cos1;																				// z
				sphVerts[j+3] = 1.0;																				// w.		
			}
			if(s==0) {	// finally, set some interesting colors for vertices:
				sphVerts[j+4]=topColr[0]; 
				sphVerts[j+5]=topColr[1]; 
				sphVerts[j+6]=topColr[2];	
				}
			else if(s==slices-1) {
				sphVerts[j+4]=botColr[0]; 
				sphVerts[j+5]=botColr[1]; 
				sphVerts[j+6]=botColr[2];	
			}
			else if(s%2==0){
					sphVerts[j+4]=equColr[0]; // equColr[0]; 
					sphVerts[j+5]=equColr[1]; // equColr[1]; 
					sphVerts[j+6]=equColr[2]; // equColr[2];	
			}
			else{
					sphVerts[j+4]=equ2Colr[0]; // equColr[0]; 
					sphVerts[j+5]=equ2Colr[1]; // equColr[1]; 
					sphVerts[j+6]=equ2Colr[2]; // equColr[2];	
			}
		}
	}
}

function makePyramid(){
	pyrVert = new Float32Array([
		-0.1, 0.0, 0.1, 1.0, 1.0, 1.0, 1.0,
		0.1, 0.0, 0.1, 1.0, 1.0, 1.0, 1.0,
		0.0, 0.0, -0.1, 1.0, 1.0, 1.0, 1.0,
		
		-0.1, 0.0, 0.1, 1.0, 1.0, 1.0, 1.0,
		0.1, 0.0, 0.1, 1.0, 1.0, 1.0, 1.0,
		0.0, 0.2, 0.1, 1.0, 1.0, 1.0, 1.0,

		-0.1, 0.0, 0.1, 1.0, 1.0, 1.0, 1.0,
		0.0, 0.0, -0.1, 1.0, 1.0, 1.0, 1.0,
		0.0, 0.2, 0.1, 1.0, 1.0, 1.0, 1.0,

		0.1, 0.0, 0.1, 1.0, 1.0, 1.0, 1.0,
		0.0, 0.0, -0.1, 1.0, 1.0, 1.0, 1.0,
		0.0, 0.2, 0.1, 1.0, 1.0, 1.0, 1.0,
	]);
	pyrNumber = 12;
  pyrNormal = new Float32Array([
		0.0, -1.0, 0.0, 1.0, 1.0, 1.0, 1.0,
		0.0, -1.0, 0.0, 1.0, 1.0, 1.0, 1.0,
		0.0, -1.0, 0.0, 1.0, 1.0, 1.0, 1.0,
		
		0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0,

		-0.04, 0.02, -0.02, 1.0, 1.0, 1.0, 1.0,
	  -0.04, 0.02, -0.02, 1.0, 1.0, 1.0, 1.0,
		-0.04, 0.02, -0.02, 1.0, 1.0, 1.0, 1.0,

		0.04, 0.02, -0.02, 1.0, 1.0, 1.0, 1.0,
		0.04, 0.02, -0.02, 1.0, 1.0, 1.0, 1.0,
		0.04, 0.02, -0.02, 1.0, 1.0, 1.0, 1.0,
	]);
}

function makeCylinder() {
//==============================================================================
// Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
// 'stepped spiral' design described in notes.
// Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
//
 var ctrColr = new Float32Array([0.1, 0.1, 0.5]);	// dark gray
 var topColr = new Float32Array([0.1, 0.1, 0.5]);	// light green
 var botColr = new Float32Array([0.1, 0.1, 0.5]);	// light blue
 var capVerts = 16;	// # of vertices around the topmost 'cap' of the shape
 var botRadius = 1;		// radius of bottom of cylinder (top always 1.0)
  var floatsPerVertex = 7;
 
 // Create a (global) array to hold this cylinder's vertices;
 cylVerts = new Float32Array(  ((capVerts*6) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them.
 cylNors = new Float32Array(  ((capVerts*6) -2) * floatsPerVertex); 

	// Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
	// v counts vertices: j counts array elements (vertices * elements per vertex)
	for(v=1,j=0; v<2*capVerts; v++,j+=floatsPerVertex) {	
		// skip the first vertex--not needed.
		if(v%2==0)
		{				// put even# vertices at center of cylinder's top cap:
			cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
			cylVerts[j+1] = 0.0;	
			cylVerts[j+2] = 1.0; 
			cylVerts[j+3] = 1.0;			// r,g,b = topColr[]
			cylVerts[j+4]=ctrColr[0]; 
			cylVerts[j+5]=ctrColr[1]; 
			cylVerts[j+6]=ctrColr[2];
		}
		else { 	// put odd# vertices around the top cap's outer edge;
						// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
						// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
			cylVerts[j  ] = Math.cos(Math.PI*(v-1)/capVerts);			// x
			cylVerts[j+1] = Math.sin(Math.PI*(v-1)/capVerts);			// y
			//	(Why not 2*PI? because 0 < =v < 2*capVerts, so we
			//	 can simplify cos(2*PI * (v-1)/(2*capVerts))
			cylVerts[j+2] = 1.0;	// z
			cylVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			cylVerts[j+4]=topColr[0]; 
			cylVerts[j+5]=topColr[1]; 
			cylVerts[j+6]=topColr[2];			
		}
			cylNors[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
			cylNors[j+1] = 0.0;	
			cylNors[j+2] = 1.0; 
			cylNors[j+3] = 1.0;			// r,g,b = topColr[]
			cylNors[j+4]=ctrColr[0]; 
			cylNors[j+5]=ctrColr[1]; 
			cylNors[j+6]=ctrColr[2];
	}
	// Create the cylinder side walls, made of 2*capVerts vertices.
	// v counts vertices within the wall; j continues to count array elements
	for(v=0; v< 2*capVerts; v++, j+=floatsPerVertex) {
		if(v%2==0)	// position all even# vertices along top cap:
		{		
				cylVerts[j  ] = Math.cos(Math.PI*(v)/capVerts);		// x
				cylVerts[j+1] = Math.sin(Math.PI*(v)/capVerts);		// y
				cylVerts[j+2] = 1.0;	// z
				cylVerts[j+3] = 1.0;	// w.
				// r,g,b = topColr[]
				cylVerts[j+4]=topColr[0]; 
				cylVerts[j+5]=topColr[1]; 
				cylVerts[j+6]=topColr[2];			
		}
		else		// position all odd# vertices along the bottom cap:
		{
				cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);		// x
				cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);		// y
				cylVerts[j+2] =-1.0;	// z
				cylVerts[j+3] = 1.0;	// w.
				// r,g,b = topColr[]
				cylVerts[j+4]=botColr[0]; 
				cylVerts[j+5]=botColr[1]; 
				cylVerts[j+6]=botColr[2];			
		}
      cylNors[j  ] = Math.cos(Math.PI*(v-1)/capVerts); 			// x,y,z,w == 0,0,1,1
			cylNors[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);	
			cylNors[j+2] = 0.0; 
			cylNors[j+3] = 1.0;			// r,g,b = topColr[]
			cylNors[j+4]=ctrColr[0]; 
			cylNors[j+5]=ctrColr[1]; 
			cylNors[j+6]=ctrColr[2];
	}
	// Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
	// v counts the vertices in the cap; j continues to count array elements
	for(v=0; v < (2*capVerts -1); v++, j+= floatsPerVertex) {
		if(v%2==0) {	// position even #'d vertices around bot cap's outer edge
			cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);		// x
			cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);		// y
			cylVerts[j+2] =-1.0;	// z
			cylVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			cylVerts[j+4]=botColr[0]; 
			cylVerts[j+5]=botColr[1]; 
			cylVerts[j+6]=botColr[2];		
		}
		else {				// position odd#'d vertices at center of the bottom cap:
			cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1
			cylVerts[j+1] = 0.0;	
			cylVerts[j+2] =-1.0; 
			cylVerts[j+3] = 1.0;			// r,g,b = botColr[]
			cylVerts[j+4]=botColr[0]; 
			cylVerts[j+5]=botColr[1]; 
			cylVerts[j+6]=botColr[2];
		}
      cylNors[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
			cylNors[j+1] = 0.0;	
			cylNors[j+2] = -1.0; 
			cylNors[j+3] = 1.0;			// r,g,b = topColr[]
			cylNors[j+4]=ctrColr[0]; 
			cylNors[j+5]=ctrColr[1]; 
			cylNors[j+6]=ctrColr[2];
	}
}

function makeTorus() {
//==============================================================================
// 		Create a torus centered at the origin that circles the z axis.  
// Terminology: imagine a torus as a flexible, cylinder-shaped bar or rod bent 
// into a circle around the z-axis. The bent bar's centerline forms a circle
// entirely in the z=0 plane, centered at the origin, with radius 'rbend'.  The 
// bent-bar circle begins at (rbend,0,0), increases in +y direction to circle  
// around the z-axis in counter-clockwise (CCW) direction, consistent with our
// right-handed coordinate system.
// 		This bent bar forms a torus because the bar itself has a circular cross-
// section with radius 'rbar' and angle 'phi'. We measure phi in CCW direction 
// around the bar's centerline, circling right-handed along the direction 
// forward from the bar's start at theta=0 towards its end at theta=2PI.
// 		THUS theta=0, phi=0 selects the torus surface point (rbend+rbar,0,0);
// a slight increase in phi moves that point in -z direction and a slight
// increase in theta moves that point in the +y direction.  
// To construct the torus, begin with the circle at the start of the bar:
//					xc = rbend + rbar*cos(phi); 
//					yc = 0; 
//					zc = -rbar*sin(phi);			(note negative sin(); right-handed phi)
// and then rotate this circle around the z-axis by angle theta:
//					x = xc*cos(theta) - yc*sin(theta) 	
//					y = xc*sin(theta) + yc*cos(theta)
//					z = zc
// Simplify: yc==0, so
//					x = (rbend + rbar*cos(phi))*cos(theta)
//					y = (rbend + rbar*cos(phi))*sin(theta) 
//					z = -rbar*sin(phi)
// To construct a torus from a single triangle-strip, make a 'stepped spiral' 
// along the length of the bent bar; successive rings of constant-theta, using 
// the same design used for cylinder walls in 'makeCyl()' and for 'slices' in 
// makeSphere().  Unlike the cylinder and sphere, we have no 'special case' 
// for the first and last of these bar-encircling rings.
//
var rbend = 1.0;										// Radius of circle formed by torus' bent bar
var rbar = 0.07;											// radius of the bar we bent to form torus
var barSlices = 23;									// # of bar-segments in the torus: >=3 req'd;
																		// more segments for more-circular torus
var barSides = 13;										// # of sides of the bar (and thus the 
																		// number of vertices in its cross-section)
																		// >=3 req'd;
																		// more sides for more-circular cross-section
// for nice-looking torus with approx square facets, 
//			--choose odd or prime#  for barSides, and
//			--choose pdd or prime# for barSlices of approx. barSides *(rbend/rbar)
// EXAMPLE: rbend = 1, rbar = 0.5, barSlices =23, barSides = 11.

	// Create a (global) array to hold this torus's vertices:
var floatsPerVertex = 7;
 torVerts = new Float32Array(floatsPerVertex*(2*barSides*barSlices +2));
 torNormal = new Float32Array(floatsPerVertex*(2*barSides*barSlices +2));
//	Each slice requires 2*barSides vertices, but 1st slice will skip its first 
// triangle and last slice will skip its last triangle. To 'close' the torus,
// repeat the first 2 vertices at the end of the triangle-strip.  Assume 7

var phi=0, theta=0;										// begin torus at angles 0,0
var thetaStep = 2*Math.PI/barSlices;	// theta angle between each bar segment
var phiHalfStep = Math.PI/barSides;		// half-phi angle between each side of bar
																			// (WHY HALF? 2 vertices per step in phi)
	// s counts slices of the bar; v counts vertices within one slice; j counts
	// array elements (Float32) (vertices*#attribs/vertex) put in torVerts array.
	for(s=0,j=0; s<barSlices; s++) {		// for each 'slice' or 'ring' of the torus:
		for(v=0; v< 2*barSides; v++, j+=7) {		// for each vertex in this slice:
			if(v%2==0)	{	// even #'d vertices at bottom of slice,
				torVerts[j  ] = (rbend + rbar*Math.cos((v)*phiHalfStep)) * 
																						 Math.cos((s)*thetaStep);
							  //	x = (rbend + rbar*cos(phi)) * cos(theta)
				torVerts[j+1] = (rbend + rbar*Math.cos((v)*phiHalfStep)) *
																						 Math.sin((s)*thetaStep);
								//  y = (rbend + rbar*cos(phi)) * sin(theta) 
				torVerts[j+2] = -rbar*Math.sin((v)*phiHalfStep);
								//  z = -rbar  *   sin(phi)
				torVerts[j+3] = 1.0;		// w

        torNormal[j  ] = rbar*Math.cos((v)*phiHalfStep) * 
																						 Math.cos((s)*thetaStep);
							  //	x = (rbend + rbar*cos(phi)) * cos(theta)
				torNormal[j+1] = rbar*Math.cos((v)*phiHalfStep) *
																						 Math.sin((s)*thetaStep);
								//  y = (rbend + rbar*cos(phi)) * sin(theta) 
				torNormal[j+2] = -rbar*Math.sin((v)*phiHalfStep);
								//  z = -rbar  *   sin(phi)
				torNormal[j+3] = 1.0;		// w
			}
			else {				// odd #'d vertices at top of slice (s+1);
										// at same phi used at bottom of slice (v-1)
				torVerts[j  ] = (rbend + rbar*Math.cos((v-1)*phiHalfStep)) * 
																						 Math.cos((s+1)*thetaStep);
							  //	x = (rbend + rbar*cos(phi)) * cos(theta)
				torVerts[j+1] = (rbend + rbar*Math.cos((v-1)*phiHalfStep)) *
																						 Math.sin((s+1)*thetaStep);
								//  y = (rbend + rbar*cos(phi)) * sin(theta) 
				torVerts[j+2] = -rbar*Math.sin((v-1)*phiHalfStep);
								//  z = -rbar  *   sin(phi)
				torVerts[j+3] = 1.0;		// w

        torNormal[j  ] = rbar*Math.cos((v)*phiHalfStep) * 
																						 Math.cos((s)*thetaStep);
							  //	x = (rbend + rbar*cos(phi)) * cos(theta)
				torNormal[j+1] = rbar*Math.cos((v)*phiHalfStep) *
																						 Math.sin((s)*thetaStep);
								//  y = (rbend + rbar*cos(phi)) * sin(theta) 
				torNormal[j+2] = -rbar*Math.sin((v)*phiHalfStep);
								//  z = -rbar  *   sin(phi)
				torNormal[j+3] = 1.0;		// w
			}
			torVerts[j+4] = Math.random();		// random color 0.0 <= R < 1.0
			torVerts[j+5] = Math.random();		// random color 0.0 <= G < 1.0
			torVerts[j+6] = Math.random();		// random color 0.0 <= B < 1.0
			torNormal[j+4] = Math.random();		// random color 0.0 <= R < 1.0
			torNormal[j+5] = Math.random();		// random color 0.0 <= G < 1.0
			torNormal[j+6] = Math.random();		// random color 0.0 <= B < 1.0
		}
	}
	// Repeat the 1st 2 vertices of the triangle strip to complete the torus:
			torVerts[j  ] = rbend + rbar;	// copy vertex zero;
						  //	x = (rbend + rbar*cos(phi==0)) * cos(theta==0)
			torVerts[j+1] = 0.0;
							//  y = (rbend + rbar*cos(phi==0)) * sin(theta==0) 
			torVerts[j+2] = 0.0;
							//  z = -rbar  *   sin(phi==0)
			torVerts[j+3] = 1.0;		// w
			torVerts[j+4] = Math.random();		// random color 0.0 <= R < 1.0
			torVerts[j+5] = Math.random();		// random color 0.0 <= G < 1.0
			torVerts[j+6] = Math.random();		// random color 0.0 <= B < 1.0
      torNormal[j  ] = rbar;	// copy vertex zero;
						  //	x = (rbend + rbar*cos(phi==0)) * cos(theta==0)
			torNormal[j+1] = 0.0;
							//  y = (rbend + rbar*cos(phi==0)) * sin(theta==0) 
			torNormal[j+2] = 0.0;
							//  z = -rbar  *   sin(phi==0)
			torNormal[j+3] = 1.0;		// w
			torNormal[j+4] = Math.random();		// random color 0.0 <= R < 1.0
			torNormal[j+5] = Math.random();		// random color 0.0 <= G < 1.0
			torNormal[j+6] = Math.random();		// random color 0.0 <= B < 1.0
			j+=7; // go to next vertex:
			torVerts[j  ] = (rbend + rbar) * Math.cos(thetaStep);
						  //	x = (rbend + rbar*cos(phi==0)) * cos(theta==thetaStep)
			torVerts[j+1] = (rbend + rbar) * Math.sin(thetaStep);
							//  y = (rbend + rbar*cos(phi==0)) * sin(theta==thetaStep) 
			torVerts[j+2] = 0.0;
							//  z = -rbar  *   sin(phi==0)
			torVerts[j+3] = 1.0;		// w
			torVerts[j+4] = Math.random();		// random color 0.0 <= R < 1.0
			torVerts[j+5] = Math.random();		// random color 0.0 <= G < 1.0
			torVerts[j+6] = Math.random();		// random color 0.0 <= B < 1.0
      torNormal[j  ] = rbar * Math.cos(thetaStep);
						  //	x = (rbend + rbar*cos(phi==0)) * cos(theta==0)
			torNormal[j+1] = rbar * Math.sin(thetaStep);
							//  y = (rbend + rbar*cos(phi==0)) * sin(theta==0) 
			torNormal[j+2] = 0.0;
							//  z = -rbar  *   sin(phi==0)
			torNormal[j+3] = 1.0;		// w
			torNormal[j+4] = Math.random();		// random color 0.0 <= R < 1.0
			torNormal[j+5] = Math.random();		// random color 0.0 <= G < 1.0
			torNormal[j+6] = Math.random();		// random color 0.0 <= B < 1.0
}