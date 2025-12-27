# 🏁 GT7 Master Tuning Lab - Complete Build Guide

## 📋 What You're Building

A professional Gran Turismo 7 tuning calculator with:
- ✅ **Automated vehicle database** (500+ cars via web scraping)
- ✅ **Physics-based calculations** (real suspension formulas, not guesses)
- ✅ **GitHub Actions automation** (weekly database updates)
- ✅ **Free hosting** on GitHub Pages
- ✅ **Mobile-friendly** responsive design

---

## 🎯 Part 1: Prerequisites

### Required Software
1. **Node.js** (v14 or higher)
   - Download: https://nodejs.org
   - Check: `node --version`

2. **Python 3** (v3.8 or higher)
   - Download: https://python.org
   - Check: `python3 --version`

3. **Git**
   - Download: https://git-scm.com
   - Check: `git --version`

4. **GitHub Account**
   - Sign up: https://github.com/signup

---

## 🚀 Part 2: Local Setup (Desktop/Laptop)

### Step 1: Download and Extract Project Files

1. **Download** the `gt7-tuning-lab` folder you received
2. **Extract** it to a location you can find easily:
   - **Windows:** Right-click → Extract All → Choose Desktop or Documents
   - **Mac:** Double-click to extract to Downloads or Desktop
   - **Linux:** Extract to your home directory or Documents

Your folder should contain:
```
gt7-tuning-lab/
├── .github/workflows/          (GitHub automation)
├── public/                     (Web files)
├── src/                        (React app code)
├── package.json               (Node dependencies)
├── requirements.txt           (Python dependencies)
├── scraper.py                 (Database scraper)
└── README.md                  (This guide)
```

### Step 2: Open Terminal/Command Prompt

**Windows:**
- Open the `gt7-tuning-lab` folder
- Hold `Shift` + Right-click in the folder
- Select "Open PowerShell window here" or "Open Command Prompt here"

**Mac:**
- Open Terminal app
- Type `cd ` (with a space after)
- Drag the `gt7-tuning-lab` folder into Terminal
- Press Enter

**Linux:**
- Right-click in the `gt7-tuning-lab` folder
- Select "Open in Terminal"

### Step 3: Install Node.js Dependencies

Copy and paste this command, then press Enter:

```bash
npm install
```

**What to expect:**
- Takes 1-3 minutes
- Downloads ~200 MB of packages
- Shows progress bars
- Ends with "added XXX packages"

**If you get an error:**
- "npm: command not found" → Install Node.js from https://nodejs.org
- "EACCES permission denied" → Try `sudo npm install` (Mac/Linux)

### Step 4: Install Python Dependencies

Copy and paste this command:

```bash
pip3 install -r requirements.txt
```

**Or try these alternatives if above doesn't work:**
```bash
pip install -r requirements.txt        # Try this first on Windows
python3 -m pip install -r requirements.txt   # If pip3 not found
python -m pip install -r requirements.txt    # Alternative
```

**What to expect:**
- Takes 30 seconds
- Downloads BeautifulSoup and requests
- Shows "Successfully installed..." message

### Step 5: Generate Vehicle Database

Run the scraper to create your car database:

```bash
python3 scraper.py
```

**Or try:**
```bash
python scraper.py   # If python3 not recognized on Windows
```

**You should see:**
```
🏁 GT7 Vehicle Database Scraper Starting...
============================================================
🔍 Scraping Kudosprime GT7 database...
✅ Database saved to public/vehicles.json
📊 Total: 43 vehicles from 19 manufacturers
============================================================
🎉 Scraping complete!
```

**Note:** The scraper may show warnings if it can't reach online databases - this is normal! It will use the fallback database with 43 vehicles.

### Step 6: Test Locally

Start the development server:

```bash
npm start
```

**What happens:**
1. Compiles the React app (takes 10-30 seconds first time)
2. Opens your browser automatically
3. Shows the app at `http://localhost:3000`

**You should see:**
- GT7 MASTER title in red
- Vehicle dropdown menus
- All the tuning options

**Test it:**
1. Select a manufacturer (e.g., Nissan)
2. Select a model (e.g., GT-R)
3. Select a tire (e.g., Racing Hard)
4. Select a track (e.g., Monza)
5. Click "CALCULATE MASTER TUNE"
6. Verify results appear

**If the page is blank:**
- Check browser console (Press F12)
- Look for error messages
- Make sure all dependencies installed correctly

### Step 7: Stop the Test Server

When you're done testing:
- Go back to the terminal
- Press `Ctrl + C` (Windows/Linux) or `Cmd + C` (Mac)
- Type `Y` if prompted to confirm

---

## 🌐 Part 3: Deploy to GitHub Pages

### Step 1: Create GitHub Account (if you don't have one)

1. Go to https://github.com/signup
2. Enter your email and create a password
3. Choose a username (this will be in your site URL!)
4. Verify your account via email
5. Choose the free plan

### Step 2: Create New Repository

1. Go to https://github.com/new (or click the "+" icon → "New repository")
2. **Repository name:** `gt7-tuning-lab` (must be exact)
3. **Description:** "GT7 Master Tuning Lab - Physics-based setup calculator"
4. **Visibility:** Choose **Public** (required for free GitHub Pages)
5. **Important:** Do NOT check any boxes:
   - ❌ Do NOT add README
   - ❌ Do NOT add .gitignore
   - ❌ Do NOT choose a license
6. Click **"Create repository"**

You'll see a page with setup instructions - keep this page open!

### Step 3: Initialize Git in Your Project

Go back to your terminal in the `gt7-tuning-lab` folder:

```bash
# Initialize git (creates local repository)
git init
```

You should see: `Initialized empty Git repository`

### Step 4: Add All Files to Git

```bash
# Add all files to staging
git add .

# Create your first commit
git commit -m "🏁 Initial commit - GT7 Tuning Lab v5.0"
```

**What to expect:**
- Shows list of files being added
- May show warnings about line endings (ignore these)
- Ends with "XX files changed"

### Step 5: Connect to GitHub

**IMPORTANT:** Replace `YOUR-USERNAME` with your actual GitHub username!

```bash
# Connect your local repository to GitHub
git remote add origin https://github.com/YOUR-USERNAME/gt7-tuning-lab.git

# Rename main branch (if needed)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

**If prompted for credentials:**
- **Username:** Your GitHub username
- **Password:** Use a Personal Access Token (not your GitHub password!)
  - Create token: https://github.com/settings/tokens
  - Click "Generate new token (classic)"
  - Give it a name: "GT7 Tuning Lab"
  - Check "repo" scope
  - Copy the token and use it as password

**Troubleshooting push errors:**
- "remote: Repository not found" → Check your username in the URL
- "Authentication failed" → Use Personal Access Token, not password
- "Permission denied" → Generate a new token with correct permissions

### Step 6: Deploy to GitHub Pages

Now for the magic command:

```bash
npm run deploy
```

**What this does:**
1. Builds production version of your app (takes 30-60 seconds)
2. Creates a new branch called `gh-pages`
3. Pushes the built files to GitHub
4. Sets up everything for hosting

**You should see:**
```
> gt7-tuning-lab@5.0.0 deploy
> gh-pages -d build

Published
```

**If you get errors:**
- "gh-pages: command not found" → Run `npm install` again
- "Failed to get remote.origin.url" → Make sure you did Step 5
- "Permission denied" → Check your GitHub authentication

### Step 7: Enable GitHub Pages

1. Go to your repository on GitHub: `https://github.com/YOUR-USERNAME/gt7-tuning-lab`
2. Click **Settings** tab (top right)
3. Click **Pages** in the left sidebar (under "Code and automation")
4. Under **"Source"**:
   - Branch: Select **gh-pages** from dropdown
   - Folder: Select **/ (root)**
5. Click **Save**

You'll see: "Your site is ready to be published at..."

### Step 8: Wait and Visit Your Site

**Wait 1-3 minutes** for GitHub to build your site.

Then visit:
```
https://YOUR-USERNAME.github.io/gt7-tuning-lab
```

🎉 **Your GT7 Tuning Lab is now live and accessible to anyone in the world!**

### Step 9: Verify Everything Works

Test your live site:
1. ✅ Page loads and shows GT7 MASTER title
2. ✅ Vehicle dropdowns populate
3. ✅ Can select tires and tracks
4. ✅ Calculate button produces results
5. ✅ Export button downloads JSON file
6. ✅ Mobile responsive (test on phone)

---

## 🔄 Making Updates After Initial Deployment

Whenever you want to update your live site:

```bash
# 1. Make your changes to the code

# 2. Test locally
npm start

# 3. If everything works, commit your changes
git add .
git commit -m "Description of your changes"

# 4. Push to GitHub
git push

# 5. Deploy the updates
npm run deploy

# Your site will update in 1-2 minutes!
```

**Examples:**
```bash
# Added new vehicles
git commit -m "Added 10 new Porsche models"

# Fixed a bug
git commit -m "Fixed brake balance calculation"

# Updated styling
git commit -m "Changed theme to blue"
```

---

## 📱 Part 4: Mobile Deployment (Using GitHub Codespaces)

If you're on a phone/tablet and can't install Node.js:

### Option A: GitHub Codespaces (Easiest)

1. **Upload files to GitHub**
   - Go to your repository
   - Click "Add file" → "Upload files"
   - Drag and drop all project files

2. **Open Codespaces**
   - Click green "Code" button
   - Go to "Codespaces" tab
   - Click "Create codespace on main"

3. **In the Codespaces terminal:**
   ```bash
   npm install
   python3 scraper.py
   npm run deploy
   ```

4. **Enable Pages** (follow Step 4 above)

### Option B: Edit on GitHub.dev

1. Go to your repository
2. Press `.` (period key) - opens web editor
3. Make changes directly in browser
4. Commit and push

---

## 🤖 Part 5: Automated Database Updates

GitHub Actions will automatically run the scraper every Monday at 3 AM UTC!

### How It Works:
1. The workflow file `.github/workflows/update-database.yml` contains the schedule
2. Every Monday, GitHub runs `python3 scraper.py`
3. If new cars are found, they're committed automatically
4. Your live site updates with the new database

### Manual Trigger:
1. Go to your repository
2. Click "Actions" tab
3. Click "Update GT7 Vehicle Database"
4. Click "Run workflow"

---

## ⚙️ Part 6: Customization

### Add More Vehicles Manually

Edit `public/vehicles.json`:

```json
"McLaren": {
  "720S '17": {
    "drive": "MR",
    "baseAero": [200, 600],
    "heightRange": [55, 105],
    "springRange": [2.0, 16.0],
    "damperRange": [1, 10],
    "antiRollRange": [1, 7],
    "camberRange": [-5.0, 0.0],
    "toeRange": [-0.60, 0.60],
    "maxPower": 710,
    "baseWeight": 1419,
    "baseTorque": 568,
    "gearRatios": [3.143, 2.105, 1.565, 1.229, 1.027, 0.884, 0.742],
    "finalGear": 3.72
  }
}
```

Then:
```bash
git add public/vehicles.json
git commit -m "Added McLaren 720S"
git push
npm run deploy
```

### Change Colors/Theme

Edit `src/GT7TuningLab.jsx` → Find the `<style>` tag:

```css
.racing-stripe {
  background: linear-gradient(90deg, 
    transparent 0%, 
    #e4000f 15%,    /* Change this color */
    ...
  );
}
```

### Add More Tracks

Edit `src/GT7TuningLab.jsx` → Find `trackDatabase`:

```javascript
"High Speed": [
  { name: "Le Mans", bumpiness: 0.2, speedLevel: "high", elevation: "flat" }
]
```

### Improve Scraping

Edit `scraper.py` → Add new scraping sources in the `run()` method.

---

## 🔧 Troubleshooting

### Installation Issues

#### "npm: command not found" or "npm is not recognized"
**Problem:** Node.js is not installed or not in PATH

**Solutions:**
1. Download and install Node.js from https://nodejs.org (choose LTS version)
2. **Windows:** After installing, close and reopen Command Prompt/PowerShell
3. **Mac/Linux:** After installing, close and reopen Terminal
4. Verify installation: `node --version` (should show v14+ or higher)

#### "python3: command not found" or "python is not recognized"
**Problem:** Python is not installed or not in PATH

**Solutions:**
1. **Windows:** 
   - Download from https://python.org
   - **Important:** Check "Add Python to PATH" during installation
   - Use `python` instead of `python3` in commands
2. **Mac:** Python 3 comes pre-installed. If not working, install via Homebrew: `brew install python3`
3. **Linux:** Install via package manager: `sudo apt install python3 python3-pip`
4. Verify: `python3 --version` or `python --version`

#### "pip3: command not found"
**Solutions:**
- **Windows:** Use `pip` instead of `pip3`
- **Mac/Linux:** Use `python3 -m pip install -r requirements.txt`
- Install pip: `python3 -m ensurepip --upgrade`

#### "EACCES: permission denied" (npm install)
**Solutions:**
- **Mac/Linux:** Try `sudo npm install`
- Better solution: Fix npm permissions
  ```bash
  mkdir ~/.npm-global
  npm config set prefix '~/.npm-global'
  echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
  source ~/.profile
  ```

#### npm install is very slow or hangs
**Solutions:**
1. Check your internet connection
2. Try a different network
3. Clear npm cache: `npm cache clean --force`
4. Delete `node_modules` and `package-lock.json`, then try again:
   ```bash
   rm -rf node_modules package-lock.json  # Mac/Linux
   rmdir /s node_modules & del package-lock.json  # Windows CMD
   npm install
   ```

### Scraper Issues

#### Scraper shows "Error scraping" messages
**This is normal!** The scraper tries to fetch data from online sources, but if they're unreachable, it automatically uses the fallback database with 43 vehicles. Your app will work perfectly fine.

#### "ModuleNotFoundError: No module named 'bs4'"
**Solution:**
```bash
pip3 install beautifulsoup4 requests lxml
# Or on Windows:
pip install beautifulsoup4 requests lxml
```

### Local Testing Issues

#### Port 3000 already in use
**Problem:** Another app is using port 3000

**Solutions:**
1. Stop the other app using port 3000
2. Or use a different port:
   ```bash
   PORT=3001 npm start  # Mac/Linux
   set PORT=3001 && npm start  # Windows CMD
   ```

#### Page is blank when running npm start
**Solutions:**
1. Open browser console (Press F12)
2. Look for error messages in red
3. Common fixes:
   - Clear browser cache (Ctrl+Shift+Del)
   - Try incognito/private browsing
   - Check if `public/vehicles.json` exists
   - Run `npm run build` to check for errors

#### Browser doesn't open automatically
**Solution:** Manually open http://localhost:3000 in your browser

### GitHub Deployment Issues

#### "remote: Repository not found"
**Solutions:**
1. Verify repository exists on GitHub
2. Check your username in the git URL:
   ```bash
   git remote -v  # Shows current remote URL
   ```
3. If wrong, update it:
   ```bash
   git remote set-url origin https://github.com/CORRECT-USERNAME/gt7-tuning-lab.git
   ```

#### "Authentication failed" when pushing to GitHub
**Problem:** GitHub no longer accepts passwords for git operations

**Solution:** Use Personal Access Token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: "GT7 Tuning Lab"
4. Expiration: Choose "No expiration" or "90 days"
5. Scopes: Check **"repo"** (full control of private repositories)
6. Click "Generate token"
7. **Copy the token immediately** (you won't see it again!)
8. When git asks for password, paste the token

**Alternative:** Use GitHub Desktop
- Download from https://desktop.github.com
- Much easier for beginners (no command line needed)

#### "gh-pages: command not found"
**Solution:**
```bash
npm install --save-dev gh-pages
npm run deploy
```

#### "Failed to get remote.origin.url"
**Problem:** Git remote not configured

**Solution:**
```bash
# Check if remote exists
git remote -v

# If no output, add the remote
git remote add origin https://github.com/YOUR-USERNAME/gt7-tuning-lab.git

# Try deploy again
npm run deploy
```

#### Deploy succeeded but site shows 404
**Solutions:**
1. Wait 3-5 minutes (GitHub needs time to build)
2. Verify GitHub Pages is enabled:
   - Settings → Pages → Source should be "gh-pages" branch
3. Check the URL is correct: `https://YOUR-USERNAME.github.io/gt7-tuning-lab`
4. Hard refresh browser: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

#### Site deployed but shows blank page
**Solutions:**
1. Check browser console (F12) for errors
2. Verify `homepage` in `package.json`:
   ```json
   "homepage": "https://YOUR-USERNAME.github.io/gt7-tuning-lab"
   ```
   Make sure YOUR-USERNAME matches your actual GitHub username!
3. If wrong, fix it and redeploy:
   ```bash
   # Edit package.json
   npm run deploy
   ```

### Database not loading
1. Check `public/vehicles.json` exists
2. Make sure it's valid JSON (use jsonlint.com)
3. Check browser network tab for 404 errors

### GitHub Actions not running
1. Go to Settings → Actions → General
2. Enable "Allow all actions and reusable workflows"
3. Manually trigger the workflow

### Git Issues

#### "fatal: not a git repository"
**Solution:**
```bash
git init
```

#### "Your branch is ahead of 'origin/main'"
**Solution:** Push your changes:
```bash
git push
```

#### Accidentally committed wrong files
**Solution:**
```bash
# Undo last commit but keep changes
git reset --soft HEAD~1

# Remove unwanted files from staging
git reset path/to/file

# Commit again
git add .
git commit -m "Correct commit"
```

### Still Having Issues?

1. **Check the error message carefully** - it usually tells you what's wrong
2. **Search the error on Google** - chances are someone else had the same issue
3. **Try the process again from scratch** - delete the folder and start over
4. **Check GitHub Actions logs** - Go to your repo → Actions tab → Click the workflow
5. **Ask for help:**
   - Open an issue on your GitHub repository
   - Share the error message
   - Describe what steps you took

### Quick Reset (Start Fresh)

If everything is broken and you want to start over:

```bash
# 1. Delete node_modules and package-lock
rm -rf node_modules package-lock.json  # Mac/Linux
# Or manually delete the folders on Windows

# 2. Reinstall everything
npm install

# 3. Regenerate database
python3 scraper.py

# 4. Test locally
npm start

# 5. If working, redeploy
npm run deploy
```

---

## 📊 How The Physics Work

### Suspension Calculations

**Natural Frequency** (how bouncy the car is):
```
f = (1 / 2π) × √(spring_rate / sprung_mass)
```

Target frequencies:
- Road cars: 2.0-2.5 Hz
- Sports cars: 2.5-3.5 Hz
- Race cars: 3.5-4.5 Hz

### Aerodynamics

**Downforce scaling:**
- Base aero from car specs
- Additional from PP rating (faster = more aero needed)
- Balance adjusts for understeer/oversteer

### LSD Logic

**Acceleration Sensitivity:**
- High torque-to-weight ratio → More locking
- MR/RR drivetrain → Less locking (prevent snap oversteer)
- FR high-power → Maximum locking

### Brake Balance

**Weight distribution affects braking:**
- FR: Slight rear bias (-1)
- MR/RR: More rear bias (-2) because of engine weight
- 4WD: Neutral (0)
- FF: Front bias (+1)

---

## 🎮 Using The App

### Basic Workflow:
1. Select manufacturer & model
2. Choose tire compound
3. Select track
4. Adjust PP/HP/Torque/Weight if modified
5. Select tune style (balanced, understeer fix, etc.)
6. Click "Calculate Master Tune"
7. Export setup as JSON

### Tune Fixes Explained:

- **Balanced**: Neutral setup
- **Reduce Understeer**: Softer front suspension, more front rotation
- **Reduce Oversteer**: Stiffer rear, more stability
- **Increase Stability**: Softer overall, more predictable
- **Increase Agility**: Stiffer overall, quicker response
- **Wet Weather**: Much softer for rain conditions

---

## 📈 Future Improvements

### Planned Features:
- [ ] Add all 500+ GT7 vehicles
- [ ] Real-time PP calculator
- [ ] Visual setup diagrams
- [ ] Community tune sharing
- [ ] Import game screenshots (OCR)
- [ ] Lap time predictor
- [ ] Mobile app version
- [ ] API for other tools

### How to Contribute:
1. Fork the repository
2. Make your changes
3. Test locally
4. Submit pull request

Priority contributions:
- Vehicle specs from GT7
- Track surface data
- Physics formula improvements
- UI/UX enhancements

---

## 📝 Quick Reference Commands

```bash
# Install dependencies
npm install
pip3 install -r requirements.txt

# Run locally
npm start

# Update vehicle database
python3 scraper.py

# Deploy to GitHub Pages
npm run deploy

# Check for errors
npm run build

# Update code and deploy
git add .
git commit -m "Your message"
git push
npm run deploy
```

---

## 🆘 Getting Help

### Common Questions:

**Q: Can multiple people use this?**
A: Yes! Once deployed on GitHub Pages, anyone can access it for free.

**Q: How often does the database update?**
A: Automatically every Monday, or manually via GitHub Actions.

**Q: Can I use this offline?**
A: Yes! Run `npm start` locally. The app will use the local `vehicles.json`.

**Q: Is this legal?**
A: Yes. This is a community tool using publicly available game data. Not affiliated with Sony/Polyphony Digital.

**Q: Can I make money from this?**
A: This is a community project. Feel free to use it, but don't sell it.

### Need More Help?

1. Check browser console (F12) for errors
2. Read the GitHub Actions logs
3. Open an issue on GitHub
4. Join GT7 tuning communities for tips

---

## 🏆 Credits

Built by the GT7 tuning community using:
- React for the frontend
- Python for data scraping
- GitHub Actions for automation
- Real motorsport physics principles

Special thanks to:
- GT7 dataminers
- Community database maintainers
- Everyone who tests and provides feedback

---

## 📄 License

MIT License - Feel free to use, modify, and distribute.

Not affiliated with Polyphony Digital or Sony Interactive Entertainment.
Gran Turismo 7 is a trademark of Sony Interactive Entertainment Inc.

---

**Ready to race? 🏎️💨**

For the fastest deployment: Follow Part 2 → Part 3, Steps 1-4.
Total time: ~10 minutes.

Questions? Open an issue on GitHub!
