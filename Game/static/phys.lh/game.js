var game = {
	gateSize: 60,	// Vartų dydis
	ballR: 50,		// Žaidėjų kamuolių spindulys
	middleR: 30,	// Vidurinio kamuolio spindulys
	middleBound: 50,
	middleSpeed: 2.5,
	ballTimeout: 100,
	
	views:{
		A: {
			strokeStyle: 'rgb(90,30,50)',
			lineWidth: 2,
			fillStyle: 'rgba(200, 60, 57, 0.8)',
			//angleIndicator: 'rgba(1, 1, 1, 0.1)'
		},
		B: {
			strokeStyle: 'rgb(30,90,50)',
			lineWidth: 2,
			fillStyle: 'rgba(60, 200, 57, 0.8)',
			//angleIndicator: 'rgba(1, 1, 1, 0.1)'
		},
		
		X: {
			strokeStyle: 'rgb(30,50,90)',
			fillStyle: 'rgba(60, 57, 200, 0.8)',
		}
	},
	
	collisions: {
		A2B: function(){
			console.log('A į B');
		},
		
		B2A: function(){
			console.log('B į A');
		},
		
		A2A: function(){
			console.log('A į A');
		},
		
		B2B: function(){
			console.log('B į B');
		},
		
		A2X: function(){
			console.log('A į X');
			//game.resetA();
		},
		
		B2X: function(){
			console.log('B į X');
			//game.resetB();
		}
	},
	
	matchTimeout: function(){
		alert('Laikas baigėsi');
	},
	
	setTimeout: function(){
		if(game.match){
			setTimeout(game.matchTimeout, game.match.duration*60000);
			ui.$match.remove();
		}
	},
	
	resetA: function(){
		game.balls.A.state.pos.set(game.gateSize*3, phys.height / 2);
		game.balls.A.state.vel.set();
	},
	
	resetB: function(){
		game.balls.B.state.pos.set(phys.width - game.gateSize*3, phys.height / 2);
		game.balls.B.state.vel.set();
	},
	
	resetX: function(){
		game.balls.X.up = false;
		game.balls.X.state.pos.set(phys.width / 2, phys.height / 2);
	},
	
	reset: function(){
		game.resetA() & game.resetB() & game.resetX();
	},
};

$(function(){
	var gateVertices = [
		{x: 0, y: game.gateSize},
		{x: game.gateSize, y: game.gateSize},
		{x: game.gateSize, y: 0},
		{x: 0, y: 0}
	];
	
	var circle = {
		x: phys.width / 2,
		y: phys.height / 2,
		radius: game.ballR,
		mass: 2,
		restitution: 0.7,
	};
	
	var gate = {
		vertices: gateVertices,
		x: phys.width / 2,
		y: phys.height / 2,
		restitution: 0.1,
		fixed: true,
	};
	
	game.balls = {};
	game.gates = {};
	
	// Player A
	game.balls.A = Physics.body('circle', circle);
	game.balls.A.view = phys.renderer.createView(game.balls.A.geometry, game.views.A);
	phys.world.add(game.balls.A);
	game.resetA();
	
	game.gates.A = Physics.body('convex-polygon',  Physics.util.extend({}, gate, {x: game.gateSize}));
	game.gates.A.view = phys.renderer.createView(game.gates.A.geometry, Physics.util.extend({}, game.views.A, {angleIndicator: false}));
	phys.world.add(game.gates.A);
	//phys.swep.untrackBody({body: game.gates.A});
	
	
	// Player B
	game.balls.B = Physics.body('circle', circle);
	game.balls.B.view = phys.renderer.createView(game.balls.B.geometry, game.views.B);
	phys.world.add(game.balls.B);
	game.resetB();
	
	game.gates.B = Physics.body('convex-polygon', Physics.util.extend({}, gate, {x: phys.width - game.gateSize}));
	game.gates.B.view = phys.renderer.createView(game.gates.B.geometry, Physics.util.extend({}, game.views.B, {angleIndicator: false}));
	phys.world.add(game.gates.B);
	
	
	phys.world.add(game.ctrl = Physics.behavior('ctrl', { el: '#view', bodies: [ws.me]}));
	phys.world.subscribe('ctrl:movement', function(d){
		ws.move(d.pos._[0], d.pos._[1]);
	});
	
	// Middle ball
	game.balls.X = Physics.body('circle', Physics.util.extend({}, circle, {radius: game.middleR, fixed: true}));
	game.balls.X.view = phys.renderer.createView(game.balls.X.geometry, game.views.X);
	phys.world.add(game.balls.X);
	
	phys.world.add( Physics.behavior('body-collision-detection', {checkAll: false, overlap: [game.gates.A, game.gates.B, game.balls.X]}) );
	
	var y = 0;
	game.balls.X.up = false;
	phys.world.subscribe('step', function(data){
		var y = game.balls.X.state.pos._[1];
		
		if(!game.balls.X.up && y>phys.height-game.middleBound) game.balls.X.up = true;
		else if(game.balls.X.up && y<0+game.middleBound) game.balls.X.up = false;
		
		game.balls.X.state.pos[game.balls.X.up?'sub':'add'](0,game.middleSpeed);
	});
	
	
	phys.world.subscribe('collisions:detected', function(data){
		var col = data.collisions[0],
			A = col.bodyA,
			B = col.bodyB;
		
		if(A == game.balls.A && B == game.balls.X) game.collisions.A2X();
		if(B == game.balls.B && A == game.balls.X) game.collisions.B2X();
	});
	
	var goal = function(gate, ball){
		if(ball == game.balls.A && gate == game.gates.B) game.collisions.A2B();
		if(ball == game.balls.B && gate == game.gates.A) game.collisions.A2B();
		if(ball == game.balls.A && gate == game.gates.A) game.collisions.A2A();
		if(ball == game.balls.B && gate == game.gates.B) game.collisions.B2B();
	};
	
	phys.world.subscribe('pause', function(d){
		console.log('pause');
	});
	
	phys.world.subscribe('collisions:candidates', function(d){
		var col = d.candidates[0],
			A = col.bodyA,
			B = col.bodyB;
			
		if(game.gates.A == A || game.gates.A == B || game.gates.B == A || game.gates.B == B){
			var gate = (game.gates.B == A || game.gates.A == A)?A:B,
				ball = (gate == A)?B:A;
			
			if(gate.timer) clearTimeout(gate.timer);
			else goal(gate, ball);
			gate.timer = setTimeout(function(){
				delete gate.timer;
			}, game.ballTimeout);
		} else
		if(game.balls.X == A || game.balls.X == B){
			var ballX = (game.balls.X == A)?A:B,
				ball = (ballX == A)?B:A;
				
			game.collisions[((ball == game.balls.A)?'A':'B')+'2X']();
		}
	});
});