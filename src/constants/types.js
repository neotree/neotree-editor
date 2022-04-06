/*
 * The MIT License (MIT)
 * Copyright (c) 2016 Ubiqueworks Ltd and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
 * SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

export const DefaultValueType = {
  COMPUTE: 'compute',
  DATE_NOW: 'date_now',
  DATE_NOON: 'date_noon',
  DATE_MIDNIGHT: 'date_midnight',
  EMPTY: '',
  UID: 'uid'
};

export const DataType = {
  BOOLEAN: 'boolean',
  DATETIME: 'datetime',
  DATE: 'date',
  ID: 'id',
  NUMBER: 'number',
  PERIOD: 'period',
  SET_ID: 'set<id>',
  STRING: 'string',
  TIME: 'time',
  VOID: 'void'
};

export const FieldTypes = [
  { name: 'date', label: 'Date' },
  { name: 'datetime', label: 'Date + Time' },
  { name: 'dropdown', label: 'Dropdown' },
  { name: 'number', label: 'Number' },
  { name: 'text', label: 'Text' },
  { name: 'time', label: 'Time' },
  { name: 'period', label: 'Time period' },
];

export const ScreenTypes = [
  { name: 'diagnosis', label: 'Diagnosis' },
  { name: 'checklist', label: 'Checklist' },
  { name: 'form', label: 'Form' },
  { name: 'management', label: 'Management' },
  { name: 'multi_select', label: 'Multiple choice list' },
  // { name: 'list', label: 'Simple list' },
  { name: 'single_select', label: 'Single choice list' },
  { name: 'progress', label: 'Progress' },
  { name: 'timer', label: 'Timer' },
  { name: 'yesno', label: 'Yes/No' },
  { name: 'edliz_summary_table', label: 'EDLIZ summary table' },
];

export const SymptomTypes = [
  { name: 'risk', label: 'Risk factor', },
  { name: 'sign', label: 'Sign/Symptom', },
];
