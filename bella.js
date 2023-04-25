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
            // First part of interpreting programs is to "load up" the memory
            // with the built-in functions and constants.
            const memory = new Map();
            memory.set("sin", Math.sin);
            memory.set("cos", Math.cos);
            memory.set("hypot", Math.hypot);
            memory.set("sqrt", Math.sqrt);
            memory.set("π", Math.PI);
            // Once the standard library is loaded, the real interpretation begins.
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
// Build the rest of the classes and interfaces here: PrintStatement,
// BinaryExpression, UnaryExpression, ConditionalExpression, Numeral,
// Identifier, etc.
function interpret(program) {
    program.interpret();
}
