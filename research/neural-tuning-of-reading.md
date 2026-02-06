---
layout: page
title: Neural Tuning of Reading Lab
subtitle: Language Processing & Computational Neuroscience Research
permalink: /research/neural-tuning-of-reading
tech: [Python, R, MATLAB]
status: Ongoing
---

I currently lead a team of undergraduate researchers in software development at the Neural Tuning of Reading Lab, advised by [Dr. Jeremy Purcell](https://sites.google.com/view/www-jjpurcell-com/home/about-me) at the University of Maryland. My work focuses on developing computational tools for linguistic analysis and running technical analyses for upcoming publications on reading and language processing.

## Research Focus

At a broad level, the Neural Tuning of Reading lab is interested in exploring the mechanisms of the brain's processing of written and spoken language (primarily English and Spanish).

The lab investigates how neural mechanisms tune to spelling-sound relationships during reading acquisition. A core concept is the study of phonographeme mappings at different grain sizes (phoneme-grapheme, onset-rime, syllable level) and how these interact during reading. English is an opaque orthography, meaning spelling-sound mappings are inconsistent, which makes it a particularly interesting case study for understanding reading acquisition and processing.

Key research areas include:
- Orthography-phonology coupling in the brain
- Developmental trajectories of reading-related brain regions
- Sublexical vs. lexical processing during reading
- Pseudoword spelling as a window into sublexical representations

## The Sublexical Toolkit

My primary development contribution is the Sublexical Toolkit, an upcoming open source language analysis package available in both R and Python. The toolkit provides researchers with comprehensive measures for analyzing spelling-sound relationships at multiple grain sizes.

### Technical Contributions

Some of my most impactful technical contributions to the toolkit:

- **Automated Data Pipeline**: Built an automated data collection, validation, and preprocessing pipeline in Python. This involved webscraping and parsing tens of thousands of words from several accredited dictionaries, handling edge cases in linguistic data, and ensuring data quality across multiple sources.

- **Dataset Expansion**: Scaled the Toolkit's dataset from 20,000 to 40,000+ words, significantly expanding the scope of analyses researchers can perform.

- **Backend Refactoring**: Refactored the Toolkit's backend from R to Python, improving performance and maintainability while preserving the existing R interface for users who prefer it.

### Available Measures

The toolkit computes various sublexical measures including:
- Phonographeme (PG) probabilities across syllable positions
- Grapheme-phoneme (GP) mappings
- Frequency tables for syllable-initial, syllable-medial, and syllable-final positions
- Word-initial and word-final probability distributions
- Age-of-acquisition statistics

## NTR Orthogonalization Library

I developed the NTR Orthogonalization Library, a specialized MATLAB toolkit for constructing optimized word lists for fMRI block-based studies. The library ensures minimal correlation between words, helping researchers design more precise neuroimaging experiments.

### Features

- **Minimized Word Correlation**: Constructs word lists with minimal inter-word correlations for cleaner fMRI signals
- **Adjustable Parameters**: Customize word list length while maintaining minimal correlation
- **Visualization Tools**: Generate distance matrices and correlation visualizations to aid study design
- **Extensibility**: Modular structure designed for easy adaptation to related projects

### Algorithm

The core algorithm minimizes correlation between words by:

1. Calculating pairwise correlations between words based on their semantic vectors (using GloVe embeddings)
2. Creating a triangular distance matrix representing semantic distances
3. Iteratively adjusting the word list to minimize overall correlation while maintaining desired length

The library draws on data from multiple sources including the English Lexicon Project (ELP) for word frequency data, IPHOD for biphone probabilities, and custom grapheme-phoneme mapping tables.

## NTR Developmental Project

I contributed to the NTR Developmental Project, which generates linguistic measures across different age bins to analyze how reading develops over time. This work supports research into how sublexical processing changes as children learn to read.

### Tools and Scripts

The project includes several analysis tools written in R:

- **Age Bin Measures**: Streamlined computation of measures across developmental age groups
- **PG Probability Calculator**: Computes phonographeme probabilities for lexical items
- **GP Table Generator**: Creates frequency and probability tables for grapheme-phoneme mappings at various syllable positions

Output tables cover syllable-initial, syllable-medial, syllable-final, word-initial, and word-final positions for frequency, PG, and GP measures.

## Publications

Technical analyses I've run support upcoming publications including work on pseudoword spelling and insights into sublexical representations and lexical interactions. These studies examine how measures of onset/rime consistency relate to lexical skill compared to phonographeme-level measures.

## Technologies

The lab's computational work spans multiple languages and tools:

- **Python**: Data pipelines, webscraping, backend development, preprocessing
- **R/RMarkdown**: Statistical analysis, probability calculations, visualization
- **MATLAB**: Orthogonalization algorithms, matrix operations, fMRI study design tools

