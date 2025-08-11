@echo off
echo Fixing branch and pushing to GitHub...

REM Check current branch
git branch

REM Rename master to main if needed
git branch -M main

REM Add remote if not exists
git remote remove origin 2>nul
git remote add origin https://github.com/hassan4k8h/kids.git

REM Push to main branch
git push -u origin main

echo.
echo SUCCESS! Check: https://github.com/hassan4k8h/kids
pause