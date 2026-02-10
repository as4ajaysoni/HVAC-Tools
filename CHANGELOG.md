# Changelog

All notable changes to the HVAC Psychrometric Calculator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-02-10

### 🎉 **Major New Features**

#### 📊 **CSV Batch Processing**
- **File Upload**: Drag-and-drop or browse CSV file interface
- **Batch Calculations**: Process hundreds of psychrometric calculations at once
- **Validation System**: Comprehensive CSV format validation with detailed error reporting
- **Progress Tracking**: Real-time progress indication during processing
- **Results Export**: Download timestamped CSV files with complete calculation results
- **Sample Template**: Download sample CSV file for easy data preparation

#### 📚 **Formula Documentation & References**
- **New Reference Page**: Comprehensive psychrometric formula documentation
- **Interactive Features**: Copy formulas to clipboard, search functionality
- **Physical Constants**: Complete table of constants with sources
- **Mobile Support**: Responsive, expandable sections for mobile devices
- **Print Support**: Print-friendly formula formatting
- **ASHRAE Standards**: References to industry standards and applicability

#### 🎨 **Enhanced User Interface**
- **Navigation System**: Clean navigation between Calculator and References pages
- **Visual Feedback**: Enhanced error messages, loading states, and micro-interactions
- **Responsive Design**: Improved mobile and tablet experience
- **Professional Styling**: Consistent design language throughout application

### 🚀 **Enhancements**

#### 🧮 **Calculation Improvements**
- **WBT+RH Algorithm**: Implemented accurate Newton-Raphson iterative solver
- **Constants Organization**: Consolidated all physical constants with proper documentation
- **JSDoc Documentation**: Complete API documentation for all functions
- **Code Quality**: Removed unused constants, improved maintainability

#### 🔍 **Validation & Error Handling**
- **CSV Validation**: Enhanced validation with warnings and granular error reporting
- **Input Validation**: Improved boundary checking for all input combinations
- **Edge Case Handling**: Better handling of extreme values and malformed data
- **User Feedback**: Clear error messages with actionable guidance

#### 🏙️ **City Weather Data**
- **Expanded Database**: 15 major cities with representative weather conditions
- **Pre-configured Values**: DBT, WBT, RH, and altitude data for each city
- **Quick Selection**: Easy city selection for common reference conditions

### 🐛 **Bug Fixes**

- **Calculation Accuracy**: Fixed WBT+RH calculation that used simplified approximation
- **Memory Management**: Proper cleanup of event listeners and timers
- **Mobile Touch**: Improved touch interaction for mobile devices
- **Browser Compatibility**: Fixed issues with Safari and Edge browsers

### 📱 **Mobile & Responsive**

- **Touch Optimization**: Better touch targets and gesture handling
- **Responsive Tables**: Improved table layouts on small screens
- **Mobile Navigation**: Collapsible sections and mobile-optimized menu
- **Performance**: Optimized for mobile devices and slower connections

### 🔧 **Technical Improvements**

- **Code Architecture**: Modular structure with better separation of concerns
- **Performance**: Optimized DOM manipulation and event handling
- **Standards Compliance**: Improved HTML5 semantic structure
- **Accessibility**: Better ARIA labels and keyboard navigation

### 📖 **Documentation**

- **README Update**: Comprehensive documentation with examples and usage guides
- **API Documentation**: Complete JSDoc coverage for all public functions
- **Development Guide**: Local development setup and contribution guidelines

### 🚨 **Breaking Changes**

#### File Structure
- **New Files**: Added `references.html`, `references.js`, `csv-processor.js`
- **Modified Files**: Updated `index.html`, `script.js`, `styles.css`
- **Dependencies**: No external dependencies added, still pure HTML/CSS/JavaScript

#### API Changes
- **Global Functions**: Some internal functions renamed for clarity
- **Constants**: Reorganized constant names for better maintainability
- **Event Handling**: Improved event delegation and memory management

---

## [1.0.0] - 2024-01-01

### 🎉 **Initial Release**

#### 🧮 **Core Features**
- **Four Input Combinations**: DBT+WBT, DBT+RH, DBT+DPT, WBT+RH
- **Eight Calculated Properties**: Temperature, humidity, enthalpy, specific volume, etc.
- **Real-time Calculation**: Instant updates as input values change
- **Input Validation**: Comprehensive validation for all input types

#### 🎨 **User Interface**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Clean Layout**: Professional, intuitive interface
- **Error Handling**: Clear validation messages and user feedback

#### 📊 **Psychrometric Functions**
- **Antoine Equation**: Saturated vapor pressure calculation
- **Barometric Pressure**: Altitude correction using hypsometric equation
- **Humidity Calculations**: Multiple methods for humidity ratio determination
- **Thermodynamic Properties**: Enthalpy, specific volume, dew point calculations

#### 🌍 **Weather Data**
- **City Selection**: 15 major cities with representative conditions
- **Automatic Loading**: Pre-populated values for quick calculations
- **Altitude Support**: Automatic altitude adjustment for each city

### 📋 **Supported Properties**
- Dry Bulb Temperature (°C)
- Wet Bulb Temperature (°C)
- Relative Humidity (%)
- Dew Point Temperature (°C)
- Humidity Ratio (kg/kg)
- Enthalpy (kJ/kg)
- Specific Volume (m³/kg)
- Vapor Pressure (kPa)

### 🔧 **Technical Details**
- **Pure JavaScript**: No external dependencies
- **Modern Browser Support**: Chrome, Firefox, Safari, Edge
- **Mobile Responsive**: Optimized for all screen sizes
- **Local Development**: Simple file-based deployment

---

## 🏷️ **Version History**

### **Version 2.0.0** - "Professional Edition"
- Major feature release with batch processing and comprehensive documentation
- Enhanced user experience and professional-grade functionality

### **Version 1.0.0** - "Foundation Release"  
- Initial release with core psychrometric calculation functionality
- Basic UI with responsive design
- Single calculation mode with city weather data

---

## 📋 **Upgrade Guide**

### From 1.0.0 to 2.0.0

#### ✅ **No Migration Required**
- All existing functionality preserved
- Same file structure (plus new files)
- Backward compatible with existing data

#### 🆕 **New Features to Explore**
1. **Batch Processing**: Try the CSV upload feature for bulk calculations
2. **Formula References**: Check the new documentation page for calculation details
3. **Enhanced Validation**: Notice improved error messages and warnings
4. **Mobile Experience**: Improved touch interactions on mobile devices

#### 🔧 **Developer Changes**
- **Constants**: Updated constant names for better clarity
- **Functions**: Added comprehensive JSDoc documentation
- **Structure**: More modular code organization

---

## 🤝 **Contributors**

### Version 2.0.0
- **Enhanced by**: HVAC Calculator Team
- **Major features**: CSV processing, formula documentation, UI improvements
- **Technical debt**: Code cleanup, performance optimization, standards compliance

### Version 1.0.0
- **Created by**: Original development team
- **Foundation**: Core psychrometric calculation engine
- **Design**: Responsive web interface

---

## 📞 **Support & Feedback**

For questions about specific versions or features:
- **GitHub Issues**: Report bugs or request features
- **GitHub Discussions**: Community support and questions
- **Version Notes**: Check relevant section in this changelog

---

*Last Updated: February 10, 2026*