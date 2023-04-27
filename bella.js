"use strict";
// An interpreter for the Language Bella
class Program {
    constructor(body) {
        this.body = body;
    }
    interpret() {
        // Bella built ins
        const memory = new Map();
        memory.set("sin", Math.sin);
        memory.set("cos", Math.cos);
        memory.set("hypot", Math.hypot);
        memory.set("sqrt", Math.sqrt);
        memory.set("π", Math.PI);
        memory.set("exp", Math.exp);
        memory.set("ln", Math.LN10); // can also be Math.LN2 but I don't remember my logs
        this.body.interpret(memory);
    }
}
class Block {
    constructor(statements) {
        this.statements = statements;
    }
    interpret(memory) {
        for (const statement of this.statements) {
            statement.interpret(memory);
        }
    }
}
class VariableDeclaration {
    constructor(id, initializer) {
        this.id = id;
        this.initializer = initializer;
    }
    interpret(memory) {
        // console.log(memory);
        if (memory.has(this.id.name)) {
            throw new Error(`Variable already declared: ${this.id.name}`);
        }
        memory.set(this.id.name, this.initializer.interpret(memory));
        // console.log(memory);
    }
}
class Assignment {
    constructor(target, source) {
        this.target = target;
        this.source = source;
    }
    interpret(memory) {
        // console.log(memory);
        if (!memory.has(this.target.name)) {
            throw new Error(`Unknown variable: ${this.target.name}`);
        }
        memory.set(this.target.name, this.source.interpret(memory));
        // console.log(memory);
    }
}
class PrintStatement {
    constructor(expression) {
        this.expression = expression;
    }
    interpret(memory) {
        console.log(this.expression.interpret(memory));
    }
}
class BinaryExp {
    constructor(operator, left, right) {
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
    interpret(memory) {
        switch (this.operator) {
            case "+":
                return this.left.interpret(memory) + this.right.interpret(memory);
            case "-":
                return this.left.interpret(memory) - this.right.interpret(memory);
            case "*":
                return this.left.interpret(memory) * this.right.interpret(memory);
            case "/":
                return this.left.interpret(memory) / this.right.interpret(memory);
            case "%":
                return this.left.interpret(memory) % this.right.interpret(memory);
            case "**":
                return this.left.interpret(memory) ** this.right.interpret(memory);
            case "<":
                return this.left.interpret(memory) < this.right.interpret(memory);
            case "<=":
                return this.left.interpret(memory) <= this.right.interpret(memory);
            case "==":
                return this.left.interpret(memory) === this.right.interpret(memory);
            case "!=":
                return this.left.interpret(memory) !== this.right.interpret(memory);
            case ">=":
                return this.left.interpret(memory) >= this.right.interpret(memory);
            case ">":
                return this.left.interpret(memory) > this.right.interpret(memory);
            case "&&":
                return this.left.interpret(memory) && this.right.interpret(memory);
            case "||":
                return this.left.interpret(memory) || this.right.interpret(memory);
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
    interpret(memory) {
        switch (this.operator) {
            case "-":
                return -this.operand.interpret(memory);
            case "!":
                return !this.operand.interpret(memory);
            default:
                throw new Error(`Unknown operator: ${this.operator}`);
        }
    }
}
class ConditionalExpression {
    constructor(exp_true, condition, exp_false) {
        this.exp_true = exp_true;
        this.condition = condition;
        this.exp_false = exp_false;
    }
    interpret(memory) {
        if (this.condition.interpret(memory)) {
            return this.exp_true.interpret(memory);
        }
        else {
            return this.exp_false.interpret(memory);
        }
    }
}
class Call {
    constructor(callee, args) {
        this.callee = callee;
        this.args = args;
    }
    interpret(memory) {
        const func = memory.get(this.callee.name);
        if (typeof func !== "function") {
            throw new Error(`Unknown function: ${this.callee.name}`);
        }
        return func(...this.args.map((arg) => arg.interpret(memory)));
    }
}
class Identifier {
    constructor(name) {
        this.name = name;
    }
    interpret(memory) {
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
function interpret(program) {
    program.interpret();
}
const sample = new Program(new Block([
    new VariableDeclaration(new Identifier("x"), new Numeral(100)),
    new Assignment(new Identifier("x"), new UnaryExp("-", new Numeral(20))),
    new PrintStatement(new BinaryExp("*", new Numeral(9), new Identifier("x"))),
    new PrintStatement(new Call(new Identifier("sqrt"), [new Numeral(2)])),
    new PrintStatement(new ConditionalExpression(new Numeral(1), new BinaryExp("<", new Numeral(3), new Numeral(2)), new Numeral(0))),
    new VariableDeclaration(new Identifier("y"), new Numeral(0)),
    // new While(
    //   new BinaryExp(">", new Numeral(2), new Identifier("y")),
    //   new Block([new BinaryExp("+", new Numeral(1), new Identifier("y"))])
    // ),
]));
interpret(sample);
