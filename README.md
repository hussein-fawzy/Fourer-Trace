A mathematical model that can trace a set of points using the epicycles of the discrete fourier transform.
This code was created using the p5.js javascript library.

**scaler_fourier**
The Discrete Fourier Transform is applied to the x-components and y-components of the input points set separately. The epicycles are then calculated for each fourier transform and then drawn to reconstruct the input points path. Optionaly, an epicycle representing the sum of the two fourier transforms can be caculated and drawn.

**complex_fourier**
The Discrete Fourier Transform is applied to a set of complex numbers. Each complex number represents the x-components of the input points as the real part and the y-component as the imaginary part. An epicycle representing the fourier transofm is then calculated and drawn to reconstruct the input points path.