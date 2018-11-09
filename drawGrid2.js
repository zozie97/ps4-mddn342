// /*
//  * This is the function to implement to make your own abstract design.
//  *
//  * arguments:
//  * p5: the p5.js object - all draw commands should be prefixed with this object
//  * x1, x2, y1, y2: draw the pattern contained in the rectangle x1,y1 to x2, y2
//  * z: use this as the noise z offset (can be shifted)
//  * zoom: current zoom level (starts at 0), useful to decide how much detail to draw
//  *
//  * The destination drawing should be in the square 0, 0, 255, 255.
//  */


// /* the random number seed for the tour */
// var tourSeed = 301;
// /* triplets of locations: zoom, x, y */
// var tourPath = [
//   [2, 512, 512],
//   [4, 512, 512],
//   [6, 512, 512]
// ]

// function circles(p5, x, y, x1, x2, y1, y2){
//   let circleX = p5.map(512, x1, x2, 0, 256);
//   let circleY = p5.map(512, y1, y2, 0, 200);
//   let circleR = p5.map(512, x1, x2, 0, 256);

//   p5.stroke(255);
//   p5.fill(0, 200, 200);
//   p5.ellipse(circleX, circleY, circleR);    
  
// }
// // This version draws two rectangles and two ellipses.
// // The rectangles are 960x720 and centered at 512,512.
// function drawGrid(p5, x1, x2, y1, y2, z, zoom) {
//   p5.background(255);
//   for(int i = 0; i < 3; i++){
//     circles(p5, 312, 512, x1, x2, y1, y2);
//   }
//   // circles(p5, 612, 512, x1, x2, y1, y2);
//   // debug - show border
//   p5.noFill();
//   p5.stroke(0, 200, 200)
//   p5.rect(0, 0, 255, 255);
//   p5.ellipse(25, 25, 50, 50);
// }

const max_thickness = 64;
const max_movement = 16;
const ball_radius = 32;
const line_width = 8;
const grid_size = 64;

let do_animation = true;

/* the random number seed for the tour */
var tourSeed = 301;
/* triplets of locations: zoom, x, y */
var tourPath = [
  [0, 356.500000000000, 665.750000000000],
  [3, 353.250000000000, 668.187500000000],
  [4, 322.562500000000, 645.093750000000],
  [5, 322.562500000000, 645.109375000000],
  [7, 317.984375000000, 643.636718750000],
  [3, 317.984375000000, 643.636718750000]
]

/* this function takes a coordinate and aligns to a grid of size gsize */
function snap_to_grid(num, gsize) {
  return (num - (num % gsize));
}

/*
 * This is the funciton to implement to make your own abstract design.
 *
 * arguments:
 * p5: the p5.js object - all draw commands should be prefixed with this object
 * x1, x2, y1, y2: draw the pattern contained in the rectangle x1,y1 to x2, y2
 * z: use this as the noise z offset (can be shifted)
 * zoom: current zoom level (starts at 0), useful to decide how much detail to draw
 *
 * The destination drawing should be in the square 0, 0, 255, 255.
 */
function drawGrid(p5, x1, x2, y1, y2, z, zoom) {
  /* max_shift is the amount of overlap a tile can spill over into its neighbors */
  let max_shift = max_thickness + max_movement;
  p5.angleMode(p5.DEGREES);

  /* For animation: updated z based on global frame count */
  let dz = p5.globalFrameCount / 80.0;
  z = z + dz;

  /* this rectangle defines the region that will be drawn and includes a margin */
  let min_x = snap_to_grid(x1 - max_shift, grid_size);
  let max_x = snap_to_grid(x2 + max_shift + grid_size, grid_size);
  let min_y = snap_to_grid(y1 - max_shift, grid_size);
  let max_y = snap_to_grid(y2 + max_shift + grid_size, grid_size);


  let c_p00 = p5.map(0, x1, x2, 0, 256);
  let c_plwidth = p5.map(line_width, x1, x2, 0, 256);
  let c_pball = p5.map(ball_radius, x1, x2, 0, 256);
  let cur_line_width = c_plwidth - c_p00;
  let cur_ball_radius = c_pball - c_p00;

  // p5.background(255);
  //background colours from light blue to dark blue
  if(zoom <= 1){
    p5.background(210, 250, 255);
  }
  else if(zoom <= 3){
    p5.background(160, 220, 255);
  }
  else if(zoom <= 5){
    p5.background(100, 150, 225);
  }
  else{
    p5.background(20, 50, 120);
  }

  for(let x=min_x; x<max_x; x+=grid_size) {
    for(let y=min_y; y<max_y; y+=grid_size) {
      // First compute shifted point in grid
      // let offsetX = getRandomValue(p5, x, y, z, "shiftX", -max_movement, max_movement, 0.1);
      // let offsetY = getRandomValue(p5, x, y, z, "shiftY", -max_movement, max_movement, 0.1);
      // let shifted_x = x + offsetX;
      // let shifted_y = y + offsetY;
      // let x_pos = p5.map(shifted_x, x1, x2, 0, 256);
      // let y_pos = p5.map(shifted_y, y1, y2, 0, 256);

      /* first compute all three points with offsets */
      let shift_point = getOffsetPoint(p5, x, y, z, 0.1);
      let x_pos = p5.map(shift_point[0], x1, x2, 0, 256);
      let y_pos = p5.map(shift_point[1], y1, y2, 0, 256);

      let shift_point_left = getOffsetPoint(p5, x+grid_size, y, z, 0.1);
      let x_pos_left = p5.map(shift_point_left[0], x1, x2, 0, 256);
      let y_pos_left = p5.map(shift_point_left[1], y1, y2, 0, 256);

      let shift_point_down = getOffsetPoint(p5, x, y+grid_size, z, 0.1);
      let x_pos_down = p5.map(shift_point_down[0], x1, x2, 0, 256);
      let y_pos_down = p5.map(shift_point_down[1], y1, y2, 0, 256);


      if(zoom <= 1){
        p5.stroke(100, 250, 100);
        p5.noFill();
        //p5.ellipse(x_pos, y_pos, cur_ball_radius);
        ribbon(p5, x1, x2, y1, y2, shifted_x, shifted_y, ball_radius/2, 2*line_width, z);
      }
      else if(zoom <= 3){
        p5.stroke(250, 200, 0);
        p5.noFill();
        //p5.ellipse(x_pos, y_pos, cur_ball_radius-200);
        ribbon(p5, x1, x2, y1, y2, shifted_x, shifted_y, ball_radius/2, line_width, z);
      }
      else if(zoom <= 5){
        p5.stroke(250, 250, 100);
        p5.noFill();
        //p5.ellipse(x_pos, y_pos, cur_ball_radius-200);
        ribbon(p5, x1, x2, y1, y2, shifted_x, shifted_y, ball_radius/4, line_width/2, z);
      }
      else{
        p5.stroke(230, 230, 230);
        // p5.noFill();
        ribbon(p5, x1, x2, y1, y2, shifted_x, shifted_y, ball_radius/4, line_width/2, z/2);
        ribbon(p5, x1, x2, y1, y2, shifted_x, shifted_y, ball_radius/4, line_width/2, z/2);
        //p5.fill(255);
        // for(let i = 0; i < 20; i++){
        //   p5.ellipse(i, i, i);
        //   p5.ellipse(i+50, i+20, i);
        //   //i++;
        //   //p5.ellipse();
        // }
      }
    }
  }
  // debug - show border
  // p5.noFill();
  // p5.stroke(0, 200, 200)
  // p5.rect(0, 0, 255, 255);
//  p5.ellipse(25, 25, 50, 50);

  function ribbon(p5, x1, x2, y1, y2, pos_x, pos_y, rad1, rad2, z) {

    // fillShape = map(sin(bGTime), -1, 1, 170, 250);
    // fill(xPos, fillShape, fillShape);

    // for(var i = 0; i < 9; i++){
    //   p5.ellipse(xPos, yPos, cur_ball_radius-200);//radius/3, radius/2);
    //   rotate(PI/4);
    // }
  // const sqrt2 = 1.4142/2;
  // const offsets = [
  //   [sqrt2, sqrt2],
  //   [sqrt2, -sqrt2],
  //   [-sqrt2, sqrt2],
  //   [-sqrt2, -sqrt2]
  // ]
  p5.noFill();
  let phase = getRandomValue(p5, pos_x, pos_y, z, "phase", 0, 2*p5.PI, 0.1);
  let freq = getRandomValue(p5, pos_x, pos_y, z, "freq", 10, 50, 0.1);
  let sineWave = p5.sin(phase + (p5.globalFrameCount / freq));
  let radiusScale = p5.map(sineWave, -1, 1, 0.80, 1.0);

  let pixel_posx1 = p5.map(pos_x, x1, x2, 0, 256);
  let pixel_posx2 = p5.map(pos_x+rad2, x1, x2, 0, 256);
  let pixel_radius = pixel_posx2 - pixel_posx1;
  pixel_radius = radiusScale * pixel_radius;
  for(let i=0; i<5; i++) {
    //let offset = offsets[i];
    let pixel_x = p5.map(pos_x+0.5*rad1*i, x1, x2, 0, 256);
    let pixel_y = p5.map(pos_y+0.5*rad1, y1, y2, 0, 256);
    p5.ellipse(pixel_x, pixel_y, pixel_radius);    
  }

  }

}

///global frame count with siine wave for colours


