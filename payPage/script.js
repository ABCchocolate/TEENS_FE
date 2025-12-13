// DOM Elements - Input
const hourlyConversion = document.getElementById("hourly-conversion")
const monthlyConversion = document.getElementById("monthly-conversion")
const hourlyWageInput = document.getElementById("hourly-wage")
const workersCountSelect = document.getElementById("workers-count")
const weeklyHoursSelect = document.getElementById("weekly-hours")
const workDaysSelect = document.getElementById("work-days")
const overtimeHoursSelect = document.getElementById("overtime-hours")
const nightHoursSelect = document.getElementById("night-hours")
const holidayHoursSelect = document.getElementById("holiday-hours")
const calculateBtn = document.getElementById("calculate-btn")

// DOM Elements - Output
const basicWageOutput = document.getElementById("basic-wage")
const weeklyAllowanceOutput = document.getElementById("weekly-allowance")
const additionalWageOutput = document.getElementById("additional-wage")
const finalAmountOutput = document.getElementById("final-amount")

// Constants
const MONTHLY_AVG_HOURS = 209 // 월 평균 근로시간

// Event Listeners
hourlyConversion.addEventListener("input", handleHourlyConversionInput)
monthlyConversion.addEventListener("input", handleMonthlyConversionInput)
hourlyWageInput.addEventListener("input", handleHourlyWageInput)
calculateBtn.addEventListener("click", calculateWages)

document.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    calculateWages()
  }
})

// Event Handlers
function handleHourlyConversionInput(e) {
  const value = e.target.value.replace(/,/g, "")
  const hourly = Number.parseFloat(value) || 0
  const monthly = Math.round(hourly * MONTHLY_AVG_HOURS)

  monthlyConversion.value = formatNumber(monthly)
  hourlyWageInput.value = hourly
}

function handleMonthlyConversionInput(e) {
  const value = e.target.value.replace(/,/g, "")
  const monthly = Number.parseFloat(value) || 0
  const hourly = Math.round(monthly / MONTHLY_AVG_HOURS)

  hourlyConversion.value = formatNumber(hourly)
  hourlyWageInput.value = hourly
}

function handleHourlyWageInput(e) {
  const hourly = Number.parseFloat(e.target.value) || 0
  const monthly = Math.round(hourly * MONTHLY_AVG_HOURS)

  hourlyConversion.value = formatNumber(hourly)
  monthlyConversion.value = formatNumber(monthly)
}

// Main Calculation Function
function calculateWages() {
  // Get input values
  const hourlyWage = Number.parseFloat(hourlyWageInput.value) || 0
  const workersCategory = workersCountSelect.value
  const weeklyHours = Number.parseFloat(weeklyHoursSelect.value) || 0
  const workDays = Number.parseFloat(workDaysSelect.value) || 0
  const overtimeHours = Number.parseFloat(overtimeHoursSelect.value) || 0
  const nightHours = Number.parseFloat(nightHoursSelect.value) || 0
  const holidayHours = Number.parseFloat(holidayHoursSelect.value) || 0
  const weeksInMonth = 4.345 // 월 평균 주 수

  // Validation
  if (hourlyWage === 0 || weeklyHours === 0 || workDays === 0) {
    alert("필수 입력값을 모두 입력해주세요.\n(시급, 주 소정 근로 시간, 근로일 수)")
    return
  }

  const dailyHours = (weeklyHours / workDays) * 7
  const monthlyWorkHours = (weeklyHours / 7) * workDays
  const basicWage = hourlyWage * monthlyWorkHours

  let weeklyAllowance = 0
  if (weeklyHours >= 15) {
    // 주 근로시간에 따른 주휴수당 (1일 소정 근로시간만큼 지급)
    const dailyWorkHours = weeklyHours / 5 // 주 5일 기준 1일 근로시간
    weeklyAllowance = hourlyWage * dailyWorkHours * weeksInMonth
  }

  // Calculate additional wage (only for 5+ workers)
  let additionalWage = 0
  if (workersCategory === "5인이상") {
    // Overtime pay: hourly wage × hours × 0.5 (1.5x total)
    const overtimePay = hourlyWage * overtimeHours * 0.5 * weeksInMonth

    // Night shift pay: hourly wage × hours × 0.5 (1.5x total)
    const nightPay = hourlyWage * nightHours * 0.5 * weeksInMonth

    // Holiday pay: hourly wage × hours × 0.5 (1.5x total)
    const holidayPay = hourlyWage * holidayHours * 0.5 * weeksInMonth

    additionalWage = overtimePay + nightPay + holidayPay
  }

  // Calculate final amount
  const finalAmount = basicWage + weeklyAllowance + additionalWage

  // Update output
  updateOutput(basicWage, weeklyAllowance, additionalWage, finalAmount)
}

// Update Output Function
function updateOutput(basicWage, weeklyAllowance, additionalWage, finalAmount) {
  basicWageOutput.textContent = formatCurrency(basicWage)
  weeklyAllowanceOutput.textContent = formatCurrency(weeklyAllowance)
  additionalWageOutput.textContent = formatCurrency(additionalWage)
  finalAmountOutput.textContent = formatCurrency(finalAmount)
}

// Utility Functions
function formatNumber(value) {
  const rounded = Math.round(value)
  return rounded.toLocaleString("ko-KR")
}

function formatCurrency(value) {
  const rounded = Math.round(value)
  return rounded.toLocaleString("ko-KR") + "원"
}

// Initialize
function initialize() {
  const initialHourly = 10030
  hourlyWageInput.value = initialHourly
  hourlyConversion.value = formatNumber(initialHourly)
  monthlyConversion.value = formatNumber(initialHourly * MONTHLY_AVG_HOURS)
}

// Run initialization
initialize()
