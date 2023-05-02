// An interpreter for the Language Bella
type BuiltInFunction = (...args: number[]) => Value;
type UserDefinedFunction = [Identifier[], Expression];

type Value = number | boolean | Value[] | BuiltInFunction | UserDefinedFunction;

function isUserDefinedFunction(v: Value): v is UserDefinedFunction {
  return Array.isArray(v) && Array.isArray([0]);
}

function isBuiltInFunction(x: Value): x is (...args: Value[]) => Value {
  return typeof x === "function";
}

let memory = new Map<string, Value>();
export let output: Value[] = [];

export class Program {
  constructor(public body: Block) {}
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
  constructor(public statements: Statement[]) {}
  interpret() {
    for (const statement of this.statements) {
      statement.interpret();
    }
  }
}

export interface Statement {
  interpret(): void;
}

export class VariableDeclaration implements Statement {
  constructor(public id: Identifier, public initializer: Expression) {}
  interpret(): void {
    if (memory.has(this.id.name)) {
      throw new Error(`Variable already declared: ${this.id.name}`);
    }
    memory.set(this.id.name, this.initializer.interpret());
  }
}

export class Assignment implements Statement {
  constructor(public target: Identifier, public source: Expression) {}
  interpret(): void {
    if (!memory.has(this.target.name)) {
      throw new Error(`Unknown variable: ${this.target.name}`);
    }
    memory.set(this.target.name, this.source.interpret());
  }
}

export class PrintStatement implements Statement {
  constructor(public expression: Expression) {}
  interpret(): void {
    console.log(this.expression.interpret());
  }
}

export class While implements Statement {
  constructor(public expression: Expression, public block: Block) {}
  interpret(): void {
    while (this.expression.interpret()) {
      this.block.interpret();
    }
  }
}

export class FunctionDeclaration implements Statement {
  constructor(
    public id: Identifier,
    public params: Identifier[],
    public expression: Expression
  ) {}

  interpret(): void {
    memory.set(this.id.name, [this.params, this.expression]);
  }
}

export interface Expression {
  interpret(): Value;
}

export class BinaryExp implements Expression {
  constructor(
    public operator: string,
    public left: Expression,
    public right: Expression
  ) {}

  interpret(): Value {
    const left = this.left.interpret();
    const right = this.right.interpret();
    const arithmeticOps = ["+", "-", "*", "/", "%", "**"];
    if (arithmeticOps.includes(this.operator)) {
      if (typeof left !== "number" || typeof right !== "number") {
        throw new Error("Must be a number to use arithmetic operations");
      } else {
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

export class UnaryExp implements Expression {
  constructor(public operator: string, public operand: Expression) {}
  interpret(): Value {
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

export class ConditionalExpression implements Expression {
  constructor(
    public test: Expression,
    public consequent: Expression,
    public alternate: Expression
  ) {}
  interpret(): Value {
    return this.test.interpret()
      ? this.consequent.interpret()
      : this.alternate.interpret();
  }
}

export class Call implements Expression {
  constructor(public callee: Identifier, public args: Expression[]) {}
  interpret(): Value {
    const functionValue = memory.get(this.callee.name);
    if (functionValue === undefined) {
      throw new Error("Identifier was undeclared");
    } else if (isUserDefinedFunction(functionValue)) {
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
    } else if (isBuiltInFunction(functionValue)) {
      return functionValue(this.args.map((arg) => arg.interpret()));
    } else {
      throw new Error("Not a function");
    }
  }
}

export class ArrayLiteral implements Expression {
  constructor(public elements: Expression[]) {}
  interpret(): Value {
    return this.elements.map((e) => e.interpret());
  }
}

export class Subscript implements Expression {
  constructor(public array: Expression[], public subscript: Expression) {}
  interpret(): Value {
    const arrayValue = this.array.map((e) => e.interpret());
    const subscriptValue = this.subscript.interpret();
    if (!Array.isArray(arrayValue)) {
      throw new Error("Subscripted item must be an array");
    } else if (typeof subscriptValue !== "number") {
      throw new Error("Subscript value must be a number");
    }
    return arrayValue[subscriptValue];
  }
}

export class Identifier implements Expression {
  constructor(public name: string) {}
  interpret(): Value {
    const value = memory.get(this.name);
    if (value === undefined) {
      throw new Error(`Unknown variable: ${this.name}`);
    }
    return value;
  }
}

export class Numeral implements Expression {
  constructor(public value: number) {}
  interpret(): Value {
    return this.value;
  }
}

export class Bool implements Expression {
  constructor(public value: boolean) {}
  interpret(): Value {
    return this.value;
  }
}

// Run the interpreter

export function interpret(program: Program): void {
  output = [];
  memory = new Map<string, Value>();
  const oldConsoleLog = console.log;
  console.log = (s: Value) => output.push(s);
  program.interpret();
  console.log = oldConsoleLog;
}
