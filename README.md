# Warehouse Scheduler Dashboard

A modern, responsive web dashboard for the Warehouse Scheduler system that displays daily schedules, employee information, and provides WMS integration capabilities.

## Features

### 📊 **Schedule Display**
- **Today's Schedule**: Shows current day's forecast data, required staff, and assigned employees
- **Tomorrow's Schedule**: Displays next day's scheduling information
- **Real-time Updates**: Refresh button to get latest data
- **Forecast Metrics**: Shipping pallets, incoming pallets, cases to pick, staged pallets

### 👥 **Employee Management**
- **Complete Employee List**: View all employees from the database
- **Search & Filter**: Real-time search through employees by name, ID, department, job title, or skills
- **Status Indicators**: Visual status badges for active, inactive, and on-leave employees
- **Employee Details**: Comprehensive information including skills, department, and contact details

### 🔐 **WMS Integration**
- **WMS Login Button**: Redirects users to the WMS login page
- **Authorization Flow**: Handles authentication tokens for secure API access
- **Seamless Integration**: Uses WMS credentials to run scheduler operations

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Beautiful Interface**: Modern gradient backgrounds and card-based layout
- **Interactive Elements**: Hover effects, smooth animations, and loading states
- **Status Messages**: Real-time feedback for user actions
- **Work Progress Indicators**: Professional loading experience with step-by-step progress tracking

## Getting Started

### Prerequisites
- Python 3.7+
- FastAPI
- ChromaDB
- Required Python packages (see `requirements.txt`)

## 🚀 **Deployment to Vercel**

### Quick Deploy
1. **Push to Git**: Commit and push your changes
2. **Deploy Script**: Run `./deploy.sh` (Linux/Mac) or `deploy.bat` (Windows)
3. **Manual Deploy**: Use Vercel Dashboard or CLI

### Configuration
- **`vercel.json`**: Routing configuration for dashboard and API
- **`index.py`**: Vercel entry point (imports from main.py)
- **`requirements-vercel.txt`**: Vercel-compatible dependencies
- **Environment Variables**: Set in Vercel Dashboard

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Installation

1. **Clone the repository** (if not already done)
2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the API server**:
   ```bash
   python main.py --api 8000
   ```

4. **Access the dashboard**:
   - Open your browser and navigate to: `http://localhost:8000/dashboard`
   - The API documentation is available at: `http://localhost:8000/docs`

## Usage

### Dashboard Navigation

1. **Header Section**
   - **WMS Login Button**: Click to redirect to WMS login page
   - **Refresh Button**: Manually refresh dashboard data
   - **Keyboard Shortcut**: Press `Ctrl+R` to refresh

2. **Schedule Cards**
   - **Today's Schedule**: Current day information
   - **Tomorrow's Schedule**: Next day planning
   - Each card shows forecast data, required staff, and assigned employees

3. **Employees Section**
   - **Search Bar**: Type to filter employees in real-time
   - **Employee List**: Scrollable list with detailed information
   - **Status Badges**: Color-coded employee status indicators

### WMS Integration

1. **Click WMS Login Button**
   - Redirects to your WMS system login page
   - Authenticate with your WMS credentials

2. **Authorization Flow**
   - After successful login, WMS redirects back with auth token
   - Dashboard automatically captures and stores the token
   - Token is used for subsequent API calls

3. **Running Scheduler**
   - With valid WMS token, scheduler can access WMS data
   - Enhanced scheduling with real-time WMS information

### API Endpoints

- **`/dashboard`**: Main dashboard page
- **`/api/schedule`**: Get scheduling data
- **`/api/employees`**: Get all employees
- **`/api/scheduled-employees/{date}`**: Get scheduled employees for specific date

## Configuration

### WMS Integration Setup

1. **Update WMS Login URL**:
   In `static/dashboard.js`, modify the `wmsLoginUrl` variable:
   ```javascript
   const wmsLoginUrl = 'https://your-actual-wms-system.com/login';
   ```

2. **Configure WMS Callback**:
   Set up your WMS system to redirect back to the dashboard with an auth token:
   ```
   http://localhost:8000/dashboard?auth_token=YOUR_TOKEN
   ```

3. **Customize Authorization Headers**:
   Modify the `runSchedulerWithWMSAuth` method to match your WMS API requirements.

### Styling Customization

The dashboard uses CSS custom properties and can be easily customized:
- **Colors**: Modify CSS variables in `dashboard.css`
- **Layout**: Adjust grid layouts and spacing
- **Typography**: Change fonts and text styling

## File Structure

```
static/
├── dashboard.html      # Main dashboard HTML
├── dashboard.css       # Dashboard styling
└── dashboard.js        # Dashboard functionality

main.py                 # FastAPI application with dashboard endpoints
database.py             # Database operations
models.py               # Data models
requirements.txt        # Python dependencies
```

## Browser Support

- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

## Troubleshooting

### Common Issues

1. **Dashboard Not Loading**
   - Check if the API server is running
   - Verify the server is accessible at the correct port
   - Check browser console for JavaScript errors

2. **Data Not Displaying**
   - Ensure the database has employee and schedule data
   - Check API endpoints are responding correctly
   - Verify CORS settings if accessing from different domain

3. **WMS Integration Issues**
   - Confirm WMS login URL is correct
   - Check WMS callback configuration
   - Verify authentication token format

### Debug Mode

Enable debug logging by checking the browser console for detailed error messages and API responses.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the troubleshooting section
- Review API documentation at `/docs`
- Open an issue in the repository

---

**Note**: This dashboard is designed to work with the existing Warehouse Scheduler system. Ensure all backend services are properly configured and running before using the dashboard.
