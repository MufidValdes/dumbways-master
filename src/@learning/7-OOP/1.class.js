class Car {
    // properties
    model = ""
    color = ""

    // special method
    constructor(model, color) {
        this.model = model
        this.color = color
    }


    // methods
   getInfo() {
    return `the model car is ${this.model} with color ${this.color} `
   }
}