document.getElementById('wasteForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 1. Retrieve UI Inputs
    const cu = parseFloat(document.getElementById('copper').value) || 0;
    const ni = parseFloat(document.getElementById('nickel').value) || 0;
    const zn = parseFloat(document.getElementById('zinc').value) || 0;
    const water = parseFloat(document.getElementById('water').value) || 0;
    
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.innerText = "";

    // 2. Structural Constraint Verification (Total composition must check out near 100%)
    const total = cu + ni + zn + water;
    if (Math.abs(total - 100) > 0.01) {
        errorMsg.innerText = `⚠️ Allocation Error: Chemical breakdown totals ${total}%. It must equal 100%.`;
        return;
    }

    // 3. Define the Adaptive AI Recovery Processing Options
    // Scores dynamically adapt base on resource presence (e.g. Acid Leaching yields more if Copper/Nickel are high)
    const pathways = [
        {
            name: "Selective Acid Leaching",
            baseValue: (cu * 12) + (ni * 15) + (zn * 5),
            opCost: 120 + (water * 0.5),
            envPenalty: 40,
            outputType: "Valuable Product"
        },
        {
            name: "Electrochemical Extraction",
            baseValue: (cu * 18) + (ni * 22) + (zn * 2),
            opCost: 240 - (water * 1.2), // High liquid content aids standard electrolytic flow profiles
            envPenalty: 15,
            outputType: "Valuable Product"
        },
        {
            name: "Thermal Smelting Slag Recovery",
            baseValue: (cu * 10) + (ni * 10) + (zn * 14),
            opCost: 190 + (water * 3.0), // High water drastically increases evaporation thermal energy costs
            envPenalty: 70,
            outputType: "Reusable Resource"
        },
        {
            name: "Standard Chemical Precipitation",
            baseValue: (cu * 5) + (ni * 5) + (zn * 5),
            opCost: 70,
            envPenalty: 55,
            outputType: "Treated Resource"
        }
    ];

    // 4. Run Optimization Engine Equation: Value - Cost - Penalty
    const evaluatedPathways = pathways.map(path => {
        const score = Math.round(path.baseValue - path.opCost - path.envPenalty);
        return {
            name: path.name,
            value: Math.round(path.baseValue),
            cost: Math.round(path.opCost),
            penalty: path.envPenalty,
            outputType: path.outputType,
            score: score
        };
    });

    // 5. Rank Pathways by Optimization Score Decrescendo
    evaluatedPathways.sort((a, b) => b.score - a.score);

    // 6. Update Primary Dashboard Status Indicators
    const optimalSelection = evaluatedPathways[0];
    document.getElementById('bestPathway').innerText = optimalSelection.name;
    document.getElementById('bestScore').innerText = optimalSelection.score + " pts";
    
    const targetBadge = document.getElementById('targetOutput');
    targetBadge.innerText = optimalSelection.outputType;

    // Change badge background context style elements depending on result type
    if(optimalSelection.outputType === "Valuable Product") {
        targetBadge.style.backgroundColor = "#4caf50";
    } else if(optimalSelection.outputType === "Reusable Resource") {
        targetBadge.style.backgroundColor = "#ff9800";
    } else {
        targetBadge.style.backgroundColor = "#2196f3";
    }

    // 7. Render Matrix Breakdown Data to the Table Elements
    const tbody = document.getElementById('pathwayTableBody');
    tbody.innerHTML = ""; // Clear baseline warning state row

    evaluatedPathways.forEach((path, index) => {
        const row = document.createElement('tr');
        if(index === 0) row.style.backgroundColor = "rgba(76, 175, 80, 0.15)"; // Highlight top rank row
        
        row.innerHTML = `
            <td><strong>#${index + 1}</strong></td>
            <td><strong>${path.name}</strong></td>
            <td style="color: #4caf50;">$${path.value}</td>
            <td style="color: #f44336;">$${path.cost}</td>
            <td style="color: #ff9800;">${path.penalty}</td>
            <td><span class="badge" style="background-color: ${index === 0 ? 'var(--primary-green)' : '#4a5568'}; color: #fff;">${path.score}</span></td>
        `;
        tbody.appendChild(row);
    });
});
