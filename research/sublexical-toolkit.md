---
layout: page
title: Sublexical Toolkit
subtitle: Computational Phonographeme Analysis for Language Research
permalink: /research/sublexical-toolkit
tech: [Python, R, MATLAB]
status: Ongoing
---

The Sublexical Toolkit is an open source computational linguistics package I lead development on at the [Neural Tuning of Reading Lab](https://sites.google.com/view/www-jjpurcell-com/home/about-me) at the University of Maryland. It computes over 80 derived linguistic measures for 22,474 English words, analyzing the consistency of spelling-sound relationships across syllabic positions and multiple grain sizes. The toolkit functions as a specialized NLP system for sublexical structure: it tokenizes words into phoneme-grapheme mapping units, builds positional probability tables, and extracts a rich feature set used in neuroscience and reading research. I work on this project with a team of undergraduate researchers under Dr. Jeremy Purcell.

## Data Pipeline

The toolkit's NLP pipeline has two stages. The first stage, which I built in Python, handles data collection and quality assurance: webscraping dictionary data from multiple accredited sources, deduplicating entries, resolving discrepant pronunciations, and producing a validated master vocabulary list. The second stage processes the master list through R-based linguistic analysis, mapping every word through the Maximum Onset Principle for syllabification, computing probability tables at each syllabic position, and extracting the full set of derived measures.

{% include toolkit/toolkit_pipeline.svg.html %}

## Dataset

I scaled the toolkit's vocabulary from roughly 20,000 inherited words to over 40,000 during the webscraping expansion phase, ultimately curating a 22,474-word master list after removing duplicates and entries with unresolvable pronunciation conflicts. The analytical depth also grew significantly: the original toolkit computed around 20 measures per word, while version 2.0 extracts over 80.

{% include toolkit/toolkit_dataset_growth.svg.html %}

Each word entry carries its spelling, phonetic transcription (in both IPA and the toolkit's in-house notation system for the 43-phoneme English inventory), SUBTLEX-US frequency data, and syllable count. Variant pronunciations are tracked separately so that analyses can account for dialectal or contextual differences.

## Multi-Grain Analysis

A distinctive feature of the toolkit is its ability to analyze spelling-sound relationships at four different linguistic grain sizes. Rather than only looking at individual phoneme-to-grapheme mappings, the toolkit also computes consistency at the onset-rime, onset-nucleus-coda, and oncleus-coda levels. This multi-scale approach lets researchers investigate how different levels of linguistic structure contribute to reading consistency.

{% include toolkit/toolkit_grain_sizes.svg.html %}

At each grain size, the toolkit computes both directions of mapping: phoneme-to-grapheme (P-to-G, relevant to spelling) and grapheme-to-phoneme (G-to-P, relevant to reading). For example, the grapheme "ea" maps to multiple phonemes across English words (as in "read" vs. "head" vs. "great"), and the toolkit quantifies this inconsistency at each position in the syllable.

## Syllabic Position Encoding

Every phoneme-grapheme mapping is tagged with one of five syllabic positions: word-initial, syllable-initial, medial, syllable-final, and word-final. English spelling consistency varies substantially across these positions, and the toolkit captures this variation in its probability tables.

{% include toolkit/toolkit_syllabic_positions.svg.html %}

Position-constrained and position-unconstrained variants of each measure are available, along with both frequency-weighted (using SUBTLEX-US log frequencies) and unweighted versions.

## Derived Measures

The 80+ measures per word span several categories: PG and GP probability scores at each position, frequency tables, frequency-weighted variants, position-unconstrained aggregates, and parsing probability metrics. For each word, the toolkit also computes aggregate statistics (mean, median, max, min, standard deviation) across positions, giving researchers flexible options for analysis.

{% include toolkit/toolkit_measures.svg.html %}

## Technical Highlights

**Phonotactic rules engine**: The R core implements the Maximum Onset Principle for syllabification along with contextual constraint filters handling 45+ onset clusters, biphone representations (e.g., /ju/, /ks/), silent-E disambiguation, velar softening, and palatalization edge cases.

**Python NLP pipeline**: I built a complete data ingestion and tokenization pipeline including dictionary webscraping, phoneme-grapheme segmentation, duplicate detection across multiple datasets (`cdupes.py`), cross-dataset comparison (`compare_excel.py`, `coldiff.py`), and automated measure description generation from column naming patterns (`toolkit-descriptions.py`).

**Backend migration**: I refactored the primary computational backend from R to Python, preserving the existing R interface for users who prefer it while improving runtime performance and enabling integration with a web platform under development.

**Toolkit Guide**: I authored a comprehensive LaTeX reference document documenting every measure, grain size, dataset, and function in the toolkit, serving as the primary reference for researchers using the package.

**Pseudoword generation**: The toolkit can generate plausible pseudoword spellings from pronunciation input using its probability tables, supporting experimental designs that require controlled nonword stimuli with known sublexical properties.

## My Role

I lead the software development team for this project. My contributions include building the entire Python NLP pipeline from scratch, scaling the dataset, designing the validation and QA tooling, engineering the phonographeme tokenization and probability computation systems, running correlation analyses for publications (including work with Stanford ROAR reading assessment data), refactoring the backend, authoring the Toolkit Guide, and presenting research at the 2023 Society for Neuroscience and 2025 Society for the Neurobiology of Language conferences.
