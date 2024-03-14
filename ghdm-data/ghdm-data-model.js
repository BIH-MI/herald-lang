// Generic Health Data Module (GHDM)
//
// Module: Data Model
// 
// Copyright (C) 2023-2024 - BIH Medical Informatics Group
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//       http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/**
 * @module
 * ghdm-data / Data Model
 */

class Observation {
    constructor(start, end, isNumeric, value, unit = null) {
        this.start = new Date(start);
        this.end = new Date(end);
        this.isNumeric = isNumeric.toLowerCase() === 'true';
        this.value = value;
        this.unit = unit;
    }
}

class Concept {
    constructor(label, subConcepts = [], observations = []) {
        this.label = label;
        this.subConcepts = subConcepts;
        this.observations = observations;
    }
}

class Patient {
    constructor(id, dob, age, sex, concepts = []) {
        const sexMap = {
        'DEM|SEX:m': 'M',
        'DEM|SEX:f': 'F',
        'DEM|SEX:u': 'U',
        };
        this.id = id;
        this.dob = dob;
        this.age = parseInt(age);
        this.sex = sexMap[sex] || sex;
        this.concepts = concepts;
    }
}

class Cohort {
    constructor(label, patients = []) {
        this.label = label;
        this.patients = patients;
    }
}
