var phys = {
	$space: false,
	world: Physics(),
	renderer: Physics.renderer('canvas', {
		el: 'view',
		styles: {
			'circle': {
				strokeStyle: 'hsla(60, 37%, 17%, 1)',
				lineWidth: 1,
				fillStyle: 'hsla(60, 37%, 57%, 0.8)',
				angleIndicator: 'hsla(60, 37%, 17%, 0.4)'
			},
			'convex-polygon' : {
				strokeStyle: 'hsla(60, 37%, 17%, 1)',
				lineWidth: 1,
				fillStyle: 'hsla(60, 47%, 37%, 0.8)',
				angleIndicator: 'hsla(0, 0%, 0%, 0)'
			}
		}
	}),
	
	resize: function(w,h){
		phys.width = w || phys.$space.width();
		phys.height = h || phys.$space.height();
		
		if(phys.renderer){
			phys.renderer.options.width = phys.renderer.el.width = phys.width;
			phys.renderer.options.height = phys.renderer.el.height = phys.height;
		}
		
		if(phys.edgeBounce)phys.edgeBounce.setAABB(Physics.aabb(0, 0, phys.width, phys.height));
    }
};

(function(){	
	phys.edgeBounce = Physics.behavior('edge-collision-detection', {
		aabb: Physics.aabb(0, 0, phys.width, phys.height),
		restitution: 0.3,
		cof: 0.5
	});
	
   //phys.$space.on('resize', phys.resize).trigger('resize');

    $(function(){
		Physics.util.ticker.start();
		
		phys.resize(1100,600);
		
		phys.swep = Physics.behavior('sweep-prune');
		
		phys.world.add(phys.swep);
		phys.world.add( Physics.behavior('body-impulse-response'));

		phys.world.add(phys.edgeBounce);
			
		phys.world.pause();
		phys.world.add(phys.renderer);

		var i = 0;
		Physics.util.ticker.subscribe(function(time, dt){
			phys.world.step(time);
			
			//console.log(i++);
			//if (!phys.world.isPaused())
				phys.world.render();
		});
		
		phys.world.unpause();
    });
})();