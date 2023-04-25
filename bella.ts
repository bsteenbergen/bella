// An interpreter for the Language Bella

type Value = number | ((...args: number[]) => number);
type Memory = Map<string, Value>;

class Program {
  constructor(public body: Block) {}
}

class Block {
  constructor(public statements: Statement[]) {
  interpret() {
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

interface Statement {  
    interpret(memory: Memory): void;
}

class Assignment implements Statement {
  constructor(public target: Identifier, public source: Expression) {}
  interpret(memory: Memory) {
    if (!memory.has(this.target.name)) {
      throw new Error(`Unknown variable: ${this.target.name}`);
    }
    memory.set(this.target.name, this.source.interpret(memory));
  }
}

class VariableDeclaration implements Statement {
  constructor(public id: Identifier, public initializer: Expression) {}
  interpret(memory: Memory) {
    if (memory.has(this.id.name)) {
      throw new Error(`Variable already declared: ${this.id.name}`);
    }
    memory.set(this.id.name, this.initializer.interpret(memory));
  }
}

class PrintStatement implements Statement {
    constructor(public expression: Expression) {}
    interpret(memory: Memory) {
      console.log(this.expression.interpret(memory));
    }
  }

interface Expression {
    interpret(memory: Memory): number;
}

class Identifier implements Expression {
    constructor(public name: string) {}
    interpret(memory: Memory): number {
      const value = memory.get(this.name);
      if (value === undefined) {
        throw new Error(`Unknown variable: ${this.name}`);
      } else if (typeof value !== "number") {
        throw new Error(`Variable is not a number: ${this.name}`);
      }
      return value;
    }
  }

  class Numeral implements Expression {
    constructor(public value: number) {}
    interpret() {
      return this.value;
    }
  }

// Build the rest of the classes and interfaces here: PrintStatement,
// BinaryExpression, UnaryExpression, ConditionalExpression, Numeral,
// Identifier, etc.

function interpret(program: Program): void {
    program.interpret();
}
