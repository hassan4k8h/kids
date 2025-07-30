@echo off
echo Pushing TypeScript fix to GitHub...

REM Add all changes
git add .

REM Commit the fix
git commit -m "Fix TypeScript error: Change const to let for userData reassignment

- Fixed TS2588 error in AuthService.ts line 114
- Changed const to let for userData destructuring
- Build now passes successfully for Netlify deployment
- Resolved: Cannot assign to 'userData' because it is a constant"

REM Push to GitHub
git push origin main

echo.
echo SUCCESS! TypeScript fix pushed to GitHub
echo Netlify should now build successfully
echo Visit: https://github.com/hassan4k8h/kids
pause