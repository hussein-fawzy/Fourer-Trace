function dft(x) {
    //calcualte the discrete fourier transform for a given series x of complex numbers
    //check https://en.wikipedia.org/wiki/Discrete_Fourier_transform

    const X = [];
    const N = x.length;

    for (let k = 0; k < N; k++) {
        let sum = new Complex(0, 0);

        for (let n = 0; n < N; n++) {
            let phi = (TWO_PI * k * n) / N;
            let c = new Complex(cos(phi), -sin(phi));
            sum = sum.add(x[n].multiply(c));
        }

        sum.re = sum.re / N;
        sum.im = sum.im / N;

        let freq = k;
        let amp = sqrt(sum.re * sum.re + sum.im * sum.im);
        let phase = atan2(sum.im, sum.re);

        X[k] = { freq, amp, phase };
    }

    return X;
}
