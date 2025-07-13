@echo off
echo Starting GoDaddy Repository Viewer...

echo Starting Go backend...
cd src
go mod tidy
start /B go run main.go

timeout /t 3 /nobreak > nul

echo Starting React frontend...
cd ..\frontend
call npm install
call npm start

pause
