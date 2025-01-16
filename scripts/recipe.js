const scaleSelect = document.getElementById('servingScale');
const servingsDisplay = document.getElementById('servings');
const amounts = document.querySelectorAll('.amount');

const originalAmounts = Array.from(amounts).map(amount => {
    const value = parseFloat(amount.textContent);
    const unit = amount.textContent.replace(/[\d.]/g, '').trim();
    return { value, unit };
});

scaleSelect.addEventListener('change', (e) => {
    const scale = parseFloat(e.target.value);
    servingsDisplay.textContent = Math.round(4 * scale);
    
    amounts.forEach((amount, index) => {
        const scaled = originalAmounts[index].value * scale;
        amount.textContent = `${scaled}${originalAmounts[index].unit}`;
    });
});

document.querySelectorAll('.instructions-list li').forEach(item => {
    item.addEventListener('click', () => {
        item.classList.toggle('completed');
    });
});
