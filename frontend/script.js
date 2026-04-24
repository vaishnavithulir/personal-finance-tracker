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
            switchFrame('all');
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
    
    // Update New Premium Mini Stats
    const miniTotal = document.getElementById('incMiniTotal');
    const miniMax = document.getElementById('incMiniMax');
    const miniRate = document.getElementById('incMiniRate');

    const incomeTxns = allTransactions.filter(t => t.type === 'income');
    if (miniTotal) miniTotal.textContent = incomeSum.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    
    if (incomeTxns.length > 0) {
        if (miniMax) {
            const max = Math.max(...incomeTxns.map(t => t.amount));
            miniMax.textContent = max.toLocaleString('en-IN', { minimumFractionDigits: 2 });
        }
        if (miniRate) {
            miniRate.textContent = (incomeSum / 30).toLocaleString('en-IN', { maximumFractionDigits: 0 });
        }
    }

    // Update Expense Premium Mini Stats
    const expMiniTotal = document.getElementById('expMiniTotal');
    const expMiniMax = document.getElementById('expMiniMax');
    const expMiniRate = document.getElementById('expMiniRate');

    if (expMiniTotal) expMiniTotal.textContent = expenseSum.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    
    const expenseTxns = allTransactions.filter(t => t.type === 'expense');
    if (expenseTxns.length > 0) {
        if (expMiniMax) {
            const max = Math.max(...expenseTxns.map(t => t.amount));
            expMiniMax.textContent = max.toLocaleString('en-IN', { minimumFractionDigits: 2 });
        }
        if (expMiniRate) {
            expMiniRate.textContent = (expenseSum / 30).toLocaleString('en-IN', { maximumFractionDigits: 0 });
        }
    }

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

            // Generate Strategic Pillar Allocations
            const pillars = document.getElementById('strategicPillars');
            if (pillars) {
                pillars.style.display = 'block';
                const income = incomeSum || 0;
                document.getElementById('pillarWealth').textContent = '₹' + (income * 0.25).toLocaleString('en-IN', { minimumFractionDigits: 2 });
                document.getElementById('pillarLife').textContent = '₹' + (income * 0.40).toLocaleString('en-IN', { minimumFractionDigits: 2 });
                document.getElementById('pillarGrowth').textContent = '₹' + (income * 0.15).toLocaleString('en-IN', { minimumFractionDigits: 2 });
                document.getElementById('pillarRisk').textContent = '₹' + (income * 0.20).toLocaleString('en-IN', { minimumFractionDigits: 2 });
            }
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

// UI Bridge Functions for Entry Form
function openEntryModal(type) {
    const formCard = document.getElementById('entryFormCard');
    const typeInput = document.getElementById('type');
    const titleEl = document.getElementById('entryFormTitle');
    const submitBtn = document.getElementById('submitBtn');

    if (!formCard) return;

    if (typeInput) typeInput.value = type;
    
    if (titleEl) {
        titleEl.innerHTML = type === 'income' 
            ? '<i class="fas fa-wallet" style="color: var(--success); margin-right: 0.5rem;"></i>Add New Income Record' 
            : '<i class="fas fa-receipt" style="color: #ef4444; margin-right: 0.5rem;"></i>Add New Expense Record';
    }

    if (submitBtn) {
        submitBtn.textContent = type === 'income' ? 'Process Income Entry' : 'Process Expense Entry';
        submitBtn.style.background = type === 'income' ? 'var(--success)' : '#ef4444';
        submitBtn.style.color = type === 'income' ? 'var(--bg-dark)' : '#fff';
    }

    formCard.style.display = 'block';
    formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeEntryForm() {
    const formCard = document.getElementById('entryFormCard');
    if (formCard) formCard.style.display = 'none';
}

// Filtering and Rendering
function switchFrame(filter, containerId = 'transactionList') {
    const container = document.getElementById(containerId);
    if (!container) return;

    let filtered = [...allTransactions];
    
    if (filter === 'income') {
        filtered = allTransactions.filter(t => t.type === 'income');
    } else if (filter === 'expense') {
        filtered = allTransactions.filter(t => t.type === 'expense');
    }

    renderTransactions(filtered, containerId);
}

function renderTransactions(txns, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (txns.length === 0) {
        container.innerHTML = '<div class="glass-card" style="padding: 2rem; text-align: center; color: var(--text-gray);">No records found in this vault.</div>';
        return;
    }

    container.innerHTML = txns.map(t => `
        <div class="glass-card" style="padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid ${t.type === 'income' ? 'var(--success)' : '#ef4444'};">
            <div>
                <h4 style="margin: 0; color: #fff; font-size: 1.1rem;">${t.description}</h4>
                <p style="margin: 0.25rem 0 0; color: var(--text-gray); font-size: 0.8rem; font-weight: 600;">${t.category} • ${new Date(t.date).toLocaleDateString()}</p>
            </div>
            <div style="text-align: right; display: flex; align-items: center; gap: 1.5rem;">
                <h3 style="margin: 0; color: ${t.type === 'income' ? 'var(--success)' : '#ef4444'}; font-family: monospace;">
                    ₹${t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="openEditModal('${t.id}')" style="background: rgba(56, 189, 248, 0.1); border: none; color: var(--primary); padding: 0.5rem; border-radius: 8px; cursor: pointer;"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteTransaction('${t.id}')" style="background: rgba(239, 68, 68, 0.1); border: none; color: #ef4444; padding: 0.5rem; border-radius: 8px; cursor: pointer;"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>
    `).join('');
}

// CRUD: Update & Delete
function openEditModal(txnId) {
    const txn = allTransactions.find(t => t.id === txnId);
    if (!txn) return;

    document.getElementById('editTxnId').value = txn.id;
    document.getElementById('editDesc').value = txn.description;
    document.getElementById('editAmount').value = txn.amount;
    document.getElementById('editType').value = txn.type;
    document.getElementById('editCategory').value = txn.category;
    
    document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

async function saveEditTransaction() {
    const id = document.getElementById('editTxnId').value;
    const description = document.getElementById('editDesc').value;
    const amount = parseFloat(document.getElementById('editAmount').value);
    const type = document.getElementById('editType').value;
    const category = document.getElementById('editCategory').value;

    try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/transactions/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token') 
            },
            body: JSON.stringify({ description, amount, type, category })
        });

        if (res.ok) {
            closeEditModal();
            await loadTransactions();
        } else {
            alert('Update failed.');
        }
    } catch (err) {
        console.error(err);
        alert('Could not reach the server.');
    }
}

async function deleteTransaction(id) {
    if (!confirm('Are you sure you want to erase this record from the vault?')) return;

    try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/transactions/${id}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': localStorage.getItem('token') }
        });

        if (res.ok) {
            await loadTransactions();
        } else {
            alert('Deletion failed.');
        }
    } catch (err) {
        console.error(err);
        alert('Server connection error.');
    }
}
