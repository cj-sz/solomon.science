---
layout: page
title: Racket Compiler
subtitle: Interpreter and Compiler for a Racket Subset
permalink: /projects/racket-compiler
tech: [Racket, x86 Assembly]
status: Complete
---

An interpreter and compiler written in Racket supporting a subset of the Racket language features, targeting x86 assembly. Built for my undergraduate compilers course (CMSC430) at the University of Maryland.

## Overview

The project implements both an interpreter and a compiler for a progressively extended subset of Racket. The compiler generates x86-64 assembly that gets linked with a C runtime for I/O and memory management. The implementation follows a staged approach where each project added new language features while maintaining backwards compatibility.

## Implemented Features

### Data Types

The language supports a variety of data types with tagged representations at the assembly level:

- **Integers**: Arbitrary-precision integers with overflow handling
- **Booleans**: `#t` and `#f` with proper truthiness semantics (only `#f` is falsy)
- **Characters**: Full Unicode support with codepoint validation
- **Strings**: Immutable string literals and mutable string construction
- **Lists**: Proper cons cells with `car`, `cdr`, `cons`, and empty list
- **Boxes**: Single-value mutable containers
- **Vectors**: Fixed-size mutable arrays with bounds checking
- **Void and EOF**: Special values for side-effecting operations and input termination

### Primitive Operations

The compiler implements numerous primitive operations across arity levels:

**Nullary Operations (Op0)**:
- `read-byte`, `peek-byte`: Byte-level input
- `void`: Returns the void value

**Unary Operations (Op1)**:
- Arithmetic: `add1`, `sub1`, `zero?`
- Type predicates: `char?`, `empty?`, `cons?`, `box?`, `vector?`, `string?`, `eof-object?`
- Conversions: `integer->char`, `char->integer`
- Accessors: `car`, `cdr`, `unbox`, `vector-length`, `string-length`
- I/O: `write-byte`
- Allocation: `box`

**Binary Operations (Op2)**:
- Arithmetic: `+`, `-`, `<`, `=`
- Comparison: `eq?`
- Construction: `cons`, `make-vector`, `make-string`
- Access: `vector-ref`, `string-ref`

**Ternary Operations (Op3)**:
- Mutation: `vector-set!`

### Control Flow

- **Conditionals**: Full `if` expressions with proper short-circuit evaluation
- **Sequencing**: `begin` for sequential side effects
- **Local Binding**: `let` expressions for variable introduction

### Functions

The function system supports multiple calling conventions:

**Plain Functions**: Fixed-arity functions with exact argument count checking at runtime.

**Rest Parameter Functions**: Functions that accept a minimum number of arguments with excess arguments collected into a list. The compiler dynamically constructs the rest list on the heap at call time.

**Case-Lambda**: Multi-arity function dispatch allowing a single function name to handle different argument counts with different implementations.

**Apply**: Supports the `apply` form for calling functions with a list of arguments, enabling higher-order programming patterns.

### Memory Management

The compiler uses a simple heap-based allocation strategy:
- Heap pointer passed via `rdi` register from C runtime
- Cons cells, boxes, vectors, and strings allocated on heap
- Tagged pointers distinguish heap-allocated types
- Automatic padding for string alignment

### Error Handling

Runtime type checking with informative error messages:
- Arity checking for function calls
- Type assertions for primitive operations
- Bounds checking for vector and string access
- Codepoint validation for character conversion

## Architecture

### Compilation Pipeline

1. **Parsing**: S-expressions parsed into AST structures using pattern matching
2. **Interpretation**: Reference interpreter for semantic specification
3. **Compilation**: AST lowered to a86 assembly DSL
4. **Assembly**: a86 library generates x86-64 machine code
5. **Linking**: Compiled code linked with C runtime for I/O

### Key Components

- **ast.rkt**: AST definitions using prefab structs for all expression types
- **parse.rkt**: Parser transforming S-expressions to AST
- **interp.rkt**: Reference interpreter with environment-passing style
- **compile.rkt**: Main compilation logic with pattern matching on AST
- **compile-ops.rkt**: Primitive operation compilation with type checking
- **types.rkt**: Type tags and bit manipulation constants

### Runtime System

The C runtime provides:
- Heap allocation and initialization
- Byte-level I/O (`read_byte`, `peek_byte`, `write_byte`)
- Error handling (`raise_error`)
- Value printing with proper Racket formatting

## Technical Details

### Register Usage

- `rax`: Primary accumulator, return value
- `rbx`: Heap pointer (callee-saved)
- `rsp`: Stack pointer
- `rdi`: Argument passing from C
- `r8-r10`: Scratch registers for binary/ternary operations
- `r11`: Argument count for variadic functions
- `r15`: Stack alignment padding (callee-saved)

### Type Tagging

Values use tagged pointer representation:
- Low bits encode type information
- Integer shift for unboxing arithmetic
- Pointer tags for heap-allocated types
- Immediate tags for characters, booleans, void, eof, empty list

### Stack Management

- Dynamic stack padding for C ABI alignment
- Proper callee-saved register preservation
- Environment variables pushed in reverse order for efficient lookup

## Libraries Used

- **a86**: x86-64 assembly DSL for Racket (course library)
- **Racket match**: Pattern matching for AST dispatch
- **C stdlib**: Runtime support for I/O and memory

## Code Availability

Due to academic integrity policies, I can't share the code publicly. However, I can provide access upon request for employment or collaboration purposes.

