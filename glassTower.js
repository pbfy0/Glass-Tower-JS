// thanks to Mike Koenig for the glass breaking sounds, from http://soundbible.com/105-Light-Bulb-Breaking.html and http://soundbible.com/994-Mirror-Shattering.html

var delstack = [];
var   b2Vec2 = Box2D.Common.Math.b2Vec2
,  b2AABB = Box2D.Collision.b2AABB
,	b2BodyDef = Box2D.Dynamics.b2BodyDef
,	b2Body = Box2D.Dynamics.b2Body
,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
,	b2Fixture = Box2D.Dynamics.b2Fixture
,	b2World = Box2D.Dynamics.b2World
,	b2MassData = Box2D.Collision.Shapes.b2MassData
,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
,  b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
;
var pel;
var pos;
var scale;
var smashcount = 0;
var over = false;
function smash(){
    var st = Math.round(Math.random()) + 1;
//    var csmash = soundManager.createSound({id: "smash" + smashcount, url: "smash" + st + ".ogg"});
//    csmash.play();
//    smashcount++;
      var a = new Audio();
      a.src = "smash" + st + ".ogg";
      a.play();
}
function levelselect(){
    var i, o = "";
    for(i in levelset){
	o += '<input type="submit" onclick="loadLevel(' + i + ')" value="' + i + '" />';
    }
    document.getElementById("levels").innerHTML = o;
}
var canvas;
var width;
var height;
var pwidth// = width/scale;
var pheight// = height/scale;
var reverse;
var reversed;
var canvasPosition;// = getElementPosition(canvas);
function init() {
    canvas = document.getElementById("canvas");
    reverse = document.getElementById("reverse");
    canvasPosition = getElementPosition(canvas);
    height = window.innerHeight - 16;
    width = height * 2/3;
    scale = height/10;
    canvas.width = width;
    canvas.height = height;
    pwidth = width/scale;
    pheight = height/scale;
    loadLevel(0);
    levelselect();
    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
    debugDraw.SetDrawScale(scale);
    debugDraw.SetFillAlpha(1);
    debugDraw.SetAlpha(1);
    debugDraw.SetLineThickness(1.0);
    //	debugDraw.SetLineColor(rgb(0, 0, 0));
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit/* | b2DebugDraw.e_jointBit*/);
    world.SetDebugDraw(debugDraw);
    window.setInterval(update, 1000 / fps);
    pel = document.getElementById("points");
}

var l = 0;
var inp = levelset[l];
var totalPoints = 0;
var levelPoints = 0;
var fps = 30;


var world = new b2World(
    new b2Vec2(0, 10)    //gravity
    ,  true                 //allow sleep
);

function XOR(a, b){
    return !!((a ? 1 : 0) ^ (b ? 1 : 0));
}

var fixDef = new b2FixtureDef;
fixDef.density = 1.0;
fixDef.friction = 0.5;
fixDef.restitution = 0.2;

var bodyDef = new b2BodyDef;
function cbox(cc, occ, xc, yc, wc, hc){
    wc = (wc) ? wc : 1;
    hc = (hc) ? hc : 1;
    return {x:xc,y:yc,w:wc,h:hc,c:cc,oc:occ};
}
function rgb(rc, gc, bc){
    return {r:rc,g:gc,b:bc};
}
var blue = rgb(0, 112, 0);
var red = rgb(255, 253, 208);
var outline = rgb(1, 68, 33);
//	 var outline = rgb(255, 255, 255);
var cwidth = 0, cpos, diff;
var blcnt = 0;
function shp(a){
    cwidth = inp.shift() / 2;
    cpos = pwidth/2;
    diff = pheight-2/15;
    reversed = reverse.checked;
    var i;
    var o = [];
    for(i in a){
	var c = XOR(reversed, a[i][0]);
	o.push(cbox(c ? blue : red, outline, a[i][1] + width/(scale*2), a[i][2]+0.5, a[i][3], a[i][4]));
	//			if(reversed){a[i][0] = !a[i][0]}
	blcnt += c ? 1 : 0;
    }
    return o;
}


//create ground
function shapes(){
    bodyDef.type = b2Body.b2_staticBody;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(cwidth, 2);
    bodyDef.position.Set(cpos, pheight + 1.8);
    world.CreateBody(bodyDef).CreateFixture(fixDef);
    
    
    //create some objects

    bodyDef.type = b2Body.b2_dynamicBody;
    for(var i = 0; i < pos.length; ++i) {
	var cp = pos[i];
        fixDef.shape = new b2PolygonShape;
        fixDef.shape.SetAsBox(cp.w/2, cp.h/2);
        bodyDef.position.x = cp.x;
        bodyDef.position.y = diff-cp.y;
        var body = world.CreateBody(bodyDef);
	var fixture = body.CreateFixture(fixDef);
	fixture.SetUserData({color : cp.c, area : cp.w*cp.h, outlineColor : cp.oc});
    }
};
//setup debug draw


//mouse

var mouseX, mouseY, mousePVec, isMouseDown, selectedBody, mouseJoint, vec, selectedFixtures;



document.addEventListener("mousedown", function(e) {
    isMouseDown = true;
    handleMouseMove(e);
}, true);

document.addEventListener("mouseup", function() {
    isMouseDown = false;
    mouseX = undefined;
    mouseY = undefined;
}, true);
document.addEventListener("touchstart", function(event) {
    isMouseDown = true;
    handleTouchMove(event);
    //	    event.preventDefault();
    //            handleTouchStart(e);
}, true); 
document.addEventListener("touchend", function(event) {
    isMouseDown = false;
    mouseX = undefined;
    mouseY = undefined;
    //            event.preventDefault();
}, true);
//	 document.addEventListener("touchmove", handleTouchMove, true);


function handleMouseMove(e) {
    mouseX = (e.pageX - canvasPosition.x) / scale;
    mouseY = (e.pageY - canvasPosition.y) / scale;
};
function handleTouchMove(e){
    //	alert(e.touches.length);
    mouseX = (e.targetTouches[0].pageX - canvasPosition.x) / scale;
    mouseY = (e.targetTouches[0].pageY - canvasPosition.y) / scale;
    e.preventDefault();

}

function getBodyCB(fixture) {
    if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
        if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
            selectedBody = fixture.GetBody();
            return false;
        }
    }
    return true;
}

function getBodyAABB(fixture) {
    if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
        selectedBody = fixture.GetBody();
        return false;
    }
    return true;
}
var fllflag = false;
function loadLevel(level){
    deleteAll();
    blcnt = 0;
    l = level;
    inp = levelset[l];
    if(inp === undefined){return}
    inp = inp.slice();
    if(inp !== undefined){
	pos = shp(inp);
	fllflag = true;
	return true;
    }else{
	return false;
    }
}
function deleteAll(){
    var fixtures = getAllFixtures();
    delstack = fixtures;
}
function nextLevel(){
    totalPoints += levelPoints;
    levelPoints = 0;
    if(l + 1 < levelset.length){
	alert("Level Complete.\n\nTotal score: " + totalPoints);
	loadLevel(l + 1);
    }else{
	deleteAll();
	alert("You win.\n\nTotal score: " + totalPoints);
	over = true;
    }
}
function getABHelper(fixture){
    selectedFixtures.push(fixture);
    return true;
}
function getBodyAtMouse() {
    mousePVec = new b2Vec2(mouseX, mouseY);
    var aabb = new b2AABB();
    aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
    aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);
    
    // Query the world for overlapping shapes.

    selectedBody = null;
    world.QueryAABB(getBodyCB, aabb);
    return selectedBody;
}
function getFallenBody(){
    vec = new b2Vec2(0, 0);
    var aabb = new b2AABB();
    aabb.lowerBound.Set(-pwidth, pheight + 1);
    aabb.upperBound.Set(2*pwidth, pheight + 1);
    
    selectedBody = null;
    world.QueryAABB(getBodyAABB, aabb);
    return selectedBody;
}
function getAllFixtures(){
    var b;
    var out = [];
    for(b = world.GetBodyList(); b !== null; b = b.GetNext()){
	var f;
	for(f = b.GetFixtureList(); f != null; f = f.GetNext()){
	    out.push(f);
	}
    }
    return out;
}

//update
function computePoints(fix){
    var fud = fix.GetUserData();
    var isblue = (fud.color == blue);
    //		  if(reversed){isblue = !isblue}
    blcnt -= isblue ? 1 : 0;
    var pd = (isblue ? 10 : -10) * fud.area;
    return pd;
}
var lock = false;
var flock = false;
function deleteFixture(fix){
    delstack.push(fix);
}
function _deleteFixture(fix){
    var body = fix.GetBody();
    body.SetAwake(true);
    body.DestroyFixture(fix);
}
function handleSmash(body){
        body.SetAwake(true);
	var fix = body.GetFixtureList();
	levelPoints += computePoints(fix);
	smash();
	_deleteFixture(fix);
}
function update() {
    var d = new Date();
    if(isMouseDown) {
        var body = getBodyAtMouse();
        if(body) {
            handleSmash(body);
        }
	isMouseDown = false;

    }
    var fbody = getFallenBody();
    if(fbody){
	handleSmash(fbody);
    }
    
    pel.innerHTML = levelPoints;
    if(blcnt == 0 && !over){
	nextLevel();
    }
    if(delstack.length > 0 && lock==false){
	lock=true;
	var i;
	for(i = 0; i < delstack.length; i++){
	    var fix = delstack[i];
	    var body = fix.GetBody();
	    if(body === null){continue}
            _deleteFixture(fix);
	    delstack.splice(i, 1);
	}
	if(fllflag){
	    fllflag=false;
	    setTimeout(shapes, 200);
	}
	lock=false;
	//		console.log(delstack);
    }
    if(fllflag){
	fllflag=false;
	setTimeout(shapes, 200);
    }
    world.Step(1 / fps, 10, 10);
    world.DrawDebugData();
    world.ClearForces();
    //	console.log(new Date().getTime()-d.getTime());
};

//helpers

//http://js-tut.aardon.de/js-tut/tutorial/position.html
function getElementPosition(element) {
    var elem=element, tagname="", x=0, y=0;
    
    while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
        y += elem.offsetTop;
        x += elem.offsetLeft;
        tagname = elem.tagName.toUpperCase();

        if(tagname == "BODY")
            elem=0;

        if(typeof(elem) == "object") {
            if(typeof(elem.offsetParent) == "object")
                elem = elem.offsetParent;
        }
    }

    return {x: x, y: y};
}
