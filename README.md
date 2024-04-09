# HERALD - Lang

## About HERALD

HERALD stands for Human-centric Extraction for Research and Analysis of Longitudinal Data. It is a specialized query language designed to empower medical researchers in analyzing longitudinal health data. The core aim of HERALD Lang is to facilitate the extraction and aggregation of data into cross-sectional tables for statistical analyses. The design of HERALD's syntax is intuitive, closely mirroring natural language to enhance user accessibility and efficiency. The prototype implementation consists of a HERALD excecution engine, combined with a  graphical query editor, and paired with analytics functionalities to showcase the capabilities of the HERALD query language. 

This repository houses the core functionalities of HERALD.

## Repository Contents

- `herald-lang`: This module forms the backbone of the HERALD query language. It encompasses the language's grammar, parser, and lexer, providing the essential components that define and interpret HERALD's syntax and commands.

- `herald-ui`: This component is dedicated to the user interface aspects of HERALD. It includes an intuitive graphical query editor, facilities for query binding, and tools for browsing and interacting with concept hierarchies, all designed to enhance the user experience in constructing and visualizing queries.

- `ghdm-data`: This module incorporates the generic data model integral to HERALD and supports various data loading and wrangling functionalities.

- `ghdm-ui`: This module houses additional UI elements, such as cohort selection and various modals.


## Bundling Instructions

To bundle HERALD-Lang for deployment or distribution, follow these steps:

1. Run the `bundling-all.sh` script in your console. This script initiates the webpack bundling process.
2. The script will install respective dependencies and create bundled files in the `dist` folders.
3. Copy the bundled files from the `dist` folders to the `src` folder in the [herald-demo](https://github.com/BIH-MI/herald-demo) repository to use them in the live demo and see HERALD in action.

## Live demo

A live demonstration is accessible at [herald-lang.org](http://herald-lang.org) with the respective code stored at [herald-demo](https://github.com/BIH-MI/herald-demo).


## Contact

If you have questions or problems, we would like to invite you to open an issue at Github. This allows other users to collaborate and (hopefully) answer your question in a timely manner. If your request contains confidential information or is not suited for a public issue, send us an email.

| Name                          | Email                                     |
|-------------------------------|-------------------------------------------|
| [Fabian Prasser](https://github.com/prasser)                  | [fabian.prasser@charite.de](mailto:fabian.prasser@charite.de) |
| [Lena Baum](https://github.com/bihmi-lb) | [lena.baum@charite.de](mailto:lena.baum@charite.de) |
| [Armin Müller](https://github.com/muellerarmin)  | [armin.mueller@charite.de](mailto:armin.mueller@charite.de) |
| [Marco Johns](https://github.com/Lumiukko) | [marco.johns@charite.de](mailto:marco.johns@charite.de) |

You can also find us at our working group's website [mi.bihealth.org](https://mi.bihealth.org).

## License

&copy; 2023-2024 Berlin Institute of Health

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.