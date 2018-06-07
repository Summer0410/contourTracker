function Point2D(x,y){
    this.x = x;
    this.y = y;
}
Point2D.prototype.getX = function(){
    return this.x;
}
Point2D.prototype.getY = function(){
    return this.y;
}
Point2D.prototype.setY = function(y){
    this.y = y;
    return this.y;
}
Point2D.prototype.setX = function(x){
    this.x = x;
    return this.x;
}

Point2D.prototype.toString = function(){
    return "X: " + this.x + "; Y: " + this.y + ";";    
}

