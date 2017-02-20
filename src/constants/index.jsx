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

export const FieldType = {
    DATE: 'date',
    DATETIME: 'datetime',
    DROPDOWN: 'dropdown',
    NUMBER: 'number',
    PERIOD: 'period',
    TEXT: 'text',
    TIME: 'time'
};

export const ScreenType = {
    CHECKLIST: 'checklist',
    FORM: 'form',
    LIST: 'list',
    MANAGEMENT: 'management',
    MULTI_SELECT: 'multi_select',
    PROGRESS: 'progress',
    SINGLE_SELECT: 'single_select',
    TIMER: 'timer',
    YESNO: 'yesno'
};

export const SymptomType = {
    SIGN: 'sign',
    RISK: 'risk'
};

export const DEFAULT_SCREEN_TYPE = ScreenType.CHECKLIST;

