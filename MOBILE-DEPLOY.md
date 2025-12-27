# 📱 Mobile Deployment Guide

## Deploy GT7 Tuning Lab from Your Phone

### Method 1: GitHub Codespaces (Recommended) ⭐

**Works on:** iPhone, iPad, Android phones/tablets

#### Step 1: Create GitHub Account
- Go to https://github.com/signup on your phone
- Create free account

#### Step 2: Create Repository
1. Go to https://github.com/new
2. Name: `gt7-tuning-lab`
3. Make it Public
4. Don't initialize with files
5. Click "Create repository"

#### Step 3: Upload Files
1. Click "Add file" → "Upload files"
2. Select all project files from your downloads
3. Commit message: "Initial commit"
4. Click "Commit changes"

#### Step 4: Open Codespaces
1. Click green "Code" button
2. Switch to "Codespaces" tab
3. Click "Create codespace on main"
   - Wait 30 seconds for environment to load

#### Step 5: Deploy in Terminal
In the terminal at bottom of screen, type these commands (one at a time):

```bash
npm install
```
Wait for completion (~2 minutes)

```bash
python3 scraper.py
```
Generates vehicle database

```bash
npm run deploy
```
Builds and deploys your site

#### Step 6: Enable GitHub Pages
1. Tap "X" to close Codespaces
2. Go to repository Settings → Pages
3. Source: Select "gh-pages" branch
4. Click Save

**Done!** Visit: `https://YOUR-USERNAME.github.io/gt7-tuning-lab`

---

### Method 2: GitHub Web Editor

**Faster but no build preview**

1. Upload files to your repository
2. Press `.` (period key) on keyboard
   - Opens github.dev web editor
3. Make changes directly in browser
4. Commit with Ctrl+Enter (Cmd+Enter on iOS)

To deploy after editing:
1. Go to Actions tab
2. Click "Update GT7 Vehicle Database"
3. Run workflow

---

### Method 3: Use Replit (No GitHub Account Needed)

#### Step 1: Create Replit Account
- Go to https://replit.com/signup
- Sign up (free)

#### Step 2: Create New Repl
1. Click "+ Create Repl"
2. Template: "React JavaScript"
3. Title: "GT7 Tuning Lab"
4. Click "Create Repl"

#### Step 3: Upload Files
1. Click "Files" icon (left sidebar)
2. Click "⋮" (three dots) → "Upload folder"
3. Select your `gt7-tuning-lab` folder

#### Step 4: Install & Run
Terminal will show. Type:
```bash
npm install
python3 scraper.py
npm start
```

Click "Run" button at top.

**Your site is now live at the Replit URL!**

To share:
1. Click "Share" button
2. Copy the URL
3. Anyone can access it

---

### Method 4: Netlify Drop (Instant Deploy)

⚠️ **Limitation:** Requires pre-built files (can't build from source on phone)

If someone sends you the `build` folder:

1. Go to https://app.netlify.com/drop
2. Drag the `build` folder
3. **Done!** Instant live site

Get build folder by:
- Running `npm run build` on a computer
- Or asking someone to build it for you

---

## 🎯 Which Method Should I Use?

| Method | Best For | Time | Cost |
|--------|----------|------|------|
| **Codespaces** | Full control, automation | 10 min | Free (60 hrs/month) |
| **Replit** | Quick testing, learning | 5 min | Free |
| **Web Editor** | Small edits only | 2 min | Free |
| **Netlify Drop** | Pre-built files | 1 min | Free |

**Recommendation:** Start with **Codespaces** for the full experience.

---

## 📝 Common Mobile Issues

### "Can't see terminal in Codespaces"
→ Swipe up from bottom of screen or tap Terminal → New Terminal

### "Commands not working"
→ Make sure you're in the right directory:
```bash
cd /workspaces/gt7-tuning-lab
```

### "npm install taking forever"
→ Normal! Can take 2-3 minutes on slower connections. Be patient.

### "Permission denied"
→ Add `sudo` before command:
```bash
sudo npm install
```

### "Can't type in terminal"
→ Tap the terminal area first to focus it

### "Site not loading after deploy"
→ Wait 2-3 minutes for GitHub Pages to process
→ Clear browser cache
→ Try incognito/private mode

---

## 🔄 Making Updates from Phone

### Quick Changes (Text/Numbers):
1. Open github.dev (press `.` on repository page)
2. Edit file
3. Commit (Ctrl/Cmd + Enter)
4. Manually trigger Actions to redeploy

### Code Changes:
1. Open Codespaces
2. Make changes in editor
3. In terminal:
```bash
git add .
git commit -m "Updated tuning logic"
git push
npm run deploy
```

---

## 💡 Pro Tips for Mobile Development

1. **Use landscape mode** - More screen space in Codespaces
2. **External keyboard helps** - Bluetooth keyboard makes coding easier
3. **Save often** - Codespaces auto-saves, but commit frequently
4. **Test on desktop first** - Complex changes are easier on computer
5. **Use GitHub app** - Better for reviewing code on mobile

---

## 🆘 Troubleshooting

### Codespaces won't start
→ Check your GitHub usage (Settings → Billing)
→ Free tier: 60 hours/month
→ Delete old codespaces to free up resources

### Can't find uploaded files
→ Go to repository page
→ Click "Code" tab
→ Verify files are there

### Deploy failed
→ Check Actions tab for error logs
→ Common fix: Delete `node_modules`, run `npm install` again

### Out of space error
→ In Codespaces terminal:
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

---

## ✅ Mobile Deployment Checklist

- [ ] GitHub account created
- [ ] Repository created & files uploaded
- [ ] Codespaces opened successfully
- [ ] `npm install` completed
- [ ] Scraper ran (`python3 scraper.py`)
- [ ] Deploy succeeded (`npm run deploy`)
- [ ] GitHub Pages enabled
- [ ] Site loads at github.io URL
- [ ] Tested vehicle selector
- [ ] Tested tuning calculator

---

## 🎉 Success!

Once deployed, share your link:
```
https://YOUR-USERNAME.github.io/gt7-tuning-lab
```

Anyone can now use your GT7 tuning calculator!

**Questions?** Open an issue on GitHub or check the full README.md

Happy racing! 🏎️💨
