# Rust client

A generated Rust library for the Token 2022 program.

## Status

This client is generated from the program IDL but is **not yet included in the root Cargo workspace**. For Rust usage in this repo, use the [Rust legacy client](../rust-legacy) until the generated client is fully integrated. See the repo root [FEATURES.md](../../FEATURES.md) for client coverage and program capabilities.

## Getting started

To build and test your Rust client from the root of the repository, you may use
the following commands.

```sh
make build-sbf-program
make test-clients-rust
```

This will build the program and run the tests for your Rust client.
