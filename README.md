# Psychrometric Calculator

A comprehensive web-based tool for calculating various psychrometric properties of air. This calculator allows users to determine properties like humidity ratio, relative humidity, dew point temperature, enthalpy, specific volume, and vapor pressure based on different input combinations.

## ✨ Features

### 🧮 **Multiple Calculation Modes**
- **Dry Bulb Temperature + Wet Bulb Temperature**
- **Dry Bulb Temperature + Relative Humidity**  
- **Dry Bulb Temperature + Dew Point Temperature**
- **Wet Bulb Temperature + Relative Humidity**

### 🌍 **City-Based Weather Data**
- Pre-populated weather data for 15 major cities worldwide
- Simply select a city to automatically load representative weather conditions
- Includes DBT, WBT, and altitude data for each city

### 📊 **Batch CSV Processing**
- Upload CSV files to process hundreds of calculations at once
- Support for all input combinations in a single file
- Comprehensive validation and error reporting
- Download results in detailed CSV format

### 📚 **Formula Documentation**
- Comprehensive reference page with all psychrometric formulas
- Interactive formula copying and search functionality
- Physical constants and calculation explanations
- Based on ASHRAE Handbook standards

### 🎯 **User Experience**
- **Real-time Calculations**: Instant results as you adjust inputs
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accurate Formulas**: Implements standard psychrometric equations
- **Professional Interface**: Clean, intuitive design with error handling

## 🚀 Getting Started

### **Individual Calculations**
1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Select your preferred input combination from the dropdown
4. Enter the required temperature and humidity values
5. Optionally select a city to load pre-defined weather data
6. View the calculated psychrometric properties in real-time

### **Batch Processing (CSV)**
1. **Download Sample CSV**: Click "📥 Download Sample CSV" to get the template
2. **Prepare Your Data**: Use the format: `InputType,Value1,Value2,Altitude`
3. **Upload File**: Drag and drop or browse to select your CSV file
4. **Process & Download**: Click "🔄 Process CSV" and download results

**Supported CSV Format:**
```csv
InputType,Value1,Value2,Altitude
dbt_wbt,25.0,20.0,0
dbt_rh,30.0,65.0,500
dbt_dpt,22.0,15.0,100
wbt_rh,18.0,70.0,0
```

### **Formula Reference**
- Click **"Formulas & References"** in the navigation menu
- Search, copy, and print formulas as needed
- View physical constants and calculation methods

## 📋 Supported Properties

- **Dry Bulb Temperature** (°C)
- **Wet Bulb Temperature** (°C)
- **Relative Humidity** (%)
- **Dew Point Temperature** (°C)
- **Humidity Ratio** (kg/kg)
- **Enthalpy** (kJ/kg)
- **Specific Volume** (m³/kg)
- **Vapor Pressure** (kPa)
- **Altitude** (m)

## 📖 Formulas & References

The calculator implements standard psychrometric relationships including:
- **Antoine equation** for saturated vapor pressure
- **Barometric pressure calculation** based on altitude (hypsometric equation)
- **Humidity ratio calculations** from different input combinations
- **Relative humidity, dew point, enthalpy, and specific volume** calculations

### 📚 **Reference Standards**
- **ASHRAE Handbook - Fundamentals**
- **ISO 7730**: Ergonomics of the thermal environment
- **CODATA 2018**: Physical constants
- **Standard atmospheric model** for altitude corrections

## 🌐 Browser Compatibility

✅ **Chrome** (90+)
✅ **Firefox** (88+)  
✅ **Safari** (14+)
✅ **Edge** (90+)

## 🛠️ Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/HVAC-Tools.git
   cd HVAC-Tools
   ```

2. **Start local server:**
   ```bash
   python3 -m http.server 8000
   # or
   npx http-server
   ```

3. **Open in browser:**
   ```
   http://localhost:8000
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests to improve the calculator.

### **Development Guidelines:**
- Follow existing code style and documentation standards
- Ensure all calculations are properly tested
- Update documentation for new features
- Maintain responsive design compatibility

## 📄 License

**MIT License** - feel free to use and modify for your own purposes.

## 📞 Support

If you encounter any issues or have questions:
- 🐛 **Report bugs**: Use GitHub Issues
- 💡 **Feature requests**: Open a new issue with "enhancement" label
- 📧 **Questions**: Use GitHub Discussions

---

**⭐ Star this repository if you find it useful for your HVAC work!**