# app.py
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import sqlite3

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# اتصال قاعدة البيانات
def get_db_connection():
    conn = sqlite3.connect('real_estate.db')
    conn.row_factory = sqlite3.Row
    return conn

# إنشاء جداول في قاعدة البيانات
def init_db():
    with sqlite3.connect('real_estate.db') as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                phone TEXT NOT NULL,
                password TEXT NOT NULL
            )
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS properties (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                price TEXT NOT NULL,
                type TEXT NOT NULL,
                location TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')

init_db()

# الصفحة الرئيسية
@app.route('/')
def home():
    conn = get_db_connection()
    properties = conn.execute('SELECT * FROM properties').fetchall()
    conn.close()
    return render_template('index.html', properties=properties)

# صفحة تسجيل الدخول
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE email = ? AND password = ?', (email, password)).fetchone()
        conn.close()

        if user:
            session['user_id'] = user['id']
            return redirect(url_for('home'))
        else:
            return "بيانات تسجيل الدخول غير صحيحة"

    return render_template('login.html')

# صفحة تسجيل المستخدمين
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        phone = request.form['phone']
        password = request.form['password']

        conn = get_db_connection()
        try:
            conn.execute('INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)', (name, email, phone, password))
            conn.commit()
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            return "البريد الإلكتروني مسجل بالفعل"
        finally:
            conn.close()

    return render_template('register.html')

# صفحة إضافة عقار
@app.route('/add_property', methods=['GET', 'POST'])
def add_property():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    if request.method == 'POST':
        title = request.form['title']
        price = request.form['price']
        type = request.form['type']
        location = request.form['location']
        user_id = session['user_id']

        conn = get_db_connection()
        conn.execute('INSERT INTO properties (title, price, type, location, user_id) VALUES (?, ?, ?, ?, ?)', (title, price, type, location, user_id))
        conn.commit()
        conn.close()

        return redirect(url_for('home'))

    return render_template('add_property.html')

# البحث عن العقارات
@app.route('/search', methods=['GET'])
def search():
    location = request.args.get('location', '')
    type = request.args.get('type', '')

    conn = get_db_connection()
    query = 'SELECT * FROM properties WHERE location LIKE ? AND type = ?'
    properties = conn.execute(query, ('%' + location + '%', type)).fetchall()
    conn.close()

    return render_template('index.html', properties=properties)

# تسجيل الخروج
@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(debug=True)