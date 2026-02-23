---
layout: page
title: League Tool
subtitle: CLI Sports Ranking & Seeding Analysis
permalink: /projects/league-tool
tech: [Rust]
status: Complete
---

A command-line tool written in Rust for seeding and ranking teams based on win percentage and points-for/points-against ratio. When provided with a previous seeding file, it computes deltas showing exactly which teams moved up or down and by how many positions.

The tool parses team rosters, game histories, and optional previous seedings from plaintext files using regex, computes an overall rating (OVR) for each team, and outputs a color-coded ranking table to the terminal.

## Usage

```bash
league-tool <team file> <game file>                      # basic seeding
league-tool <team file> <game file> <prev seeding file>  # with deltas
```

## Output

Without a previous seeding file, each team is ranked with no delta information:

![No previous seeding](/assets/images/posts/league-tool-no-seeding.png)

When a previous seeding file is provided, the tool shows how each team's position has changed — green arrows for teams that climbed, red arrows for teams that dropped:

![With previous seeding](/assets/images/posts/league-tool-seeding.png)

## How It Works

### Rating Formula

Each team's overall rating (OVR) is computed as:

```
OVR = (win_pct + points_for / points_against) * 100
```

where `win_pct = wins / (wins + losses + ties)`. This produces a composite score that rewards both winning and scoring efficiency. Teams are then sorted by OVR descending.

### File Parsing

The tool uses regex to parse three file formats:

- **Team file**: `<TeamName> <MascotName>` — one per line
- **Game file**: `<GameNum>. <WinnerMascot> def. <LoserMascot> <WinScore>-<LoseScore>` — supports `tie` for draws
- **Seeding file**: direct copy-paste of previous tool output

### Delta Tracking

When a previous seeding is provided, each team's old seed position is compared against its new position. The output is color-coded using ANSI terminal colors: seed numbers in magenta, win-loss records in blue, percentages in cyan, and OVR in green. Delta arrows are green (▲) for improvement and red (▼) for drops.

### Implementation

The tool is ~225 lines of Rust. Key design decisions:

- **Tuple-based data model**: teams are stored as `Vec<(String, Team)>` keyed by mascot name for O(n) lookups — appropriate for the small dataset sizes (recreational leagues)
- **Regex-based parsing**: game results, team names, and seedings are all parsed with compiled regex patterns
- **Dynamic column formatting**: output column widths are computed from the data to keep alignment clean regardless of team name lengths
- **Colored terminal output**: uses the `colored` crate for ANSI color codes

Source code: [github.com/cj-sz/league-tool](https://github.com/cj-sz/league-tool)
