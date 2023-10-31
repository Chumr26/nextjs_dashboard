function func1(x) {
    console.log(x);
}

const func2 = func1.bind(null, 5);
func2();
