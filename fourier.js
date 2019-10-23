function dft(x) {
    //calcualte the discrete fourier transform for a given series x
    //check https://en.wikipedia.org/wiki/Discrete_Fourier_transform
    
    const N = x.length; //length of the original series is also the number of frequency components in the resulting fourier transform

    const X = []; //resulting fourier transform
    for (let k = 0; k < N; k++) {
        let re = 0;
        let im = 0;

        for (let n = 0; n < N; n++) {
            let phi = (TWO_PI * k * n) / N;
            re += x[n] * cos(phi);
            im -= x[n] * sin(phi);
        }

        re = re / N;
        im = im / N;

        let freq = k;
        let amp = sqrt(re * re + im * im);
        let phase = atan2(im, re);

        X[k] = { freq, amp, phase };
    }

    return X;
}
