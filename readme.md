# image-audit-cli

A CLI tool to audit and organize image folders. It detects oversized images, duplicate **file names**, and visually similar images using **perceptual hashing (pHash)**. It can also compress and move images based on audit results.

> **Requirements**
>
> - Node.js
> - **ImageMagick** must be installed and available in your PATH

---

## Installation

```bash
npm run build
```

```bash
npm install -g .
```

---

## Usage

```bash
img-audit <command> [options] <dir>
```

Where `<dir>` is the directory containing images to process.

Default supported image extensions:

```
jpg,jpeg,png,webp
```

---

## Commands

### scan

Scan a directory and report common image issues **without modifying files**.

**What it does**

- Flags images larger than a given file size
- Detects duplicate **file names**
- Detects visually similar / near-duplicate images using **pHash**
- Groups results for easier review
- Prints a summary and generates detailed reports

**Syntax**

```bash
img-audit scan <dir> [options]
```

**Options**

| Option                | Description                                               |
| --------------------- | --------------------------------------------------------- |
| `--max-mb <n>`        | Flag images larger than `n` MB (default: `2`)             |
| `--group <type>`      | Grouping mode: `all`, `duplicate-name`, `day`, `similar`  |
| `--extensions <list>` | Comma-separated extensions (default: `jpg,jpeg,png,webp`) |
| `-y, --yes`           | Skip confirmation prompt                                  |

**Examples**

Scan everything and group all findings:

```bash
img-audit scan ./images --group all
```

Only check for duplicate file names:

```bash
img-audit scan ./images --group duplicate-name
```

Flag images larger than 5 MB:

```bash
img-audit scan ./images --max-mb 5
```

---

### compress

Compress images in a directory based on size and format rules.

**What it does**

- Compresses images larger than a given file size
- Uses ImageMagick under the hood
- Supports JPEG quality and PNG compression tuning
- Can run in dry-run mode to preview changes

**Syntax**

```bash
img-audit compress <dir> [options]
```

**Options**

| Option                | Description                                               |
| --------------------- | --------------------------------------------------------- |
| `--max-mb <n>`        | Only compress images larger than `n` MB (default: `2`)    |
| `--extensions <list>` | Comma-separated extensions (default: `jpg,jpeg,png,webp`) |
| `--quality <n>`       | JPEG quality (default: `88`)                              |
| `--level <n>`         | PNG compression level `0–9` (default: `9`)                |
| `--dry-run`           | Show what would be done without changing files            |
| `-y, --yes`           | Skip confirmation prompt                                  |

**Examples**

Preview compression without modifying files:

```bash
img-audit compress ./images --dry-run
```

Compress images larger than 3 MB:

```bash
img-audit compress ./images --max-mb 3
```

Compress JPEGs with lower quality:

```bash
img-audit compress ./images --quality 80
```

---

### move

Move images into folders based on audit groupings.

**What it does**

- Organizes files based on detected issues
- Useful after running `scan`
- Moves files into grouped directories

**Syntax**

```bash
img-audit move <dir> --group <type> [options]
```

**Options**

| Option                | Description                                               |
| --------------------- | --------------------------------------------------------- |
| `--group <type>`      | Grouping mode: `duplicate-name`, `day`, `similar`         |
| `--extensions <list>` | Comma-separated extensions (default: `jpg,jpeg,png,webp`) |
| `-y, --yes`           | Skip confirmation prompt                                  |

**Examples**

Move duplicate file names into grouped folders:

```bash
img-audit move ./images --group duplicate-name
```

Organize images by creation day:

```bash
img-audit move ./images --group day
```

Move visually similar images into groups:

```bash
img-audit move ./images --group similar
```

---

## Notes

- Image similarity is based on **perceptual hashing (pHash)**, which detects visually similar images even if file sizes or dimensions differ.
- All destructive operations require confirmation unless `--yes` is provided.
- Make sure ImageMagick is installed and accessible before running the CLI.

---

## License

MIT
