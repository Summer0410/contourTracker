function load() {
  var videoNameIndex = 0;
  var draw_cropped_frame = function(self) {
    self.canvas.getContext('2d').drawImage(self.video,
      158, 31, 364, 379, //Magic numbers from the matlab code.
      0, 0, self.canvas.width, self.canvas.height);
  }
  var canvas = document.getElementById("frame_canvas");
  var video_file = document.getElementById("ultrasound_video_file");
  var submit_button = document.getElementById("submit_button");
  var form = document.getElementById("main_form");
  var test = document.getElementById("test");
  var video_player = document.getElementById('ultrasound_video_container');
  var frame_handler = new FrameInitalizer(canvas, form, video_player, {
    "override_image_draw": (function(options) {
      this._drawImage({
        "image_draw": (function(self) {
          draw_cropped_frame(self);
        })
      });
    })
  });
  var number_box = document.getElementById('ultrasound_segment_count');
  var next_button = document.getElementById('next_frame_button');
  var prev_button = document.getElementById('previous_frame_button');
  var clicked = false;
  var handle_click = (function(e) {
    if (frame_handler.source === null) {
      return;
    }
    var xPosition = event.pageX - frame_handler.canvas.offsetLeft;
    var yPosition = event.pageY - frame_handler.canvas.offsetTop;
    frame_handler.addPointToActive(new Point2D(xPosition + 1, yPosition + 1)); //Matlab starts from 1,1 not 0,0
  });

  canvas.addEventListener('mousedown', (function(e) {
    clicked = true;
    handle_click(e);
    frame_handler.drawFrame();
  }));
  canvas.addEventListener('mouseup', (function(e) {
    clicked = false;
    frame_handler.drawFrame();
  }));
  canvas.addEventListener('mousemove', (function(e) {
    if (clicked) {
      handle_click(e);
      frame_handler.drawFrame();
    }
  }));
  submit_button.addEventListener('click', (function(e) {
    var xyCoor = frame_handler.submit(videoNameIndex);


  }));

  clear_button.addEventListener('click', (function(e) {
    frame_handler.clearActiveFrame();
    frame_handler.drawFrame();
  }));
  video_file.addEventListener('change', (function(e) {
    console.log("Change detected...");
    frame_handler.updateVideo(video_file, function() {
      console.log("Video Loaded.");
      //Overwrite with matlab values to prevent over-clicking.
      frame_handler.canvas.width = 364;
      frame_handler.canvas.height = 379;
      document.getElementById("hidden_block").className = '';
      frame_handler.updateFrameList(Math.floor(number_box.value));
      frame_handler.drawFrame();
    });
  }));
  //Number of frames to be initiated 
  number_box.addEventListener('change', (function(e) {
    frame_handler.updateFrameList(Math.floor(number_box.value));
    frame_handler.drawFrame();
  }));
  next_button.addEventListener('click', (function(e) {
    frame_handler.nextFrame();
    frame_handler.drawFrame();
  }));
  prev_button.addEventListener('click', (function(e) {
    frame_handler.previousFrame();
    frame_handler.drawFrame();
  }));
  var draw_frame_interval = setInterval((function() {
    try {
      frame_handler.drawFrame();
    } catch (e) {
      console.log(e);
    }
  }), 250); // Pick up any dropped frames.
}
