# Gram Editor

| File              | Description                            |
|-----------------  |----------------------------------------|
| `settings.jsonc`  | Custom settings                        |

## Prerequisites

[Gram Editor](https://codeberg.org/GramEditor/gram)

## Install

Copy `settings.jsonc` to `~/.config/gram/`

## Troubleshooting

### CSharp Language Server with Gram Editor 3.3.0

- Install [Rust](https://rust-lang.org/tools/install/)
- Install [CSharp](https://github.com/zed-extensions/csharp)
- Restart Gram Editor
- Append this into Gram Editor settings to avoid OmniSharp error

```
{
  "languages": {
    "CSharp": {
      "language_servers": ["roslyn"]
    }
  }
}
```
