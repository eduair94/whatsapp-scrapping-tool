# 📱 WhatsApp Number Checker Tool

<div align="center">

![WhatsApp Checker Logo](./assets/icon.svg)

**A powerful Electron-based desktop application to verify WhatsApp numbers in bulk with a beautiful, user-friendly interface.**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Electron](https://img.shields.io/badge/Electron-191970?logo=Electron&logoColor=white)](https://www.electronjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Screenshots](#-screenshots) • [Contributing](#-contributing)

</div>

---

## 🌟 Features

### ✨ **Core Functionality**
- 🔍 **Bulk WhatsApp Verification** - Check thousands of phone numbers at once
- 📁 **Multiple Input Methods** - Upload CSV/Excel files, paste numbers, or generate random test numbers
- 🌍 **International Support** - Validate phone numbers from any country with proper formatting
- ⚡ **Real-time Processing** - Live progress tracking with rate limit monitoring
- 📊 **Detailed Results** - Export verified numbers with complete WhatsApp profile information

### 🎨 **Modern Interface**
- 🖥️ **Beautiful Desktop App** - Native Electron application with sleek design
- 📱 **Responsive Layout** - Optimized for different screen sizes and resolutions
- 🎯 **Intuitive Workflow** - Step-by-step process with clear visual feedback
- 🔔 **Smart Notifications** - Toast notifications for all important actions
- 📈 **Session Management** - Track and manage multiple checking sessions with history

### ⚙️ **Advanced Features**
- 🛡️ **Rate Limit Protection** - Built-in safeguards to prevent API abuse
- 💾 **Session Persistence** - Save and resume checking sessions
- 📋 **Flexible Export** - Export results in multiple formats (Excel, CSV)
- 🔄 **Retry Logic** - Automatic retry for failed checks
- 📝 **Detailed Logging** - Complete audit trail of all operations

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** for cloning the repository

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/whatsapp-scrapping-tool.git
   cd whatsapp-scrapping-tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the application**
   ```bash
   npm run build
   ```

4. **Start the application**
   ```bash
   npm start
   ```

### Development Mode

For development with hot reload:

```bash
# Start the development server
npm run dev
```

---

## 📖 How to Use

### 1. **Getting Started**

When you first open the application, you'll see the welcome screen with three main options:

- **📁 Upload File** - Import phone numbers from CSV or Excel files
- **📋 Paste Numbers** - Enter numbers manually or paste from clipboard  
- **🎲 Generate Random** - Create test numbers for demo purposes

### 2. **Upload Phone Numbers**

#### From File:
1. Click **"Choose File"** or drag and drop your file
2. Supported formats: `.csv`, `.txt`, `.xlsx`, `.xls`
3. The tool will automatically detect and parse phone numbers
4. Invalid numbers are flagged with error details

#### Manual Entry:
1. Click on **"Paste Numbers"** section
2. Enter numbers one per line or comma-separated
3. Use the clipboard button to paste directly
4. Numbers are validated in real-time

#### Example formats supported:
```
+1234567890
(123) 456-7890
123-456-7890
+44 20 7946 0958
```

### 3. **Preview and Validate**

After uploading, you'll see:
- **📊 Summary Statistics** - Total numbers, valid vs invalid counts
- **📋 Number List** - Detailed view of all numbers with validation status
- **🌍 Country Detection** - Automatic country code identification
- **⚠️ Error Details** - Specific validation errors for invalid numbers

### 4. **Configure Settings**

Before starting the check:
- **🔑 API Configuration** - Set your WhatsApp API credentials
- **⏱️ Rate Limits** - Adjust checking speed to avoid rate limits
- **📊 Export Options** - Choose output format and fields
- **🔄 Retry Settings** - Configure retry attempts for failed checks

### 5. **Start Checking**

1. Click **"Start Checking"** to begin verification
2. Monitor real-time progress with:
   - Progress bar showing completion percentage
   - Live count of successful/failed checks
   - Rate limit status and remaining quota
   - Estimated time remaining

### 6. **View Results**

After completion:
- **📈 Results Summary** - Overview of all checked numbers
- **✅ Verified Numbers** - List of active WhatsApp accounts
- **❌ Invalid Numbers** - Numbers not on WhatsApp
- **📋 Detailed Information** - Profile data, business accounts, etc.

### 7. **Export Data**

Export your results in multiple formats:
- **📊 Excel (.xlsx)** - Complete data with formatting
- **📄 CSV** - Simple comma-separated values
- **📋 JSON** - Structured data for developers

---

## 📸 Screenshots

### Welcome Screen
*Clean, intuitive interface with multiple input options*

### File Upload
*Drag and drop functionality with format validation*

### Number Preview
*Detailed validation with country detection and error handling*

### Live Checking
*Real-time progress monitoring with rate limit tracking*

### Results Dashboard
*Comprehensive results view with export options*

### Session History
*Track and manage multiple checking sessions*

---

## 🛠️ Technical Stack

### Frontend
- **React 18** - Modern React with hooks and TypeScript
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **React Hot Toast** - Elegant notification system

### Backend/Desktop
- **Electron** - Cross-platform desktop app framework
- **Node.js** - JavaScript runtime for backend operations
- **WhatsApp Number Checker API** - Third-party verification service

### Development Tools
- **Webpack** - Module bundler and development server
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **TypeScript Compiler** - Type checking and compilation

### Libraries & Utilities
- **google-libphonenumber** - International phone number validation
- **xlsx** - Excel file reading and writing
- **csv-parser** - CSV file parsing
- **clsx** - Conditional CSS class management

---

## 📁 Project Structure

```
whatsapp-scrapping-tool/
├── 📁 src/
│   ├── 📁 main/               # Electron main process
│   │   └── main.ts            # Application entry point
│   ├── 📁 renderer/           # React frontend
│   │   ├── App.tsx            # Main application component
│   │   ├── 📁 components/     # Reusable UI components
│   │   ├── 📁 hooks/          # Custom React hooks
│   │   ├── 📁 managers/       # Business logic managers
│   │   ├── 📁 services/       # API and data services
│   │   └── 📁 types/          # TypeScript type definitions
│   └── preload.ts             # Electron preload script
├── 📁 assets/                 # Static assets and icons
├── 📁 dist/                   # Compiled output
├── package.json               # Project dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── webpack.config.js          # Webpack build configuration
└── tailwind.config.js         # Tailwind CSS configuration
```

---

## ⚙️ Configuration

### API Setup

1. **Get WhatsApp API Key**
   - Sign up for a WhatsApp number verification service
   - Popular options: RapidAPI, APILayer, or custom solutions
   - Obtain your API key and endpoint URL

2. **Configure in Application**
   - Open Settings in the application
   - Enter your API credentials
   - Test the connection before bulk checking

### Rate Limiting

To avoid being blocked:
- **Default**: 10 requests per minute
- **Recommended**: Start slow and increase gradually
- **Monitor**: Watch for rate limit warnings
- **Adjust**: Reduce speed if errors occur

---

## 🔧 Development

### Building from Source

```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Creating Distributables

```bash
# Build executable for your platform
npm run dist

# Build for specific platforms
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:linux  # Linux
```

---

## 📊 Performance

### Checking Speed
- **Average**: 50-100 numbers per minute
- **Factors**: API rate limits, network speed, number format
- **Optimization**: Batch processing, connection pooling

### Memory Usage
- **Idle**: ~50MB RAM
- **Processing**: ~100-200MB RAM (depending on dataset size)
- **Large Files**: Efficient streaming for 10k+ numbers

### File Size Limits
- **CSV/TXT**: Up to 50MB
- **Excel**: Up to 25MB
- **Numbers**: Tested with 100k+ numbers

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Style

- Use **TypeScript** for all new code
- Follow **ESLint** and **Prettier** configurations
- Write **tests** for new features
- Update **documentation** as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **WhatsApp** - For providing the messaging platform
- **React Team** - For the amazing frontend framework
- **Electron Team** - For enabling cross-platform desktop apps
- **Contributors** - Thanks to all who help improve this project

---

## 📞 Support

### Getting Help

- **📖 Documentation** - Check this README first
- **🐛 Bug Reports** - [Open an issue](https://github.com/yourusername/whatsapp-scrapping-tool/issues)
- **💡 Feature Requests** - [Request a feature](https://github.com/yourusername/whatsapp-scrapping-tool/issues)
- **💬 Discussions** - [Join the discussion](https://github.com/yourusername/whatsapp-scrapping-tool/discussions)

### Common Issues

#### "API Key Invalid"
- Verify your API key is correct
- Check if the service is active
- Ensure you have sufficient credits

#### "Numbers Not Loading"
- Check file format (CSV, Excel supported)
- Verify phone number format
- Try with a smaller test file first

#### "Application Won't Start"
- Ensure Node.js 16+ is installed
- Run `npm install` to update dependencies
- Try `npm run clean` then `npm run build`

---

<div align="center">

**Made with ❤️ by the WhatsApp Checker Team**

[⭐ Star this repo](https://github.com/yourusername/whatsapp-scrapping-tool) if you find it useful!

</div>
