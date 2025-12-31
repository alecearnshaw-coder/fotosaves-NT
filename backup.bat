@echo off
echo ============================================
echo   FOTOSAVES-NT BACKUP SCRIPT
echo ============================================
echo.
echo Source:      E:\fotosaves-nt
echo Destination: X:\BU\Mis Webs\fotosaves-nt
echo.
echo Excluding: node_modules, .next, .git, *.log
echo.
echo Starting backup...
echo.

robocopy "E:\fotosaves-nt" "X:\BU\Mis Webs\fotosaves-nt" /MIR /XD node_modules .next .git /XF *.log

echo.
echo ============================================
echo   BACKUP COMPLETE
echo ============================================
echo.
echo Exit code: %ERRORLEVEL%
echo   (0-7 = Success, 8+ = Error)
echo.
pause

