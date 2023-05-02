"use strict";
// An interpreter for the Language Bella
let memory = new Map();
class Program {
    constructor(body) {
        this.body = body;
    }
    interpret() {
        // Bella built ins
        memory.set("sin", Math.sin);
        memory.set("cos", Math.cos);
        memory.set("hypot", Math.hypot);
        memory.set("sqrt", Math.sqrt);
        memory.set("π", Math.PI);
        memory.set("exp", Math.exp);
        memory.set("ln", Math.LN10); // can also be Math.LN2 but I don't remember my logs
        return this.body.interpret();
    }
}
class Block {
    constructor(statements) {
        this.statements = statements;
    }
    interpret() {
        for (const statement of this.statements) {
            statement.interpret();
        }
    }
}
class VariableDeclaration {
    constructor(id, initializer) {
        this.id = id;
        this.initializer = initializer;
    }
    interpret() {
        if (memory.has(this.id.name)) {
            throw new Error(`Variable already declared: ${this.id.name}`);
        }
        memory.set(this.id.name, this.initializer.interpret());
    }
}
class Assignment {
    constructor(target, source) {
        this.target = target;
        this.source = source;
    }
    interpret() {
        if (!memory.has(this.target.name)) {
            throw new Error(`Unknown variable: ${this.target.name}`);
        }
        memory.set(this.target.name, this.source.interpret());
    }
}
class PrintStatement {
    constructor(expression) {
        this.expression = expression;
    }
    interpret() {
        console.log(this.expression.interpret());
    }
}
class While {
    constructor(expression, block) {
        this.expression = expression;
        this.block = block;
    }
    interpret() {
        while (this.expression.interpret()) {
            this.block.interpret();
        }
    }
}
class FunctionStatement {
    constructor(id, args, expression) {
        this.id = id;
        this.args = args;
        this.expression = expression;
    }
    interpret() {
        memory.set(this.id.name, [
            this.args.map((arg) => arg),
            this.expression,
        ]);
    }
}
class BinaryExp {
    constructor(operator, left, right) {
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
    interpret() {
        const left = this.left.interpret();
        const right = this.right.interpret();
        if (typeof left !== "number" || typeof right !== "number") {
            throw new Error("Must be a number to use arithmetic operations");
        }
        else {
            switch (this.operator) {
                case "+":
                    return left + right;
                case "-":
                    return left - right;
                case "*":
                    return left * right;
                case "/":
                    return left / right;
                case "%":
                    return left % right;
                case "**":
                    return left ** right;
            }
        }
        switch (this.operator) {
            case "<":
                return left < right;
            case "<=":
                return left <= right;
            case "==":
                return left === right;
            case "!=":
                return left !== right;
            case ">=":
                return left >= right;
            case ">":
                return left > right;
            case "&&":
                return left && right;
            case "||":
                return left || right;
            default:
                throw new Error(`Unknown operator: ${this.operator}`);
        }
    }
}
class UnaryExp {
    constructor(operator, operand) {
        this.operator = operator;
        this.operand = operand;
    }
    interpret() {
        switch (this.operator) {
            case "-":
                return -this.operand.interpret();
            case "!":
                return !this.operand.interpret();
            default:
                throw new Error(`Unknown operator: ${this.operator}`);
        }
    }
}
class ConditionalExpression {
    constructor(test, consequent, alternate) {
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
    interpret() {
        return this.test.interpret()
            ? this.consequent.interpret()
            : this.alternate.interpret();
    }
}
class Call {
    constructor(callee, args) {
        this.callee = callee;
        this.args = args;
    }
    interpret() {
        const functionValue = memory.get(this.callee.name);
        if (typeof functionValue !== "function") {
            throw new Error(`Value is not a function: ${this.callee.name}`);
        }
        return functionValue(this.args.map((arg) => arg.interpret()));
    }
}
class ArrayLiteral {
    constructor(elements) {
        this.elements = elements;
    }
    interpret() {
        return this.elements.map((e) => e.interpret());
    }
}
class Subscript {
    constructor(array, subscript) {
        this.array = array;
        this.subscript = subscript;
    }
    interpret() {
        const arrayValue = this.array.interpret();
        const subscriptValue = this.subscript.interpret();
        if (!Array.isArray(arrayValue)) {
            throw new Error("Subscripted item must be an array");
        }
        if (typeof subscriptValue !== "number") {
            throw new Error("Subscript value must be a number");
        }
        return arrayValue[subscriptValue];
    }
}
class Identifier {
    constructor(name) {
        this.name = name;
    }
    interpret() {
        const value = memory.get(this.name);
        if (value === undefined) {
            throw new Error(`Unknown variable: ${this.name}`);
        }
        else if (typeof value !== "number") {
            throw new Error(`Variable is not a number: ${this.name}`);
        }
        return value;
    }
}
class Numeral {
    constructor(value) {
        this.value = value;
    }
    interpret() {
        return this.value;
    }
}
class Bool {
    constructor(value) {
        this.value = value;
    }
    interpret() {
        return this.value;
    }
}
// Run the interpreter
function interpret(program) {
    program.interpret();
}
const sample = new Program(new Block([
    new VariableDeclaration(new Identifier("x"), new Numeral(100)),
    new Assignment(new Identifier("x"), new UnaryExp("-", new Numeral(20))),
    new PrintStatement(new BinaryExp("*", new Numeral(9), new Identifier("x"))),
    new PrintStatement(new Call(new Identifier("sqrt"), [new Numeral(2)])),
    new PrintStatement(new ConditionalExpression(new BinaryExp("<", new Numeral(3), new Numeral(2)), new Numeral(1), new Numeral(0))),
    // While test
    new VariableDeclaration(new Identifier("y"), new Numeral(0)),
    new While(new BinaryExp(">", new Numeral(10), new Identifier("y")), new Block([
        new Assignment(new Identifier("y"), new BinaryExp("+", new Numeral(1), new Identifier("y"))),
    ])),
    new PrintStatement(new Identifier("y")),
    // FunctionStatement test
    new VariableDeclaration(new Identifier("i"), new Numeral(0)),
    new FunctionStatement(new Identifier("plusFour"), [new Identifier("i")], new BinaryExp("+", new Identifier("z"), new Numeral(4))),
    new Call(new Identifier("plusFour"), [new Identifier("i")]),
    new PrintStatement(new Identifier("i")),
]));
interpret(sample);
