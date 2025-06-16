# Convert password to secure string
$securePassword = ConvertTo-SecureString "StrongPassword123" -AsPlainText -Force
$credentials = New-Object System.Management.Automation.PSCredential("manageuser", $securePassword)

# Build the frontend
Set-Location frontend
npm run build

# Create deployment directory on NAS
$nasPath = "/volume2/video/Projects/IamHereApp"
$sshCommand = "mkdir -p $nasPath"
$sshSession = New-PSSession -HostName "192.168.1.17" -Credential $credentials
Invoke-Command -Session $sshSession -ScriptBlock { param($path) mkdir -p $path } -ArgumentList $nasPath

# Copy frontend build
$frontendBuildPath = "build/*"
Copy-Item -Path $frontendBuildPath -Destination "/tmp/frontend" -Recurse
Copy-Item -Path "/tmp/frontend/*" -Destination "$nasPath/" -ToSession $sshSession -Recurse

# Copy backend files
Set-Location ../backend
$backendPath = "$nasPath/backend"
Copy-Item -Path * -Destination "/tmp/backend" -Recurse
Copy-Item -Path "/tmp/backend/*" -Destination "$backendPath/" -ToSession $sshSession -Recurse

# Copy package files
Set-Location ..
Copy-Item -Path "package.json" -Destination "$nasPath/" -ToSession $sshSession
Copy-Item -Path "package-lock.json" -Destination "$nasPath/" -ToSession $sshSession

# Install dependencies and start the application
$installCommand = {
    param($path)
    cd $path
    npm install
    cd backend
    npm install
    pm2 start app.js --name arrived-app
}

Invoke-Command -Session $sshSession -ScriptBlock $installCommand -ArgumentList $nasPath

# Clean up
Remove-PSSession $sshSession 