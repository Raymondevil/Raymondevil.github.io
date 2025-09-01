class InteractiveCalendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDates = new Set();
        this.selectionMode = 'multi'; // 'multi', 'range', 'work'
        this.rangeStart = null;
        this.rangeEnd = null;
        
        // Modo trabajo
        this.currentDayType = 'rest'; // 'rest', 'work', 'advance'
        this.workDays = new Map(); // dateString -> {type: 'rest'|'work'|'advance', value?: number}
        this.advanceValue = 300;
        
        this.monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
        this.updateSelectedDatesList();
        this.updateRangeInfo();
        this.updateWorkInfo();
    }

    bindEvents() {
        // Navegación entre meses
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.render();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.render();
        });

        // Ir a hoy
        document.getElementById('goToToday').addEventListener('click', () => {
            this.currentDate = new Date();
            this.render();
        });

        // Limpiar selección
        document.getElementById('clearSelection').addEventListener('click', () => {
            this.clearAllSelections();
        });

        // Cambio de modo
        document.getElementById('multiSelectMode').addEventListener('click', () => {
            this.setSelectionMode('multi');
        });

        document.getElementById('rangeSelectMode').addEventListener('click', () => {
            this.setSelectionMode('range');
        });

        document.getElementById('workSelectMode').addEventListener('click', () => {
            this.setSelectionMode('work');
        });

        // Controles modo trabajo
        document.getElementById('restDayType').addEventListener('click', () => {
            this.setCurrentDayType('rest');
        });

        document.getElementById('workDayType').addEventListener('click', () => {
            this.setCurrentDayType('work');
        });

        document.getElementById('advanceDayType').addEventListener('click', () => {
            this.setCurrentDayType('advance');
        });

        // Control valor adelanto
        document.getElementById('advanceValue').addEventListener('input', (e) => {
            this.advanceValue = parseInt(e.target.value) || 300;
            document.getElementById('advanceRate').textContent = this.advanceValue;
            this.updateWorkInfo();
        });
    }

    setSelectionMode(mode) {
        this.selectionMode = mode;
        this.clearAllSelections();
        
        // Actualizar botones activos
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        if (mode === 'multi') {
            document.getElementById('multiSelectMode').classList.add('active');
        } else if (mode === 'range') {
            document.getElementById('rangeSelectMode').classList.add('active');
        } else if (mode === 'work') {
            document.getElementById('workSelectMode').classList.add('active');
        }
        
        // Mostrar/ocultar información correspondiente
        document.querySelectorAll('.selection-info').forEach(info => info.classList.remove('active'));
        if (mode === 'multi') {
            document.getElementById('multiModeInfo').classList.add('active');
        } else if (mode === 'range') {
            document.getElementById('rangeModeInfo').classList.add('active');
        } else if (mode === 'work') {
            document.getElementById('workModeInfo').classList.add('active');
        }
        
        this.render();
    }

    setCurrentDayType(type) {
        this.currentDayType = type;
        
        // Actualizar botones activos
        document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(type + 'DayType').classList.add('active');
    }

    render() {
        this.updateHeader();
        this.generateCalendar();
    }

    updateHeader() {
        const monthYear = document.getElementById('monthYear');
        monthYear.textContent = `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }

    generateCalendar() {
        const daysContainer = document.getElementById('daysContainer');
        daysContainer.innerHTML = '';

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Primer día del mes
        const firstDay = new Date(year, month, 1);
        // Último día del mes
        const lastDay = new Date(year, month + 1, 0);
        
        // Primer día de la semana (lunes = 1, domingo = 0)
        let startDay = firstDay.getDay();
        if (startDay === 0) startDay = 7; // Convertir domingo a 7
        startDay = startDay - 1; // Ajustar para que lunes sea 0

        // Fecha de hoy
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
        const todayDate = today.getDate();

        // Agregar días del mes anterior para completar la primera semana
        const prevMonth = new Date(year, month, 0);
        const prevMonthDays = prevMonth.getDate();
        
        for (let i = startDay - 1; i >= 0; i--) {
            const dayElement = this.createDayElement(
                prevMonthDays - i, 
                false, 
                false, 
                new Date(year, month - 1, prevMonthDays - i)
            );
            dayElement.classList.add('other-month');
            daysContainer.appendChild(dayElement);
        }

        // Agregar días del mes actual
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const isToday = isCurrentMonth && day === todayDate;
            const currentDateObj = new Date(year, month, day);
            const dayElement = this.createDayElement(day, true, isToday, currentDateObj);
            daysContainer.appendChild(dayElement);
        }

        // Completar con días del siguiente mes
        const totalCells = daysContainer.children.length;
        const remainingCells = 42 - totalCells; // 6 semanas * 7 días
        
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = this.createDayElement(
                day, 
                false, 
                false, 
                new Date(year, month + 1, day)
            );
            dayElement.classList.add('other-month');
            daysContainer.appendChild(dayElement);
        }
    }

    createDayElement(dayNumber, isCurrentMonth, isToday, dateObj) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.textContent = dayNumber;

        if (isToday) {
            dayElement.classList.add('today');
        }

        const dateString = this.formatDateString(dateObj);

        if (this.selectionMode === 'multi') {
            // Modo selección múltiple
            if (this.selectedDates.has(dateString)) {
                dayElement.classList.add('selected');
            }
        } else if (this.selectionMode === 'range') {
            // Modo rango
            if (this.rangeStart && dateString === this.rangeStart) {
                dayElement.classList.add('range-start');
            }
            if (this.rangeEnd && dateString === this.rangeEnd) {
                dayElement.classList.add('range-end');
            }
            if (this.isInRange(dateObj)) {
                dayElement.classList.add('range-middle');
            }
        } else if (this.selectionMode === 'work') {
            // Modo trabajo
            const workDay = this.workDays.get(dateString);
            if (workDay) {
                if (workDay.type === 'rest') {
                    dayElement.classList.add('rest-day');
                } else if (workDay.type === 'work') {
                    dayElement.classList.add('work-day');
                } else if (workDay.type === 'advance') {
                    dayElement.classList.add('advance-day');
                }
            }
        }

        // Solo agregar evento de click para días del mes actual
        if (isCurrentMonth) {
            dayElement.addEventListener('click', () => {
                if (this.selectionMode === 'multi') {
                    this.toggleDateSelection(dateObj, dayElement);
                } else if (this.selectionMode === 'range') {
                    this.handleRangeSelection(dateObj);
                } else if (this.selectionMode === 'work') {
                    this.handleWorkSelection(dateObj);
                }
            });
        }

        return dayElement;
    }

    // Modo selección múltiple
    toggleDateSelection(dateObj, dayElement) {
        const dateString = this.formatDateString(dateObj);
        
        if (this.selectedDates.has(dateString)) {
            this.selectedDates.delete(dateString);
            dayElement.classList.remove('selected');
        } else {
            this.selectedDates.add(dateString);
            dayElement.classList.add('selected');
        }

        this.updateSelectedDatesList();
    }

    // Modo rango
    handleRangeSelection(dateObj) {
        const dateString = this.formatDateString(dateObj);
        
        if (!this.rangeStart) {
            // Primera selección - inicio del rango
            this.rangeStart = dateString;
            this.rangeEnd = null;
        } else if (!this.rangeEnd) {
            // Segunda selección - fin del rango
            const startDate = new Date(this.rangeStart);
            const endDate = new Date(dateString);
            
            if (endDate < startDate) {
                // Si la fecha de fin es anterior, intercambiar
                this.rangeEnd = this.rangeStart;
                this.rangeStart = dateString;
            } else {
                this.rangeEnd = dateString;
            }
        } else {
            // Ya hay un rango completo, iniciar nuevo rango
            this.rangeStart = dateString;
            this.rangeEnd = null;
        }
        
        this.render();
        this.updateRangeInfo();
    }

    // Modo trabajo
    handleWorkSelection(dateObj) {
        const dateString = this.formatDateString(dateObj);
        const currentWorkDay = this.workDays.get(dateString);

        if (currentWorkDay && currentWorkDay.type === this.currentDayType) {
            // Si ya es el mismo tipo, deseleccionar
            this.workDays.delete(dateString);
        } else {
            // Agregar o cambiar tipo
            const workDayData = { type: this.currentDayType };
            if (this.currentDayType === 'advance') {
                workDayData.value = this.advanceValue;
            }
            this.workDays.set(dateString, workDayData);
        }

        this.render();
        this.updateWorkInfo();
    }

    isInRange(dateObj) {
        if (!this.rangeStart || !this.rangeEnd) return false;
        
        const dateString = this.formatDateString(dateObj);
        const startDate = new Date(this.rangeStart);
        const endDate = new Date(this.rangeEnd);
        const currentDate = new Date(dateString);
        
        return currentDate > startDate && currentDate < endDate;
    }

    calculateDaysDifference() {
        if (!this.rangeStart || !this.rangeEnd) return 0;
        
        const startDate = new Date(this.rangeStart);
        const endDate = new Date(this.rangeEnd);
        const timeDifference = Math.abs(endDate - startDate);
        const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
        
        return daysDifference;
    }

    calculateWorkTotals() {
        let restDays = 0;
        let workDays = 0;
        let advanceDays = 0;
        let advanceTotal = 0;

        this.workDays.forEach((workDay, dateString) => {
            if (workDay.type === 'rest') {
                restDays++;
            } else if (workDay.type === 'work') {
                workDays++;
            } else if (workDay.type === 'advance') {
                advanceDays++;
                advanceTotal += workDay.value || this.advanceValue;
            }
        });

        const restTotal = restDays * 400;
        const workTotal = workDays * 200;
        const grandTotal = restTotal + workTotal + advanceTotal;

        return {
            restDays,
            workDays,
            advanceDays,
            restTotal,
            workTotal,
            advanceTotal,
            grandTotal
        };
    }

    updateRangeInfo() {
        const startDateElement = document.getElementById('startDate');
        const endDateElement = document.getElementById('endDate');
        const daysDifferenceElement = document.getElementById('daysDifference');
        
        if (this.rangeStart) {
            startDateElement.textContent = this.formatDisplayDate(this.rangeStart);
            startDateElement.style.color = '#2d3748';
        } else {
            startDateElement.textContent = 'No seleccionado';
            startDateElement.style.color = '#a0aec0';
        }
        
        if (this.rangeEnd) {
            endDateElement.textContent = this.formatDisplayDate(this.rangeEnd);
            endDateElement.style.color = '#2d3748';
        } else {
            endDateElement.textContent = 'No seleccionado';
            endDateElement.style.color = '#a0aec0';
        }
        
        const daysDiff = this.calculateDaysDifference();
        daysDifferenceElement.textContent = daysDiff;
        
        // Cambiar color según la cantidad de días
        if (daysDiff === 0) {
            daysDifferenceElement.style.background = 'linear-gradient(135deg, #a0aec0 0%, #718096 100%)';
        } else if (daysDiff <= 7) {
            daysDifferenceElement.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
        } else if (daysDiff <= 30) {
            daysDifferenceElement.style.background = 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)';
        } else {
            daysDifferenceElement.style.background = 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)';
        }
    }

    updateWorkInfo() {
        const totals = this.calculateWorkTotals();

        // Actualizar contadores
        document.getElementById('restDaysCount').textContent = totals.restDays;
        document.getElementById('workDaysCount').textContent = totals.workDays;
        document.getElementById('advanceDaysCount').textContent = totals.advanceDays;

        // Actualizar totales
        document.getElementById('restTotal').textContent = totals.restTotal.toLocaleString();
        document.getElementById('workTotal').textContent = totals.workTotal.toLocaleString();
        document.getElementById('advanceTotal').textContent = totals.advanceTotal.toLocaleString();
        document.getElementById('grandTotal').textContent = '$' + totals.grandTotal.toLocaleString();

        // Actualizar cálculos mostrados
        document.getElementById('restDaysCount').parentNode.querySelector('.stat-calc').innerHTML = 
            `${totals.restDays} × $400 = $<span>${totals.restTotal.toLocaleString()}</span>`;
        
        document.getElementById('workDaysCount').parentNode.querySelector('.stat-calc').innerHTML = 
            `${totals.workDays} × $200 = $<span>${totals.workTotal.toLocaleString()}</span>`;
        
        document.getElementById('advanceDaysCount').parentNode.querySelector('.stat-calc').innerHTML = 
            `${totals.advanceDays} × $<span id="advanceRate">${this.advanceValue}</span> = $<span>${totals.advanceTotal.toLocaleString()}</span>`;
    }

    formatDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatDisplayDate(dateString) {
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        const dayName = this.getDayName(date.getDay());
        return `${dayName}, ${day}/${month}/${year}`;
    }

    getDayName(dayIndex) {
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return dayNames[dayIndex];
    }

    updateSelectedDatesList() {
        const selectedList = document.getElementById('selectedDatesList');
        
        if (this.selectedDates.size === 0) {
            selectedList.innerHTML = '<span class="no-selection">Ningún día seleccionado</span>';
            return;
        }

        const sortedDates = Array.from(this.selectedDates).sort();
        selectedList.innerHTML = '';
        
        sortedDates.forEach(dateString => {
            const tag = document.createElement('div');
            tag.className = 'selected-date-tag';
            
            const dateText = document.createElement('span');
            dateText.textContent = this.formatDisplayDate(dateString);
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-date';
            removeBtn.innerHTML = '×';
            removeBtn.title = 'Eliminar fecha';
            
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectedDates.delete(dateString);
                this.render();
                this.updateSelectedDatesList();
            });
            
            tag.appendChild(dateText);
            tag.appendChild(removeBtn);
            selectedList.appendChild(tag);
        });
    }

    clearAllSelections() {
        this.selectedDates.clear();
        this.rangeStart = null;
        this.rangeEnd = null;
        this.workDays.clear();
        this.render();
        this.updateSelectedDatesList();
        this.updateRangeInfo();
        this.updateWorkInfo();
    }

    // Métodos públicos para interactuar con el calendario
    getSelectedDates() {
        if (this.selectionMode === 'multi') {
            return Array.from(this.selectedDates);
        } else if (this.selectionMode === 'range') {
            return {
                start: this.rangeStart,
                end: this.rangeEnd,
                daysDifference: this.calculateDaysDifference()
            };
        } else if (this.selectionMode === 'work') {
            const totals = this.calculateWorkTotals();
            return {
                workDays: Object.fromEntries(this.workDays),
                totals: totals
            };
        }
    }

    setSelectedDates(dates) {
        if (this.selectionMode === 'multi') {
            this.selectedDates.clear();
            dates.forEach(date => {
                if (typeof date === 'string') {
                    this.selectedDates.add(date);
                } else if (date instanceof Date) {
                    this.selectedDates.add(this.formatDateString(date));
                }
            });
            this.updateSelectedDatesList();
        }
        this.render();
    }

    setDateRange(startDate, endDate) {
        if (this.selectionMode === 'range') {
            this.rangeStart = typeof startDate === 'string' ? startDate : this.formatDateString(startDate);
            this.rangeEnd = typeof endDate === 'string' ? endDate : this.formatDateString(endDate);
            this.render();
            this.updateRangeInfo();
        }
    }

    setWorkDay(date, type, value = null) {
        if (this.selectionMode === 'work') {
            const dateString = typeof date === 'string' ? date : this.formatDateString(date);
            const workDayData = { type };
            if (type === 'advance' && value !== null) {
                workDayData.value = value;
            }
            this.workDays.set(dateString, workDayData);
            this.render();
            this.updateWorkInfo();
        }
    }

    goToMonth(year, month) {
        this.currentDate = new Date(year, month, 1);
        this.render();
    }

    // Método para obtener información del calendario
    getCalendarInfo() {
        const info = {
            currentMonth: this.currentDate.getMonth() + 1,
            currentYear: this.currentDate.getFullYear(),
            selectionMode: this.selectionMode,
            selectedData: this.getSelectedDates()
        };

        if (this.selectionMode === 'multi') {
            info.selectedDatesCount = this.selectedDates.size;
        } else if (this.selectionMode === 'range') {
            info.selectedDatesCount = this.rangeStart && this.rangeEnd ? this.calculateDaysDifference() + 1 : 0;
        } else if (this.selectionMode === 'work') {
            info.selectedDatesCount = this.workDays.size;
            info.totals = this.calculateWorkTotals();
        }

        return info;
    }

    // Métodos para obtener rangos de fechas específicos
    getRangeDates() {
        if (this.selectionMode !== 'range' || !this.rangeStart || !this.rangeEnd) {
            return [];
        }
        
        const dates = [];
        const startDate = new Date(this.rangeStart);
        const endDate = new Date(this.rangeEnd);
        
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            dates.push(this.formatDateString(new Date(date)));
        }
        
        return dates;
    }

    getWorkDaysData() {
        return {
            workDays: Object.fromEntries(this.workDays),
            totals: this.calculateWorkTotals(),
            currentAdvanceValue: this.advanceValue
        };
    }
}

// Inicializar el calendario cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.calendar = new InteractiveCalendar();
    
    // Exponer métodos útiles globalmente
    window.getSelectedDates = () => window.calendar.getSelectedDates();
    window.clearCalendar = () => window.calendar.clearAllSelections();
    window.getCalendarInfo = () => window.calendar.getCalendarInfo();
    window.getRangeDates = () => window.calendar.getRangeDates();
    window.getWorkData = () => window.calendar.getWorkDaysData();
    window.switchToMultiMode = () => window.calendar.setSelectionMode('multi');
    window.switchToRangeMode = () => window.calendar.setSelectionMode('range');
    window.switchToWorkMode = () => window.calendar.setSelectionMode('work');
    
    console.log('📅 Calendario interactivo con modo trabajo cargado exitosamente!');
    console.log('💡 Funciones disponibles en la consola:');
    console.log('   - getSelectedDates(): obtiene las fechas seleccionadas');
    console.log('   - clearCalendar(): limpia todas las selecciones');
    console.log('   - getCalendarInfo(): obtiene información del calendario');
    console.log('   - getRangeDates(): obtiene array de fechas del rango');
    console.log('   - getWorkData(): obtiene datos del modo trabajo con totales');
    console.log('   - switchToMultiMode(): cambia a modo selección múltiple');
    console.log('   - switchToRangeMode(): cambia a modo rango');
    console.log('   - switchToWorkMode(): cambia a modo trabajo');
});

// Atajos de teclado actualizados
document.addEventListener('keydown', (e) => {
    if (!window.calendar) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            if (e.ctrlKey) {
                e.preventDefault();
                document.getElementById('prevMonth').click();
            }
            break;
        case 'ArrowRight':
            if (e.ctrlKey) {
                e.preventDefault();
                document.getElementById('nextMonth').click();
            }
            break;
        case 'Home':
            if (e.ctrlKey) {
                e.preventDefault();
                document.getElementById('goToToday').click();
            }
            break;
        case 'Delete':
            if (e.ctrlKey) {
                e.preventDefault();
                document.getElementById('clearSelection').click();
            }
            break;
        case '1':
            if (e.ctrlKey) {
                e.preventDefault();
                window.calendar.setSelectionMode('multi');
            }
            break;
        case '2':
            if (e.ctrlKey) {
                e.preventDefault();
                window.calendar.setSelectionMode('range');
            }
            break;
        case '3':
            if (e.ctrlKey) {
                e.preventDefault();
                window.calendar.setSelectionMode('work');
            }
            break;
        case 'r':
            if (e.ctrlKey && window.calendar.selectionMode === 'work') {
                e.preventDefault();
                window.calendar.setCurrentDayType('rest');
            }
            break;
        case 'w':
            if (e.ctrlKey && window.calendar.selectionMode === 'work') {
                e.preventDefault();
                window.calendar.setCurrentDayType('work');
            }
            break;
        case 'a':
            if (e.ctrlKey && window.calendar.selectionMode === 'work') {
                e.preventDefault();
                window.calendar.setCurrentDayType('advance');
            }
            break;
    }
});