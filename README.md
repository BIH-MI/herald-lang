# HERALD - Lang

## About HERALD

HERALD stands for Human-centric Extraction for Research and Analysis of Longitudinal Data. It is a specialized query language designed to facilitate the extraction and aggregation of longitudinal data into cross-sectional tables for statistical analyses and machine learning. HERALD's syntax closely mirrors natural language. The implementation consists of an excecution engine, a graphical query editor, and an online demo supporting analytics functionalities.

This repository, "herald-lang," contains the core modules of HERALD.

## Repository Contents

- `herald-core`: This module forms the core of the HERALD query language. It encompasses the language's grammar, parser, and lexer, as well as an execution engine.

- `herald-ui`: This component implements a user interface for graphically building queries and browsing the concept hierarchy contained within a dataset.

- `ghdm-data`: This module provides the generic data model used by HERALD and supports various data loading and wrangling functionalities.

- `ghdm-ui`: This module contains additional UI elements, such as interfaces for cohort selection.


## Bundling Instructions

To bundle HERALD-Lang for deployment or distribution, run the `bundling.sh` script in your console. This script initiates the webpack bundling process, installs respective dependencies and stores the bundled files in a `dist` folder.

To see the results in action, copy the bundled files from the `dist` folder to the `src` folder in the [herald-demo](https://github.com/BIH-MI/herald-demo) repository to use them in the demo.

## Building the Grammar

`npm install -g nearley`
`nearleyc herald-grammar.ne -o herald-grammar.js`

## Debugging the Grammar

`https://nearley.js.org/docs/tooling`

## Online demo

An online demonstration is available at [herald-lang.org](http://herald-lang.org) with the respective code managed at [herald-demo](https://github.com/BIH-MI/herald-demo).

## Contact

If you have questions or problems, please open an issue on GitHub or contact us directly.

You can find out more about our work here: [mi.bihealth.org](https://mi.bihealth.org).

## License

&copy; 2023-2024 Berlin Institute of Health

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
