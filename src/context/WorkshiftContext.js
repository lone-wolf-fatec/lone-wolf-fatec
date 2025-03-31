import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const WorkshiftContext = createContext();

// Create a custom hook to use the context
export const useWorkshift = () => useContext(WorkshiftContext);

// Create the provider component
export const WorkshiftProvider = ({ children }) => {
  // State for workshift data
  const [workshifts, setWorkshifts] = useState([]);
  const [employeesByWorkshift, setEmployeesByWorkshift] = useState({});
  
  // Load data from localStorage on component mount
  useEffect(() => {
    // Load workshifts
    const storedWorkshifts = localStorage.getItem('jornadas');
    if (storedWorkshifts) {
      try {
        const parsedWorkshifts = JSON.parse(storedWorkshifts);
        if (Array.isArray(parsedWorkshifts)) {
          setWorkshifts(parsedWorkshifts);
        }
      } catch (error) {
        console.error('Error loading workshifts from localStorage:', error);
      }
    }
    
    // Load employees by workshift
    const storedEmployeesByWorkshift = localStorage.getItem('funcionariosPorJornada');
    if (storedEmployeesByWorkshift) {
      try {
        const parsedEmployeesByWorkshift = JSON.parse(storedEmployeesByWorkshift);
        if (parsedEmployeesByWorkshift && typeof parsedEmployeesByWorkshift === 'object') {
          setEmployeesByWorkshift(parsedEmployeesByWorkshift);
        }
      } catch (error) {
        console.error('Error loading employees by workshift from localStorage:', error);
      }
    }
  }, []);
  
  // Save data to localStorage when it changes
  useEffect(() => {
    if (workshifts.length > 0) {
      localStorage.setItem('jornadas', JSON.stringify(workshifts));
    }
  }, [workshifts]);
  
  useEffect(() => {
    if (Object.keys(employeesByWorkshift).length > 0) {
      localStorage.setItem('funcionariosPorJornada', JSON.stringify(employeesByWorkshift));
    }
  }, [employeesByWorkshift]);
  
  // Function to get workshift data for a specific employee
  const getEmployeeWorkshift = (employeeName) => {
    if (!employeeName) return null;
    
    // Find the workshift ID for this employee
    let workshiftId = null;
    
    for (const [id, employees] of Object.entries(employeesByWorkshift)) {
      if (Array.isArray(employees) && employees.includes(employeeName)) {
        workshiftId = parseInt(id);
        break;
      }
    }
    
    if (workshiftId === null) return null;
    
    // Find the workshift data
    const workshiftData = workshifts.find(w => w.id === workshiftId);
    return workshiftData || null;
  };
  
  // Function to add or update workshift
  const updateWorkshift = (workshift) => {
    setWorkshifts(prev => {
      const exists = prev.some(w => w.id === workshift.id);
      if (exists) {
        return prev.map(w => w.id === workshift.id ? workshift : w);
      } else {
        return [...prev, workshift];
      }
    });
  };
  
  // Function to add or remove employee from workshift
  const updateEmployeeWorkshift = (employeeName, workshiftId) => {
    // First, remove the employee from any existing workshifts
    const newEmployeesByWorkshift = { ...employeesByWorkshift };
    
    for (const id in newEmployeesByWorkshift) {
      if (Array.isArray(newEmployeesByWorkshift[id]) && newEmployeesByWorkshift[id].includes(employeeName)) {
        newEmployeesByWorkshift[id] = newEmployeesByWorkshift[id].filter(name => name !== employeeName);
      }
    }
    
    // Then, add the employee to the new workshift if provided
    if (workshiftId) {
      if (!newEmployeesByWorkshift[workshiftId]) {
        newEmployeesByWorkshift[workshiftId] = [];
      }
      if (!newEmployeesByWorkshift[workshiftId].includes(employeeName)) {
        newEmployeesByWorkshift[workshiftId] = [...newEmployeesByWorkshift[workshiftId], employeeName];
      }
    }
    
    setEmployeesByWorkshift(newEmployeesByWorkshift);
  };
  
  // Function to render days of week
  const renderWorkDays = (days) => {
    const dayNames = {
      0: 'Dom',
      1: 'Seg',
      2: 'Ter',
      3: 'Qua',
      4: 'Qui',
      5: 'Sex',
      6: 'Sáb'
    };
    
    if (!days || days.length === 0) return 'Escala especial';
    if (days.length === 7) return 'Todos os dias';
    
    if (days.length === 5 && days.includes(1) && days.includes(2) && 
        days.includes(3) && days.includes(4) && days.includes(5)) {
      return 'Segunda a Sexta';
    }
    
    if (days.length === 6 && days.includes(1) && days.includes(2) && 
        days.includes(3) && days.includes(4) && days.includes(5) && days.includes(6)) {
      return 'Segunda a Sábado';
    }
    
    return days.map(day => dayNames[day]).join(', ');
  };
  
  const value = {
    workshifts,
    employeesByWorkshift,
    getEmployeeWorkshift,
    updateWorkshift,
    updateEmployeeWorkshift,
    renderWorkDays
  };
  
  return (
    <WorkshiftContext.Provider value={value}>
      {children}
    </WorkshiftContext.Provider>
  );
};

export default WorkshiftProvider;