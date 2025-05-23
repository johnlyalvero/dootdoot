# test_epic2.ps1
<#
.SYNOPSIS
  Automated tests for EPIC 2: Task, Test & Session management on Windows PowerShell.
.DESCRIPTION
  Uses a single WebSession to preserve cookies across requests.
#>

# Configuration
$baseUrl  = 'http://localhost/dootdoot/api'
$username = 'testuser'
$password = 'Pwd123!'
$session  = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Write-Host "=== EPIC 2 Automated Tests ===`n"

# 1) Login (US2)
Write-Host ">> Login"
$loginBody = @{ username = $username; password = $password } | ConvertTo-Json
try {
    $loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login.php" `
        -Method Post -ContentType 'application/json' `
        -Body $loginBody -WebSession $session
    Write-Host "Login Response:" ($loginRes | ConvertTo-Json -Depth 2)
} catch {
    Write-Error "Login failed: $_"
    exit 1
}

# 2) US4 – Create Task
Write-Host "`n>> US4: Create Task"
$taskBody = @{ title = 'Test Task'; description = 'EPIC2 automated'; due_date = '2025-06-15'; is_test = 0 } | ConvertTo-Json
try {
    $taskRes = Invoke-RestMethod -Uri "$baseUrl/tasks/add.php" `
        -Method Post -ContentType 'application/json' `
        -Body $taskBody -WebSession $session
    Write-Host "Create Task Response:" ($taskRes | ConvertTo-Json -Depth 2)
    $taskId = $taskRes.task_id
} catch {
    Write-Error "Create Task failed: $_"
}

# 3) US5 – Create Test (auto sessions)
Write-Host "`n>> US5: Create Test (auto sessions)"
$testBody = @{ title = 'AutoTest'; description = 'Verifica auto'; due_date = '2025-06-20'; is_test = 1 } | ConvertTo-Json
try {
    $testRes = Invoke-RestMethod -Uri "$baseUrl/tasks/add.php" `
        -Method Post -ContentType 'application/json' `
        -Body $testBody -WebSession $session
    Write-Host "Create Test Response:" ($testRes | ConvertTo-Json -Depth 2)
    $testId = $testRes.task_id
} catch {
    Write-Error "Create Test failed: $_"
}

# 4) US6 – List Tasks & Sessions
Write-Host "`n>> US6: List Tasks & Sessions"
try {
    $listRes = Invoke-RestMethod -Uri "$baseUrl/tasks/list.php" `
        -Method Get -WebSession $session
    Write-Host "List Response:" ($listRes | ConvertTo-Json -Depth 4)
} catch {
    Write-Error "List failed: $_"
}

# 5) US7 – Update Task
Write-Host "`n>> US7: Update Task"
if ($taskId) {
    $updateBody = @{ id = $taskId; title = 'Updated Task'; completed = 1 } | ConvertTo-Json
    try {
        $updateRes = Invoke-RestMethod -Uri "$baseUrl/tasks/update.php" `
            -Method Put -ContentType 'application/json' `
            -Body $updateBody -WebSession $session
        Write-Host "Update Task Response:" ($updateRes | ConvertTo-Json -Depth 2)
    } catch {
        Write-Error "Update Task failed: $_"
    }
} else {
    Write-Warning "Skipping Update Task: no taskId"
}

# 6) US7 – Delete Test Task
Write-Host "`n>> US7: Delete Test Task"
if ($testId) {
    $delTestBody = @{ id = $testId } | ConvertTo-Json
    try {
        $delTestRes = Invoke-RestMethod -Uri "$baseUrl/tasks/delete.php" `
            -Method Delete -ContentType 'application/json' `
            -Body $delTestBody -WebSession $session
        Write-Host "Delete Test Response:" ($delTestRes | ConvertTo-Json -Depth 2)
    } catch {
        Write-Error "Delete Test failed: $_"
    }
} else {
    Write-Warning "Skipping Delete Test: no testId"
}

# 7) US7 – Update Session
Write-Host "`n>> US7: Update Session"
if ($testId -and $listRes.tasks) {
    $sessionObj = $listRes.tasks | Where-Object { $_.id -eq $testId } | Select-Object -ExpandProperty sessions | Select-Object -First 1
    if ($sessionObj) {
        $sessionId = $sessionObj.id
        $updateSesBody = @{ id = $sessionId; notes = 'Automated debug note' } | ConvertTo-Json
        try {
            $updSesRes = Invoke-RestMethod -Uri "$baseUrl/sessions/update.php" `
                -Method Put -ContentType 'application/json' `
                -Body $updateSesBody -WebSession $session
            Write-Host "Update Session Response:" ($updSesRes | ConvertTo-Json -Depth 2)
        } catch {
            Write-Error "Update Session failed: $_"
        }
    } else {
        Write-Warning "No session found to update"
    }
} else {
    Write-Warning "Skipping Update Session: prerequisites missing"
}

# 8) US7 – Delete Session
Write-Host "`n>> US7: Delete Session"
if ($sessionId) {
    $delSesBody = @{ id = $sessionId } | ConvertTo-Json
    try {
        $delSesRes = Invoke-RestMethod -Uri "$baseUrl/sessions/delete.php" `
            -Method Delete -ContentType 'application/json' `
            -Body $delSesBody -WebSession $session
        Write-Host "Delete Session Response:" ($delSesRes | ConvertTo-Json -Depth 2)
    } catch {
        Write-Error "Delete Session failed: $_"
    }
} else {
    Write-Warning "Skipping Delete Session: no sessionId"
}

Write-Host "`n=== EPIC 2 Tests Completed ==="
