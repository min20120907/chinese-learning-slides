# Deployment Guide

This application is built with React and Vite, making it easy to deploy to static hosting services like Vercel or GitHub Pages.

## Option 1: Vercel (Recommended) & GitHub

This is the easiest way to get a permanent link (e.g., `https://your-slides.vercel.app`) that automatically updates when you push code.

### Step 1: Push to GitHub
1.  Create a new repository on [GitHub](https://github.com/new).
2.  Run the following commands in your terminal (replace `YOUR_USERNAME/YOUR_REPO` with your repository info):
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
    git branch -M main
    git push -u origin main
    ```

### Step 2: Deploy on Vercel
1.  Go to [Vercel](https://vercel.com) and sign up/login with GitHub.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your `japanese-learning-slides` repository.
4.  Leave the default settings (Framework Preset: Vite).
5.  Click **"Deploy"**.

Done! You will get a live URL in seconds.

## Option 2: Build Locally (for manual upload)
If you want to just build the files and upload them somewhere else:

1.  Run the build command:
    ```bash
    npm run build
    ```
2.  The output will be in the `dist/` folder.
3.  You can upload the contents of `dist/` to any web server.
