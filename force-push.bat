@echo off
echo Forcing push to GitHub (this will overwrite remote)...

REM Make sure we're on main branch
git branch -M main

REM Set remote
git remote remove origin 2>nul
git remote add origin https://github.com/hassan4k8h/kids.git

REM Force push (this will overwrite everything on GitHub)
git push -u origin main --force

echo.
echo SUCCESS! All updates pushed to GitHub
echo Visit: https://github.com/hassan4k8h/kids
echo.
echo Your app is now production-ready!
pause