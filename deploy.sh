#!/bin/bash

echo "🚀 Deploying CleanScan to Vercel..."

# Check if build works
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Check if vercel CLI is installed
    if command -v vercel &> /dev/null; then
        echo "🌐 Deploying to Vercel..."
        vercel --prod
    else
        echo "⚠️  Vercel CLI not found. Install with: npm i -g vercel"
        echo "💡 Alternative: Push to GitHub and connect repository to Vercel"
    fi
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo "🎉 Deployment complete!"
echo "📱 Your app will be available at: https://your-project-name.vercel.app"
