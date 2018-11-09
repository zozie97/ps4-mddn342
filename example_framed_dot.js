/*
 * This is the a class example of the abstract design framework.
 *
 * arguments:
 * p5: the p5.js object - all draw commands should be prefixed with this object
 * x1, x2, y1, y2: draw the pattern contained in the rectangle x1,y1 to x2, y2
 * z: use this as the noise z offset (can be shifted)
 * zoom: current zoom level (starts at 0), useful to decide how much detail to draw
 *
 * The destination drawing should be in the square 0, 0, 255, 255.
 */


/* the random number seed for the tour */
var tourSeed = 301;
/* triplets of locations: zoom, x, y */
var tourPath = [
  [2, 512, 512],
  [2, 420, 400],
  [4, 420, 400]
]

// This version draws two rectangles and two ellipses.
// The rectangles are 960x720 and centered at 512,512.
function drawGrid(p5, x1, x2, y1, y2, z, zoom) {
  // temporary variables used for object placement
  let cx=0, cy=0, cx2=0, cy2=0;

  p5.background(255);
  p5.rectMode(p5.CORNERS);

  // The first red rectangle fills the entire space
  cx = p5.map(512-960/2, x1, x2, 0, 256);
  cy = p5.map(512-720/2, y1, y2, 0, 256);
  cx2 = p5.map(512+960/2, x1, x2, 0, 256);
  cy2 = p5.map(512+720/2, y1, y2, 0, 256);
  p5.fill(255, 0, 0);
  p5.rect(cx, cy, cx2, cy2);

  // The second black rectangle is inset to form a frame inset by 20 units
  cx = p5.map(512-940/2, x1, x2, 0, 256);
  cy = p5.map(512-700/2, y1, y2, 0, 256);
  cx2 = p5.map(512+940/2, x1, x2, 0, 256);
  cy2 = p5.map(512+700/2, y1, y2, 0, 256);
  p5.fill(0);
  p5.rect(cx, cy, cx2, cy2);

  // Two ellipses with a radius of 50 units are then added.
  cx = p5.map(512, x1, x2, 0, 256);
  cy = p5.map(512, y1, y2, 0, 256);
  cx2 = p5.map(512+50, x1, x2, 0, 256);
  p5.fill(0, 0, 255);
  p5.ellipse(cx, cy, (cx2-cx));

  // The second green ellipse is above and to the left of the first one.
  cx = p5.map(412, x1, x2, 0, 256);
  cy = p5.map(412, y1, y2, 0, 256);
  cx2 = p5.map(412+50, x1, x2, 0, 256);
  p5.fill(0, 255, 0);
  p5.ellipse(cx, cy, (cx2-cx));

  // debug - show border
  // p5.noFill();
  // p5.stroke(255, 0, 0)
  // p5.rect(0, 0, 255, 255);
}
