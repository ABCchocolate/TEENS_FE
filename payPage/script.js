// DOM Elements - Input
const hourlyConversion = document.getElementById('hourly-conversion');
const monthlyConversion = document.getElementById('monthly-conversion');
const hourlyWageInput = document.getElementById('hourly-wage');
const workersCountSelect = document.getElementById('workers-count');
const weeklyHoursSelect = document.getElementById('weekly-hours');
const workDaysSelect = document.getElementById('work-days');
const overtimeHoursSelect = document.getElementById('overtime-hours');
const nightHoursSelect = document.getElementById('night-hours');
const holidayHoursSelect = document.getElementById('holiday-hours');
const calculateBtn = document.getElementById('calculate-btn');
const closeBtn = document.querySelector('.close-btn');

// DOM Elements - Output
const basicWageOutput = document.getElementById('basic-wage');
const weeklyAllowanceOutput = document.getElementById('weekly-allowance');
const additionalWageOutput = document.getElementById('additional-wage');
const finalAmountOutput = document.getElementById('final-amount');

// Constants
const MONTHLY_AVG_HOURS = 209; // 월 평균 근로시간

// Event Listeners
closeBtn.addEventListener('click', handleClose);
hourlyConversion.addEventListener('input', handleHourlyConversionInput);
monthlyConversion.addEventListener('input', handleMonthlyConversionInput);
hourlyWageInput.addEventListener('input', handleHourlyWageInput);
calculateBtn.addEventListener('click', calculateWages);

document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        calculateWages();
    }
});

// Event Handlers
function handleClose() {
    if (confirm('임금계산기를 닫으시겠습니까?')) {
        window.close();
    }
}

function handleHourlyConversionInput(e) {
    const value = e.target.value.replace(/,/g, '');
    const hourly = parseFloat(value) || 0;
    const monthly = Math.round(hourly * MONTHLY_AVG_HOURS);
    
    monthlyConversion.value = formatNumber(monthly);
    hourlyWageInput.value = hourly;
}

function handleMonthlyConversionInput(e) {
    const value = e.target.value.replace(/,/g, '');
    const monthly = parseFloat(value) || 0;
    const hourly = Math.round(monthly / MONTHLY_AVG_HOURS);
    
    hourlyConversion.value = formatNumber(hourly);
    hourlyWageInput.value = hourly;
}

function handleHourlyWageInput(e) {
    const hourly = parseFloat(e.target.value) || 0;
    const monthly = Math.round(hourly * MONTHLY_AVG_HOURS);
    
    hourlyConversion.value = formatNumber(hourly);
    monthlyConversion.value = formatNumber(monthly);
}

// Main Calculation Function
function calculateWages() {
    // Get input values
    const hourlyWage = parseFloat(hourlyWageInput.value) || 0;
    const workersCategory = workersCountSelect.value;
    const weeklyHours = parseFloat(weeklyHoursSelect.value) || 0;
    const workDays = parseFloat(workDaysSelect.value) || 0;
    const overtimeHours = parseFloat(overtimeHoursSelect.value) || 0;
    const nightHours = parseFloat(nightHoursSelect.value) || 0;
    const holidayHours = parseFloat(holidayHoursSelect.value) || 0;

    // Validation
    if (hourlyWage === 0 || weeklyHours === 0 || workDays === 0) {
        alert('필수 입력값을 모두 입력해주세요.\n(시급, 주 소정 근로 시간, 근로일 수)');
        return;
    }

    // Calculate basic wage
    const dailyHours = weeklyHours / 5;
    const monthlyWorkHours = dailyHours * workDays;
    const basicWage = hourlyWage * monthlyWorkHours;

    // Calculate weekly allowance
    const weeklyAllowance = hourlyWage * (weeklyHours / 40) * 8 * 4;

    // Calculate additional wage (only for 5+ workers)
    let additionalWage = 0;
    if (workersCategory === '5인이상') {
        // Overtime pay: hourly wage × hours × 0.5 (1.5x total)
        const overtimePay = hourlyWage * overtimeHours * 0.5;
        
        // Night shift pay: hourly wage × hours × 0.5 (1.5x total)
        const nightPay = hourlyWage * nightHours * 0.5;
        
        // Holiday pay: hourly wage × hours × 0.5 (1.5x total)
        const holidayPay = hourlyWage * holidayHours * 0.5;
        
        additionalWage = overtimePay + nightPay + holidayPay;
    }

    // Calculate final amount
    const finalAmount = basicWage + weeklyAllowance + additionalWage;

    // Update output
    updateOutput(basicWage, weeklyAllowance, additionalWage, finalAmount);
}

// Update Output Function
function updateOutput(basicWage, weeklyAllowance, additionalWage, finalAmount) {
    basicWageOutput.textContent = formatCurrency(basicWage);
    weeklyAllowanceOutput.textContent = formatCurrency(weeklyAllowance);
    additionalWageOutput.textContent = formatCurrency(additionalWage);
    finalAmountOutput.textContent = formatCurrency(finalAmount);
}

// Utility Functions
function formatNumber(value) {
    const rounded = Math.round(value);
    return rounded.toLocaleString('ko-KR');
}

function formatCurrency(value) {
    const rounded = Math.round(value);
    return rounded.toLocaleString('ko-KR') + '원';
}

// Initialize
function initialize() {
    const initialHourly = 10030;
    hourlyWageInput.value = initialHourly;
    hourlyConversion.value = formatNumber(initialHourly);
    monthlyConversion.value = formatNumber(initialHourly * MONTHLY_AVG_HOURS);
}

// Run initialization
initialize();