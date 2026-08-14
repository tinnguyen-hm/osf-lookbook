# OSF Lookbook

A GitHub Pages site for OSF to review the Fall Engagement Campaign assets, built the same way as `hike-lookbook`. Each asset gets its own page with a no-login comment box so OSF can leave feedback directly.

## What's in here

```
osf-lookbook/
├── index.html              (hub — links to every asset)
├── newsletter.html
├── website-listing.html
├── benefit-portal.html
├── flyer.html
├── table-tent.html
├── internal-posts.html
├── powerpoint.html
├── emails.html
├── mailer.html
├── sms.html
├── css/style.css
├── js/comments.js          (comment widget — don't need to edit)
├── js/comments-config.js   (paste your Apps Script URL here)
└── apps-script/Code.gs     (paste into Google Apps Script)
```

## 1. Set up commenting (Google Sheet + Apps Script)

This gives OSF reviewers a simple "name + comment" box on every page — no Google or GitHub account required. Comments land in a Sheet you own.

1. Create a new Google Sheet (sheets.new). Name it whatever you like, e.g. "OSF Lookbook Comments".
2. In the Sheet, go to **Extensions → Apps Script**.
3. Delete the placeholder code and paste in the contents of `apps-script/Code.gs`.
4. Click **Deploy → New deployment**.
   - Select type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, authorize the script when prompted (it's your own script, so this is safe — it only touches this one Sheet).
6. Copy the **Web app URL** you're given (ends in `/exec`).
7. Open `js/comments-config.js` in this folder and replace the placeholder with that URL:
   ```js
   window.COMMENTS_ENDPOINT = "https://script.google.com/macros/s/XXXXXXXX/exec";
   ```
8. Save. Comments will now read/write to a "Comments" tab that the script creates automatically in your Sheet the first time it runs.

If you ever need to update the script later, redeploy as the *same* deployment (Deploy → Manage deployments → Edit → New version) so the URL doesn't change.

**Status: done.** This site's backend is already deployed and wired up — `js/comments-config.js` points at the live Apps Script URL, and comments are stored in the "OSF Lookbook Comments" Google Sheet.

## 2. Push to GitHub Pages

From this folder:

```bash
git init
git add .
git commit -m "OSF lookbook site"
git branch -M main
git remote add origin https://github.com/<your-username>/osf-lookbook.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Source: Deploy from branch → Branch: main / (root)**. Your site will be live in a minute or two at:

```
https://<your-username>.github.io/osf-lookbook/
```

## 3. Share with OSF

Once the Apps Script URL is wired up and the site is pushed, send OSF the hub link:

```
https://tinnguyen-hm.github.io/osf-lookbook/index.html
```

They can click into any asset and leave feedback right on the page — no account needed. Every comment shows up as a new row in your Google Sheet (with the page name, so you know which asset it's about), and also reappears on the page itself for anyone else reviewing.

## Notes

- Each asset page is a coded HTML/CSS recreation of the current OSF Claude Design files, matching the copy and layout as of this review round. If you make further edits in Claude Design, you'll want to mirror those changes here manually (or ask Claude to update the corresponding page).
- The comment widget posts as `text/plain` (not `application/json`) on purpose — this avoids a CORS preflight request that Apps Script Web Apps don't handle well.
- No comment moderation is built in. If you want to hide/delete a comment, just delete its row in the Sheet.
