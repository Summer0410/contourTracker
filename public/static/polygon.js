/*
PolygonInterface{
	Any object which wishes to use the duck interface of _Polygon
	Must have a member called this.points which is an optionally empty 
	Javascript array of Point2D objects.
	They can extend their prototype to use some or all of the interface
	methods.
}
*/
_Polygon = {}
_Polygon.add_point = function(point){
	this.points.push(point);
}
_Polygon.get_point_array = function(){
	return this.points;
}
_Polygon.clear = function(){
	this.points = [];
}
_Polygon.remove_point = function(point){
	this.remove_point_at_index(this.points.indexOf(point))
}
_Polygon.remove_point_at_index = function(index){
	this.points.splice(index, 1);
}

//TODO: _Polygon Point transformations. (Skew, scale, etc)
//AbsolutePolygon should be given a translate transformation, but not RelativePolygon. 
//RelativePolygon is relative to the first point, so it doesn't have a translate since, since we can't change the center point, it must be 0,0!

function RelativePolygon(points){
	this.points = points || [new Point2D(0,0)]
	var center_point = this.points[0]
	for(var i = 0; i < this.points.length; i++){
		this.points[i].x = this.points[i].x - center_point.x;
		this.points[i].y = this.points[i].y - center_point.y;
	}
}

RelativePolygon.prototype.draw = function(ctx, center_point, options){
	this.to_absolute(center_point).draw(ctx,options);		
}

RelativePolygon.prototype.to_absolute = function(center_point){
	var pts = []
	for(var i = 0; i < this.points.length; i++){
		var pnt = new Point2D(0,0);
		pnt.setX(this.points[i].getX() - center_point.getX())
		pnt.setY(this.points[i].getY() - center_point.getY())
		pts.push(pnt)
	}
	return new AbsolutePolygon(pnts);
}

RelativePolygon.prototype.add_point = _Polygon.add_point;
RelativePolygon.prototype.get_point_array = _Polygon.get_point_array;
RelativePolygon.prototype.remove_point = _Polygon.remove_point;
RelativePolygon.prototype.remove_point_at_index = _Polygon.remove_point_at_index;
RelativePolygon.prototype.clear = _Polygon.clear;

function AbsolutePolygon(points){
	this.points = points || [];
}

AbsolutePolygon.prototype.draw = function(ctx,options){
	options = options || {};
	var draw_point_functor = options.draw_point_functor || (function(self, ctx, options, point){
		ctx.fillRect(point.x,point.y,2,2);
	});
	var draw_line_functor = options.draw_line_functor || (function(self, ctx, options, prev_point, curr_point){
	    ctx.moveTo(prev_point.getX(), prev_point.getY());
	    ctx.lineTo(curr_point.getX(), curr_point.getY());
	    ctx.stroke();		
	});
	var final_functor = options.final_functor || (function(self, ctx, options){
		return;
	})
	if(this.points.length <= 0 || this.points[0] === undefined){return;}
	var prev_point = this.points[0];
	ctx.beginPath();
	draw_point_functor(this, ctx, options, prev_point);
	for(var i = 1; i < this.points.length; i++){
	    var curr_point = this.points[i];
	    draw_line_functor(this, ctx, options, prev_point, curr_point);
	    draw_point_functor(this, ctx, options, curr_point);
	    prev_point = curr_point;
	}
	draw_line_functor(this, ctx, options, prev_point, this.points[0]); //Draw a line back to the first point.
	final_functor(this, ctx, options);
}

AbsolutePolygon.prototype.to_relative = function(){
	return new RelativePolygon(this.points);
}
AbsolutePolygon.prototype.add_point = _Polygon.add_point;
AbsolutePolygon.prototype.get_point_array = _Polygon.get_point_array;
AbsolutePolygon.prototype.remove_point = _Polygon.remove_point;
AbsolutePolygon.prototype.remove_point_at_index = _Polygon.remove_point_at_index;
AbsolutePolygon.prototype.clear = _Polygon.clear;

