# deno-reinstall

[![JSR](https://jsr.io/badges/@scirexs/reinstall)](https://jsr.io/@scirexs/reinstall)

Some times, type errors are occured at update imports for npm. To resolve the
error, this package remove completely all imports, and re-add all.

## Requirements

- The project has a `deno.json` file.
- Current directry is in the project when run the command.

## Run

```sh
deno run jsr:@scirexs/reinstall
```
