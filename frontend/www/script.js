let totalSum = 0;
let incomeSum = 0;
let expenseSum = 0;
const token = localStorage.getItem('token');
let allTransactions = [];

// Load transactions from database on start
async function loadTransactions() {
    try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/transactions`, {
            headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        const data = await res.json();
        
        if (res.ok) {
            allTransactions = data;
            // Reset sums
            totalSum = 0; incomeSum = 0; expenseSum = 0;
            data.forEach(item => {
                if (item.type === 'income') {
                    incomeSum += item.amount;
                    totalSum += item.amount;
                } else {
                    expenseSum += item.amount;
                    totalSum -= item.amount;
                }
            });
            updateVisuals();
        } else if (res.status === 401) {
            localStorage.clear();
            window.location.href = 'login.html';
        }
    } catch (err) {
        console.error('Error loading transactions:', err);
    }
}





function updateVisuals() {
    const totalDisplay = document.getElementById("total");
    const incomeDisplay = document.getElementById("monthlyIncome");
    const expenseDisplay = document.getElementById("monthlyExpense");

    if (totalDisplay) totalDisplay.textContent = totalSum.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    if (incomeDisplay) incomeDisplay.textContent = incomeSum.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    if (expenseDisplay) expenseDisplay.textContent = expenseSum.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    
    if (typeof updateChart === 'function') {
        updateChart();
    }
}

async function addExpense() {
    const descInput = document.getElementById("desc");
    const amountInput = document.getElementById("amount");
    const typeInput = document.getElementById("type");
    const categoryInput = document.getElementById("category");
    const submitBtn = document.querySelector('#entryFormCard button[onclick="addExpense()"]');

    const description = descInput.value;
    const amount = parseFloat(amountInput.value);
    const type = typeInput ? typeInput.value : 'expense';
    const category = categoryInput ? categoryInput.value : 'Other';

    if (!description || isNaN(amount)) {
        alert("Please enter a valid description and amount.");
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = "...";

        // Read response directly as it might be an error text if not well-handled before
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/transactions`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
              },
            body: JSON.stringify({ description, amount, type, category })
        });

        const data = await res.json();

        if (res.ok) {
            await loadTransactions();
            updateVisuals();
            descInput.value = "";
            amountInput.value = "";
        } else {
            if (res.status === 401) {
                alert("Your session token expired! Redirecting to login...");
                localStorage.clear();
                window.location.href = 'login.html';
                return;
            }
            alert(data.msg || 'Error adding transaction');
        }
    } catch (err) {
        console.error(err);
        alert('Server error connection failed.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Add Item";
    }
}

async function getAIAdvice() {
    const btn = document.getElementById('aiAdviceBtn');
    const results = document.getElementById('aiResults');
    const placeholder = document.getElementById('aiPlaceholder');
    const loader = document.getElementById('aiLoader');

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Brainstorming...';
        placeholder.style.display = 'none';
        results.style.display = 'none';
        loader.style.display = 'block';

        const res = await fetch(`${CONFIG.API_BASE_URL}/api/ai/advice`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token') 
            }
        });

        const data = await res.json();
        loader.style.display = 'none';

        if (res.ok) {
            results.style.display = 'block';
            results.innerHTML = `
                <div class="ai-response-card" style="border-left: 4px solid #c084fc;">
                    <h5 style="color: #c084fc; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; margin-bottom: 0.5rem;">Financial Summary</h5>
                    <p style="color: #e2e8f0; line-height: 1.6;">${data.summary || 'Summary unavailable.'}</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
                    ${(data.tips || []).map(tip => `
                        <div class="ai-response-card">
                            <i class="fas fa-lightbulb" style="color: #fbbf24; margin-bottom: 0.75rem; font-size: 1.2rem;"></i>
                            <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.5;">${tip}</p>
                        </div>
                    `).join('')}
                </div>

                <div class="ai-response-card" style="background: linear-gradient(135deg, rgba(192, 132, 252, 0.1), transparent); border: 1px solid rgba(192, 132, 252, 0.2);">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                         <i class="fas fa-heart" style="color: #ec4899;"></i>
                         <p style="color: #fff; font-weight: 600; font-size: 0.9rem; font-style: italic;">"${data.encouragement || 'Keep going!'}"</p>
                    </div>
                </div>
            `;
        } else {
            placeholder.style.display = 'block';
            alert(data.msg || 'AI Analysis failed. Check if API Key is set.');
        }

    } catch (err) {
        console.error('AI Request Failed:', err);
        loader.style.display = 'none';
        placeholder.style.display = 'block';
        
        const errorMsg = err.message || 'Unknown Error';
        alert(`AI Service Unavailable: ${errorMsg}`);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sparkles"></i> Generate Advice';
    }
}

// Ensure the page loads properly
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        loadTransactions();
    }
});
async function loadSettings() {
    try {
        console.log('Initiating Settings Fetch...');
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/users/profile`, {
            headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        
        console.log('Settings Response Status:', res.status);
        const data = await res.json();
        
        if (res.ok && data) {
            const fields = {
                'setFullName': data.fullName,
                'setEmail': data.email,
                'setBankName': data.bankName || 'Not Configured',
                'setAccountNum': data.accountNumber || '•••• •••• ••••',
                'setIFSC': data.ifscCode || '—'
            };
            
            for (const [id, value] of Object.entries(fields)) {
                const el = document.getElementById(id);
                if (el) el.textContent = value;
            }
            console.log('Settings Profile Rendered');
        } else {
            console.error('Profile Retrieval Error:', data.msg);
            if (res.status === 404 || res.status === 401) {
                alert('Session expired or profile not found. Redirecting to login...');
                localStorage.clear();
                window.location.href = 'login.html';
            } else {
                alert(`Profile Error [${res.status}]: ${data.msg || 'Retrieval failed'}`);
            }
        }
    } catch (err) {
        console.error('Critical Settings Error:', err);
        // Providing more context in the alert
        alert(`Hardware/Network Exception: ${err.message}. Check if Backend (Port 5005) is active.`);
    }
}
async function updatePassword() {
    const pwd = document.getElementById('newPassword').value;
    if (!pwd || pwd.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
    }

    try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/users/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ password: pwd })
        });

        const data = await res.json();
        if (res.ok) {
            alert('Security credentials updated successfully.');
            document.getElementById('newPassword').value = '';
        } else {
            alert('Error: ' + (data.msg || 'Update failed'));
        }
    } catch (err) {
        console.error('Password update error:', err);
        alert('Could not reach the security server.');
    }
}
