     //The parsing logic for this is on the server side in the utilities folder.
     //I might port it to JS later if there is a significant modification.
     function frame_array_to_string(frame_array) {
       //time;poiint1.x:point2.y,point2,pointn;point1,point2,pointn;|frame2|framen...
       s = "";
       for (var i = 0; i < frame_array.length; i++) {
         var frame = frame_array[i];
         s += frame.get_time().toString() + ";";
         for (var j = 0; j < frame.get_polygon_array().length; j++) {
           var polygon = frame.get_polygon_array()[j];
           if (polygon.get_point_array().length < 1) {
             continue; //If it's empty, ignore this polygon.
           }
           var pnt_strs = []
           for (var k = 0; k < polygon.get_point_array().length; k++) {
             var point = polygon.get_point_array()[k]
             pnt_strs.push(point.x + ":" + point.y)
           }
           s += pnt_strs.join(",") + ";"
         }
         s += "|"
       }
       return s;
     }


     function _FrameTracker(time, polygons) {
       this.frame_time = time;
       this.polygons = polygons || [new AbsolutePolygon()];
       this.polygon_index = 0;
     }
     _FrameTracker.prototype.get_polygon_array = function() {
       return this.polygons;
     }
     _FrameTracker.prototype.remove_polygon = function(polygon) {
       return this.remove_polygon_at_index(this.polygons.indexOf(polygon));
     }
     _FrameTracker.prototype.remove_polygon_at_index = function(index) {
       return this.polygons.splice(index, 1);
     }
     _FrameTracker.prototype.add_polygon = function(polygon) {
       this.polygons.push(polygon);
     }
     _FrameTracker.prototype.add_new_polygon = function() {
       this.polygons.push(new AbsolutePolygon());
     }
     _FrameTracker.prototype.next_polygon = function() {
       if ((this.polygon_index + 1 >= this.polygons.length) || (this.polygon_index < 0)) {
         this.polygon_index = 0
       } else {
         this.polygon_index += 1;
       }
     }
     _FrameTracker.prototype.goto_polygon_index = function(index) {
       if ((index < 0) || (index >= this.polygons.length)) { return; } //Do nothing.
       this.polygon_index = index;
     }
     _FrameTracker.prototype.previous_polygon = function() {
       if ((this.polygon_index - 1 < 0) || (this.polygon_index > this.polygons.length)) {
         this.polygon_index = this.polygons.length - 1;
       } else {
         this.polygon_index -= 1;
       }
     }
     _FrameTracker.prototype.get_time = function() {
       return this.frame_time;
     }
     _FrameTracker.prototype.add_point_to_active = function(point) {
       return this.polygons[this.polygon_index].add_point(point);
     }
     _FrameTracker.prototype.remove_point_from_active = function(point) {
       return this.polygons[this.polygon_index].remove_point(point);
     }
     _FrameTracker.prototype.remove_point_at_index_from_active = function(index) {
       return this.polygons[this.polygon_index].remove_point_at_index(index);
     }
     //If you want to get fancier than the basicis, you'll have to grab the reference.
     _FrameTracker.prototype.get_active_polygon = function() {
       return this.polygons[this.polygon_index];
     }
     _FrameTracker.prototype.clear_active = function() {
       this.polygons[this.polygon_index].clear();
     }
     _FrameTracker.prototype.clear_all = function() {
       for (var i = 0; i < this.polygons.length; i++) {
         this.polygons[i].clear();
       }
     }
     _FrameTracker.prototype.clear = function() {
       this.polygons = [new AbsolutePolygon()];
     }
     //A function to initialize a frame
     function FrameInitalizer(canvas, form, video, options) {
       //Opt parse.
       options = options || {};
       this.drawFrame = options.override_frame_draw || this._drawFrame
       this.drawImage = options.override_image_draw || this._drawImage
       this.drawPolygons = options.override_polygon_draw || this._drawPolygons
       //I might add a string to the OnChange functions that says where they were called from.
       //I could also add stuff like OnClear or whatever, not really sure I wanna go for that.
       //A return a reference to the previous state?
       //You shouldn't need these unless you do web worker stuff anyways.
       this.onImageChange = options.on_image_change_functor || (function(self) {
         return; //self.drawFrame() //Do nothing, if they want to draw on every update, let them set this.
       });
       this.onPolygonChange = options.on_polygon_change_functor || (function(self) {
         return; //self.drawFrame(); //Do nothing, if they want to draw on every update, let them set this.
       });
       this.source = options.source || null;
       this.number_of_frames = options.number_of_frames || 1;
       //Mandatory positional args.
       this.canvas = canvas;
       this.form = form;
       this.video = video; //video element;
       this.frames = [new _FrameTracker(0)];
       this.frame_index = 0;
       this.updateFrameList(1);
     }

     FrameInitalizer.prototype.nextFrame = function() {
       if ((this.frame_index + 1 >= this.frames.length) || (this.frame_index < 0)) {
         this.frame_index = 0;
       } else {
         this.frame_index += 1;
       }
       console.log("Calling GOTO")
       this.gotoFrameIndex(this.frame_index);
     }
     FrameInitalizer.prototype.previousFrame = function() {
       if ((this.frame_index - 1 < 0) || (this.frame_index > this.frames.length)) {
         this.frame_index = this.frames.length - 1;
       } else {
         this.frame_index -= 1;
       }
       this.gotoFrameIndex(this.frame_index);
     }
     //Switch polygon for active frame.
     FrameInitalizer.prototype.nextPolygon = function() {
       this.frames[this.frame_index].next_polygon();
     }
     FrameInitalizer.prototype.previousPolygon = function() {
       this.frames[this.frame_index].previous_polygon();
     }
     FrameInitalizer.prototype.gotoPolygonIndex = function(index) {
       this.frames[this.frame_index].goto_polygon_index(index);
     }
     FrameInitalizer.prototype.getActiveFrame = function() {
       return this.frames[this.frame_index];
     }
     FrameInitalizer.prototype.getActivePolygon = function() {
       return this.frames[this.frame_index].get_active_polygon();
     }

     FrameInitalizer.prototype.gotoFrameIndex = function(index) {
       //console.log("Index: " + index.toString());
     //  console.log("Frames Length " + this.frames.length);
       if ((index >= this.frames.length) || (index < 0)) { return; }
     //  console.log("Setting time.");
     //  console.log(this.frames[this.frame_index]);
       this.frame_index = index;
       this.video.currentTime = this.frames[this.frame_index].frame_time;
      // console.log("Current Time");
      // console.log(this.video.currentTime);
     //  console.log(this.frames[this.frame_index]);
       this.onImageChange(this);
     }

     //Why does this get called when the page is loaded and not on video load? -- OH It's on change. Right.
     FrameInitalizer.prototype.updateFrameList = function(number_of_frames) {
       if (number_of_frames < 1) {
         number_of_frames = 1;
       }
       var running_time = this.video.duration;
       var delta = Math.floor(running_time / number_of_frames)
       delta = delta > 0 ? delta : 1;
       var i = 0
       var frame_times = [new _FrameTracker(i)] // No matter what, we need at least one frame.
       for (var c = 1; c < number_of_frames; c++) {
         i += delta
         frame_times.push(new _FrameTracker(i)); // We don't care that this is blowing away old frames.
       }
       this.frames = frame_times;
       //console.log(this.frames);
       this.gotoFrameIndex(0);
     }
     /*
         FrameInitializer.prototype.setNumberOfFrames = function(num_frames){
     	this.number_of_frames = num_frames;
     	this.updateFrameList();
         }
     */
     FrameInitalizer.prototype.setDrawFunctor = function(frame_draw) {
       this.draw_frame_functor = frame_draw;
     }

     FrameInitalizer.prototype.getPoints = function() {
       return this.points;
     }

     FrameInitalizer.prototype.getFrameImage = function() {
       return this.img;
     }

     FrameInitalizer.prototype.getCanvasContext = function() {
       return this.canvas.getContext('2d');
     }


     FrameInitalizer.prototype._drawPolygons = function(options) {
       var polygons = this.frames[this.frame_index].get_polygon_array()
       for (var i = 0; i < polygons.length; i++) {
         polygons[i].draw(this.canvas.getContext('2d'), options);
       }
     }
     FrameInitalizer.prototype._drawPolygonAtIndex = function(index, options) {
       //See polygons.js for options.
       //Maybe these should be moved to teh _Frame class
       var polygons = this.frames[this.frame_index].get_polygon_array()
       if ((index < 0) || (index >= polygons.length)) { return; }
       polygons[index].draw(this.canvas.getContext('2d'), options)
     }
     FrameInitalizer.prototype._drawPolygonsAtIndexs = function(polygon_index_list, options) {
       for (var i = 0; i < polygon_index_list; i++) {
         this._drawPolygonAtIndex(i);
       }
     }
     FrameInitalizer.prototype._drawFrame = function(options, image_options, polygon_options) {
       options = options || {};
       image_options = image_options || {};
       polygon_options = polygon_options || {};
       var draw_frame = options.draw_frame || (function(self, options, image_options, polygon_options) {
         //Set style options
         var ctx = self.getCanvasContext();
         ctx.strokeStyle = options.strokeStyle || '#ffff00';
         ctx.fillStyle = options.fillStyle || 'rgba(0xFF,0x00,0xFF,0.5)';

         //Reset canvas.
         ctx.save()
         ctx.setTransform(1, 0, 0, 1, 0, 0);
         ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
         ctx.restore()

         self.drawImage(self, image_options); // Draw the image frame first.
         self.drawPolygons(self, polygon_options); // Draw the polygons on top.
       });
       draw_frame(this, options, image_options, polygon_options);
     }

     FrameInitalizer.prototype._drawImage = function(options) {
       if (this.source === null) { return; }
       options = options || {};
       var image_draw = (options.image_draw) ? options.image_draw : (function(self) {
         return self.canvas.getContext('2d').drawImage(self.video, 0, 0, self.canvas.width, self.canvas.height);
       });
       image_draw(this);
     }

     //Add a point to the active frame.
     FrameInitalizer.prototype.addPointToActive = function(pnt) {
       this.frames[this.frame_index].add_point_to_active(pnt);
       this.onPolygonChange(this);
     }

     FrameInitalizer.prototype.resetAllFrames = function() {
       for (var i = 0; i < this.frames.length; i++) {
         this.frames[i] = new _FrameTacker(this.frames[i].get_time()); // Blow it all away.
       }
       this.onPolygonChange(this);
       this.gotoFrameIndex(0);
     }
     FrameInitalizer.prototype.clearAllFrames = function() {
       for (var i = 0; i < this.frames.length; i++) {
         this.frames[i].clear_all();
       }
       this.onPolygonChange(this);
       this.gotoFrameIndex(0);
     }
     FrameInitalizer.prototype.resetActiveFrame = function() {
       this.frames[this.frame_index].clear();
       this.onPolygonChange(this);
     }
     FrameInitalizer.prototype.clearActiveFrame = function() {
       this.frames[this.frame_index].clear_all()
       this.onPolygonChange(this);
     }
     FrameInitalizer.prototype.clearActivePolygon = function() {
       this.frames[this.frame_index].clear_active();
       this.onPolygonChange(this);
     }

     FrameInitalizer.prototype.submit = function(videoNameIndex) {
       videoNameIndex += 1;
       var input = document.createElement("input");
       input.setAttribute("type", "hidden");
       input.setAttribute("name", "canvas");
       input.setAttribute("value", frame_array_to_string(this.frames));
       //console.log(frame_array_to_string(this.frames));
       this.form.appendChild(input);
       //this.form.submit();
       console.log(videoNameIndex);
       return input.value;
     }

     FrameInitalizer.prototype.updateVideo = function(file_input, on_file_load) {
       if (this.source === null || this.source === undefined) {
         this.source = document.createElement('source');
         this.video.appendChild(this.source);
       }
       if (file_input.files[0] === undefined || file_input.files[0] === null) {
         this.video.removeChild(this.source);
         this.source = null;
         return;
       }
       var self = this;
       var file_reader = new FileReader();
       file_reader.readAsDataURL(file_input.files[0]);
       file_reader.addEventListener("load", function() {
         self.source.setAttribute('src', file_reader.result);
         self.video.onloadeddata = function() {
           self.canvas.width = self.video.videoWidth; //self.canvas.clientHeight; // self.video.videoHeight;
           self.canvas.height = self.video.videoHeight; //self.canvas.clientWidth; //self.video.videoWidth;
           on_file_load();
         }
         self.video.load();
       }, false);
     }