var chartInstance = null; // 在函数外部定义一个变量来持有图表实例

document.addEventListener('DOMContentLoaded', function() {
    // 绑定单选按钮事件监听器
    updateCalculationFunctionForRadio();

    // 直接调用默认计算函数以生成图表
    calculateFV();
});

function updateCalculationFunctionForRadio() {
    var calculationTypes = document.querySelectorAll('input[name="calculationType"]');
    calculationTypes.forEach(function(radio) {
        radio.addEventListener('change', function() {
            var calculationType = this.value; // 获取当前选中的单选按钮的值
            // 根据单选按钮的值动态更改事件监听器绑定的函数
            switch (calculationType) {
                case 'ear':
                    bindEventListeners(calculateEAR);
                    break;
                case 'pv':
                    bindEventListeners(calculatePV);
                    break;
                case 'fv':
                    bindEventListeners(calculateFV);
                    break;
                case 'yrs':
                    bindEventListeners(calculateyrs);
                    break;
                case 'pmt':
                    bindEventListeners(calculatePMT);
                    break;
                default:
                    bindEventListeners(calculateFV);
                    break;
            }
            resetFieldsForRadio(calculationType); // 重置字段为可编辑状态，并根据选择设置只读
        });
    });
    // 由于页面加载时默认选择的是计算FV，直接调用calculateFV()即可
    // calculateFV(); // 若需要在用户更改选择时才更新，可将此行移至相应的case内
}

// 确保其他函数（如calculateFV等）已正确定义且可以执行。

function bindEventListeners(calculationFunction) {
    var inputs = document.querySelectorAll('#investmentForm input, #investmentForm select');
    inputs.forEach(function(input) {
        input.removeEventListener('input', window.currentCalculationFunction); // 移除之前的事件监听器
        input.addEventListener('input', calculationFunction); // 添加新的事件监听器
    });
    window.currentCalculationFunction = calculationFunction; // 更新当前计算函数，用于移除监听器
    calculationFunction(); // 初始调用计算函数以显示默认值的结果
}

function calculateFV() {
    var pv = document.getElementById('pv').value;                // 本金
    var yrs = document.getElementById('yrs').value;              // 投資年限
    var frequency = document.getElementById('frequency').value;  // 投資頻率
    var frequenciesPerYrs = parseInt(frequency, 10);             // 每年的支付次数
    var pmt = document.getElementById('pmt').value;              // 每期支付
    var ear = document.getElementById('ear').value / 100;        // 年化利率
    var n = yrs * frequenciesPerYrs;                             // 總支付次數
    var r = Math.pow(1 + ear, 1 / frequenciesPerYrs) - 1;        // 每期利率
    // var fv = parseFloat(document.getElementById('fv').value);    // 最終金額

    // 計算FV
    var fv = Math.round(pv * Math.pow(1 + r, n) + pmt * ((Math.pow(1 + r, n) - 1) / r));
    // 更新FV的顯示
    document.getElementById('fv').value = fv.toFixed(0);


    // 生成图表的逻辑，只显示每年的标签
    var amounts = [pv]; // 初始金额作为图表的起点
    var labels = ['本金']; // 开始时的标签
    
    for (var i = 1; i <= n; i++) {
        var amount = Math.round(pv * Math.pow(1 + r, i) + pmt * ((Math.pow(1 + r, i) - 1) / r));
        // 仅在每个年度的最后一个周期添加数据和标签
        if (i % frequenciesPerYrs === 0) {
            amounts.push(amount);
            labels.push(`${i / frequenciesPerYrs}年後`);
        }
    }
    

    // 检查是否已经存在图表实例
    if (chartInstance) {
        chartInstance.destroy(); // 销毁旧的图表实例
    }
    
    var ctx = document.getElementById('investmentChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '當下資金',
                data: amounts,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function calculatePV() {
    // var pv = document.getElementById('pv').value;                // 本金
    var yrs = document.getElementById('yrs').value;              // 投資年限
    var frequency = document.getElementById('frequency').value;  // 投資頻率
    var frequenciesPerYrs = parseInt(frequency, 10);             // 每年的支付次数
    var pmt = document.getElementById('pmt').value;              // 每期支付
    var ear = document.getElementById('ear').value / 100;        // 年化利率
    var n = yrs * frequenciesPerYrs;                             // 總支付次數
    var r = Math.pow(1 + ear, 1 / frequenciesPerYrs) - 1;        // 每期利率
    var fv = parseFloat(document.getElementById('fv').value);    // 最終金額

    // 計算PV
    var pv = (fv - pmt*((Math.pow(1 + r, n)-1)/r))/Math.pow(1 + r, n);
    // 更新PV的顯示
    document.getElementById('pv').value = pv.toFixed(0);

    // 生成图表的逻辑，只显示每年的标签
    var amounts = [pv]; // 初始金额作为图表的起点
    var labels = ['本金']; // 开始时的标签
    
    for (var i = 1; i <= n; i++) {
        var amount = Math.round(pv * Math.pow(1 + r, i) + pmt * ((Math.pow(1 + r, i) - 1) / r));
        // 仅在每个年度的最后一个周期添加数据和标签
        if (i % frequenciesPerYrs === 0) {
            amounts.push(amount);
            labels.push(`${i / frequenciesPerYrs}年後`);
        }
    }


    // 检查是否已经存在图表实例
    if (chartInstance) {
        chartInstance.destroy(); // 销毁旧的图表实例
    }

    var ctx = document.getElementById('investmentChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '當前資金',
                data: amounts,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function calculateEAR() {
    var pv = document.getElementById('pv').value;                // 本金
    var yrs = document.getElementById('yrs').value;              // 投資年限
    var frequency = document.getElementById('frequency').value;  // 投資頻率
    var frequenciesPerYrs = parseInt(frequency, 10);             // 每年的支付次数
    var pmt = document.getElementById('pmt').value;              // 每期支付
    // var ear = document.getElementById('ear').value / 100;        // 年化利率
    var n = yrs * frequenciesPerYrs;                             // 總支付次數
    var r = Math.pow(1 + ear, 1 / frequenciesPerYrs) - 1;        // 每期利率
    var fv = parseFloat(document.getElementById('fv').value);    // 最終金額


    // 初始化r的估计值
    var r = 0.05 / frequenciesPerYrs; // 初始假设年化利率为5%
    var currentAmount = 0;

    // 使用迭代方法来估计r
    for (var i = 0; i < 10000000; i++) { // 迭代1000次作为示例
        currentAmount = pv * Math.pow(1 + r, n) + pmt * ((Math.pow(1 + r, n) - 1) / r);

        if (Math.abs(currentAmount - fv) < 0.00001) {
            break; // 如果计算的金额与目标金额非常接近，则停止迭代
        }

        if (currentAmount < fv) {
            r += 0.0000001; // 根据需要调整r的值
        } else {
            r -= 0.0000001;
        }
    }

    // 将周期利率转换为年化利率
    var ear = (Math.pow(1 + r, frequenciesPerYrs) - 1) * 100;

    // 更新年化利率的显示
    document.getElementById('ear').value = ear.toFixed(2);

    // 生成图表的逻辑，只显示每年的标签
    var amounts = [pv]; // 添加初始本金作为图表的起始点
    var labels = ['本金']; // 开始时的标签
    
    for (var i = 1; i <= n; i++) {
        var amount = Math.round(pv * Math.pow(1 + r, i) + pmt * ((Math.pow(1 + r, i) - 1) / r));
        // 仅在每个年度的最后一个周期添加数据和标签
        if (i % frequenciesPerYrs === 0) {
            amounts.push(amount);
            labels.push(`${i / frequenciesPerYrs}年後`);
        }
    }

    // 检查是否已经存在图表实例
    if (chartInstance) {
        chartInstance.destroy(); // 销毁旧的图表实例
    }

    var ctx = document.getElementById('investmentChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '當下資金',
                data: amounts,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function calculatePMT() {
    var pv = document.getElementById('pv').value;                // 本金
    var yrs = document.getElementById('yrs').value;              // 投資年限
    var frequency = document.getElementById('frequency').value;  // 投資頻率
    var frequenciesPerYrs = parseInt(frequency, 10);             // 每年的支付次数
    // var pmt = document.getElementById('pmt').value;              // 每期支付
    var ear = document.getElementById('ear').value / 100;        // 年化利率
    var n = yrs * frequenciesPerYrs;                             // 總支付次數
    var r = Math.pow(1 + ear, 1 / frequenciesPerYrs) - 1;        // 每期利率
    var fv = parseFloat(document.getElementById('fv').value);    // 最終金額

    // 计算PMT
    var pmt = (fv - pv*Math.pow(1 + r, n))/ ((Math.pow(1 + r, n) - 1) / r);

    // 更新PV的显示
    document.getElementById('pmt').value = pmt.toFixed(0);

    var amounts = [pv]; // 添加初始本金作为图表的起始点
    var labels = ['本金']; // 开始时的标签
    
    for (var i = 1; i <= n; i++) {
        var currentAmount = pv * Math.pow(1 + r, i) + pmt * ((Math.pow(1 + r, i) - 1) / r);
        // 仅在每年的最后一个周期添加数据和标签
        if (i % frequenciesPerYrs === 0) {
            amounts.push(currentAmount.toFixed(2));
            labels.push(`${i / frequenciesPerYrs}年後`);
        }
    }

    // 检查是否已经存在图表实例
    if (chartInstance) {
        chartInstance.destroy(); // 销毁旧的图表实例
    }

    var ctx = document.getElementById('investmentChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '當下資金',
                data: amounts,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function calculateyrs() {
    var pv = parseFloat(document.getElementById('pv').value);
    var pmt = parseFloat(document.getElementById('pmt').value);
    var ear = parseFloat(document.getElementById('ear').value) / 100;
    var fv = parseFloat(document.getElementById('fv').value);
    var frequenciesPerYrs = parseInt(document.getElementById('frequency').value, 10);
    var r = Math.pow(1 + ear, 1 / frequenciesPerYrs) - 1;

    var low = -100000000, high = 100000000; // 设定搜索范围，需要根据实际情况调整
    var n = 0;
    while (low <= high) {
        n = Math.floor((low + high) / 2);
        var currentAmount = pv * Math.pow(1 + r, n) + pmt * ((Math.pow(1 + r, n) - 1) / r);
        if (Math.abs(currentAmount - fv) < 0.01) {
            break; // 找到接近最终金额的n值
        } else if (currentAmount < fv) {
            low = n + 1;
        } else {
            high = n - 1;
        }
    }

    var yrs = n / frequenciesPerYrs;

    // 更新总时间的显示
    document.getElementById('yrs').value = yrs.toFixed(0);

    // 生成图表的逻辑，调整为只显示每年的标签
    var amounts = [pv]; // 添加初始本金作为图表的起始点
    var labels = ['本金']; // 开始时的标签
    
    for (var i = 1; i <= n; i++) {
        var amount = pv * Math.pow(1 + r, i) + pmt * ((Math.pow(1 + r, i) - 1) / r);
        // 仅在每年的最后一个周期添加数据和标签
        if (i % frequenciesPerYrs === 0 || i === n) { // 确保最后一个数据点被包括，无论其是否完整年份
            amounts.push(amount.toFixed(2));
            labels.push(`${Math.ceil(i / frequenciesPerYrs)}年後`);
        }
    }


    // 检查是否已经存在图表实例
    if (chartInstance) {
        chartInstance.destroy(); // 销毁旧的图表实例
    }

    var ctx = document.getElementById('investmentChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '當下資金',
                data: amounts,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 监听calculationType的更改
document.getElementById('calculationType').addEventListener('change', function() {
    updateCalculationFunction(); // 更新计算函数
    resetFields(); // 重置字段为可编辑状态，并根据选择设置只读
});

// function resetFields() {
//     // Reset all fields to be editable
//     var fields = ['pv', 'yrs', 'pmt', 'ear', 'fv'];
//     fields.forEach(function(field) {
//         var input = document.getElementById(field);
//         input.readOnly = false;
//         input.style.backgroundColor = "#ffffff"; // 重置背景色
//     });

//     // Set the selected field to readonly based on the dropdown selection
//     var selectedField = document.getElementById('calculationType').value;
//     if (selectedField !== '') {
//         var selectedInput = document.getElementById(selectedField);
//         selectedInput.readOnly = true;
//         selectedInput.style.backgroundColor = "#f0f0f0"; // 设置只读字段的背景色
//     }
// }

function resetFieldsForRadio(selectedCalculationType) {
    var fields = ['pv', 'yrs', 'pmt', 'ear', 'fv']; // 对应于HTML中的输入框ID
    fields.forEach(function(field) {
        var input = document.getElementById(field);
        if (field === selectedCalculationType) {
            // 如果字段与选中的计算类型匹配，设置为只读并改变背景色
            input.readOnly = true;
            input.style.backgroundColor = "#f0f0f0";
        } else {
            // 其他字段设置为可编辑并重置背景色
            input.readOnly = false;
            input.style.backgroundColor = "#ffffff";
        }
    });
}