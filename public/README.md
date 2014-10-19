This example is the second of three in the [Path Transitions tutorial](http://bost.ocks.org/mike/path/); see the [previous example](/mbostock/1643051) for context.

The desired pairing of numbers for path interpolation is like this:

    M x0, y0 L x1, y1 L x2, y2 L x3, y3 L xR, y4
       ↓   ↓    ↓   ↓    ↓   ↓    ↓   ↓
    M xl, y0 L x0, y1 L x1, y2 L x2, y3 L x3, y4

Where `xl` is some negative value off the left side, and `xr` is some positive value off the right side. This way, the first point ⟨x0,y0⟩ is interpolated to ⟨xl,y0⟩; meaning, the x-coordinate is interpolated rather than the y-coordinate, and so the path appears to slide off to the left. Likewise, the incoming point ⟨xr,y4⟩ is interpolated to ⟨x3,y4⟩.

While you could write a custom interpolator and use [transition.attrTween](https://github.com/mbostock/d3/wiki/Transitions#wiki-attrTween) to achieve this, a much simpler solution is to **interpolate the transform attribute** rather than the path. This way, the shape of the path remains static while the it translates left during the transition.

Immediately prior to the transition, the path is redrawn as follows:

    M x0, y0 L x1, y1 L x2, y2 L x3, y3 L xr, y4

Then, a transform transition is applied:

    translate(0,0)
              ↓
    translate(xl,0)

This causes the path to slide left. A clip path is used so the path is not visible outside of the chart body.

Note that for charts with spline interpolation, you’ll need to crop the visible part of the line by an extra point, so that the change in tangent is not visible; see the [next example](/mbostock/1642989).
