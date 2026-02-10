// CSV Processor - Handle CSV input/output for batch psychrometric calculations

class CSVProcessor {
    constructor() {
        this.processing = false;
        this.results = [];
        this.errors = [];
        this.warnings = [];
    }

    /**
     * Parse CSV content into array of objects
     * @param {string} csvContent - Raw CSV content
     * @returns {Array} Parsed data
     */
    parseCSV(csvContent) {
        const lines = csvContent.trim().split('\n');
        const headers = this.parseCSVLine(lines[0]);
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines
            if (line === '') {
                continue;
            }
            
            const values = this.parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header.trim()] = values[index].trim();
                });
                data.push(row);
            } else if (values.length > 0) {
                // Log warning for malformed rows
                this.warnings.push(`Row ${i + 2}: Expected ${headers.length} columns but found ${values.length}. Row skipped.`);
            }
        }

        return data;
    }

    /**
     * Parse a single CSV line handling quoted fields
     * @param {string} line - CSV line to parse
     * @returns {Array} Array of values
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        let i = 0;

        while (i < line.length) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Escaped quote
                    current += '"';
                    i += 2;
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                    i++;
                }
            } else if (char === ',' && !inQuotes) {
                // Field separator
                result.push(current);
                current = '';
                i++;
            } else {
                current += char;
                i++;
            }
        }

        // Add the last field
        result.push(current);
        return result;
    }

    /**
     * Validate CSV data format
     * @param {Array} data - Parsed CSV data
     * @returns {Object} Validation result with errors
     */
    validateCSVData(data) {
        const errors = [];
        const validInputTypes = ['dbt_wbt', 'dbt_rh', 'dbt_dpt', 'wbt_rh'];
        this.warnings = []; // Reset warnings

        // Check if data is empty
        if (data.length === 0) {
            errors.push('CSV file is empty or contains only headers');
            return { isValid: false, errors, warnings: this.warnings };
        }

        // Check required columns
        const requiredColumns = ['InputType', 'Value1', 'Value2', 'Altitude'];
        if (data.length > 0) {
            const headers = Object.keys(data[0]);
            
            requiredColumns.forEach(col => {
                if (!headers.some(h => h.toLowerCase() === col.toLowerCase())) {
                    errors.push(`Missing required column: ${col}`);
                }
            });
            
            // Warn about extra columns
            const extraColumns = headers.filter(h => 
                !requiredColumns.some(req => h.toLowerCase() === req.toLowerCase())
            );
            if (extraColumns.length > 0) {
                this.warnings.push(`Extra columns found and will be ignored: ${extraColumns.join(', ')}`);
            }
        }

        // Validate each row
        data.forEach((row, index) => {
            const rowNum = index + 2; // Account for header row

            // Validate InputType
            const inputType = row.InputType || row.inputtype || row['Input Type'];
            if (!inputType) {
                errors.push(`Row ${rowNum}: Missing InputType`);
            } else if (!validInputTypes.includes(inputType)) {
                errors.push(`Row ${rowNum}: Invalid InputType '${inputType}'. Must be one of: ${validInputTypes.join(', ')}`);
            } else if (inputType !== inputType.toLowerCase()) {
                this.warnings.push(`Row ${rowNum}: InputType '${inputType}' should be lowercase. Consider using '${inputType.toLowerCase()}'.`);
            }

            // Validate numeric values
            const value1 = parseFloat(row.Value1 || row.value1 || row['Value 1']);
            const value2 = parseFloat(row.Value2 || row.value2 || row['Value 2']);
            const altitude = parseFloat(row.Altitude || row.altitude || row['Alt']);

            if (isNaN(value1)) {
                errors.push(`Row ${rowNum}: Invalid Value1 - must be a number`);
            } else if (value1 < -273.15) {
                errors.push(`Row ${rowNum}: Value1 cannot be below absolute zero (-273.15°C)`);
            } else if (Math.abs(value1) > 1000) {
                this.warnings.push(`Row ${rowNum}: Value1 (${value1}°C) is extremely high. Please verify.`);
            }

            if (isNaN(value2)) {
                errors.push(`Row ${rowNum}: Invalid Value2 - must be a number`);
            }

            if (isNaN(altitude)) {
                errors.push(`Row ${rowNum}: Invalid Altitude - must be a number`);
            } else if (altitude < -500) {
                errors.push(`Row ${rowNum}: Altitude cannot be negative (minimum: 0 meters)`);
            } else if (altitude > 20000) {
                errors.push(`Row ${rowNum}: Altitude exceeds maximum supported (20,000 meters)`);
            }

            // Input-specific validations
            if (!isNaN(value1) && !isNaN(value2) && inputType) {
                switch (inputType) {
                    case 'dbt_wbt':
                        if (value2 > value1 + 0.5) { // Allow small measurement tolerance
                            errors.push(`Row ${rowNum}: Wet bulb temperature (${value2}°C) cannot be greater than dry bulb temperature (${value1}°C)`);
                        }
                        if (value1 < -100 || value1 > 100) {
                            errors.push(`Row ${rowNum}: Dry bulb temperature must be between -100°C and 100°C`);
                        }
                        if (value2 < -100 || value2 > 100) {
                            errors.push(`Row ${rowNum}: Wet bulb temperature must be between -100°C and 100°C`);
                        }
                        break;
                    case 'dbt_rh':
                        if (value2 < 0 || value2 > 100) {
                            errors.push(`Row ${rowNum}: Relative humidity must be between 0% and 100%`);
                        }
                        if (value1 < -100 || value1 > 100) {
                            errors.push(`Row ${rowNum}: Dry bulb temperature must be between -100°C and 100°C`);
                        }
                        break;
                    case 'dbt_dpt':
                        if (value2 > value1 + 0.5) { // Allow small measurement tolerance
                            errors.push(`Row ${rowNum}: Dew point temperature (${value2}°C) cannot be greater than dry bulb temperature (${value1}°C)`);
                        }
                        if (value1 < -100 || value1 > 100) {
                            errors.push(`Row ${rowNum}: Dry bulb temperature must be between -100°C and 100°C`);
                        }
                        if (value2 < -100 || value2 > 100) {
                            errors.push(`Row ${rowNum}: Dew point temperature must be between -100°C and 100°C`);
                        }
                        break;
                    case 'wbt_rh':
                        if (value2 < 0 || value2 > 100) {
                            errors.push(`Row ${rowNum}: Relative humidity must be between 0% and 100%`);
                        }
                        if (value1 < -100 || value1 > 100) {
                            errors.push(`Row ${rowNum}: Wet bulb temperature must be between -100°C and 100°C`);
                        }
                        // Additional warning for wbt_rh extreme values
                        if (value1 > 50) {
                            this.warnings.push(`Row ${rowNum}: Wet bulb temperature (${value1}°C) is very high for RH calculation. Results may be less accurate.`);
                        }
                        break;
                }
            }
        });

        return {
            isValid: errors.length === 0,
            errors,
            warnings: this.warnings
        };
    }

    /**
     * Process CSV data and calculate psychrometric properties
     * @param {Array} data - Validated CSV data
     * @param {Function} progressCallback - Progress callback function
     * @returns {Promise<Array>} Processed results
     */
    async processData(data, progressCallback) {
        this.processing = true;
        this.results = [];
        this.errors = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNum = i + 2; // Account for header row

            try {
                // Extract values with flexible column names
                const inputType = row.InputType || row.inputtype || row['Input Type'];
                const value1 = parseFloat(row.Value1 || row.value1 || row['Value 1']);
                const value2 = parseFloat(row.Value2 || row.value2 || row['Value 2']);
                const altitude = parseFloat(row.Altitude || row.altitude || row['Alt']);

                // Calculate psychrometric properties
                const results = calculatePsychrometricProperties(inputType, value1, value2, altitude);
                
                // Add original input data to results
                this.results.push({
                    rowNumber: rowNum,
                    inputType,
                    value1,
                    value2,
                    altitude,
                    ...results
                });

                // Update progress
                if (progressCallback) {
                    progressCallback((i + 1) / data.length * 100);
                }

            } catch (error) {
                this.errors.push({
                    row: rowNum,
                    error: error.message
                });
            }

            // Allow UI to update between rows
            if (i % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        this.processing = false;
        return this.results;
    }

    /**
     * Generate CSV output from results
     * @param {Array} results - Processed results
     * @returns {string} CSV content
     */
    generateOutputCSV(results) {
        if (results.length === 0) {
            return '';
        }

        // Define CSV headers
        const headers = [
            'RowNumber',
            'InputType', 
            'Value1',
            'Value2', 
            'Altitude',
            'DBT',
            'WBT',
            'RH',
            'DPT',
            'HumidityRatio',
            'Enthalpy',
            'SpecificVolume',
            'VaporPressure'
        ];

        // Convert results to CSV rows
        const rows = results.map(result => {
            return [
                result.rowNumber,
                result.inputType,
                result.value1,
                result.value2,
                result.altitude,
                result.dbt,
                result.wbt,
                result.rh,
                result.dpt,
                result.humidityRatio,
                result.enthalpy,
                result.specificVolume,
                result.vaporPressure
            ].map(value => `"${value}"`).join(',');
        });

        // Combine headers and rows
        return [headers.join(','), ...rows].join('\n');
    }

    /**
     * Download CSV file
     * @param {string} content - CSV content
     * @param {string} filename - Download filename
     */
    downloadCSV(content, filename = 'psychrometric_results.csv') {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }

    /**
     * Generate sample CSV template
     * @returns {string} Sample CSV content
     */
    generateSampleCSV() {
        const sampleData = [
            { InputType: 'dbt_wbt', Value1: '25.0', Value2: '20.0', Altitude: '0' },
            { InputType: 'dbt_rh', Value1: '30.0', Value2: '65.0', Altitude: '500' },
            { InputType: 'dbt_dpt', Value1: '22.0', Value2: '15.0', Altitude: '100' },
            { InputType: 'wbt_rh', Value1: '18.0', Value2: '70.0', Altitude: '0' },
            { InputType: 'dbt_wbt', Value1: '35.0', Value2: '28.0', Altitude: '1000' }
        ];

        const headers = ['InputType', 'Value1', 'Value2', 'Altitude'];
        const rows = sampleData.map(row => 
            headers.map(header => `"${row[header]}"`).join(',')
        );

        return [headers.join(','), ...rows].join('\n');
    }

    /**
     * Get processing status
     * @returns {Object} Current processing status
     */
    getStatus() {
        return {
            processing: this.processing,
            resultsCount: this.results.length,
            errorsCount: this.errors.length,
            warningsCount: this.warnings.length,
            errors: [...this.errors],
            warnings: [...this.warnings]
        };
    }

    /**
     * Clear all data and reset processor
     */
    reset() {
        this.processing = false;
        this.results = [];
        this.errors = [];
        this.warnings = [];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSVProcessor;
}