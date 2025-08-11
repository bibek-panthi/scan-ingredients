# CleanScan - Vercel Deployment Guide

## Quick Deploy to Vercel

### Option 1: One-Click Deploy (Easiest)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - CleanScan MVP"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Vite settings
   - Click "Deploy"

### Option 2: Vercel CLI Deploy

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? Yes
   - Which scope? (select your account)
   - Link to existing project? No
   - Project name: cleanscan (or your preferred name)
   - In which directory is your code located? ./
   - Want to override settings? No

## Environment Configuration

### For Production Features (Optional)

If you want to add real OCR functionality, create these environment variables in Vercel:

1. **In Vercel Dashboard:**
   - Go to your project settings
   - Click "Environment Variables"
   - Add the following:

```
VITE_GOOGLE_CLOUD_API_KEY=your_google_cloud_vision_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## Domain Configuration

### Custom Domain (Optional)

1. **In Vercel Dashboard:**
   - Go to your project
   - Click "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

### Default Domain
Your app will be available at: `https://your-project-name.vercel.app`

## Automatic Deployments

- **Main Branch**: Automatically deploys to production
- **Feature Branches**: Create preview deployments
- **Pull Requests**: Generate preview links for testing

## Performance Optimization

The app is already optimized for Vercel with:
- ✅ Vite for fast builds
- ✅ Code splitting
- ✅ Asset optimization
- ✅ Gzip compression
- ✅ CDN distribution

## Monitoring & Analytics

### Built-in Vercel Analytics
1. Go to your project dashboard
2. Enable "Analytics" tab
3. Monitor page views, performance, and user engagement

### Speed Insights
1. Enable "Speed Insights" in project settings
2. Get Core Web Vitals data
3. Monitor performance metrics

## Troubleshooting

### Common Issues

1. **Build Fails:**
   ```bash
   npm run build
   ```
   Fix any errors locally first

2. **Routes Not Working:**
   - The `vercel.json` file handles SPA routing
   - Ensure all routes redirect to `index.html`

3. **Large Bundle Size:**
   - Current build: ~193KB (62KB gzipped)
   - Consider code splitting for larger apps

### Build Commands
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

## Security Considerations

### Environment Variables
- Never commit API keys to Git
- Use Vercel's environment variables for secrets
- Prefix client-side vars with `VITE_`

### HTTPS
- Vercel provides automatic HTTPS
- All domains get SSL certificates
- HTTP redirects to HTTPS automatically

## Scaling Considerations

### Current Setup Supports:
- ✅ Unlimited page views
- ✅ Global CDN distribution
- ✅ Automatic scaling
- ✅ Zero configuration required

### For High Traffic:
- Consider Vercel Pro for advanced analytics
- Implement caching strategies
- Use Vercel Edge Functions for API routes

## Post-Deployment Checklist

- [ ] Test all features on production URL
- [ ] Verify image upload works
- [ ] Check ingredient scanning functionality
- [ ] Test avoid list management
- [ ] Verify mobile responsiveness
- [ ] Test performance with Lighthouse
- [ ] Set up monitoring/analytics

## Next Steps

After deployment, consider adding:
1. **Real OCR**: Google Cloud Vision API integration
2. **Authentication**: Firebase Auth for user accounts
3. **Database**: Store user preferences and scan history
4. **PWA**: Make it installable on mobile devices
5. **API Routes**: Vercel serverless functions for backend logic

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vite Deployment**: https://vitejs.dev/guide/static-deploy.html
- **React Deployment**: https://reactjs.org/docs/deployment.html

Your CleanScan app is now ready for global deployment! 🚀
