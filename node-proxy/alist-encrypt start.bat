@echo off
cd /d %~dp0
powershell -command "Start-Process node.exe -ArgumentList 'app.js' -WindowStyle Hidden -Verb runAs"
exit
