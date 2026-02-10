/**
 * Psychrometric Calculator - Core Functions
 * 
 * This file contains psychrometric calculation functions for HVAC applications.
 * Based on ASHRAE Handbook - Fundamentals and standard thermodynamic equations.
 * 
 * @version 2.0.0
 * @author HVAC Calculator Team
 */

// ============================================================================
// PHYSICAL CONSTANTS
// ============================================================================

/**
 * Gas constant for dry air (J/(kg·K))
 * Standard value from CODATA 2018
 */
const R_AIR = 287.055;

/**
 * Gas constant for water vapor (J/(kg·K))
 * Standard value from CODATA 2018
 */
const R_WATER = 461.523;

/**
 * Specific heat capacity of dry air at constant pressure (J/(kg·K))
 * Approximate value at 20°C, 1 atm
 */
const CP_AIR = 1006;

/**
 * Latent heat of vaporization of water at 0°C (J/kg)
 * Reference value for psychrometric calculations
 */
const HVAP = 2501000;

// ============================================================================
// ANTOINE EQUATION COEFFICIENTS
// ============================================================================

/**
 * Antoine equation coefficient A for water vapor pressure
 * Valid for temperature range 1°C to 100°C
 */
const ANTOINE_A = 8.07131;

/**
 * Antoine equation coefficient B for water vapor pressure
 * Valid for temperature range 1°C to 100°C
 */
const ANTOINE_B = 1730.63;

/**
 * Antoine equation coefficient C for water vapor pressure
 * Valid for temperature range 1°C to 100°C
 */
const ANTOINE_C = 233.426;

// ============================================================================
// CALCULATION CONSTANTS
// ============================================================================

/**
 * Conversion factor from mmHg to kPa
 */
const MMHG_TO_KPA = 0.133322;

/**
 * Molecular weight ratio of water to dry air
 * Used in humidity ratio calculations
 */
const MW_RATIO = 0.621945;

/**
 * Standard atmospheric pressure at sea level (kPa)
 */
const STANDARD_PRESSURE = 101.325;

/**
 * Temperature lapse rate in troposphere (K/m)
 */
const LAPSE_RATE = 0.0065;

/**
 * Standard temperature at sea level (K)
 */
const STANDARD_TEMP_K = 288.15;

/**
 * Pressure exponent for altitude correction
 * Standard atmospheric value
 */
const PRESSURE_EXPONENT = 5.255;

/**
 * Specific heat of water vapor (kJ/(kg·K))
 * Used in enthalpy calculations
 */
const CP_VAPOR = 1.86;

/**
 * Conversion factor for specific volume calculations (J to kJ)
 */
const JOULE_TO_KILOJOULE = 0.001;

/**
 * Calculate saturated vapor pressure at given temperature using Antoine equation
 * 
 * Antoine equation: log₁₀(P) = A - B/(C + T)
 * Valid for temperature range 1°C to 100°C
 * 
 * @param {number} temp - Temperature in Celsius
 * @returns {number} Saturated vapor pressure in kPa
 */
function saturatedVaporPressure(temp) {
    // Calculate vapor pressure in mmHg using Antoine equation
    const logP = ANTOINE_A - (ANTOINE_B / (ANTOINE_C + temp));
    const p_mmHg = Math.pow(10, logP);
    
    // Convert mmHg to kPa
    return p_mmHg * MMHG_TO_KPA;
}

/**
 * Calculate atmospheric pressure at given altitude using hypsometric equation
 * 
 * Based on standard atmosphere model:
 * P = P₀ × (1 - L×h/T₀)^(g×M/(R×L))
 * Simplified for standard atmosphere conditions
 * 
 * @param {number} altitude - Altitude in meters
 * @returns {number} Atmospheric pressure in kPa
 */
function barometricPressure(altitude) {
    // Standard atmosphere hypsometric equation
    return STANDARD_PRESSURE * Math.pow(1 - (LAPSE_RATE * altitude) / STANDARD_TEMP_K, PRESSURE_EXPONENT);
}

/**
 * Calculate humidity ratio from dry bulb and wet bulb temperatures
 * 
 * Uses the psychrometric relationship between dry bulb, wet bulb, and humidity ratio.
 * Based on the approximation from ASHRAE Handbook.
 * 
 * @param {number} dbt - Dry bulb temperature in Celsius
 * @param {number} wbt - Wet bulb temperature in Celsius
 * @param {number} pressure - Atmospheric pressure in kPa
 * @returns {number} Humidity ratio in kg_water/kg_dry_air
 */
function calculateHumidityRatio(dbt, wbt, pressure) {
    // Calculate saturated humidity ratio at wet bulb temperature
    const p_ws_wbt = saturatedVaporPressure(wbt);
    const w_ws_wbt = (MW_RATIO * p_ws_wbt) / (pressure - p_ws_wbt);
    
    // Psychrometric approximation formula (ASHRAE Handbook)
    // W = [(1093 - 0.556 × WBT) × W_wbt - 0.240 × (DBT - WBT)] / [1093 + 0.444 × DBT - WBT]
    const numerator = ((1093 - 0.556 * wbt) * w_ws_wbt - 0.240 * (dbt - wbt));
    const denominator = (1093 + 0.444 * dbt - wbt);
    
    return numerator / denominator;
}

/**
 * Calculate relative humidity from dry bulb temperature and humidity ratio
 * 
 * RH = (P_w / P_ws) × 100%
 * where P_w is partial pressure of water vapor and P_ws is saturation pressure
 * 
 * @param {number} dbt - Dry bulb temperature in Celsius
 * @param {number} humidityRatio - Humidity ratio in kg_water/kg_dry_air
 * @param {number} pressure - Atmospheric pressure in kPa
 * @returns {number} Relative humidity in percent (0-100)
 */
function calculateRelativeHumidity(dbt, humidityRatio, pressure) {
    const p_ws = saturatedVaporPressure(dbt); // Saturation pressure at DBT
    const p_w = (humidityRatio * pressure) / (MW_RATIO + humidityRatio); // Partial pressure of water vapor
    
    // Calculate relative humidity and constrain to physical limits
    return Math.min(100, Math.max(0, (p_w / p_ws) * 100));
}

/**
 * Calculate dew point temperature from humidity ratio
 * @param {number} humidityRatio - Humidity ratio in kg/kg
 * @param {number} pressure - Atmospheric pressure in kPa
 * @returns {number} Dew point temperature in Celsius
 */
function calculateDewPoint(humidityRatio, pressure) {
    // Calculate partial pressure of water vapor
    const p_w = (humidityRatio * pressure) / (0.621945 + humidityRatio);
    
    // Calculate dew point using inverse of saturation vapor pressure equation
    // From Antoine equation: T = B/(A-log10(P)) - C
    const logP = Math.log10(p_w / 0.133322); // Convert kPa to mmHg
    return ANTOINE_B / (ANTOINE_A - logP) - ANTOINE_C;
}

/**
 * Calculate specific enthalpy of moist air
 * 
 * h = c_pa × T + W × (h_fg + c_pv × T)
 * where c_pa is specific heat of dry air, c_pv is specific heat of water vapor
 * 
 * @param {number} dbt - Dry bulb temperature in Celsius
 * @param {number} humidityRatio - Humidity ratio in kg_water/kg_dry_air
 * @returns {number} Enthalpy in kJ/kg_dry_air
 */
function calculateEnthalpy(dbt, humidityRatio) {
    // Enthalpy equation: h = c_pa × T + W × (h_fg/1000 + c_pv × T)
    // HVAP is in J/kg, need to convert to kJ/kg
    const hvap_kj = HVAP * JOULE_TO_KILOJOULE;
    
    return (CP_AIR * JOULE_TO_KILOJOULE) * dbt + humidityRatio * (hvap_kj + CP_VAPOR * dbt);
}

/**
 * Calculate specific volume of moist air
 * @param {number} dbt - Dry bulb temperature in Celsius
 * @param {number} humidityRatio - Humidity ratio in kg/kg
 * @param {number} pressure - Atmospheric pressure in kPa
 * @returns {number} Specific volume in m³/kg
 */
function calculateSpecificVolume(dbt, humidityRatio, pressure) {
    // v = R_air * T / p_a = R_air * T / (p - p_w)
    const tempK = dbt + 273.15; // Convert to Kelvin
    const p_w = (humidityRatio * pressure) / (0.621945 + humidityRatio); // Vapor pressure
    const p_dry = pressure - p_w; // Dry air pressure
    
    return (R_AIR * tempK) / (p_dry * 1000); // Convert kPa to Pa
}

/**
 * Calculate wet bulb temperature from dry bulb temperature and relative humidity
 * @param {number} dbt - Dry bulb temperature in Celsius
 * @param {number} rh - Relative humidity in percent
 * @param {number} pressure - Atmospheric pressure in kPa
 * @returns {number} Wet bulb temperature in Celsius
 */
function calculateWetBulbFromDBTRH(dbt, rh, pressure) {
    // This is an iterative calculation
    // Start with an initial guess for WBT
    let wbt = dbt; // Start with DBT as initial guess
    const tolerance = 0.01;
    const maxIterations = 50;
    
    // Get humidity ratio from DBT and RH
    const hr_from_rh = calculateHumidityRatioFromDBTRH(dbt, rh, pressure);
    
    for (let i = 0; i < maxIterations; i++) {
        const hr_from_wbt = calculateHumidityRatio(dbt, wbt, pressure);
        const difference = hr_from_rh - hr_from_wbt;
        
        if (Math.abs(difference) < tolerance) {
            break;
        }
        
        // Adjust WBT based on the difference
        wbt += difference * 10; // Adjust the factor as needed
        
        // Constrain WBT to be less than or equal to DBT
        if (wbt > dbt) {
            wbt = dbt;
        } else if (wbt < -50) {
            wbt = -50; // Lower bound
        }
    }
    
    return wbt;
}

/**
 * Calculate humidity ratio from dry bulb temperature and relative humidity
 * 
 * W = MW_ratio × (RH/100) × P_ws / (P - (RH/100) × P_ws)
 * 
 * @param {number} dbt - Dry bulb temperature in Celsius
 * @param {number} rh - Relative humidity in percent (0-100)
 * @param {number} pressure - Atmospheric pressure in kPa
 * @returns {number} Humidity ratio in kg_water/kg_dry_air
 */
function calculateHumidityRatioFromDBTRH(dbt, rh, pressure) {
    const p_ws = saturatedVaporPressure(dbt); // Saturation pressure at DBT
    const p_w = (rh / 100) * p_ws; // Partial pressure of water vapor
    return (MW_RATIO * p_w) / (pressure - p_w);
}

/**
 * Calculate wet bulb temperature from dry bulb temperature and dew point
 * @param {number} dbt - Dry bulb temperature in Celsius
 * @param {number} dpt - Dew point temperature in Celsius
 * @param {number} pressure - Atmospheric pressure in kPa
 * @returns {number} Wet bulb temperature in Celsius
 */
function calculateWetBulbFromDBTDewPoint(dbt, dpt, pressure) {
    // Get humidity ratio from dew point
    const hr_from_dpt = calculateHumidityRatioFromDewPoint(dpt, pressure);
    
    // Now solve for WBT using the humidity ratio equation backwards
    // This requires an iterative approach
    let wbt = (dbt + dpt) / 2; // Initial guess
    const tolerance = 0.01;
    const maxIterations = 50;
    
    for (let i = 0; i < maxIterations; i++) {
        const estimated_hr = calculateHumidityRatio(dbt, wbt, pressure);
        const difference = hr_from_dpt - estimated_hr;
        
        if (Math.abs(difference) < tolerance) {
            break;
        }
        
        // Adjust WBT based on the difference
        wbt -= difference * 5; // Adjust the factor as needed
        
        // Constrain WBT to be between DPT and DBT
        if (wbt > dbt) {
            wbt = dbt;
        } else if (wbt < dpt) {
            wbt = dpt;
        }
    }
    
    return wbt;
}

/**
 * Calculate humidity ratio from dew point temperature
 * @param {number} dpt - Dew point temperature in Celsius
 * @param {number} pressure - Atmospheric pressure in kPa
 * @returns {number} Humidity ratio in kg/kg
 */
function calculateHumidityRatioFromDewPoint(dpt, pressure) {
    const p_w = saturatedVaporPressure(dpt); // Vapor pressure at dew point
    return (0.621945 * p_w) / (pressure - p_w);
}

/**
 * Calculate relative humidity from dry bulb temperature and dew point
 * @param {number} dbt - Dry bulb temperature in Celsius
 * @param {number} dpt - Dew point temperature in Celsius
 * @returns {number} Relative humidity in percent
 */
function calculateRelativeHumidityFromDewPoint(dbt, dpt) {
    const p_ws = saturatedVaporPressure(dbt); // Saturation pressure at DBT
    const p_w = saturatedVaporPressure(dpt);   // Vapor pressure at DPT
    return Math.min(100, Math.max(0, (p_w / p_ws) * 100)); // Limit to 0-100%
}

/**
 * Solve for Dry Bulb Temperature from Wet Bulb Temperature and Relative Humidity
 * Uses Newton-Raphson method to find DBT that satisfies the psychrometric relationship
 * @param {number} wbt - Wet bulb temperature in Celsius
 * @param {number} rh - Relative humidity in percent (0-100)
 * @param {number} pressure - Atmospheric pressure in kPa
 * @returns {number} Dry bulb temperature in Celsius
 */
function solveDBTFromWBTRH(wbt, rh, pressure) {
    const tolerance = 0.001;
    const maxIterations = 100;
    
    // Initial guess: DBT is typically higher than WBT
    let dbt = wbt + (100 - rh) / 4; // Better initial approximation
    
    // Get target humidity ratio from WBT and RH
    const targetHR = (0.621945 * (rh/100) * saturatedVaporPressure(wbt)) / (pressure - (rh/100) * saturatedVaporPressure(wbt));
    
    for (let i = 0; i < maxIterations; i++) {
        // Calculate current humidity ratio using current DBT estimate
        const currentHR = calculateHumidityRatio(dbt, wbt, pressure);
        
        // Calculate error
        const error = currentHR - targetHR;
        
        // Check convergence
        if (Math.abs(error) < tolerance) {
            break;
        }
        
        // Calculate derivative numerically
        const delta = 0.001;
        const dbtPlus = dbt + delta;
        const hrPlus = calculateHumidityRatio(dbtPlus, wbt, pressure);
        const derivative = (hrPlus - currentHR) / delta;
        
        // Newton-Raphson update
        if (Math.abs(derivative) > 1e-10) {
            dbt = dbt - error / derivative;
        } else {
            // Fallback to simple bisection if derivative is too small
            dbt = (dbt + wbt) / 2;
        }
        
        // Apply constraints
        if (dbt < wbt - 10) {
            dbt = wbt - 10;
        } else if (dbt > wbt + 50) {
            dbt = wbt + 50;
        }
    }
    
    // Final validation
    const finalHR = calculateHumidityRatio(dbt, wbt, pressure);
    const finalError = Math.abs(finalHR - targetHR) / targetHR;
    
    // If solution is poor, use fallback approximation
    if (finalError > 0.05) {
        dbt = wbt + (100 - rh) / 3; // Conservative fallback
    }
    
    return dbt;
}

/**
 * Format number to specified decimal places
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
function formatNumber(num, decimals) {
    return parseFloat(num.toFixed(decimals)).toString();
}

/**
 * Perform all psychrometric calculations based on input type
 * @param {string} inputType - Type of input combination ('dbt_wbt', 'dbt_rh', 'dbt_dpt', etc.)
 * @param {number} value1 - First input value (e.g., DBT)
 * @param {number} value2 - Second input value (e.g., WBT or RH or DPT)
 * @param {number} altitude - Altitude in meters
 * @returns {Object} Object containing all calculated properties
 */
function calculatePsychrometricProperties(inputType, value1, value2, altitude) {
    // Calculate atmospheric pressure based on altitude
    const pressure = barometricPressure(altitude);
    
    let dbt, wbt, rh, dpt, hr;
    
    switch(inputType) {
        case 'dbt_wbt':
            dbt = value1;
            wbt = value2;
            hr = calculateHumidityRatio(dbt, wbt, pressure);
            rh = calculateRelativeHumidity(dbt, hr, pressure);
            dpt = calculateDewPoint(hr, pressure);
            break;
            
        case 'dbt_rh':
            dbt = value1;
            rh = value2;
            hr = calculateHumidityRatioFromDBTRH(dbt, rh, pressure);
            wbt = calculateWetBulbFromDBTRH(dbt, rh, pressure);
            dpt = calculateDewPoint(hr, pressure);
            break;
            
        case 'dbt_dpt':
            dbt = value1;
            dpt = value2;
            rh = calculateRelativeHumidityFromDewPoint(dbt, dpt);
            hr = calculateHumidityRatioFromDewPoint(dpt, pressure);
            wbt = calculateWetBulbFromDBTDewPoint(dbt, dpt, pressure);
            break;
            
        case 'wbt_rh':
            wbt = value1;
            rh = value2;
            // Solve iteratively for DBT using Newton-Raphson method
            dbt = solveDBTFromWBTRH(wbt, rh, pressure);
            hr = calculateHumidityRatio(dbt, wbt, pressure);
            dpt = calculateDewPoint(hr, pressure);
            break;
            
        default:
            // Default to DBT and WBT
            dbt = value1;
            wbt = value2;
            hr = calculateHumidityRatio(dbt, wbt, pressure);
            rh = calculateRelativeHumidity(dbt, hr, pressure);
            dpt = calculateDewPoint(hr, pressure);
    }

    // Ensure humidity ratio is physically meaningful
    if (hr < 0) hr = 0;

    // Calculate remaining properties
    const enthalpy = calculateEnthalpy(dbt, hr);
    const specificVolume = calculateSpecificVolume(dbt, hr, pressure);
    const vaporPressure = (hr * pressure) / (0.621945 + hr);

    return {
        dbt: formatNumber(dbt, 1),
        wbt: formatNumber(wbt, 1),
        rh: formatNumber(rh, 1),
        dpt: formatNumber(dpt, 1),
        humidityRatio: formatNumber(hr, 4),
        enthalpy: formatNumber(enthalpy, 1),
        specificVolume: formatNumber(specificVolume, 3),
        vaporPressure: formatNumber(vaporPressure, 2)
    };
}

// DOM elements
const inputTypeSelect = document.getElementById('input-type');
const value1Input = document.getElementById('value1');
const value2Input = document.getElementById('value2');
const altitudeInput = document.getElementById('altitude');
const calculateBtn = document.getElementById('calculate-btn');
const citySelect = document.getElementById('city-select');

// CSV Processing DOM elements
const csvUploadArea = document.getElementById('csv-upload-area');
const csvFileInput = document.getElementById('csv-file-input');
const csvControls = document.getElementById('csv-controls');
const fileName = document.getElementById('file-name');
const removeFileBtn = document.getElementById('remove-file-btn');
const downloadSampleBtn = document.getElementById('download-sample-btn');
const processCsvBtn = document.getElementById('process-csv-btn');
const csvProgress = document.getElementById('csv-progress');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const csvResults = document.getElementById('csv-results');
const totalRows = document.getElementById('total-rows');
const successfulRows = document.getElementById('successful-rows');
const errorRows = document.getElementById('error-rows');
const downloadResultsBtn = document.getElementById('download-results-btn');
const errorDetails = document.getElementById('error-details');
const errorList = document.getElementById('error-list');

// Initialize CSV processor
const csvProcessor = new CSVProcessor();
let currentCSVData = null;

// Result elements
const dbtResultEl = document.getElementById('dbt-result');
const wbtResultEl = document.getElementById('wbt-result');
const rhResultEl = document.getElementById('rh-result');
const dptResultEl = document.getElementById('dpt-result');
const humidityRatioEl = document.getElementById('humidity-ratio');
const enthalpyEl = document.getElementById('enthalpy');
const specificVolumeEl = document.getElementById('specific-volume');
const vaporPressureEl = document.getElementById('vapor-pressure');

// Calculate button event listener
calculateBtn.addEventListener('click', function() {
    const inputType = inputTypeSelect.value;
    const value1 = parseFloat(value1Input.value);
    const value2 = parseFloat(value2Input.value);
    const altitude = parseFloat(altitudeInput.value);

    // Validate inputs
    if (isNaN(value1) || isNaN(value2) || isNaN(altitude)) {
        showError('Please enter valid numbers for all fields.');
        return;
    }

    // Input-specific validations
    let isValid = true;
    let errorMsg = '';
    
    switch(inputType) {
        case 'dbt_wbt':
            if (value2 > value1) {
                errorMsg = 'Wet bulb temperature cannot be greater than dry bulb temperature.';
                isValid = false;
            }
            if (value1 < -100 || value1 > 100) {
                errorMsg = 'Dry bulb temperature must be between -100°C and 100°C.';
                isValid = false;
            }
            if (value2 < -100 || value2 > 100) {
                errorMsg = 'Wet bulb temperature must be between -100°C and 100°C.';
                isValid = false;
            }
            break;
            
        case 'dbt_rh':
            if (value2 < 0 || value2 > 100) {
                errorMsg = 'Relative humidity must be between 0% and 100%.';
                isValid = false;
            }
            if (value1 < -100 || value1 > 100) {
                errorMsg = 'Dry bulb temperature must be between -100°C and 100°C.';
                isValid = false;
            }
            break;
            
        case 'dbt_dpt':
            if (value2 > value1) {
                errorMsg = 'Dew point temperature cannot be greater than dry bulb temperature.';
                isValid = false;
            }
            if (value1 < -100 || value1 > 100) {
                errorMsg = 'Dry bulb temperature must be between -100°C and 100°C.';
                isValid = false;
            }
            if (value2 < -100 || value2 > 100) {
                errorMsg = 'Dew point temperature must be between -100°C and 100°C.';
                isValid = false;
            }
            break;
            
        case 'wbt_rh':
            if (value2 < 0 || value2 > 100) {
                errorMsg = 'Relative humidity must be between 0% and 100%.';
                isValid = false;
            }
            if (value1 < -100 || value1 > 100) {
                errorMsg = 'Wet bulb temperature must be between -100°C and 100°C.';
                isValid = false;
            }
            break;
    }

    if (!isValid) {
        showError(errorMsg);
        return;
    }

    if (altitude < 0 || altitude > 10000) {
        showError('Altitude must be between 0m and 10,000m.');
        return;
    }

    try {
        // Perform calculations
        const results = calculatePsychrometricProperties(inputType, value1, value2, altitude);

        // Update the UI with results
        dbtResultEl.textContent = `${results.dbt}°C`;
        wbtResultEl.textContent = `${results.wbt}°C`;
        rhResultEl.textContent = `${results.rh}%`;
        dptResultEl.textContent = `${results.dpt}°C`;
        humidityRatioEl.textContent = `${results.humidityRatio} kg/kg`;
        enthalpyEl.textContent = `${results.enthalpy} kJ/kg`;
        specificVolumeEl.textContent = `${results.specificVolume} m³/kg`;
        vaporPressureEl.textContent = `${results.vaporPressure} kPa`;

        // Clear any previous error messages
        hideError();
    } catch (error) {
        showError(`An error occurred during calculations: ${error.message}`);
    }
});

// Error handling functions
function showError(message) {
    // Create or update error element
    let errorElement = document.getElementById('error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'error-message';
        errorElement.className = 'error-message';
        document.querySelector('.calculator-section').appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideError() {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// City weather data - representative conditions for major cities
const cityWeatherData = {
    'New York': { dbt: 22, wbt: 18, rh: 65, dpt: 15, altitude: 10 },
    'London': { dbt: 15, wbt: 12, rh: 75, dpt: 10, altitude: 35 },
    'Tokyo': { dbt: 28, wbt: 24, rh: 70, dpt: 21, altitude: 40 },
    'Sydney': { dbt: 25, wbt: 18, rh: 55, dpt: 12, altitude: 50 },
    'Dubai': { dbt: 40, wbt: 25, rh: 25, dpt: 15, altitude: 30 },
    'Singapore': { dbt: 30, wbt: 26, rh: 80, dpt: 25, altitude: 15 },
    'Mumbai': { dbt: 32, wbt: 27, rh: 75, dpt: 24, altitude: 12 },
    'Delhi': { dbt: 35, wbt: 22, rh: 40, dpt: 15, altitude: 220 },
    'Moscow': { dbt: 10, wbt: 6, rh: 70, dpt: 4, altitude: 156 },
    'Rio de Janeiro': { dbt: 30, wbt: 24, rh: 65, dpt: 20, altitude: 3 },
    'Los Angeles': { dbt: 25, wbt: 15, rh: 40, dpt: 8, altitude: 90 },
    'Paris': { dbt: 18, wbt: 14, rh: 70, dpt: 11, altitude: 35 },
    'Beijing': { dbt: 26, wbt: 19, rh: 55, dpt: 14, altitude: 50 },
    'Cairo': { dbt: 35, wbt: 20, rh: 30, dpt: 12, altitude: 23 },
    'Bangkok': { dbt: 32, wbt: 27, rh: 75, dpt: 24, altitude: 10 }
};


// Initialize with default values
document.addEventListener('DOMContentLoaded', function() {
    // Set default values
    inputTypeSelect.value = 'dbt_wbt';
    value1Input.value = '25';  // DBT
    value2Input.value = '20';  // WBT
    altitudeInput.value = '0'; // Altitude
    
    calculateBtn.click(); // Trigger initial calculation

    // Add event listeners for automatic calculation on input change
    inputTypeSelect.addEventListener('change', function() {
        updateInputLabels();
        calculateBtn.click();
    });
    
    value1Input.addEventListener('input', function() {
        calculateBtn.click();
    });

    value2Input.addEventListener('input', function() {
        calculateBtn.click();
    });

    altitudeInput.addEventListener('input', function() {
        calculateBtn.click();
    });
    
    // City selection event listener
    citySelect.addEventListener('change', function() {
        console.log('City selection changed:', citySelect.value);
        const cityName = citySelect.value;
        console.log('City name:', cityName);
        if (cityName && cityWeatherData[cityName]) {
            const cityData = cityWeatherData[cityName];
            console.log('City data found:', cityData);
            
            // Set the input type to DBT+WBT by default when selecting a city
            inputTypeSelect.value = 'dbt_wbt';
            updateInputLabels(); // Update the labels based on the new input type
            
            // Populate the input fields with city data
            value1Input.value = cityData.dbt.toString();   // DBT
            value2Input.value = cityData.wbt.toString();   // WBT
            altitudeInput.value = cityData.altitude.toString(); // Altitude
            
            console.log('Values set - DBT:', cityData.dbt, 'WBT:', cityData.wbt, 'Altitude:', cityData.altitude);
            
            // Trigger calculation
            calculateBtn.click();
        } else {
            console.log('No city data found for:', cityName);
        }
    });
    
    // Set initial labels
    updateInputLabels();
    
    // Initialize CSV functionality
    initializeCSVProcessing();
});

// Function to update input labels based on selected input type
function updateInputLabels() {
    const inputType = inputTypeSelect.value;
    const labels = {
        'dbt_wbt': { label1: 'Dry Bulb Temperature (°C)', label2: 'Wet Bulb Temperature (°C)' },
        'dbt_rh': { label1: 'Dry Bulb Temperature (°C)', label2: 'Relative Humidity (%)' },
        'dbt_dpt': { label1: 'Dry Bulb Temperature (°C)', label2: 'Dew Point Temperature (°C)' },
        'wbt_rh': { label1: 'Wet Bulb Temperature (°C)', label2: 'Relative Humidity (%)' }
    };
    
    const label1 = document.querySelector('#value1-label');
    const label2 = document.querySelector('#value2-label');
    
    if (label1 && label2) {
        label1.textContent = labels[inputType].label1 + ':';
        label2.textContent = labels[inputType].label2 + ':';
    }
}

// CSV Processing Functions
function initializeCSVProcessing() {
    // Drag and drop functionality
    csvUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        csvUploadArea.classList.add('drag-over');
    });

    csvUploadArea.addEventListener('dragleave', () => {
        csvUploadArea.classList.remove('drag-over');
    });

    csvUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        csvUploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'text/csv') {
            handleFileSelect(files[0]);
        } else {
            showCSVError('Please upload a valid CSV file.');
        }
    });

    // File input change
    csvFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Remove file button
    removeFileBtn.addEventListener('click', () => {
        resetCSVUpload();
    });

    // Download sample CSV
    downloadSampleBtn.addEventListener('click', () => {
        const sampleCSV = csvProcessor.generateSampleCSV();
        csvProcessor.downloadCSV(sampleCSV, 'sample_psychrometric_input.csv');
    });

    // Process CSV
    processCsvBtn.addEventListener('click', () => {
        processCSVFile();
    });

    // Download results
    downloadResultsBtn.addEventListener('click', () => {
        const results = csvProcessor.getStatus();
        if (results.resultsCount > 0) {
            const csvContent = csvProcessor.generateOutputCSV(csvProcessor.results);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            csvProcessor.downloadCSV(csvContent, `psychrometric_results_${timestamp}.csv`);
        }
    });
}

function handleFileSelect(file) {
    if (!file.name.endsWith('.csv')) {
        showCSVError('Please select a CSV file.');
        return;
    }

    fileName.textContent = file.name;
    csvControls.style.display = 'block';
    csvUploadArea.style.display = 'none';

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const csvContent = e.target.result;
            const data = csvProcessor.parseCSV(csvContent);
            const validation = csvProcessor.validateCSVData(data);
            
            if (!validation.isValid) {
                showCSVError('CSV validation failed:', validation.errors);
            } else {
                currentCSVData = data;
                showCSVSuccess(`Successfully loaded ${data.length} rows for processing.`);
            }
        } catch (error) {
            showCSVError('Error reading CSV file:', error.message);
        }
    };
    reader.onerror = () => {
        showCSVError('Error reading file. Please try again.');
    };
    reader.readAsText(file);
}

async function processCSVFile() {
    if (!currentCSVData) {
        showCSVError('No CSV data available for processing.');
        return;
    }

    // Show progress
    csvControls.style.display = 'none';
    csvProgress.style.display = 'block';
    csvResults.style.display = 'none';

    try {
        // Process data with progress callback
        await csvProcessor.processData(currentCSVData, (progress) => {
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
        });

        // Show results
        showResults();

    } catch (error) {
        showCSVError('Error processing CSV:', error.message);
        resetCSVUpload();
    }
}

function showResults() {
    const status = csvProcessor.getStatus();
    
    totalRows.textContent = status.resultsCount + status.errorsCount;
    successfulRows.textContent = status.resultsCount;
    errorRows.textContent = status.errorsCount;

    csvProgress.style.display = 'none';
    csvResults.style.display = 'block';

    // Show error details if any
    if (status.errorsCount > 0) {
        errorDetails.style.display = 'block';
        errorList.innerHTML = status.errors.map(error => 
            `<div class="error-item">
                <strong>Row ${error.row}:</strong> ${error.error}
            </div>`
        ).join('');
    } else {
        errorDetails.style.display = 'none';
    }

    // Enable download only if there are successful results
    downloadResultsBtn.disabled = status.resultsCount === 0;
}

function resetCSVUpload() {
    csvFileInput.value = '';
    currentCSVData = null;
    csvControls.style.display = 'none';
    csvProgress.style.display = 'none';
    csvResults.style.display = 'none';
    csvUploadArea.style.display = 'block';
    csvProcessor.reset();
}

function showCSVError(title, errors = []) {
    let message = title;
    if (errors.length > 0) {
        message += '\n' + errors.join('\n');
    }
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'csv-error-message';
    errorDiv.innerHTML = `
        <div class="error-content">
            <h4>Error</h4>
            <p>${message}</p>
            <button onclick="this.parentElement.parentElement.remove()">OK</button>
        </div>
    `;
    
    document.querySelector('.csv-section').appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 5000);
}

function showCSVSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'csv-success-message';
    successDiv.innerHTML = `
        <div class="success-content">
            <h4>Success</h4>
            <p>${message}</p>
            <button onclick="this.parentElement.parentElement.remove()">OK</button>
        </div>
    `;
    
    document.querySelector('.csv-section').appendChild(successDiv);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (successDiv.parentElement) {
            successDiv.remove();
        }
    }, 3000);
}