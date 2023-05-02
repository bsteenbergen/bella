import { strict as assert } from "assert";
import * as bella from "../bella.js";
describe("the interpreter", () => {
    it("works", () => {
        assert.deepEqual(1, 1);
    });
    it("interprets numerals ok", () => {
        assert.deepEqual(new bella.Numeral(8).interpret(), 8);
    });
    it("interprets identifier expressions ok", () => {
        const program = new bella.Program(new bella.Block([
            new bella.VariableDeclaration(new bella.Identifier("x"), new bella.Numeral(100)),
            new bella.PrintStatement(new bella.Identifier("x")),
        ]));
        bella.interpret(program);
        assert.deepEqual(bella.output, [100]);
    });
    it("interprets array literals and subscripts ok", () => {
        const program = new bella.Program(new bella.Block([
            new bella.PrintStatement(new bella.ArrayLiteral([
                new bella.Numeral(3),
                new bella.Numeral(12),
                new bella.Numeral(-3),
                new bella.Numeral(54),
            ])),
            new bella.PrintStatement(new bella.Subscript([
                new bella.Numeral(3),
                new bella.Numeral(12),
                new bella.Numeral(-3),
                new bella.Numeral(54),
            ], new bella.Numeral(1))),
        ]));
        bella.interpret(program);
        assert.deepEqual(bella.output, [[3, 12, -3, 54], 12]);
    });
    it("interprets built in functions ok", () => {
        const program = new bella.Program(new bella.Block([
            new bella.PrintStatement(new bella.Call(new bella.Identifier("sqrt"), [new bella.Numeral(2)])),
        ]));
        bella.interpret(program);
        assert.deepEqual(bella.output, [1.4142135623730951]);
    });
    it("interprets binary and unary expressions ok", () => {
        const program = new bella.Program(new bella.Block([
            new bella.VariableDeclaration(new bella.Identifier("x"), new bella.Numeral(100)),
            new bella.Assignment(new bella.Identifier("x"), new bella.UnaryExp("-", new bella.Numeral(20))),
            new bella.PrintStatement(new bella.BinaryExp("*", new bella.Numeral(9), new bella.Identifier("x"))),
        ]));
        bella.interpret(program);
        assert.deepEqual(bella.output, [-180]);
    });
    it("interprets conditional expressions ok", () => {
        const program = new bella.Program(new bella.Block([
            new bella.PrintStatement(new bella.ConditionalExpression(new bella.BinaryExp(">", new bella.Numeral(3), new bella.Numeral(2)), new bella.Numeral(1), new bella.Numeral(0))),
        ]));
        bella.interpret(program);
        assert.deepEqual(bella.output, [1]);
    });
    it("interprets while statements ok", () => {
        const program = new bella.Program(new bella.Block([
            new bella.VariableDeclaration(new bella.Identifier("y"), new bella.Numeral(0)),
            new bella.While(new bella.BinaryExp(">", new bella.Numeral(10), new bella.Identifier("y")), new bella.Block([
                new bella.Assignment(new bella.Identifier("y"), new bella.BinaryExp("+", new bella.Numeral(1), new bella.Identifier("y"))),
            ])),
            new bella.PrintStatement(new bella.Identifier("y")),
        ]));
        bella.interpret(program);
        assert.deepEqual(bella.output, [10]);
    });
    it("interprets function statements ok", () => {
        const program = new bella.Program(new bella.Block([
            new bella.VariableDeclaration(new bella.Identifier("i"), new bella.Numeral(0)),
            new bella.FunctionDeclaration(new bella.Identifier("plusFour"), [new bella.Identifier("x")], new bella.BinaryExp("+", new bella.Identifier("x"), new bella.Numeral(4))),
            new bella.PrintStatement(new bella.Call(new bella.Identifier("plusFour"), [
                new bella.Identifier("i"),
            ])),
        ]));
        bella.interpret(program);
        assert.deepEqual(bella.output, [4]);
    });
});
