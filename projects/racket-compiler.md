---
layout: page
title: Racket Compiler
subtitle: Interpreter and Compiler for a Racket Subset Targeting x86-64
permalink: /projects/racket-compiler
tech: [Racket, x86-64 Assembly, C, NASM]
status: Complete
---

A compiler and interpreter written in Racket that targets x86-64 native machine code, built across three progressively complex project stages and a final project for my undergraduate compilers course (CMSC430) at the University of Maryland. The largest project compiler (Knock+) supports 10 data types, 33 primitive operations, pattern matching, function definitions, heap allocation, and a C runtime for I/O. The final project (Iniquity+) is a separate sublanguage that extends the function system with variadic arguments, case-lambda dispatch, and `apply`.

## Compilation Pipeline

The compiler transforms Racket source code into native executables through a multi-stage pipeline. S-expressions are parsed into an abstract syntax tree, which is then lowered to x86-64 assembly instructions using the a86 DSL. The assembled output is linked with a C runtime that provides heap initialization, byte-level I/O, and formatted value printing.

<div class="pipeline-grid">
  <div class="pipeline-box pb-source" data-animate="slide-left" data-delay="1">
    <span class="box-label">Source</span>
    <span class="box-sub">(.rkt)</span>
  </div>
  <div class="pipeline-arrow" data-animate="fade" data-delay="2">→</div>
  <div class="pipeline-box pb-parser" data-animate data-delay="2">
    <span class="box-label">Parser</span>
    <span class="box-sub">parse.rkt</span>
  </div>
  <div class="pipeline-arrow" data-animate="fade" data-delay="3">→</div>
  <div class="pipeline-box pb-ast" data-animate="slide-right" data-delay="3">
    <span class="box-label">AST</span>
    <span class="box-sub">ast.rkt</span>
  </div>
</div>

<div style="display:grid; grid-template-columns:1fr auto 1fr auto 1fr; margin:0;">
  <div></div><div></div><div></div><div></div>
  <div style="text-align:center; font-size:18px; color:#888; padding:6px 0;" data-animate="fade" data-delay="4">↓</div>
</div>

<div class="pipeline-grid row2">
  <div class="pipeline-box pb-exe" data-animate="slide-left" data-delay="6">
    <span class="box-label">Executable</span>
    <span class="box-sub">+ C runtime</span>
  </div>
  <div class="pipeline-arrow" data-animate="fade" data-delay="6">←</div>
  <div class="pipeline-box pb-asm" data-animate data-delay="5">
    <span class="box-label">x86-64 ASM</span>
    <span class="box-sub">NASM</span>
  </div>
  <div class="pipeline-arrow" data-animate="fade" data-delay="5">←</div>
  <div class="pipeline-box pb-compile" data-animate="slide-right" data-delay="4">
    <span class="box-label">Compiler</span>
    <span class="box-sub">compile.rkt</span>
  </div>
</div>

## Compiler Evolution

The project was built incrementally across three stages (Projects 3-5), each introducing significant new capabilities while maintaining backwards compatibility with all previous features. The codebase grew from 454 lines to 2,783 lines of Racket and C combined. The final project (Iniquity+) is a separate sublanguage based on the course's Iniquity language rather than a direct extension of Knock+.

{% include compiler/compiler_evolution.svg.html %}

**Dupe+** introduced the foundation: integer and boolean literals, unary primitives (`add1`, `sub1`, `zero?`, `abs`, `not`, negation), and conditional expressions including `if`, `cond`, and `case`.

**Fraud+** added state and environment management: local variable bindings via `let` and `let*`, multi-argument functions, binary arithmetic (`+`, `-`, `<`, `=`), n-ary operations, character and I/O support (`read-byte`, `write-byte`, `peek-byte`), and `begin` for sequencing side effects. This stage introduced the compilation environment (`CEnv`) for tracking variable positions on the stack.

**Knock+** (Project 5) was the largest jump in complexity. It bundled several course languages together: heap-allocated data structures from Hustle and Hoax (cons cells, boxes, vectors, strings), named function definitions and calls from Iniquity, tail-call optimization from Jig, and pattern matching from Knock with eight pattern types (`Var`, `Lit`, `Conj`, `Box`, `Cons`, `List`, `Vect`, `Pred`). The C runtime grew substantially to handle value printing for all heap types.

### Final Project: Iniquity+

The final project was a separate sublanguage based on the course's Iniquity language rather than a continuation of the Knock+ codebase. It extended the function system with advanced dispatch mechanisms: variadic functions with rest parameters that dynamically construct cons lists on the heap, `case-lambda` for multi-arity dispatch across different clause bodies, and `apply` for calling functions with list arguments. This compiler added arity checking via the `r11` register and focused on function dispatch complexity rather than pattern matching (1,282 lines of Racket + 1,156 lines of C).

## Language Feature Growth

{% include compiler/feature_growth.svg.html %}

## Type System

All values are represented as tagged 64-bit words. The low bits encode type information, allowing the runtime to distinguish types without separate metadata. Immediate values (integers, characters, booleans, void, eof, empty list) are stored directly in registers and on the stack. Heap-allocated types (boxes, cons cells, vectors, strings) use pointer tagging, where the low 3 bits of a heap pointer are XORed with the type tag.

{% include compiler/type_tagging.svg.html %}

Integers are shifted left by 4 bits, giving them a `0000` tag pattern. Characters are shifted left by 5 bits with a `01000` tag. The remaining immediate types each have unique bit patterns that don't collide with any shifted value. This design allows single-instruction type checks using bitwise AND and comparison.

## Code Generation Analysis

Different source constructs expand to vastly different amounts of x86-64 instructions. The instruction counts below were obtained by counting assembly instruction nodes in each match clause of `compile-ops.rkt` and `compile.rkt`, including type assertion instructions (each assertion emits 4 instructions: Mov, And, Cmp, Jne).

{% include compiler/codegen_density.svg.html %}

The most instruction-dense constructs are variadic function entry (`FunRest`, 32 instructions) and `apply` (24 instructions). `FunRest` must check arity, then loop over excess stack arguments to construct a cons list on the heap bottom-up. `apply` traverses a cons list at runtime, pushing each car onto the stack, counting into `r11`, and jumping to the target. By contrast, simple operations like `add1` compile to just 6 instructions (4 for the type assertion + Add + implicit setup).

## Memory Layout

Heap-allocated types have varying memory footprints. Cons cells are a fixed 16 bytes (two 64-bit words for car and cdr). Vectors and strings carry a length word followed by their elements, with strings using 4-byte character slots padded to even alignment.

{% include compiler/memory_layout.svg.html %}

## Final Compiler Capabilities

The final compiler (Iniquity+) supports a substantial subset of Racket with 10 data types, 30 primitive operations, 6 control flow forms, and 5 function calling conventions.

**Supported Data Types**: Integers, booleans, characters, strings, cons pairs, boxes (mutable single-value containers), vectors (fixed-size mutable arrays), void, EOF, and the empty list.

**Function Types**:
- *Plain functions*: Fixed-arity with exact argument count checking
- *Rest-parameter functions*: Accept a minimum number of arguments with extras collected into a heap-allocated list
- *Case-lambda*: Multiple clauses with different arities, dispatched at runtime
- *Apply*: Spreads a list into individual function arguments by traversing cons cells and pushing values onto the stack

**Primitive Operations**: 30 operations across four arity levels, including arithmetic, comparisons, type predicates, type conversions, data structure construction and access, bounds-checked vector/string indexing, and byte-level I/O.

**Runtime Safety**: Comprehensive type assertions before every primitive operation, arity checking for all function calls, bounds checking for vector and string access, and Unicode codepoint validation for character conversion.

## Implementation Highlights

**Heap-allocated rest parameters**: When a rest-parameter function receives extra arguments, the compiler emits a loop that pops values from the stack and constructs a cons list bottom-up on the heap, linking each cell to the previous one via tagged pointers.

**Case-lambda dispatch**: The compiler generates code that jumps to each clause's label, checks the arity, and falls through to the next clause on mismatch. Each clause is compiled as an independent function body with its own stack frame management.

**Dynamic stack padding**: Before calling C runtime functions, the compiler saves `rsp & 0b1000` into `r15` and subtracts it from `rsp`, guaranteeing 16-byte alignment. After the call returns, `r15` is added back to restore the original stack pointer.

## Code Availability

Due to university academic integrity requirements, the source code is not publicly available. Access can be provided upon request for employment or collaboration purposes.
