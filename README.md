# Psychrometric Calculator

A comprehensive web-based tool for calculating various psychrometric properties of air. This calculator allows users to determine properties like humidity ratio, relative humidity, dew point temperature, enthalpy, specific volume, and vapor pressure based on different input combinations.

## Features

- **Multiple Input Modes**: Calculate properties using different input combinations:
  - Dry Bulb Temperature + Wet Bulb Temperature
  - Dry Bulb Temperature + Relative Humidity
  - Dry Bulb Temperature + Dew Point Temperature
  - Wet Bulb Temperature + Relative Humidity

- **City-Based Weather Data**: Pre-populated weather data for 15 major cities worldwide
  - Simply select a city to automatically load representative weather conditions
  - Includes DBT, WBT, and altitude data for each city

- **Real-time Calculations**: Instant results as you adjust inputs
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accurate Formulas**: Implements standard psychrometric equations

## How to Use

1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Select your preferred input combination from the dropdown
4. Enter the required temperature and humidity values
5. Optionally select a city to load pre-defined weather data
6. View the calculated psychrometric properties in real-time

## Supported Properties

- Dry Bulb Temperature (°C)
- Wet Bulb Temperature (°C)
- Relative Humidity (%)
- Dew Point Temperature (°C)
- Humidity Ratio (kg/kg)
- Enthalpy (kJ/kg)
- Specific Volume (m³/kg)
- Vapor Pressure (kPa)
- Altitude (m)

## Formulas Used

The calculator implements standard psychrometric relationships including:
- Antoine equation for saturated vapor pressure
- Barometric pressure calculation based on altitude
- Humidity ratio calculations from different input combinations
- Relative humidity, dew point, enthalpy, and specific volume calculations

## Browser Compatibility

Works with all modern browsers (Chrome, Firefox, Safari, Edge).

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to improve the calculator.

## License

MIT License - feel free to use and modify for your own purposes.