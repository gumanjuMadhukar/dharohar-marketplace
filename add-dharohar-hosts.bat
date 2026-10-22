@echo off
echo Adding dharohar.local to Windows hosts file...
findstr /i "dharohar.local" "%SystemRoot%\System32\drivers\etc\hosts" >nul
if %errorlevel% equ 0 (
    echo [OK] dharohar.local is already in hosts file!
) else (
    echo 127.0.0.1 dharohar.local api.dharohar.local >> "%SystemRoot%\System32\drivers\etc\hosts"
    echo [OK] Successfully added dharohar.local and api.dharohar.local to hosts!
)
pause

