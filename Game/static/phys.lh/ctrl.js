$(function(){
	Physics.behavior('ctrl', function(parent){	
		var defaults = {
			resistance: 0.998
		};
	
		return {
			init: function(opt){
				var self = this;
				
				this.opt = Physics.util.extend({}, defaults, opt);
				
				this.mousePos = Physics.vector();
				this.offset = Physics.vector();
				
				this.el = $(opt.el).on({
					mousedown: function(e){
						var offset = $(this).offset();
						self.mousePos.set(e.pageX - offset.left, e.pageY - offset.top);
						
						var body = self._world.findOne({ $at: self.mousePos });
						if (body && (!self.bodies || self.bodies.indexOf(body) >= 0)){
							self.body = body;
							self.offset.clone(self.mousePos).vsub(body.state.pos);
							self.mouseDown = true;
						}

					},
					
					mousemove: function(e){
						var offset = $(this).offset();
						self.mousePos.set(e.pageX - offset.left, e.pageY - offset.top);
					},
					
					mouseup: function(e){
						var offset = $(this).offset();
						self.mousePos.set(e.pageX - offset.left, e.pageY - offset.top);

						if (self.body)
							self.body = false;
							
						self.mouseDown = false;
					}
				});
			},
			
			move: function(body, pos){
				var scratch = Physics.scratchpad(),
					v = scratch.vector();

				v.clone(pos).vsub(body.state.pos);
				var length = v.norm();
				
				v.normalize().mult(0.003);
				
				if(length>1)body.state.acc.vadd(v);
				body.state.vel.mult(1-(1/((length<1)?1:length)));
				

				scratch.done();
			},

			behave: function(data){
				var bodies = data.bodies;
				for (var i = 0, l = bodies.length; i < l; ++i){
					bodies[i].state.vel.mult(this.opt.resistance);
					bodies[i].state.angular.vel *= this.opt.resistance;
				}
			
				if(!this.body || !this.mouseDown) return;
				
				this.move(this.body, this.mousePos);
				
				this._world.publish({
					topic: 'ctrl:movement',
					body: this.body,
					pos: this.mousePos
				});
			}
		};
	});
});

//