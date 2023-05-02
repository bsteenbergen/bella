function isUserDefinedFunction(v) {
    return Array.isArray(v) && Array.isArray([0]);
}
function isBuiltInFunction(x) {
    return typeof x === "function";
}
let memory = new Map();
export let output = [];
export class Program {
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
        memory.set("ln", Math.LN10);
        return this.body.interpret();
    }
}
export class Block {
    constructor(statements) {
        this.statements = statements;
    }
    interpret() {
        for (const statement of this.statements) {
            statement.interpret();
        }
    }
}
export class VariableDeclaration {
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
export class Assignment {
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
export class PrintStatement {
    constructor(expression) {
        this.expression = expression;
    }
    interpret() {
        console.log(this.expression.interpret());
    }
}
export class While {
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
export class FunctionDeclaration {
    constructor(id, params, expression) {
        this.id = id;
        this.params = params;
        this.expression = expression;
    }
    interpret() {
        memory.set(this.id.name, [this.params, this.expression]);
    }
}
export class BinaryExp {
    constructor(operator, left, right) {
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
    interpret() {
        const left = this.left.interpret();
        const right = this.right.interpret();
        const arithmeticOps = ["+", "-", "*", "/", "%", "**"];
        if (arithmeticOps.includes(this.operator)) {
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
export class UnaryExp {
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
export class ConditionalExpression {
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
export class Call {
    constructor(callee, args) {
        this.callee = callee;
        this.args = args;
    }
    interpret() {
        const functionValue = memory.get(this.callee.name);
        if (functionValue === undefined) {
            throw new Error("Identifier was undeclared");
        }
        else if (isUserDefinedFunction(functionValue)) {
            const [paramters, expression] = functionValue;
            if (paramters.length !== this.args.length) {
                throw new Error("Incorrect number of arguments");
            }
            const savedMemory = memory;
            memory = new Map(savedMemory);
            for (let i = 0; i < paramters.length; i++) {
                memory.set(paramters[i].name, this.args[i].interpret());
            }
            const result = expression.interpret();
            memory = savedMemory;
            return result;
        }
        else if (isBuiltInFunction(functionValue)) {
            return functionValue(this.args.map((arg) => arg.interpret()));
        }
        else {
            throw new Error("Not a function");
        }
    }
}
export class ArrayLiteral {
    constructor(elements) {
        this.elements = elements;
    }
    interpret() {
        return this.elements.map((e) => e.interpret());
    }
}
export class Subscript {
    constructor(array, subscript) {
        this.array = array;
        this.subscript = subscript;
    }
    interpret() {
        const arrayValue = this.array.map((e) => e.interpret());
        const subscriptValue = this.subscript.interpret();
        if (!Array.isArray(arrayValue)) {
            throw new Error("Subscripted item must be an array");
        }
        else if (typeof subscriptValue !== "number") {
            throw new Error("Subscript value must be a number");
        }
        return arrayValue[subscriptValue];
    }
}
export class Identifier {
    constructor(name) {
        this.name = name;
    }
    interpret() {
        const value = memory.get(this.name);
        if (value === undefined) {
            throw new Error(`Unknown variable: ${this.name}`);
        }
        return value;
    }
}
export class Numeral {
    constructor(value) {
        this.value = value;
    }
    interpret() {
        return this.value;
    }
}
export class Bool {
    constructor(value) {
        this.value = value;
    }
    interpret() {
        return this.value;
    }
}
// Run the interpreter
export function interpret(program) {
    output = [];
    memory = new Map();
    const oldConsoleLog = console.log;
    console.log = (s) => output.push(s);
    program.interpret();
    console.log = oldConsoleLog;
}
