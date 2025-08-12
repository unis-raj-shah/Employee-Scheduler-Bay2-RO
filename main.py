"""Main application for warehouse scheduler."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Dict, Any
import schedule_service
from database import save_scheduled_employees, get_scheduled_employees, delete_scheduled_employees, employee_collection

def calculate_total_staff(required_roles: Dict[str, Any]) -> int:
    """
    Calculate the total number of staff required across all operations.
    
    Args:
        required_roles: Dictionary containing required roles for all operations
        
    Returns:
        Total number of staff required
    """
    total = 0
    for operation, roles in required_roles.items():
        if isinstance(roles, dict):
            # Sum all role counts for this operation
            total += sum(roles.values())
        else:
            # Single number for this operation
            total += roles
    return total

# Initialize FastAPI app
app = FastAPI(
    title="Warehouse Scheduler API",
    description="API for calculating warehouse staffing requirements",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Mount static files for the dashboard
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/dashboard")
async def dashboard():
    """Serve the dashboard HTML page."""
    return FileResponse("static/dashboard.html")

@app.get("/api/employees")
async def get_all_employees() -> Dict[str, Any]:
    """
    Get all employees from the database.
    
    Returns:
        Dict containing all employee details.
    
    Raises:
        HTTPException: If there's an error retrieving employees.
    """
    try:
        all_employees = employee_collection.get()
        
        if not all_employees or not all_employees.get("metadatas"):
            return {
                'success': True,
                'data': {"employees": [], "total_count": 0}
            }
        
        employees = []
        for i, metadata in enumerate(all_employees["metadatas"]):
            employee = {
                "id": all_employees["ids"][i],
                "name": metadata.get("name", "Unknown"),
                "email": metadata.get("email", ""),
                "department": metadata.get("department", ""),
                "job_title": metadata.get("original_job_title", ""),
                "skills": metadata.get("skills", ""),
                "active": metadata.get("active", True),
                "on_leave": metadata.get("on_leave", False)
            }
            employees.append(employee)
        
        return {
            'success': True,
            'data': {
                "employees": employees,
                "total_count": len(employees)
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving employees: {str(e)}"
        )

@app.get("/")
async def root():
    try:
        # Run the scheduler
        schedule_result = schedule_service.run_scheduler()
        
        if not schedule_result:
            return {"error": "Failed to generate schedule"}
            
        tomorrow_data = schedule_result.get('tomorrow')
        day_after_data = schedule_result.get('day_after')
        
        if not tomorrow_data or not day_after_data:
            return {"error": "Invalid schedule data structure"}
        
        # Save scheduled employees to database for tomorrow
        tomorrow_saved = save_scheduled_employees(
            tomorrow_data['date'],
            tomorrow_data['day_name'],
            tomorrow_data['assigned_employees']
        )
        
        # Save scheduled employees to database for day after tomorrow
        day_after_saved = save_scheduled_employees(
            day_after_data['date'],
            day_after_data['day_name'],
            day_after_data['assigned_employees']
        )
        
        return {
            "message": "Schedule generated successfully",
            "tomorrow": tomorrow_data,
            "day_after": day_after_data,
            "database_saves": {
                "tomorrow_saved": tomorrow_saved,
                "day_after_saved": day_after_saved
            }
        }
        
    except Exception as e:
        print(f"Error in root endpoint: {str(e)}")
        return {"error": str(e)}

@app.get("/api/schedule")
async def get_schedule() -> Dict[str, Any]:
    """
    Get warehouse scheduling data for tomorrow.
    
    Returns:
        Dict containing scheduling data including required staff and forecast.
    
    Raises:
        HTTPException: If there's an error generating the schedule.
    """
    try:
        scheduling_data = schedule_service.run_scheduler()
        if not scheduling_data:
            raise HTTPException(
                status_code=404,
                detail="No scheduling data available for tomorrow"
            )
        
        # Save scheduled employees to database
        tomorrow_data = scheduling_data.get('tomorrow', {})
        day_after_data = scheduling_data.get('day_after', {})
        
        saves_successful = {}
        if tomorrow_data:
            saves_successful['tomorrow'] = save_scheduled_employees(
                tomorrow_data['date'],
                tomorrow_data['day_name'],
                tomorrow_data['assigned_employees']
            )
        
        if day_after_data:
            saves_successful['day_after'] = save_scheduled_employees(
                day_after_data['date'],
                day_after_data['day_name'],
                day_after_data['assigned_employees']
            )
        
        return {
            'success': True,
            'data': scheduling_data,
            'database_saves': saves_successful
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating schedule: {str(e)}"
        )

@app.get("/api/scheduled-employees/{date}")
async def get_scheduled_employees_by_date(date: str) -> Dict[str, Any]:
    """
    Get scheduled employees for a specific date.
    
    Args:
        date: Date in YYYY-MM-DD format
        
    Returns:
        Dict containing scheduled employee details for the specified date.
    
    Raises:
        HTTPException: If there's an error retrieving the scheduled employees.
    """
    try:
        scheduled_data = get_scheduled_employees(date)
        
        return {
            'success': True,
            'data': scheduled_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving scheduled employees: {str(e)}"
        )

# Vercel deployment - CLI interface removed