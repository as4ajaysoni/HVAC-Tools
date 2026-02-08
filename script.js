// Psychrometric Calculator - JavaScript Functions

// Constants for calculations
const R_AIR = 287.055; // J/(kg·K) - Gas constant for dry air
const R_WATER = 461.523; // J/(kg·K) - Gas constant for water vapor
const CP_AIR = 1006; // J/(kg·K) - Specific heat of dry air
const HVAP = 2501000; // J/kg - Latent heat of vaporization of water
const C14 = 6.54;
const C15 = 14.526;
const C16 = 0.7389;
const C17 = 0.09486;
const C18 = 0.4569;

// Antoine equation coefficients for water vapor pressure
const ANTOINE_A = 8.07131;
const ANTOINE_B = 1730.63;
const ANTOINE_C = 233.426;

/**
 * Calculate saturated vapor pressure at given temperature (°C)
 * Using Antoine equation: log10(P) = A - B/(C + T)
 * @param {number} temp - Temperature in Celsius
 * @returns {number} Saturated vapor pressure in kPa
 */
function saturatedVaporPressure(temp) {
    // Convert to mmHg first using Antoine equation, then to kPa
    const logP = ANTOINE_A - (ANTOINE_B / (ANTOINE_C + temp));
    const p_mmHg = Math.pow(10, logP);
    return p_mmHg * 0.133322; // Convert mmHg to kPa
}

/**
 * Calculate barometric pressure at given altitude
 * @param {number} altitude - Altitude in meters
 * @returns {number} Barometric pressure in kPa
 */
function barometricPressure(altitude) {
    // Simplified hypsometric formula
    return 101.325 * Math.pow(1 - (0.0065 * altitude) / 288.15, 5.255);
}

/**
 * Calculate humidity ratio from dry bulb and wet bulb temperatures
 * @param {number} dbt - Dry bulb temperature in Celsius
 * @param {number} wbt - Wet bulb temperature in Celsius
 * @param {number} pressure - Atmospheric pressure in kPa
 * @returns {number} Humidity ratio in kg/kg
 */
function calculateHumidityRatio(dbt, wbt, pressure) {
    // Calculate saturated humidity ratio at wet bulb temperature
    const p_ws_wbt = saturatedVaporPressure(wbt);
    const w_ws_wbt = (0.621945 * p_ws_wbt) / (pressure - p_ws_wbt);
    
    // Calculate humidity ratio using psychrometric relationship
    // W = [c_p * (T_db - T_wb) + W_ws * h_fg] / [h_g - h_f_wb]
    // Simplified version: W = [(1093 - 0.556 * WBT) * W_wbt - 0.240 * (DBT - WBT)] / [1093 + 0.444 * DBT - WBT]
    const numerator = ((1093 - 0.556 * wbt) * w_ws_wbt - 0.240 * (dbt - wbt));
    const denominator = (1093 + 0.444 * dbt - wbt);
    
    return numerator / denominator;
}

/**
 * Calculate relative humidity from dry bulb temperature and humidity ratio
 * @param {number} dbt - Dry bulb temperature in Celsius
 * @param {number} humidityRatio - Humidity ratio in kg/kg
 * @param {number} pressure - Atmospheric pressure in kPa
 * @returns {number} Relative humidity in percent
 */
function calculateRelativeHumidity(dbt, humidityRatio, pressure) {
    const p_ws = saturatedVaporPressure(dbt); // Saturation pressure at DBT
    const p_w = (humidityRatio * pressure) / (0.621945 + humidityRatio); // Partial pressure of water vapor
    return Math.min(100, Math.max(0, (p_w / p_ws) * 100)); // Limit to 0-100%
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
 * @param {number} dbt - Dry bulb temperature in Celsius
 * @param {number} humidityRatio - Humidity ratio in kg/kg
 * @returns {number} Enthalpy in kJ/kg
 */
function calculateEnthalpy(dbt, humidityRatio) {
    // h = c_pa * T + W * (h_fg + c_pv * T)
    // Simplified: h = 1.006 * T + W * (2501 + 1.86 * T)
    // Result in kJ/kg of dry air
    return 1.006 * dbt + humidityRatio * (2501 + 1.86 * dbt);
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
 * @param {number} dbt - Dry bulb temperature in Celsius
 * @param {number} rh - Relative humidity in percent
 * @param {number} pressure - Atmospheric pressure in kPa
 * @returns {number} Humidity ratio in kg/kg
 */
function calculateHumidityRatioFromDBTRH(dbt, rh, pressure) {
    const p_ws = saturatedVaporPressure(dbt); // Saturation pressure at DBT
    const p_w = (rh / 100) * p_ws; // Partial pressure of water vapor
    return (0.621945 * p_w) / (pressure - p_w);
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
            // Need to solve iteratively for DBT
            dbt = value1 + 5; // Initial estimate
            // This requires more complex iteration to solve
            // For now, we'll use a simplified approach
            hr = (0.621945 * (rh/100) * saturatedVaporPressure(dbt)) / (pressure - (rh/100) * saturatedVaporPressure(dbt));
            // Recalculate using the proper relationship
            // This is a simplified placeholder - full implementation would require solving iteratively
            dbt = value1 + (100 - rh) / 10; // Rough approximation
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
    
    // Set initial labels
    updateInputLabels();
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