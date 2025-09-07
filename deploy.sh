#!/bin/bash

echo "🚀 Starting deployment process..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - ready for deployment"
fi

# Check if we're on main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "🔄 Switching to main branch..."
    git checkout -b main
fi

# Add all changes
echo "📝 Adding changes to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Prepare for deployment - $(date)"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com and connect your GitHub repository"
echo "2. Deploy backend first (set root directory to 'backend')"
echo "3. Deploy frontend (set root directory to 'frontend')"
echo "4. Update environment variables in both deployments"
echo "5. Update CORS settings in backend with your frontend URL"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
