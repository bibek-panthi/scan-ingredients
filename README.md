# CleanScan - Ingredient Scanner MVP

A web application that helps users scan ingredient labels on packaged foods and detects harmful substances from a customizable avoid list.

## Features

### Core Functionality
- **Image Upload & OCR**: Upload photos of ingredient labels for text extraction
- **Ingredient Detection**: Advanced fuzzy matching to find harmful ingredients
- **Severity Classification**: Color-coded risk levels (High 🔴, Medium 🟠, Low 🟢)
- **Detailed Information**: Comprehensive details about why each ingredient is harmful

### Avoid List Management
- **Toggle System**: Enable/disable ingredients you want to check for
- **Custom Ingredients**: Add your own ingredients to avoid
- **Persistent Settings**: Your preferences are saved locally
- **Bulk Management**: Sort by severity and manage large lists efficiently

### Results & Analysis
- **Clear Results**: Green checkmark for safe products, red warning for flagged items
- **Risk Assessment**: Overall risk evaluation with recommendations
- **Ingredient Details**: Tap any detected ingredient for detailed information
- **Source Links**: Credible research links for each ingredient

## Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Pure CSS with modern design
- **Search**: Fuse.js for fuzzy ingredient matching
- **Storage**: localStorage for user preferences
- **OCR**: Demo mode (production would use Google Cloud Vision API)

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CleanScan
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Usage Guide

### 1. Scanning Products
- Click the "Scanner" tab
- Upload an image by clicking the scan area or dragging & dropping
- Wait for processing (demo uses simulated OCR results)
- View results with detected harmful ingredients

### 2. Managing Your Avoid List
- Click "Avoid List" to see all ingredients
- Toggle ingredients on/off to customize what you want to detect
- Add custom ingredients with the "Add Custom Ingredient" button
- Delete custom ingredients you no longer need

### 3. Understanding Results
- **Green ✅**: No flagged ingredients found - product is likely safe
- **Red ❌**: High-risk ingredients detected - avoid this product
- **Yellow ⚠️**: Medium/low-risk ingredients - use caution

### 4. Detailed Information
- Click any detected ingredient to see detailed information
- Learn why it's harmful and view research sources
- See alternative names the ingredient might be listed under

## Default Avoid List

The app comes pre-loaded with harmful ingredients including:

**High Risk (🔴)**
- BPA and other endocrine disruptors
- PFAS (forever chemicals)
- Sodium nitrates/nitrites
- Azodicarbonamide
- Potassium bromate
- BHA (Butylated Hydroxyanisole)

**Medium Risk (🟠)**
- Artificial food dyes (Red #40, Yellow #5, etc.)
- Caramel coloring
- Sulfites
- BHT (Butylated Hydroxytoluene)
- High fructose corn syrup
- Artificial sweeteners (aspartame, sucralose)

**Low Risk (🟢)**
- Refined vegetable oils (canola, soybean, corn)
- MSG
- Propylene glycol

## Production Deployment

### Google Cloud Vision API Integration

For production use, replace the demo OCR with Google Cloud Vision API:

1. Get a Google Cloud Vision API key
2. Update `src/components/IngredientScanner.jsx` to use `googleCloudVisionOCR`
3. Set your API key in environment variables

### Environment Variables

Create a `.env` file:
```
VITE_GOOGLE_CLOUD_API_KEY=your_api_key_here
```

## Customization

### Adding New Ingredients

1. **Via UI**: Use the "Add Custom Ingredient" feature
2. **Via Code**: Edit `src/data/avoidList.json`

### Modifying Severity Levels

Edit the severity field in the ingredient data:
- `"High"` - Red warning, strong avoidance recommendation
- `"Medium"` - Orange warning, caution recommendation  
- `"Low"` - Yellow warning, awareness recommendation

### Styling Customization

Modify `src/index.css` to change:
- Color scheme
- Typography
- Layout and spacing
- Component styling

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

CleanScan is for informational purposes only. Always consult healthcare professionals for personalized dietary advice. The ingredient database and risk assessments are based on available research and should not replace professional medical guidance.

## Roadmap

### Future Features
- [ ] Barcode scanning integration
- [ ] User accounts and cloud sync
- [ ] Nutritional analysis
- [ ] Recipe recommendations
- [ ] Community ingredient database
- [ ] Mobile app (React Native)
- [ ] Offline mode
- [ ] Multi-language support

### Technical Improvements
- [ ] Advanced image preprocessing
- [ ] Machine learning for better ingredient recognition
- [ ] Real-time scanning with camera
- [ ] Performance optimizations
- [ ] Comprehensive testing suite
