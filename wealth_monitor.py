import streamlit as st
import sqlite3
import pandas as pd
import plotly.express as px

st.set_page_config(page_title="Dumbo Finance | Wealth Monitor", layout="wide")

# Custom Styling for Institutional Look
st.markdown("""
    <style>
    .main { background-color: #0a0f1e; color: #fff; }
    .stMetric { background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; border: 1px solid rgba(56,189,248,0.2); }
    </style>
    """, unsafe_allow_html=True)

st.title("🐘 Dumbo Finance: Institutional Wealth Intelligence")

# Database Connection
def get_data():
    conn = sqlite3.connect('dev.db')
    df = pd.read_sql_query("SELECT * FROM Transaction", conn)
    users = pd.read_sql_query("SELECT id, fullName FROM User", conn)
    conn.close()
    return df, users

try:
    df, users = get_data()
    
    # User filter
    user_list = users['fullName'].tolist()
    selected_user = st.sidebar.selectbox("Select Access Entity", user_list)
    user_id = users[users['fullName'] == selected_user]['id'].iloc[0]
    
    # Filter data
    user_df = df[df['userId'] == user_id].copy()
    user_df['date'] = pd.to_datetime(user_df['date'])
    
    # Metrics
    income = user_df[user_df['type'] == 'income']['amount'].sum()
    expense = user_df[user_df['type'] == 'expense']['amount'].sum()
    
    col1, col2, col3 = st.columns(3)
    col1.metric("Net Vault Balance", f"₹{income - expense:,.2f}")
    col2.metric("Accumulated Income", f"₹{income:,.2f}")
    col3.metric("Institutional Burn", f"₹{expense:,.2f}")
    
    # Charts
    st.subheader("📊 Wealth Signal Distribution")
    fig = px.pie(user_df, values='amount', names='type', 
                 color_discrete_map={'income':'#34d399', 'expense':'#ef4444'},
                 hole=0.6)
    st.plotly_chart(fig, use_container_width=True)
    
    st.subheader("📈 Liquidity Timeline")
    timeline = user_df.sort_values('date')
    fig2 = px.line(timeline, x='date', y='amount', color='type', markers=True)
    st.plotly_chart(fig2, use_container_width=True)
    
    st.subheader("📜 Recent Access Logs")
    st.dataframe(user_df[['description', 'amount', 'type', 'date']].sort_values('date', ascending=False), use_container_width=True)

except Exception as e:
    st.error(f"Waiting for Data Signals... (Error: {str(e)})")
    st.info("Ensure the SQLite 'dev.db' is present and populated.")
