import * as assert from "assert/strict";
import * as bella from "../bella.js";
describe("the interpreter", () => {
    it("works", () => {
        assert.equal(1, 1);
    });
    it("interprets numerals ok", () => {
        assert.equal(new bella.Numeral(8).interpret(), 8);
    });
    it("interprets identifier expressions ok", () => {
        const program = new bella.Program(new bella.Block([
            new bella.VariableDeclaration(new bella.Identifier("x"), new bella.Numeral(100)),
            new bella.PrintStatement(new bella.Identifier("x")),
        ]));
        bella.interpret(program);
        assert.deepEqual(bella.output, [100]);
    });
});
