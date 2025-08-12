// Dashboard JavaScript functionality
class WarehouseDashboard {
    constructor() {
        this.apiBase = window.location.origin;
        this.employees = [];
        this.filteredEmployees = [];
        this.scheduleData = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDateDisplays();
        this.loadDashboardData();
    }

    setupEventListeners() {
        // WMS Login button
        document.getElementById('wmsLoginBtn').addEventListener('click', () => {
            this.redirectToWMS();
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadDashboardData();
        });

        // Employee search
        const searchInput = document.getElementById('employeeSearch');
        searchInput.addEventListener('input', (e) => {
            this.filterEmployees(e.target.value);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.loadDashboardData();
            }
        });
    }

    setDateDisplays() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayFormatted = today.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const tomorrowFormatted = tomorrow.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        document.getElementById('todayDate').textContent = todayFormatted;
        document.getElementById('tomorrowDate').textContent = tomorrowFormatted;
    }

    async loadDashboardData() {
        try {
            this.showWorkProgress();
            this.updateProgressStatus('Initializing system...', 0);
            
            // Step 1: Database Connection
            this.updateProgressStep(1, 'active');
            this.updateProgressStatus('Connecting to database...', 25);
            await this.delay(500);
            
            // Step 2: Load employees
            this.updateProgressStep(1, 'completed');
            this.updateProgressStep(2, 'active');
            this.updateProgressStatus('Loading employee data...', 50);
            await this.loadEmployees();
            
            // Step 3: Load schedule data
            this.updateProgressStep(2, 'completed');
            this.updateProgressStep(3, 'active');
            this.updateProgressStatus('Generating schedules...', 75);
            await this.loadScheduleData();
            
            // Step 4: Complete
            this.updateProgressStep(3, 'completed');
            this.updateProgressStep(4, 'active');
            this.updateProgressStatus('Finalizing data...', 90);
            await this.delay(300);
            
            this.updateProgressStep(4, 'completed');
            this.updateProgressStatus('Dashboard ready!', 100);
            
            setTimeout(() => {
                this.hideWorkProgress();
            }, 1500);
            
            this.showStatusMessage('Dashboard data loaded successfully!', 'success');
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.updateProgressStatus('Error occurred', 0);
            this.showStatusMessage('Error loading dashboard data', 'error');
        }
    }

    async loadScheduleData() {
        try {
            const response = await fetch(`${this.apiBase}/api/schedule`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.success && data.data) {
                this.scheduleData = data.data;
                this.displayScheduleData();
            } else {
                throw new Error('Invalid schedule data received');
            }
        } catch (error) {
            console.error('Error loading schedule data:', error);
            this.showStatusMessage('Error loading schedule data', 'error');
        }
    }

    async loadEmployees() {
        try {
            const response = await fetch(`${this.apiBase}/api/employees`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.success && data.data) {
                this.employees = data.data.employees;
                this.filteredEmployees = [...this.employees];
                this.displayEmployees();
                this.updateEmployeeCount();
            } else {
                throw new Error('Invalid employee data received');
            }
        } catch (error) {
            console.error('Error loading employees:', error);
            this.showStatusMessage('Error loading employees', 'error');
        }
    }

    displayScheduleData() {
        if (!this.scheduleData) return;

        // Display today's schedule (assuming it's the first day in the data)
        const todayData = this.scheduleData.tomorrow || this.scheduleData.day_after;
        if (todayData) {
            this.displayDaySchedule(todayData, 'today');
        }

        // Display tomorrow's schedule
        const tomorrowData = this.scheduleData.day_after || this.scheduleData.tomorrow;
        if (tomorrowData) {
            this.displayDaySchedule(tomorrowData, 'tomorrow');
        }
    }

    displayDaySchedule(dayData, dayType) {
        const prefix = dayType === 'tomorrow' ? 'tomorrow' : '';
        
        // Display forecast data
        if (dayData.forecast_data) {
            const forecast = dayData.forecast_data;
            if (prefix) {
                document.getElementById(`${prefix}ShippingPallets`).textContent = forecast.shipping_pallets?.toFixed(1) || '-';
                document.getElementById(`${prefix}IncomingPallets`).textContent = forecast.incoming_pallets?.toFixed(1) || '-';
                document.getElementById(`${prefix}CasesToPick`).textContent = forecast.cases_to_pick?.toFixed(1) || '-';
                document.getElementById(`${prefix}StagedPallets`).textContent = forecast.staged_pallets?.toFixed(1) || '-';
            } else {
                document.getElementById('shippingPallets').textContent = forecast.shipping_pallets?.toFixed(1) || '-';
                document.getElementById('incomingPallets').textContent = forecast.incoming_pallets?.toFixed(1) || '-';
                document.getElementById('casesToPick').textContent = forecast.cases_to_pick?.toFixed(1) || '-';
                document.getElementById('stagedPallets').textContent = forecast.staged_pallets?.toFixed(1) || '-';
            }
        }

        // Display required staff
        if (dayData.required_roles) {
            this.displayRequiredStaff(dayData.required_roles, prefix);
        }

        // Display assigned employees
        if (dayData.assigned_employees) {
            this.displayAssignedEmployees(dayData.assigned_employees, prefix);
        }

        // Show content and hide loading
        const contentId = prefix ? `${prefix}Content` : 'scheduleContent';
        const loadingId = prefix ? `${prefix}Loading` : 'scheduleLoading';
        
        document.getElementById(loadingId).style.display = 'none';
        document.getElementById(contentId).style.display = 'block';
    }

    displayRequiredStaff(requiredRoles, prefix) {
        const containerId = prefix ? `${prefix}RequiredStaff` : 'requiredStaff';
        const container = document.getElementById(containerId);
        
        container.innerHTML = '';
        
        Object.entries(requiredRoles).forEach(([role, count]) => {
            const staffItem = document.createElement('div');
            staffItem.className = 'staffing-item';
            staffItem.innerHTML = `
                <span class="role">${this.formatRoleName(role)}</span>
                <span class="count">${count}</span>
            `;
            container.appendChild(staffItem);
        });
    }

    displayAssignedEmployees(assignedEmployees, prefix) {
        const containerId = prefix ? `${prefix}AssignedEmployees` : 'assignedEmployees';
        const container = document.getElementById(containerId);
        
        container.innerHTML = '';
        
        Object.entries(assignedEmployees).forEach(([role, employeeIds]) => {
            employeeIds.forEach(employeeId => {
                const employee = this.employees.find(emp => emp.id === employeeId);
                const employeeName = employee ? employee.name : employeeId;
                
                const assignedItem = document.createElement('div');
                assignedItem.className = 'assigned-item';
                assignedItem.innerHTML = `
                    <div class="employee-info">
                        <span class="employee-name">${employeeName}</span>
                        <span class="employee-role">${this.formatRoleName(role)}</span>
                    </div>
                `;
                container.appendChild(assignedItem);
            });
        });
    }

    displayEmployees() {
        const container = document.getElementById('employeesList');
        container.innerHTML = '';
        
        this.filteredEmployees.forEach(employee => {
            const employeeItem = document.createElement('div');
            employeeItem.className = 'employee-item';
            
            const statusClass = this.getEmployeeStatusClass(employee);
            const statusText = this.getEmployeeStatusText(employee);
            
            employeeItem.innerHTML = `
                <div class="employee-header">
                    <span class="employee-name">${employee.name}</span>
                    <span class="employee-status ${statusClass}">${statusText}</span>
                </div>
                <div class="employee-details">
                    <div class="detail-item">
                        <span class="detail-label">ID:</span>
                        <span>${employee.id}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Department:</span>
                        <span>${employee.department || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Job Title:</span>
                        <span>${employee.job_title || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Skills:</span>
                        <span>${employee.skills || 'N/A'}</span>
                    </div>
                </div>
            `;
            
            container.appendChild(employeeItem);
        });
        
        // Show content and hide loading
        document.getElementById('employeesLoading').style.display = 'none';
        document.getElementById('employeesContent').style.display = 'block';
    }

    filterEmployees(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredEmployees = [...this.employees];
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredEmployees = this.employees.filter(employee => 
                employee.name.toLowerCase().includes(term) ||
                employee.id.toLowerCase().includes(term) ||
                (employee.department && employee.department.toLowerCase().includes(term)) ||
                (employee.job_title && employee.job_title.toLowerCase().includes(term)) ||
                (employee.skills && employee.skills.toLowerCase().includes(term))
            );
        }
        
        this.displayEmployees();
        this.updateEmployeeCount();
    }

    updateEmployeeCount() {
        const countElement = document.getElementById('employeeCount');
        countElement.textContent = this.filteredEmployees.length;
    }

    getEmployeeStatusClass(employee) {
        if (employee.on_leave) return 'status-leave';
        if (!employee.active) return 'status-inactive';
        return 'status-active';
    }

    getEmployeeStatusText(employee) {
        if (employee.on_leave) return 'On Leave';
        if (!employee.active) return 'Inactive';
        return 'Active';
    }

    formatRoleName(role) {
        return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    redirectToWMS() {
        // This would typically redirect to your WMS login page
        // For now, we'll show a message and simulate the redirect
        this.showStatusMessage('Redirecting to WMS login...', 'info');
        
        // You can replace this URL with your actual WMS login page
        const wmsLoginUrl = 'https://unis.item.com/';
        
        // Store current page state for return
        sessionStorage.setItem('dashboardState', JSON.stringify({
            timestamp: Date.now(),
            returnUrl: window.location.href
        }));
        
        // Redirect to WMS login
        setTimeout(() => {
            window.open(wmsLoginUrl, '_blank');
            // Or use window.location.href = wmsLoginUrl; for same tab
        }, 1000);
    }

    showWorkProgress() {
        const container = document.getElementById('workProgressContainer');
        container.style.display = 'block';
    }

    hideWorkProgress() {
        const container = document.getElementById('workProgressContainer');
        container.style.display = 'none';
    }

    updateProgressStatus(status, percentage) {
        const statusElement = document.getElementById('progressStatus');
        const fillElement = document.getElementById('progressFill');
        
        statusElement.textContent = status;
        fillElement.style.width = `${percentage}%`;
    }

    updateProgressStep(stepNumber, state) {
        const stepElement = document.getElementById(`step${stepNumber}`);
        if (stepElement) {
            stepElement.className = `step ${state}`;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showStatusMessage(message, type = 'info') {
        const statusElement = document.getElementById('statusMessage');
        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
        statusElement.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 5000);
    }

    // Method to handle WMS authentication callback
    handleWMSAuthCallback(authToken) {
        if (authToken) {
            // Store the auth token
            localStorage.setItem('wmsAuthToken', authToken);
            this.showStatusMessage('WMS authentication successful!', 'success');
            
            // Now you can use this token for API calls
            this.runSchedulerWithWMSAuth(authToken);
        }
    }

    async runSchedulerWithWMSAuth(authToken) {
        try {
            this.showStatusMessage('Running scheduler with WMS authorization...', 'info');
            
            // Make API call with WMS auth token
            const response = await fetch(`${this.apiBase}/api/schedule`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.showStatusMessage('Scheduler completed successfully!', 'success');
                
                // Refresh dashboard data
                this.loadDashboardData();
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error running scheduler with WMS auth:', error);
            this.showStatusMessage('Error running scheduler', 'error');
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new WarehouseDashboard();
    
    // Check for WMS auth callback
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('auth_token');
    if (authToken) {
        window.dashboard.handleWMSAuthCallback(authToken);
    }
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WarehouseDashboard;
}
