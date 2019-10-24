class Complex {
    constructor(a, b) {
        this.re = a;
        this.im = b;
    }

    add(c) {
        //add a complex number c to the current instance and return a new complex number

        let re = this.re + c.re;
        let im = this.im + c.im;

        return new Complex(re, im);
    }

    multiply(c) {
        //multiply a complex number c by the current instance and return a new complex number

        let re = this.re * c.re - this.im * c.im;
        let im = this.re * c.im + this.im * c.re;

        return new Complex(re, im);
    }
}
  