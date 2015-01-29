var ui = {
	modal: function(id){
		$('.modal').hide();
		if(id && typeof id == 'string'){
			ui.$modal.show();
			var $box = $(id).show(),
				$cont = $box.children('.cont');
			
			if($cont.length>0){
				$box.height($cont.outerHeight());
				$box.width($cont.outerWidth());
			}
		}
		else
			ui.$modal.hide();
	},
	
	play: function(){
		var d = (ui.$match = $(this).parent().parent()).data();
		
		ws.close();
		ws.hi = function(msg){
			game.match = d;
			ws.me = game.balls[msg.online.length>1?'B':'A'];
			ws.rival = game.balls[msg.online.length>1?'A':'B'];
			game.ctrl.bodies = [ws.me];
			
			if(msg.id == 0){
				ws.send({_: 'set', info: d});
			}
			
			if(msg.online.length > 1){
				game.setTimeout();
				$('.pg').hide();
				$('#game').show();
				game.reset();
			}	
		};
		ws.connect(domain+'/'+d.name);
	},

	add: function(d){
		var el = "<tr>"+
			"<td>"+d.owner+"</td>"+
			"<td>"+(new Date(d.created)).toDateString()+"</td>"+
			"<td>"+d.price+"</td>"+
			"<td>"+d.duration+"</td>"
		"</tr>";
		
		var btnPlay = $("<td><button>Žaisti</button></td>");
		btnPlay.children('button').click(ui.play);
	
		return $(el).prependTo('#events').append(btnPlay).data(d);
	}
}

var domain = document.domain.toLowerCase(),
	host = domain.match(/[^.]+\.[^.]+$/);

$(function(){
	ui.$modal = $('#modal');
	ui.$modal.click(ui.modal);
	$('.close').click(ui.modal);

	$('#defineMatch').click(function(){
		ui.modal('#modalMatch');
	});
	
	$.query('/ws/rooms', {}, function(d){
		d.rooms.forEach(function(room){
			if(room.online.length == 1 && room.online[0] == 0) ui.add(room.info);
		});
	});
	$('#createMatch').click(function(){
		var $el = ui.add({
			owner: 'admin', 
			created: Date.now(), 
			price: $('#inpPrice').val(), 
			duration: $('#inpDuration').val(), 
			name: randomString(5)
		});
		ui.modal();
		$el.find('button').click();
	});
})