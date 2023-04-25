"use strict";
// An interpreter for the Language Bella
class Program {
    constructor(body) {
        this.body = body;
    }
}
class Block {
    constructor(statements) {
        this.statements = statements;
        interpret();
        {
            // Bella built ins
            const memory = new Map();
            memory.set("sin", Math.sin);
            memory.set("cos", Math.cos);
            memory.set("hypot", Math.hypot);
            memory.set("sqrt", Math.sqrt);
            memory.set("π", Math.PI);
            memory.set("exp", Math.exp);
            memory.set("ln", Math.LN10); // can also be Math.LN2 but I don't remember my logs 
            for (const stmt of this.statements) {
                stmt.interpret(memory);
            }
        }
    }
}
class Assignment {
    constructor(target, source) {
        this.target = target;
        this.source = source;
    }
    interpret(memory) {
        if (!memory.has(this.target.name)) {
            throw new Error(`Unknown variable: ${this.target.name}`);
        }
        memory.set(this.target.name, this.source.interpret(memory));
    }
}
class VariableDeclaration {
    constructor(id, initializer) {
        this.id = id;
        this.initializer = initializer;
    }
    interpret(memory) {
        if (memory.has(this.id.name)) {
            throw new Error(`Variable already declared: ${this.id.name}`);
        }
        memory.set(this.id.name, this.initializer.interpret(memory));
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
class While {
    constructor(expression, block) {
        this.expression = expression;
        this.block = block;
    }
}
class Function {
    constructor(name, args, expression) {
        this.name = name;
        this.args = args;
        this.expression = expression;
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
class Call {
    constructor(callee, args) {
        this.callee = callee;
        this.args = args;
    }
    interpret(memory) {
        const fn = memory.get(this.callee.name);
        if (typeof fn !== "function") {
            throw new Error(`Unknown function: ${this.callee.name}`);
        }
        return fn(...this.args.map((arg) => arg.interpret(memory)));
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
// Build the rest of the classes and interfaces here: PrintStatement,
// BinaryExpression, UnaryExpression, ConditionalExpression, Numeral,
// Identifier, etc.
function interpret(program) {
    program.interpret();
}
